import { z } from "zod";

/**
 * Description: Query schema สำหรับหน้า list (ใช้กับ router.getDoc)
 * Input : querystring (status, assignedToMe)
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const getHistoryIssueQuerySchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  assignedToMe: z.coerce.boolean().optional(),
});

/**
 * Description: Param schema สำหรับ :id
 * Input : params.id
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Description: Device child schema (สำหรับ detail)
 * Input : deviceChild object
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyIssueDeviceChildSchema = z.object({
  deviceChildId: z.number(),
  deviceChildAssetCode: z.string(),
  deviceChildSerialNumber: z.string().nullable(),
  deviceChildStatus: z.string(),
});

/**
 * Description: Attachment schema (รูปแนบใบแจ้งซ่อม)
 * Input : attachment object
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyIssueAttachmentSchema = z.object({
  attachmentId: z.number(),
  pathUrl: z.string(),
  uploadedAt: z.date(),
});

/**
 * Description: Item schema (ใช้ทั้ง list และ detail)
 * Input : HistoryIssueItem DTO
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
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

  issueStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  issueResult: z.enum(["SUCCESS", "FAILED", "IN_PROGRESS"]),

  /**
   * หมายเหตุ:
   * - ถ้าคุณ validate ก่อน res.json() (ยังเป็น Date object) ให้ใช้ z.date() ได้
   * - ถ้าคุณ validate หลัง serialize (เป็น ISO string) ให้เปลี่ยนเป็น z.string().datetime()
   */
  reportedAt: z.date(),

  reporterUser: z.object({
    id: z.number(),
    empCode: z.string().nullable(),
    fullName: z.string(),
  }),

  /**
   * Description: ผู้รับผิดชอบ (เพิ่ม empCode ตาม requirement)
   * Input : assigneeUser (nullable)
   * Output : object | null
   * Author: Chanwit Muangma (Boom) 66160224
   */
  assigneeUser: z
    .object({
      id: z.number(),
      empCode: z.string().nullable(),
      fullName: z.string(),
    })
    .nullable(),

  receiveLocationName: z.string().nullable(),
  deviceChildCount: z.number(),
});

/**
 * Description: Data schema สำหรับ detail (extend จาก item)
 * Input : HistoryIssueDetail DTO
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyIssueDetailDataSchema = historyIssueItemSchema.extend({
  damagedReason: z.string().nullable(),
  resolvedNote: z.string().nullable(),
  deviceChildList: z.array(historyIssueDeviceChildSchema),

  /**
   * Description: รูปแนบของใบแจ้งซ่อม (ใช้ทำปุ่ม “ดูรูป”)
   * Input : attachments[]
   * Output : attachments[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  attachments: z.array(historyIssueAttachmentSchema),
});

/**
 * Description: Response schema สำหรับ list
 * Input : { success, data }
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyIssueListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(historyIssueItemSchema),
});

/**
 * Description: Response schema สำหรับ detail
 * Input : { success, data }
 * Output : Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
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
export type HistoryIssueAttachment = z.infer<typeof historyIssueAttachmentSchema>;
