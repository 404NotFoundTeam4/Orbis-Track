/**
 * Description: Service สำหรับเรียก API Dashboard
 * Note      : รองรับ filter year + quarter (quarter=0 = ทั้งปี)
 * Output    : DashboardLineChartService (object) สำหรับเรียกใช้งาน API
 * Author    : Nontapat Sinthum (Guitar) 66160104
 */

import api from "../api/axios.js";

/**
 * Description: โครงสร้าง Envelope มาตรฐานที่ Backend ส่งกลับมา (ใช้ครอบข้อมูล response จริง)
 * Input : Type (Generic type ของข้อมูลใน field data)
 * Output : ApiEnvelope<Type>
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
type ApiEnvelope<Type> = {
  success?: boolean;
  message?: string;
  data: Type;
};

/**
 * Description: จุดข้อมูลสำหรับกราฟเส้น
 * Input : label (string), value (number)
 * Output : LinePoint
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type LinePoint = { label: string; value: number };

/**
 * Description: พารามิเตอร์สำหรับดึงสถิติการยืม
 * Input : year, quarter
 * Output : GetBorrowStatsParams
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type GetBorrowStatsParams = {
  year: number;
  quarter: number; // 0=ทั้งปี, 1-4=ไตรมาส
};

/**
 * Description: โครงสร้าง response สำหรับสถิติการยืม
 * Input : -
 * Output : GetBorrowStatsResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type GetBorrowStatsResponse = {
  year: number;
  quarter: number;
  range: { start: string; end: string };
  points: LinePoint[]; // quarter=0 => 12 จุด, 1-4 => 3 จุด
};

const BorrowStatsUrl = "/dashboard/borrow-stats";

/**
 * Description: พารามิเตอร์สำหรับดึงจำนวนอุปกรณ์ย่อยสะสม
 * Input : year, quarter
 * Output : GetDeviceChildCountParams
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type GetDeviceChildCountParams = {
  year: number;
  quarter: number; // 0=ทั้งปี, 1-4=ไตรมาส
};

/**
 * Description: โครงสร้าง response สำหรับจำนวนอุปกรณ์ย่อยสะสม
 * Input : -
 * Output : GetDeviceChildCountResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type GetDeviceChildCountResponse = {
  year: number;
  quarter: number;
  range: { start: string; end: string };
  total: number; // จำนวนอุปกรณ์ย่อยสะสมจนถึง end ของช่วงที่เลือก
};

const DeviceChildCountUrl = "/dashboard/device-child-count";

/**
 * Description: พารามิเตอร์สำหรับดึงสถิติคำร้องแจ้งซ่อม
 * Input : year, quarter
 * Output : GetIssueStatsParams
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type GetIssueStatsParams = {
  year: number;
  quarter: number; // 0=ทั้งปี, 1-4=ไตรมาส
};

/**
 * Description: โครงสร้าง response สำหรับสถิติคำร้องแจ้งซ่อม
 * Input : -
 * Output : GetIssueStatsResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type GetIssueStatsResponse = {
  year: number;
  quarter: number;
  range: { start: string; end: string };
  points: LinePoint[]; // quarter=0 => 12 จุด, 1-4 => 3 จุด
};

const IssueStatsUrl = "/dashboard/issue-stats";

export const DashboardLineChartService = {
  /**
   * Description: ดึงสถิติการยืมตามปี/ไตรมาส
   * Input : params { year, quarter } (quarter=0=ทั้งปี)
   * Output: Promise<GetBorrowStatsResponse>
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async getBorrowStats(params: GetBorrowStatsParams): Promise<GetBorrowStatsResponse> {
    const res = await api.get<ApiEnvelope<GetBorrowStatsResponse>>(BorrowStatsUrl, {
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
    const res = await api.get<ApiEnvelope<GetDeviceChildCountResponse>>(DeviceChildCountUrl, {
      params: {
        year: params.year,
        quarter: params.quarter ?? 0,
      },
    });
    return res.data.data;
  },

  /**
   * Description: ดึงสถิติคำร้องแจ้งซ่อมตามปี/ไตรมาส
   * Input : params { year, quarter } (quarter=0=ทั้งปี)
   * Output: Promise<GetIssueStatsResponse>
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async getIssueStats(params: GetIssueStatsParams): Promise<GetIssueStatsResponse> {
    const res = await api.get<ApiEnvelope<GetIssueStatsResponse>>(IssueStatsUrl, {
      params: {
        year: params.year,
        quarter: params.quarter ?? 0,
      },
    });
    return res.data.data;
  },
};

export default DashboardLineChartService;