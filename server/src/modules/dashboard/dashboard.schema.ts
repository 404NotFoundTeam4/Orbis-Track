import { z } from "zod";

/**
 * Description: Query สำหรับดึงสถิติคำร้องแจ้งซ่อม (รองรับ filter ปี + ไตรมาส)
 * Input : year (number), quarter (0-4)
 * Output: query dto
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getIssueStatsQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).openapi({ description: "ปี ค.ศ." }),
  quarter: z.coerce.number().int().min(0).max(4).openapi({ description: "ไตรมาส 1-4 (0=ทั้งปี)" }),
});

/**
 * Description: จุดข้อมูล line chart ของคำร้องแจ้งซ่อม
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const issueLinePointSchema = z.object({
  label: z.string().openapi({ description: "ชื่อเดือน (ไทย)" }),
  value: z.number().int().nonnegative().openapi({ description: "จำนวนคำร้องแจ้งซ่อม" }),
});

/**
 * Description: Response สำหรับสถิติคำร้องแจ้งซ่อมรายเดือน
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getIssueStatsResponseSchema = z.object({
  year: z.number(),
  quarter: z.number(),
  range: z.object({
    start: z.string().openapi({ description: "ISO start (inclusive)" }),
    end: z.string().openapi({ description: "ISO end (exclusive)" }),
  }),
  points: z.array(issueLinePointSchema).openapi({ description: "ข้อมูลเดือนในช่วงที่เลือก" }),
});

export type GetIssueStatsQueryDto = z.infer<typeof getIssueStatsQuerySchema>;
export type GetIssueStatsResponseDto = z.infer<typeof getIssueStatsResponseSchema>;
export type IssueLinePointSchema = z.infer<typeof issueLinePointSchema>;

/**
 * Data points for dashboard line charts (general)
 */
export const dashboardLinePointSchema = z.object({
  label: z.string().openapi({ description: "ชื่อเดือน (ไทย)" }),
  value: z.number().int().nonnegative().openapi({ description: "จำนวน" }),
});

/**
 * Borrow Stats (รายเดือน)
 */
export const getBorrowStatsResponseSchema = z.object({
  year: z.number(),
  points: z.array(dashboardLinePointSchema).openapi({ description: "ข้อมูลสถิติการยืมรายเดือน" }),
});

/**
 * Most Borrowed Equipment (รายเดือน)
 */
export const mostBorrowedPointSchema = z.object({
  equipmentName: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
  value: z.number().int().nonnegative().openapi({ description: "จำนวนครั้งที่ยืมรายปี" }),
});

export const getMostBorrowedStatsResponseSchema = z.object({
  year: z.number(),
  points: z.array(mostBorrowedPointSchema).openapi({ description: "อุปกรณ์ที่ถูกยืมบ่อยสุดรายเดือน" }),
});

/**
 * Repair Status (ซ่อมอุปกรณ์แบบรายเดือน แยกตามสถานะ)
 */
export const repairStatusPointSchema = z.object({
  label: z.string().openapi({ description: "ชื่อเดือน (ไทย)" }),
  pending: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
});

export const getRepairStatusStatsResponseSchema = z.object({
  year: z.number(),
  points: z.array(repairStatusPointSchema).openapi({ description: "สถานะการซ่อมรายเดือน" }),
});

/**
 * Overdue Table
 */
export const overdueTicketSchema = z.object({
  ticketId: z.number(),
  userName: z.string(),
  userEmail: z.string(),
  userEmpCode: z.string().nullable(),
  userImage: z.string().nullable(),
  userRole: z.string(),
  department: z.string().nullable(),
  section: z.string().nullable(),
  phone: z.string(),
  equipments: z.array(z.string()),
  categories: z.array(z.string()),
  assetCodes: z.array(z.string()),
  quantity: z.number(),
  purpose: z.string(),
  location: z.string(),
  staffName: z.string().nullable(),
  delayedDays: z.number(),
  returnDate: z.string(),
  startDate: z.string(),
});

export const getOverdueTableResponseSchema = z.object({
  data: z.array(overdueTicketSchema).openapi({ description: "ตารางรายการอุปกรณ์ที่คืนล่าช้าพร้อมข้อมูลผู้ยืม" }),
});

// query schema for all new endpoints
export const dashboardQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).openapi({ description: "ปี ค.ศ." }),
  quarter: z.coerce.number().int().min(0).max(4).default(0).openapi({ description: "ไตรมาส 1-4 (0=ทั้งปี)" }),
});

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
export type GetBorrowStatsResponseDto = z.infer<typeof getBorrowStatsResponseSchema>;
export type GetMostBorrowedStatsResponseDto = z.infer<typeof getMostBorrowedStatsResponseSchema>;
export type GetRepairStatusStatsResponseDto = z.infer<typeof getRepairStatusStatsResponseSchema>;
export type GetOverdueTableResponseDto = z.infer<typeof getOverdueTableResponseSchema>;