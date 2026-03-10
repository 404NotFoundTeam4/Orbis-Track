import { prisma } from "../../infrastructure/database/client.js";
import type {
  GetBorrowStatsQueryDto,
  GetBorrowStatsResponseDto,
  GetDeviceChildCountQueryDto,
  GetDeviceChildCountResponseDto,
} from "./dashboard-borrow.schema.js";

const ThaiMonths = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

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
 * Description: ดึงสถิติการยืมรายเดือนตามช่วงปี/ไตรมาสที่เลือก
 * Input : query { year, quarter }
 * Output: { year, quarter, range, points[] }
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
async function getBorrowStatsByQuarter(
  query: GetBorrowStatsQueryDto,
): Promise<GetBorrowStatsResponseDto> {
  const year = query.year;
  const quarter = query.quarter ?? 0;

  const isYear = quarter === 0;
  const { start, end } = isYear
    ? getYearRange(year)
    : getQuarterRange(year, quarter);

  type MonthRow = { month: number; count: number };

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

/**
 * Description: ดึงจำนวนอุปกรณ์ย่อยแบบสะสมจนถึงสิ้นสุดช่วง (filter ปี/ไตรมาส)
 * Input : query { year, quarter }
 * Output: { year, quarter, range, total }
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
async function getDeviceChildCountByQuarter(
  query: GetDeviceChildCountQueryDto,
): Promise<GetDeviceChildCountResponseDto> {
  const year = query.year;
  const quarter = query.quarter ?? 0;

  const isYear = quarter === 0;
  const { start, end } = isYear
    ? getYearRange(year)
    : getQuarterRange(year, quarter);

  /**
   * นับแบบสะสม: ตั้งแต่ต้นระบบ -> จนถึง "สิ้นสุดช่วงที่เลือก"
   * เงื่อนไขหลัก: created_at < end
   */
  const row = (await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total
    FROM device_childs dec
    WHERE dec.created_at < ${end}
      AND (dec.deleted_at IS NULL OR dec.deleted_at >= ${end});
  `) as Array<{ total: number }>;

  const total = Number(row?.[0]?.total ?? 0);

  return {
    year,
    quarter,
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    total,
  };
}

export const dashboardBorrowService = {
  getBorrowStatsByQuarter,
  getDeviceChildCountByQuarter,
};