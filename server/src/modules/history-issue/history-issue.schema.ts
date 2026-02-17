import { z } from "zod";

/**
 * Query schema สำหรับหน้า list (ใช้กับ router.getDoc)
 */
export const getHistoryIssueQuerySchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  assignedToMe: z.coerce.boolean().optional(),
});

/**
 * Param schema สำหรับ :id
 * (ถ้าคุณมี idParamSchema ในไฟล์ common อยู่แล้ว ให้ import แทนได้)
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Device child schema (สำหรับ detail)
 */
export const historyIssueDeviceChildSchema = z.object({
  deviceChildId: z.number(),
  deviceChildAssetCode: z.string(),
  deviceChildSerialNumber: z.string().nullable(),
  deviceChildStatus: z.string(),
});

/**
 * Item schema (ใช้ทั้ง list และ detail)
 */
export const historyIssueItemSchema = z.object({
  issueId: z.number(),

  parentDevice: z.object({
    id: z.number(),
    serialNumber: z.string(),
    name: z.string(),
    categoryName: z.string(),
    departmentName: z.string().nullable(),
    sectionName: z.string().nullable(),
    locationName: z.string(),
  }),

  issueTitle: z.string(),
  issueDescription: z.string(),
  issueStatus: z.string(),
  issueResult: z.string(),

  reportedAt: z.date(),

  reporterUser: z.object({
    id: z.number(),
    empCode: z.string().nullable(),
    fullName: z.string(),
  }),

  assigneeUser: z
    .object({
      id: z.number(),
      fullName: z.string(),
    })
    .nullable(),

  receiveLocationName: z.string().nullable(),
  deviceChildCount: z.number(),
});

/**
 * Data schema สำหรับ detail (เพื่อเอาไป infer type ได้ง่าย และ reuse ใน response schema)
 */
export const historyIssueDetailDataSchema = historyIssueItemSchema.extend({
  damagedReason: z.string().nullable(),
  resolvedNote: z.string().nullable(),
  deviceChildList: z.array(historyIssueDeviceChildSchema),
});

/**
 * Response schema สำหรับ list
 */
export const historyIssueListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(historyIssueItemSchema),
});

/**
 * Response schema สำหรับ detail
 */
export const historyIssueDetailResponseSchema = z.object({
  success: z.boolean(),
  data: historyIssueDetailDataSchema,
});

/**
 * -----------------------------
 * Export Types (ให้ service import ได้)
 * -----------------------------
 */
export type GetHistoryIssueQuery = z.infer<typeof getHistoryIssueQuerySchema>;
export type HistoryIssueItem = z.infer<typeof historyIssueItemSchema>;
export type HistoryIssueDetail = z.infer<typeof historyIssueDetailDataSchema>;
export type HistoryIssueDeviceChild = z.infer<typeof historyIssueDeviceChildSchema>;
