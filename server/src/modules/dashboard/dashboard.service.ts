import { Prisma, BRT_STATUS, TI_STATUS } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";
import type {
  GetIssueStatsQueryDto,
  GetIssueStatsResponseDto,
  DashboardQueryDto,
  GetBorrowStatsResponseDto,
  GetMostBorrowedStatsResponseDto,
  GetRepairStatusStatsResponseDto,
  GetOverdueTableResponseDto,
} from "./dashboard.schema.js";

/**
 * Description: type สำหรับ filter ตาม role ของผู้ใช้
 */
export type UserRoleFilter = {
  role: string;
  dept: number | null;
  sec: number | null;
};

/**
 * Description: สร้าง WHERE clause เสริมสำหรับ borrow_return_tickets ตาม role
 * คืนค่า { clause: string, params: any[] }
 * - ADMIN / อื่นๆ: ไม่มี filter เพิ่ม
 * - HOD: กรองตาม dept_id ของ requester
 * - HOS: กรองตาม sec_id ของ requester
 */
function buildBorrowRoleClause(filter: UserRoleFilter, paramIndex: number) {
  if (filter.role === "HOD" && filter.dept !== null) {
    return { clause: `AND u.us_dept_id = $${paramIndex}`, params: [filter.dept] };
  } else if (filter.role === "HOS" && filter.sec !== null) {
    return { clause: `AND u.us_sec_id = $${paramIndex}`, params: [filter.sec] };
  }
  return { clause: "", params: [] };
}

/**
 * Description: สร้าง WHERE clause เสริมสำหรับ ticket_issues ตาม role
 * - HOD: กรองตาม dept_id ของ reporter
 * - HOS: กรองตาม sec_id ของ reporter
 */
function buildIssueRoleClause(filter: UserRoleFilter, paramIndex: number) {
  if (filter.role === "HOD" && filter.dept !== null) {
    return { clause: `AND u.us_dept_id = $${paramIndex}`, params: [filter.dept] };
  } else if (filter.role === "HOS" && filter.sec !== null) {
    return { clause: `AND u.us_sec_id = $${paramIndex}`, params: [filter.sec] };
  }
  return { clause: "", params: [] };
}

/**
 * Description: คำนวณช่วงวันเริ่มต้นและสิ้นสุดของไตรมาสที่เลือก
 * Input : year (number), quarter (number: 1-4)
 * Output: { start: Date, end: Date }
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
function getQuarterRange(year: number, quarter: number) {
  const startMonthIndex = (quarter - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
  const start = new Date(year, startMonthIndex, 1, 0, 0, 0, 0);
  const end =
    quarter === 4
      ? new Date(year + 1, 0, 1, 0, 0, 0, 0)
      : new Date(year, startMonthIndex + 3, 1, 0, 0, 0, 0);

  return { start, end };
}

/**
 * Description: คำนวณช่วงวันเริ่มต้นและสิ้นสุดของทั้งปีที่เลือก
 * Input : year (number)
 * Output: { start: Date, end: Date }
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
function getYearRange(year: number) {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);

  return { start, end };
}

/**
 * Description: รายชื่อเดือนภาษาไทยสำหรับใช้แสดงผลบนกราฟรายเดือน
 * Input : -
 * Output: string[] (ชื่อเดือนภาษาไทย 12 เดือน)
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
const ThaiMonths = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/**
 * Description: ดึงสถิติการแจ้งปัญหารายเดือนตามช่วงปี/ไตรมาสที่เลือก
 * Input : query { year, quarter }
 * Output: { year, quarter, range, points[] }
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
async function getIssueStatsByQuarter(
  query: GetIssueStatsQueryDto,
  filter: UserRoleFilter,
): Promise<GetIssueStatsResponseDto> {
  const year = query.year;
  const quarter = query.quarter ?? 0;

  const isYear = quarter === 0;
  const { start, end } = isYear
    ? getYearRange(year)
    : getQuarterRange(year, quarter);

  type MonthRow = { month: number; count: number };

  const { clause: roleClause, params: roleParams } = buildIssueRoleClause(filter, 3);

  // base params: year(1), quarter(2)
  const sql = `SELECT
      EXTRACT(MONTH FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int AS month,
      COUNT(*)::int AS count
    FROM ticket_issues ti
    JOIN users u ON ti.ti_reported_by = u.us_id
    WHERE ti.deleted_at IS NULL
      AND EXTRACT(YEAR FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int = $1
      AND ($2 = 0 OR EXTRACT(QUARTER FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int = $2)
      ${roleClause}
    GROUP BY 1
    ORDER BY 1`;
  const rows = (await prisma.$queryRawUnsafe(sql, year, quarter, ...roleParams)) as MonthRow[];

  const countMap = new Map<number, number>();
  for (const row of rows) {
    countMap.set(row.month, Number(row.count) || 0);
  }

  const monthIndices =
    quarter === 0
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3];

  const points = monthIndices.map((month) => ({
    label: ThaiMonths[month - 1],
    value: countMap.get(month) ?? 0,
  }));

  return {
    year,
    quarter,
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    points,
  };
}

async function getDeviceChildCount(query: any): Promise<any> {
    const year = query.year;
    const quarter = query.quarter ?? 0;
  
    const isYear = quarter === 0;
    const { start, end } = isYear
      ? getYearRange(year)
      : getQuarterRange(year, quarter);
  
    // นับจำนวนอุปกรณ์สะสมถึงวันที่สิ้นสุดช่วง
    const result = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM device_childs dc
      WHERE dc.deleted_at IS NULL
        AND dc.created_at <= ${end}
    `;
    
    const count = Array.isArray(result) && result.length > 0 ? Number(result[0].total) : 0;
  
    return {
      year,
      quarter,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      total: count,
    };
}
export async function updateOverdueTickets() {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.borrow_return_tickets.updateMany({
      where: {
        brt_status: BRT_STATUS.IN_USE,
        brt_end_date: { lt: now },
        deleted_at: null,
      },
      data: {
        brt_status: BRT_STATUS.OVERDUE,
      },
    });

    if (updated.count > 0) {
      console.log(`🔥 Updated ${updated.count} overdue tickets`);
    }

    return updated.count;
  });
}

// ==========================================
// New Dashboard Statistics Functions
// ==========================================

export async function getBorrowStats(query: DashboardQueryDto, filter: UserRoleFilter): Promise<GetBorrowStatsResponseDto> {
  const { year, quarter = 0 } = query;
  const { clause: roleClause, params: roleParams } = buildBorrowRoleClause(filter, 3);

  type MonthRow = { month: number; count: number };
  const sql = `SELECT
      EXTRACT(MONTH FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int AS month,
      COUNT(*)::int AS count
    FROM borrow_return_tickets brt
    JOIN users u ON brt.brt_user_id = u.us_id
    WHERE brt.deleted_at IS NULL
      AND EXTRACT(YEAR FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int = $1
      AND ($2 = 0 OR EXTRACT(QUARTER FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int = $2)
      ${roleClause}
    GROUP BY 1
    ORDER BY 1`;
  const rows = (await prisma.$queryRawUnsafe(sql, year, quarter, ...roleParams)) as MonthRow[];

  const countMap = new Map<number, number>();
  for (const row of rows) {
    countMap.set(row.month, Number(row.count) || 0);
  }

  const monthIndices =
    quarter === 0
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3];

  const points = monthIndices.map((month) => ({
    label: ThaiMonths[month - 1],
    value: countMap.get(month) ?? 0,
  }));

  return { year, points };
}

export async function getMostBorrowedEquipmentStats(query: DashboardQueryDto, filter: UserRoleFilter): Promise<GetMostBorrowedStatsResponseDto> {
  const { year, quarter = 0 } = query;
  const { clause: roleClause, params: roleParams } = buildBorrowRoleClause(filter, 3);

  type MostBorrowedRow = { device_name: string; count: number };
  
  const sql = `SELECT
      d.de_name AS device_name,
      COUNT(td.td_id)::int AS count
    FROM borrow_return_tickets brt
    JOIN users u ON brt.brt_user_id = u.us_id
    JOIN ticket_devices td ON brt.brt_id = td.td_brt_id
    JOIN device_childs dc ON td.td_dec_id = dc.dec_id
    JOIN devices d ON dc.dec_de_id = d.de_id
    WHERE brt.deleted_at IS NULL
      AND EXTRACT(YEAR FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int = $1
      AND ($2 = 0 OR EXTRACT(QUARTER FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int = $2)
      ${roleClause}
    GROUP BY 1
    ORDER BY count DESC
    LIMIT 5`;
  const rows = (await prisma.$queryRawUnsafe(sql, year, quarter, ...roleParams)) as MostBorrowedRow[];

  const points = rows.map((row) => {
    return {
      equipmentName: row.device_name,
      value: Number(row.count) || 0,
    };
  });

  return { year, points };
}

export async function getRepairStatusStats(query: DashboardQueryDto, filter: UserRoleFilter): Promise<GetRepairStatusStatsResponseDto> {
  const { year, quarter = 0 } = query;
  const { clause: roleClause, params: roleParams } = buildIssueRoleClause(filter, 3);

  type StatusRow = { month: number; status: string; count: number };

  const sql = `SELECT
      EXTRACT(MONTH FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int AS month,
      ti.ti_status AS status,
      COUNT(*)::int AS count
    FROM ticket_issues ti
    JOIN users u ON ti.ti_reported_by = u.us_id
    WHERE ti.deleted_at IS NULL
      AND EXTRACT(YEAR FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int = $1
      AND ($2 = 0 OR EXTRACT(QUARTER FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int = $2)
      ${roleClause}
    GROUP BY 1, 2
    ORDER BY 1`;
  const rows = (await prisma.$queryRawUnsafe(sql, year, quarter, ...roleParams)) as StatusRow[];

  const monthIndices =
    quarter === 0
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3];

  const monthMap = new Map<number, { pending: number; inProgress: number; completed: number }>();
  
  for (const i of monthIndices) {
    monthMap.set(i, { pending: 0, inProgress: 0, completed: 0 });
  }

  for (const row of rows) {
    const stats = monthMap.get(row.month);
    if (!stats) continue;
    if (row.status === TI_STATUS.PENDING) stats.pending += Number(row.count) || 0;
    else if (row.status === TI_STATUS.IN_PROGRESS) stats.inProgress += Number(row.count) || 0;
    else if (row.status === TI_STATUS.COMPLETED) stats.completed += Number(row.count) || 0;
  }

  const points = monthIndices.map((month) => ({
    label: ThaiMonths[month - 1],
    ...monthMap.get(month)!,
  }));

  return { year, points };
}

type OverdueTableFilter = {
  role: string;
  dept: number | null;
  sec: number | null;
};

export async function getOverdueTicketsTable(filter: OverdueTableFilter): Promise<GetOverdueTableResponseDto> {
  const { role, dept, sec } = filter;

  // สร้าง where clause สำหรับ filter requester ตาม role
  const requesterWhere: Record<string, any> = {};
  if (role === "HOD" && dept !== null) {
    // HOD เห็นเฉพาะในแผนกของตนเอง
    requesterWhere.us_dept_id = dept;
  } else if (role === "HOS" && sec !== null) {
    // HOS เห็นเฉพาะในฝ่ายย่อยของตนเอง
    requesterWhere.us_sec_id = sec;
  }
  // ADMIN และ role อื่นๆ ไม่มี filter (เห็นทั้งหมด)

  const overdueTickets = await prisma.borrow_return_tickets.findMany({
    where: {
      brt_status: BRT_STATUS.OVERDUE,
      deleted_at: null,
      requester: Object.keys(requesterWhere).length > 0 ? requesterWhere : undefined,
    },
    include: {
      requester: {
        include: {
          department: true,
          section: true,
        }
      },
      staffer: true,
      ticket_devices: {
        include: {
          child: {
            include: {
              device: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      brt_end_date: 'asc'
    }
  });

  const now = new Date();

  const data = overdueTickets.map((ticket: any) => {
    const returnDate = ticket.brt_end_date;
    const diffTime = Math.abs(now.getTime() - returnDate.getTime());
    const delayedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const equipments = ticket.ticket_devices.map((td: any) => td.child.device.de_name);
    const uniqueEquipments = Array.from(new Set(equipments));
    
    const categories = ticket.ticket_devices.map((td: any) => td.child.device.category?.ca_name);
    const uniqueCategories = Array.from(new Set(categories)).filter(Boolean);

    const assetCodes = ticket.ticket_devices.map((td: any) => td.child.dec_asset_code);

    return {
      ticketId: ticket.brt_id,
      userName: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
      userEmail: ticket.requester.us_email,
      userEmpCode: ticket.requester.us_emp_code,
      userImage: ticket.requester.us_images,
      userRole: ticket.requester.us_role,
      department: ticket.requester.department?.dept_name ?? null,
      section: ticket.requester.section?.sec_name ?? null,
      phone: ticket.brt_phone || ticket.requester.us_phone,
      equipments: uniqueEquipments,
      categories: uniqueCategories,
      assetCodes: assetCodes,
      quantity: ticket.brt_quantity,
      purpose: ticket.brt_borrow_purpose,
      location: ticket.brt_usage_location,
      staffName: ticket.staffer ? `${ticket.staffer.us_firstname} ${ticket.staffer.us_lastname}` : null,
      delayedDays: delayedDays,
      returnDate: returnDate.toISOString(),
      startDate: ticket.brt_start_date.toISOString(),
    };
  });

  return { data };
}

export const dashboardDataService = {
  getBorrowStats,
  getMostBorrowedEquipmentStats,
  getRepairStatusStats,
  getOverdueTicketsTable,
};

export const dashboardIssueService = { getIssueStatsByQuarter, updateOverdueTickets, getDeviceChildCount };