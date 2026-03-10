import { prisma } from "../../infrastructure/database/client.js";
import type {
  GetIssueStatsQueryDto,
  GetIssueStatsResponseDto,
} from "./dashboard-issue.schema.js";

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
): Promise<GetIssueStatsResponseDto> {
  const year = query.year;
  const quarter = query.quarter ?? 0;

  const isYear = quarter === 0;
  const { start, end } = isYear
    ? getYearRange(year)
    : getQuarterRange(year, quarter);

  type MonthRow = { month: number; count: number };

  /**
   * นับคำร้องแจ้งซ่อมจาก ticket_issues.created_at
   * - ตัด soft delete ออก
   * - quarter = 0 หมายถึงทั้งปี
   */
  const rows = (await prisma.$queryRaw`
    SELECT
      EXTRACT(MONTH FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int AS month,
      COUNT(*)::int AS count
    FROM ticket_issues ti
    WHERE ti.deleted_at IS NULL
      AND EXTRACT(YEAR FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int = ${year}
      AND (
        ${quarter} = 0 OR
        EXTRACT(QUARTER FROM (ti.created_at AT TIME ZONE 'Asia/Bangkok'))::int = ${quarter}
      )
    GROUP BY 1
    ORDER BY 1;
  `) as MonthRow[];

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

export const dashboardIssueService = {
  getIssueStatsByQuarter,
};