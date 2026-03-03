/**
 * Description: Service สำหรับเรียก API Dashboard (สถิติการยืมรายเดือน)
 * Note      : รองรับ filter year + quarter (quarter=0 = ทั้งปี)
 * Output    : DashboardBorrowService (object) สำหรับเรียกใช้งาน API
 * Author    : Nontapat Sinthum (Guitar) 66160104
 */

import api from "../api/axios.js";

/**
 * Description: โครงสร้าง Envelope มาตรฐานที่ Backend ส่งกลับมา (ใช้ครอบข้อมูล response จริง)
 * Input : T (Generic type ของข้อมูลใน field data)
 * Output : ApiEnvelope<T>
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type LinePoint = { label: string; value: number };

export type GetBorrowStatsParams = {
  year: number;
  quarter: number; // 0=ทั้งปี, 1-4=ไตรมาส
};

export type GetBorrowStatsResponse = {
  year: number;
  quarter: number;
  range: { start: string; end: string };
  points: LinePoint[]; // quarter=0 => 12 จุด, 1-4 => 3 จุด
};

// ✅ ปรับ path ให้ตรง backend ของคุณ
const BORROW_STATS_URL = "/dashboard/borrow-stats";
// ถ้าของคุณเป็น dashboard-borrow ให้ใช้บรรทัดนี้แทน:
// const BORROW_STATS_URL = "/dashboard-borrow/borrow-stats";

export const DashboardBorrowService = {
  /**
   * Description: ดึงสถิติการยืมตามปี/ไตรมาส
   * Input : params { year, quarter } (quarter=0=ทั้งปี)
   * Output: Promise<GetBorrowStatsResponse>
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async getBorrowStats(
    params: GetBorrowStatsParams,
  ): Promise<GetBorrowStatsResponse> {
    const res = await api.get<ApiEnvelope<GetBorrowStatsResponse>>(
      BORROW_STATS_URL,
      {
        params: {
          year: params.year,
          quarter: params.quarter ?? 0,
        },
      },
    );
    return res.data.data;
  },
};

export default DashboardBorrowService;