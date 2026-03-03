/**
 * Description: Service สำหรับเรียก API Dashboard (สถิติการยืมรายเดือน + จำนวนอุปกรณ์ย่อยสะสม)
 * Note      : รองรับ filter year + quarter (quarter=0 = ทั้งปี)
 * Output    : DashboardLineChartService (object) สำหรับเรียกใช้งาน API
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

const BORROW_STATS_URL = "/dashboard/borrow-stats";
// ถ้าของคุณเป็น dashboard-borrow ให้ใช้บรรทัดนี้แทน:
// const BORROW_STATS_URL = "/dashboard-borrow/borrow-stats";


export type GetDeviceChildCountParams = {
  year: number;
  quarter: number; // 0=ทั้งปี, 1-4=ไตรมาส
};

export type GetDeviceChildCountResponse = {
  year: number;
  quarter: number;
  range: { start: string; end: string };
  total: number; // จำนวนอุปกรณ์ย่อยสะสมจนถึง end ของช่วงที่เลือก
};

const DEVICE_CHILD_COUNT_URL = "/dashboard/device-child-count";
// ถ้าของคุณเป็น dashboard-borrow ให้ใช้บรรทัดนี้แทน:
// const DEVICE_CHILD_COUNT_URL = "/dashboard-borrow/device-child-count";

export const DashboardLineChartService = {
  /**
   * Description: ดึงสถิติการยืมตามปี/ไตรมาส
   * Input : params { year, quarter } (quarter=0=ทั้งปี)
   * Output: Promise<GetBorrowStatsResponse>
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async getBorrowStats(params: GetBorrowStatsParams): Promise<GetBorrowStatsResponse> {
    const res = await api.get<ApiEnvelope<GetBorrowStatsResponse>>("/dashboard/borrow-stats", {
      params: {
        year: params.year,
        quarter: params.quarter ?? 0,
      },
    });
    return res.data.data;
  },

  /**
   * Description: ดึงจำนวนอุปกรณ์ย่อยแบบสะสม (ตั้งแต่ต้นระบบจนถึงสิ้นสุดช่วงที่เลือก)
   * Input : params { year, quarter }
   * Output: Promise<GetDeviceChildCountResponse>
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async getDeviceChildCount(
    params: GetDeviceChildCountParams,
  ): Promise<GetDeviceChildCountResponse> {
    const res = await api.get<ApiEnvelope<GetDeviceChildCountResponse>>("/dashboard/device-child-count", {
      params: {
        year: params.year,
        quarter: params.quarter ?? 0,
      },
    });
    return res.data.data;
  },
};

export default DashboardLineChartService;