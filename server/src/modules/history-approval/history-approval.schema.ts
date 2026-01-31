// src/modules/history-approval/history-approval.schema.ts
import { z } from "zod";
import { BRTS_STATUS, US_ROLE } from "@prisma/client";

/**
 * Description: ฟังก์ชันสำหรับแปลงค่า empty/null/undefined ให้เป็น undefined เพื่อให้ Zod optional ทำงานถูกต้อง
 * Input : value (unknown) ค่าที่รับมาจาก query เช่น string ว่าง, null, undefined หรือค่าอื่น
 * Output : unknown (คืนค่า undefined เมื่อเป็นค่าว่าง/ไม่ถูกต้อง มิฉะนั้นคืนค่าเดิม)
 * Author: Chanwit Muangma (Boom) 66160224
 */
const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (trimmedValue === "" || trimmedValue === "--") return undefined;
  }

  return value;
};

/**
 * Description: Schema สำหรับ action ของประวัติการอนุมัติ (รองรับเฉพาะผลลัพธ์ที่ “ทำแล้ว”)
 * Input : string
 * Output : "APPROVED" | "REJECTED"
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const approvalActionSchema = z.enum(["APPROVED", "REJECTED"]);

/**
 * Description: Schema สำหรับ query ของ endpoint List ประวัติการอนุมัติ
 * Input : Query string (page, limit, action, search, sortField, sortDirection)
 * Output : Zod Schema สำหรับ validate และ coerce ชนิดข้อมูลของ query
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const getHistoryApprovalQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).optional()
  ),

  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).optional()
  ),

  /**
   * Description: ตัวกรองผลการอนุมัติ (อนุมัติ/ปฏิเสธ)
   * Input : "APPROVED" | "REJECTED"
   * Output : approvalActionSchema | undefined
   * Author: Chanwit Muangma (Boom) 66160224
   */
  action: z.preprocess(emptyToUndefined, approvalActionSchema.optional()),

  search: z.preprocess(emptyToUndefined, z.string().optional()),

  /**
   * Description: ฟิลด์ที่รองรับการ sort ในหน้า List ประวัติการอนุมัติ
   * Input : string union
   * Output : ใช้ส่งเป็น query parameter sortField
   * Author: Chanwit Muangma (Boom) 66160224
   */
  sortField: z.preprocess(
    emptyToUndefined,
    z
      .enum([
        "actionDateTime",
        "action",
        "requester",
        "deviceName",
      ])
      .optional()
  ),

  sortDirection: z.preprocess(
    emptyToUndefined,
    z.enum(["asc", "desc"]).optional()
  ),
});

/**
 * Description: Schema สำหรับพารามิเตอร์ ticketId ใน path
 * Input : Params { ticketId }
 * Output : Zod Schema สำหรับ validate และ coerce ticketId เป็น number
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Description: Schema สำหรับข้อมูลสรุปผู้ส่งคำขอ (Requester)
 * Input : Object ของผู้ร้องขอจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลผู้ร้องขอ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const requesterSummarySchema = z.object({
  userId: z.coerce.number(),
  fullName: z.string(),
  employeeCode: z.string().nullable(),
  departmentName: z.string().nullable(),
  sectionName: z.string().nullable(),
});

/**
 * Description: Schema สำหรับข้อมูลสรุปอุปกรณ์แม่ (Main Device) ใน Ticket
 * Input : Object ของอุปกรณ์แม่จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์แม่
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const deviceSummarySchema = z.object({
  deviceId: z.coerce.number(),
  deviceName: z.string(),
  deviceSerialNumber: z.string(),
  categoryName: z.string().nullable(), 
});

/**
 * Description: Schema สำหรับข้อมูลผู้ดำเนินการ/ผู้กระทำ (Actor)
 * - ใช้แสดง "ผู้ดำเนินการ" ใน UI สำหรับ ADMIN/STAFF (และสามารถใช้เป็นผู้กระทำได้ทุก role)
 * Input : Object ของผู้ใช้จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลผู้ใช้
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const actorUserSchema = z.object({
  userId: z.coerce.number(),
  fullName: z.string(),
  employeeCode: z.string().nullable(),
  role: z.nativeEnum(US_ROLE),
  departmentName: z.string().nullable(),
  sectionName: z.string().nullable(),
});

/**
 * Description: Schema สำหรับ “แถว” ของรายการประวัติการอนุมัติ (List item)
 * NOTE:
 * - ตาม requirement ใหม่: เอา actor ออกจาก list (จะไปอยู่ใน detail แทน)
 * - actionDateTime ให้เป็น ISO string เพื่อให้ FE format ได้ง่ายและตรงกันทั้ง list/detail
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyApprovalItemSchema = z.object({
  ticketId: z.coerce.number(),

  /**
   * Description: ผลการอนุมัติ/ปฏิเสธ
   * Input : "APPROVED" | "REJECTED"
   * Output : approvalActionSchema
   * Author: Chanwit Muangma (Boom) 66160224
   */
  action: approvalActionSchema,

  /**
   * Description: วัน-เวลาที่กระทำ (API ส่งเป็น ISO string)
   * Input : string (ISO 8601)
   * Output : string
   * Author: Chanwit Muangma (Boom) 66160224
   */
  actionDateTime: z.string().datetime(),

  requester: requesterSummarySchema,
  deviceSummary: deviceSummarySchema,
});


/**
 * Description: Schema สำหรับ response ของ endpoint List (รองรับ pagination)
 * Input : Object response { items, pagination }
 * Output : Zod Schema สำหรับ validate โครงสร้าง response
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyApprovalListResponseSchema = z.object({
  items: z.array(historyApprovalItemSchema),
  pagination: z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
    totalItems: z.coerce.number(),
    totalPages: z.coerce.number(),
  }),
});

/**
 * Description: Schema สำหรับรายละเอียดประวัติการอนุมัติ (Detail Modal)
 * Input : Object response ของรายละเอียด
 * Output : Zod Schema สำหรับ validate โครงสร้างรายละเอียด
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyApprovalDetailSchema = z.object({
  ticketId: z.coerce.number(),
  action: approvalActionSchema,

  /**
   * Description: วัน-เวลาที่กระทำ (API ส่งเป็น ISO string)
   * Input : string (ISO 8601)
   * Output : string
   * Author: Chanwit Muangma (Boom) 66160224
   */
  actionDateTime: z.string().datetime(),

  deviceSummary: deviceSummarySchema,
  deviceChildCount: z.coerce.number(),

  requester: requesterSummarySchema,

  /**
   * Description: ผู้กระทำ/ผู้ดำเนินการ
   * - แสดงเฉพาะ ADMIN/STAFF ตาม UI
   * - บาง role/บาง action อาจไม่มี actor → ให้เป็น null ได้
   *
   * Input : actorUserSchema | null
   * Output : actorUserSchema | null
   * Author: Chanwit Muangma (Boom) 66160224
   */
  actor: actorUserSchema.nullable(),

  /**
   * Description: รายละเอียดการใช้งาน (เพิ่มในหน้า Detail)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  borrowPurpose: z.string().nullable(),
  usageLocation: z.string().nullable(),
  borrowDateRange: z.object({
  startDateTime: z.string().datetime().nullable(),
  endDateTime: z.string().datetime().nullable(),
  }),

  /**
   * Description: เหตุผลการปฏิเสธ (แสดงเมื่อ action = "REJECTED")
   * Author: Chanwit Muangma (Boom) 66160224
   */
  rejectReason: z.string().nullable(),
});

/**
 * =========================
 * Type exports
 * =========================
 */

export type GetHistoryApprovalQuery = z.infer<typeof getHistoryApprovalQuerySchema>;
export type HistoryApprovalItem = z.infer<typeof historyApprovalItemSchema>;
export type HistoryApprovalListResponse = z.infer<typeof historyApprovalListResponseSchema>;
export type HistoryApprovalDetail = z.infer<typeof historyApprovalDetailSchema>;

/**
 * Description: Type สำหรับผลการอนุมัติที่ใช้งานจริงใน service
 * - ใช้สำหรับทำ where เฉพาะ "APPROVED" | "REJECTED"
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type ApprovalAction = z.infer<typeof approvalActionSchema>;

/**
 * Description: Type guard สำหรับ enum BRTS_STATUS ให้เหลือเฉพาะ action ที่ต้องการ
 * Input : status (BRTS_STATUS)
 * Output : boolean
 * Author: Chanwit Muangma (Boom) 66160224
 */
export function isApprovalActionStatus(status: BRTS_STATUS): status is "APPROVED" | "REJECTED" {
  return status === "APPROVED" || status === "REJECTED";
}
