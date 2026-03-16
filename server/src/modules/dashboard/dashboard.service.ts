import { Prisma,BRT_STATUS   } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";
import type { GetBorrowStatsQueryDto, GetBorrowStatsResponseDto } from "./dashboard.schema.js";

function getQuarterRange(year: number, quarter: number) {
  const startMonthIndex = (quarter - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
  const start = new Date(year, startMonthIndex, 1, 0, 0, 0, 0);
  const end =
    quarter === 4
      ? new Date(year + 1, 0, 1, 0, 0, 0, 0)
      : new Date(year, startMonthIndex + 3, 1, 0, 0, 0, 0);
  return { start, end };
}

function getYearRange(year: number) {
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);
  return { start, end };
}

const TH_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

async function getBorrowStatsByQuarter(
  query: GetBorrowStatsQueryDto,
): Promise<GetBorrowStatsResponseDto> {
  const year = query.year;
  const quarter = query.quarter ?? 0;

  const isYear = quarter === 0;
  const { start, end } = isYear ? getYearRange(year) : getQuarterRange(year, quarter);

  // ✅ นิยาม "การยืม": ตัด REJECTED ออก
  const includedStatuses = ["PENDING", "APPROVED", "IN_USE", "COMPLETED"] as const;

  type MonthRow = { month: number; count: number };

  // year, quarter (0=ทั้งปี)
  const rows = (await prisma.$queryRaw`
  SELECT
    EXTRACT(MONTH FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int AS month,
    COUNT(*)::int AS count
  FROM borrow_return_tickets brt
  WHERE brt.deleted_at IS NULL
    AND brt.brt_status <> 'REJECTED'
    AND EXTRACT(YEAR FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int = ${year}
    AND (
      ${quarter} = 0 OR
      EXTRACT(QUARTER FROM (brt.brt_start_date AT TIME ZONE 'Asia/Bangkok'))::int = ${quarter}
    )
  GROUP BY 1
  ORDER BY 1;
`) as MonthRow[];

  const countMap = new Map<number, number>(); // key = 1..12
  for (const r of rows) countMap.set(r.month, Number(r.count) || 0);

  // monthIndices ที่จะคืน
  const monthIndices =
    quarter === 0
      ? Array.from({ length: 12 }, (_, i) => i + 1) // 1..12
      : [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3];

  const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const points = monthIndices.map((m) => ({
    label: TH_MONTHS[m - 1],
    value: countMap.get(m) ?? 0,
  }));

  return {
    year,
    quarter,
    range: { start: start.toISOString(), end: end.toISOString() },
    points,
  };
}
async function getTopBorrowedDevices(year?: number) {
  type Row = {
    device_id: number;
    device_name: string;
    total: number;
  };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      d.id AS device_id,
      d.device_name,
      COUNT(*)::int AS total
    FROM borrow_return_ticket_items bi
    JOIN borrow_return_tickets brt
      ON brt.id = bi.borrow_return_ticket_id
    JOIN devices d
      ON d.id = bi.device_id
    WHERE brt.deleted_at IS NULL
      AND brt.brt_status <> 'REJECTED'
      ${
        year
          ? Prisma.sql`AND EXTRACT(YEAR FROM brt.brt_start_date)::int = ${year}`
          : Prisma.empty
      }
    GROUP BY d.id, d.device_name
    ORDER BY total DESC
    LIMIT 5;
  `;

  return rows;
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
export const dashboardBorrowService = { getBorrowStatsByQuarter,updateOverdueTickets  };