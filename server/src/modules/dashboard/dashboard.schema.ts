import { z } from "zod";

/**
 * Description: Query สำหรับดึงสถิติการยืม (รองรับ filter ปี + ไตรมาส)
 * Input : year (number), quarter (1-4)
 * Output: query dto
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export const getBorrowStatsQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .openapi({ description: "ปี ค.ศ." }),

  quarter: z.coerce
    .number()
    .int()
    .min(0)
    .max(4)
    .openapi({ description: "ไตรมาส 1-4" }),
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
  points: z
    .array(linePointSchema)
    .openapi({ description: "ข้อมูล 3 เดือนในไตรมาส" }),
});

export const getTopBorrowedQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const topBorrowedDeviceSchema = z.object({
  device_id: z.number(),
  device_name: z.string(),
  total: z.number(),
});

export const getTopBorrowedResponseSchema = z.array(topBorrowedDeviceSchema);

export type GetTopBorrowedQueryDto = z.infer<typeof getTopBorrowedQuerySchema>;
export type GetTopBorrowedResponseDto = z.infer<
  typeof getTopBorrowedResponseSchema
>;
export type GetBorrowStatsQueryDto = z.infer<typeof getBorrowStatsQuerySchema>;
export type GetBorrowStatsResponseDto = z.infer<
  typeof getBorrowStatsResponseSchema
>;
