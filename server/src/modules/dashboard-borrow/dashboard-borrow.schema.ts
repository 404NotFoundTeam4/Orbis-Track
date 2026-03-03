import { z } from "zod";

/**
 * Description: Query สำหรับดึงสถิติการยืม (รองรับ filter ปี + ไตรมาส)
 * Input : year (number), quarter (1-4)
 * Output: query dto
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getBorrowStatsQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).openapi({ description: "ปี ค.ศ." }),

  quarter: z.coerce.number().int().min(0).max(4).openapi({ description: "ไตรมาส 1-4 (0=ทั้งปี)" }),
});

/**
 * Description: จุดข้อมูล line chart
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const linePointSchema = z.object({
  label: z.string().openapi({ description: "ชื่อเดือน (ไทย)" }),
  value: z.number().int().nonnegative().openapi({ description: "จำนวนการยืม" }),
});

/**
 * Description: Response สำหรับสถิติการยืมรายเดือนในไตรมาส
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getBorrowStatsResponseSchema = z.object({
  year: z.number(),
  quarter: z.number(),
  range: z.object({
    start: z.string().openapi({ description: "ISO start (inclusive)" }),
    end: z.string().openapi({ description: "ISO end (exclusive)" }),
  }),
  points: z.array(linePointSchema).openapi({ description: "ข้อมูลเดือนในช่วงที่เลือก" }),
});

/**
 * Description: Query สำหรับดึงจำนวนอุปกรณ์ย่อยแบบสะสม (ตั้งแต่ต้นระบบจนถึงสิ้นสุดช่วงที่เลือก)
 * Input : year (number), quarter (0-4)
 * Output: query dto
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getDeviceChildCountQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).openapi({ description: "ปี ค.ศ." }),
  quarter: z.coerce.number().int().min(0).max(4).openapi({ description: "ไตรมาส 1-4 (0=ทั้งปี)" }),
});

/**
 * Description: Response สำหรับจำนวนอุปกรณ์ย่อยแบบสะสมจนถึงสิ้นสุดช่วงที่เลือก
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getDeviceChildCountResponseSchema = z.object({
  year: z.number(),
  quarter: z.number(),
  range: z.object({
    start: z.string().openapi({ description: "ISO start (inclusive)" }),
    end: z.string().openapi({ description: "ISO end (exclusive)" }),
  }),
  total: z.number().int().nonnegative().openapi({ description: "จำนวนอุปกรณ์ย่อยทั้งหมด (สะสมจนถึง end)" }),
});

export type GetBorrowStatsQueryDto = z.infer<typeof getBorrowStatsQuerySchema>;
export type GetBorrowStatsResponseDto = z.infer<typeof getBorrowStatsResponseSchema>;
export type LinePointSchema = z.infer<typeof linePointSchema>;
export type GetDeviceChildCountQueryDto = z.infer<typeof getDeviceChildCountQuerySchema>;
export type GetDeviceChildCountResponseDto = z.infer<typeof getDeviceChildCountResponseSchema>;