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