// src/modules/history-borrow/history-borrow.schema.ts
import { z } from "zod";
import {
  BRT_STATUS,
  BRTS_STATUS,
  DEVICE_CHILD_STATUS,
  US_ROLE,
} from "@prisma/client";

/**
 * Description: ฟังก์ชันสำหรับแปลงค่า empty/null/undefined ให้เป็น undefined เพื่อให้ Zod optional ทำงานถูกต้อง
 * Input : value (unknown) ค่าที่รับมาจาก query/body เช่น string ว่าง, null, undefined หรือค่าอื่น
 * Output : unknown (คืนค่า undefined เมื่อเป็นค่าว่าง/ไม่ถูกต้อง มิฉะนั้นคืนค่าเดิม)
 * Author: Chanwit Muangma (Boom) 66160224
 */
const emptyToUndefined = (value: unknown) => {
  // กรณีที่เป็นค่าว่างจริง ๆ
  if (value === "" || value === null || value === undefined) return undefined;

  // กรณี Swagger dropdown มักส่ง "--" (ถือว่าไม่มีการเลือกค่า)
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (trimmedValue === "" || trimmedValue === "--") return undefined;
  }

  return value;
};

/**
 * Description: Schema สำหรับ query ของ endpoint List ประวัติการยืม-คืน
 * Input : Query string (page, limit, status, search, sortField, sortDirection)
 * Output : Zod Schema สำหรับ validate และ coerce ชนิดข้อมูลของ query
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const getHistoryBorrowTicketQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).optional()
  ).openapi({ description: "เลขหน้า" }), // กัน page="" และ page=0

  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).optional()
  ).openapi({ description: "จำนวนต่อหน้า" }), // กัน limit="" และ limit=0

  status: z.preprocess(emptyToUndefined, z.nativeEnum(BRT_STATUS).optional()).openapi({ description: "สถานะ" }),

  search: z.preprocess(emptyToUndefined, z.string().optional()).openapi({ description: "คำค้นหา" }),

  sortField: z.preprocess(
    emptyToUndefined,
    z
      .enum([
        "deviceName",
        "deviceChildCount",
        "category",
        "requester",
        "requestDate",
        "status",
      ])
      .optional()
  ).openapi({ description: "เรียงตามฟิลด์" }),

  sortDirection: z.preprocess(
    emptyToUndefined,
    z.enum(["asc", "desc"]).optional()
  ).openapi({ description: "ทิศทางการเรียง" }),
});

/**
 * Description: Schema สำหรับพารามิเตอร์ id ใน path
 * Input : Params { id }
 * Output : Zod Schema สำหรับ validate และ coerce id เป็น number
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({ description: "ID" }),
});

/**
 * Description: Schema สำหรับข้อมูลสรุปผู้ร้องขอ (Requester)
 * Input : Object ของผู้ร้องขอจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลผู้ร้องขอ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const requesterSummarySchema = z.object({
  userId: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }), // อ้างอิงจาก us_id
  fullName: z.string().openapi({ description: "ชื่อ-นามสกุล" }), // ชื่อ-นามสกุล
  employeeCode: z.string().nullable().openapi({ description: "รหัสพนักงาน" }), // อ้างอิงจาก us_emp_code
  phoneNumber: z.string().nullable().openapi({ description: "เบอร์โทรศัพท์" }), // อ้างอิงจาก us_phone (ใช้ในหน้า detail)

  department_name: z.string().nullable().openapi({ description: "ชื่อแผนก" }), // departments.dept_name
  section_name: z.string().nullable().openapi({ description: "ชื่อฝ่าย" }), // sections.sec_name
});

/**
 * Description: Schema สำหรับข้อมูลสรุปอุปกรณ์แม่ (Main Device)
 * Input : Object ของอุปกรณ์แม่จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์แม่
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const deviceSummarySchema = z.object({
  deviceId: z.coerce.number().openapi({ description: "รหัสอุปกรณ์" }), // อ้างอิงจาก de_id
  deviceName: z.string().openapi({ description: "ชื่ออุปกรณ์" }), // อ้างอิงจาก de_name
  deviceSerialNumber: z.string().openapi({ description: "Serial Number" }), // อ้างอิงจาก devices.de_serial_number
  categoryName: z.string().openapi({ description: "ชื่อหมวดหมู่" }), // อ้างอิงจาก categories.ca_name
  imageUrl: z.string().nullable().openapi({ description: "Url รูปภาพ" }), // อ้างอิงจาก devices.de_images
  description: z.string().nullable().openapi({ description: "รายละเอียด" }), // อ้างอิงจาก devices.de_description
  maximumBorrowDays: z.coerce.number().openapi({ description: "จำนวนวันยืมสูงสุด" }), // อ้างอิงจาก devices.de_max_borrow_days
  sectionName: z.string().nullable().openapi({ description: "ชื่อฝ่าย" }), // อ้างอิงจาก sections.sec_name
  departmentName: z.string().nullable().openapi({ description: "ชื่อแผนก" }), // อ้างอิงจาก departments.dept_name
});

/**
 * Description: Schema สำหรับข้อมูลอุปกรณ์ลูก (Device Child) ที่ถูกผูกจริงใน Ticket
 * Input : Object ของอุปกรณ์ลูกจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์ลูก
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const ticketDeviceChildSchema = z.object({
  deviceChildId: z.coerce.number().openapi({ description: "รหัสอุปกรณ์ลูก" }), // อ้างอิงจาก dec_id
  assetCode: z.string().openapi({ description: "Asset Code" }), // อ้างอิงจาก dec_asset_code
  serialNumber: z.string().nullable().openapi({ description: "Serial Number" }), // อ้างอิงจาก dec_serial_number
  status: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะ" }), // อ้างอิงจาก dec_status
});

/**
 * Description: Schema สำหรับข้อมูลอุปกรณ์เสริม (Accessories) ที่แนบมากับ Ticket
 * Input : Object ของอุปกรณ์เสริมจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์เสริม
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const accessorySchema = z.object({
  accessoryId: z.coerce.number().openapi({ description: "รหัสอุปกรณ์เสริม" }),
  accessoryName: z.string().openapi({ description: "ชื่ออุปกรณ์เสริม" }),
  quantity: z.coerce.number().openapi({ description: "จำนวน" }),
});

/**
 * Description: Schema สำหรับข้อมูลผู้อนุมัติ (Approver) ของแต่ละ step
 * - ใช้ทั้ง "approver" (คนที่อนุมัติจริง) และ "approverCandidates" (รายชื่อผู้ที่มีสิทธิ์อนุมัติ)
 * Input : Object ผู้ใช้จาก backend (users)
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลผู้อนุมัติ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const approverUserSchema = z.object({
  userId: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }), // อ้างอิงจาก users.us_id
  fullName: z.string().openapi({ description: "ชื่อ-นามสกุล" }), // ชื่อ-นามสกุล (ประกอบจาก us_firstname + us_lastname)
  employeeCode: z.string().nullable().openapi({ description: "รหัสพนักงาน" }), // อ้างอิงจาก users.us_emp_code
  role: z.nativeEnum(US_ROLE).openapi({ description: "บทบาท" }), // อ้างอิงจาก users.us_role
  departmentName: z.string().nullable().openapi({ description: "ชื่อแผนก" }), // อ้างอิงจาก departments.dept_name
  sectionName: z.string().nullable().openapi({ description: "ชื่อฝ่าย" }), // อ้างอิงจาก sections.sec_name
});

/**
 * Description: Schema สำหรับรายชื่อผู้มีสิทธิ์อนุมัติ (Approver Candidates) ในแต่ละ step
 * - ใช้แสดงผลรายชื่อ 2 คน + "+N" ตาม UI
 * Input : Array ของผู้ใช้ที่มีสิทธิ์อนุมัติ step นั้น (คำนวณจาก role + dept/sec)
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลรายชื่อผู้มีสิทธิ์อนุมัติ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const approverCandidateSchema = approverUserSchema;

/**
 * Description: Schema สำหรับ Timeline/Stages ของการอนุมัติ Ticket
 * Input : Object ของ timeline จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูล timeline
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const ticketTimelineSchema = z.object({
  stepNumber: z.coerce.number().openapi({ description: "ลำดับขั้นตอน" }), // ลำดับขั้นตอน
  roleDisplayName: z.string().openapi({ description: "ชื่อบทบาท" }), // ชื่อที่แสดงของ step (เช่น หัวหน้าแผนก)
  requiredRole: z.nativeEnum(US_ROLE).openapi({ description: "บทบาทที่ต้องการ" }),
  status: z.nativeEnum(BRTS_STATUS).openapi({ description: "สถานะ" }),

  /**
   * Description: ขอบเขต flow ของ step (ใช้สำหรับระบุหน่วยงานที่ต้องอนุมัติจริง)
   * Input : flowDepartmentId/flowSectionId จาก backend
   * Output : number | null และชื่อหน่วยงาน
   * Author: Chanwit Muangma (Boom) 66160224
   */
  flowDepartmentId: z.coerce.number().nullable().openapi({ description: "รหัสแผนกของ Flow" }),
  flowDepartmentName: z.string().nullable().openapi({ description: "ชื่อแผนกของ Flow" }),
  flowSectionId: z.coerce.number().nullable().openapi({ description: "รหัสฝ่ายของ Flow" }),
  flowSectionName: z.string().nullable().openapi({ description: "ชื่อฝ่ายของ Flow" }),

  /**
   * Description: ผู้อนุมัติจริงของ step (มีค่าเมื่อ status ผ่านแล้ว)
   * Input : Object approver จาก backend หรือ null (ถ้ายังไม่อนุมัติ)
   * Output : approverUserSchema | null
   * Author: Chanwit Muangma (Boom) 66160224
   */
  approver: approverUserSchema.nullable().openapi({ description: "ผู้อนุมัติ" }),

  /**
   * Description: รายชื่อผู้มีสิทธิ์อนุมัติทั้งหมดใน step นี้ (ใช้แสดง 2 ชื่อ + "+N")
   * Input : Array ของผู้มีสิทธิ์อนุมัติ (คำนวณจาก role + dept/sec หรือ flow dept/sec)
   * Output : Array<approverCandidateSchema>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  approverCandidates: z.array(approverCandidateSchema).default([]).openapi({ description: "รายชื่อผู้มีสิทธิ์อนุมัติ" }),

  updatedAt: z.coerce.date().nullable().openapi({ description: "วันที่แก้ไขล่าสุด" }),

  departmentId: z.coerce.number().nullable().openapi({ description: "รหัสแผนก" }),
  departmentName: z.string().nullable().openapi({ description: "ชื่อแผนก" }),
  sectionId: z.coerce.number().nullable().openapi({ description: "รหัสฝ่าย" }),
  sectionName: z.string().nullable().openapi({ description: "ชื่อฝ่าย" }),
});

/**
 * Description: Schema สำหรับ “แถว” ของรายการ Ticket ในหน้า List (ตารางประวัติ)
 * Input : Object ของรายการ ticket (แบบแถวเดียว) จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลรายการประวัติ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowTicketItemSchema = z.object({
  ticketId: z.coerce.number().openapi({ description: "รหัส Ticket" }), // อ้างอิงจาก brt_id
  status: z.nativeEnum(BRT_STATUS).openapi({ description: "สถานะ" }), // อ้างอิงจาก brt_status
  requestDateTime: z.coerce.date().openapi({ description: "วันที่ร้องขอ" }), // วัน-เวลา ที่ร้องขอ
  deviceChildCount: z.coerce.number().openapi({ description: "จำนวนอุปกรณ์" }), // จำนวนอุปกรณ์ลูกที่ถูกผูกจริงใน ticket

  requester: z.object({
    userId: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }),
    fullName: z.string().openapi({ description: "ชื่อ-นามสกุล" }),
    employeeCode: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),

    department_name: z.string().nullable().openapi({ description: "ชื่อแผนก" }),
    section_name: z.string().nullable().openapi({ description: "ชื่อฝ่าย" }),
  }).openapi({ description: "ข้อมูลผู้ร้องขอ" }),

  deviceSummary: z.object({
    deviceId: z.coerce.number().openapi({ description: "รหัสอุปกรณ์" }),
    deviceName: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
    deviceSerialNumber: z.string().openapi({ description: "Serial Number" }),
    categoryName: z.string().openapi({ description: "หมวดหมู่" }),
  }).openapi({ description: "ข้อมูลสรุปอุปกรณ์" }),
});

/**
 * Description: Schema สำหรับ response ของ endpoint List (รองรับ pagination)
 * Input : Object response จาก backend { items, pagination }
 * Output : Zod Schema สำหรับ validate โครงสร้าง response รายการประวัติแบบมี pagination
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowTicketListResponseSchema = z.object({
  items: z.array(historyBorrowTicketItemSchema).openapi({ description: "รายการประวัติ" }),
  pagination: z.object({
    page: z.coerce.number().openapi({ description: "เลขหน้า" }),
    limit: z.coerce.number().openapi({ description: "จำนวนต่อหน้า" }),
    totalItems: z.coerce.number().openapi({ description: "รายการทั้งหมด" }),
    totalPages: z.coerce.number().openapi({ description: "หน้าทั้งหมด" }),
  }).openapi({ description: "ข้อมูล Pagination" }),
});

/**
 * Description: Schema สำหรับรายละเอียด Ticket ในหน้า Detail (modal/page)
 * Input : Object response จาก backend ของรายละเอียด ticket
 * Output : Zod Schema สำหรับ validate โครงสร้างข้อมูลรายละเอียด ticket
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowTicketDetailSchema = z.object({
  ticketId: z.coerce.number().openapi({ description: "รหัส Ticket" }),
  status: z.nativeEnum(BRT_STATUS).openapi({ description: "สถานะ" }),

  requestDateTime: z.coerce.date().openapi({ description: "วันที่ร้องขอ" }),

  requester: requesterSummarySchema.openapi({ description: "ข้อมูลผู้ร้องขอ" }),

  device: deviceSummarySchema.openapi({ description: "ข้อมูลอุปกรณ์" }),

  deviceChildCount: z.coerce.number().openapi({ description: "จำนวนอุปกรณ์" }),
  deviceChildren: z.array(ticketDeviceChildSchema).openapi({ description: "รายการอุปกรณ์ลูก" }),

  borrowPurpose: z.string().openapi({ description: "วัตถุประสงค์การยืม" }),
  usageLocation: z.string().openapi({ description: "สถานที่ใช้งาน" }),

  borrowDateRange: z.object({
    startDateTime: z.coerce.date().openapi({ description: "วันเริ่มยืม" }), // อ้างอิงจาก brt_start_date
    endDateTime: z.coerce.date().openapi({ description: "วันคืน" }), // อ้างอิงจาก brt_end_date
  }).openapi({ description: "ช่วงเวลาการยืม" }),

  /**
   * Description: เวลาที่ใช้งาน (นิยาม: ดึงจากวันที่เริ่มยืม)
   * Input : Date ที่ backend map มาจาก borrowDateRange.startDateTime
   * Output : Date สำหรับ UI ใช้แสดงเวลาที่เริ่มใช้งาน
   * Author: Chanwit Muangma (Boom) 66160224
   */
  inUseDateTime: z.coerce.date().openapi({ description: "เวลาที่เริ่มใช้งาน" }),

  fulfillmentDateTimes: z.object({
    pickupDateTime: z.coerce.date().nullable().openapi({ description: "เวลารับของ" }), // อ้างอิงจาก brt_pickup_datetime
    returnDateTime: z.coerce.date().nullable().openapi({ description: "เวลาคืนของ" }), // อ้างอิงจาก brt_return_datetime
  }).openapi({ description: "เวลาการดำเนินการ" }),

  /**
   * Description: สถานที่รับ/คืน และเหตุผลปฏิเสธ (กรณีถูกปฏิเสธ)
   * Input : pickupLocation, returnLocation, rejectReason
   * Output : ค่า string หรือ null เพื่อให้ UI แสดงผลตามสถานะ ticket
   * Author: Chanwit Muangma (Boom) 66160224
   */
  pickupLocation: z.string().nullable().openapi({ description: "สถานที่รับของ" }),
  returnLocation: z.string().nullable().openapi({ description: "สถานที่คืนของ" }),
  rejectReason: z.string().nullable().openapi({ description: "เหตุผลที่ปฏิเสธ" }),

  accessories: z.array(accessorySchema).openapi({ description: "อุปกรณ์เสริม" }),

  timeline: z.array(ticketTimelineSchema).openapi({ description: "Timeline การอนุมัติ" }),
});

/**
 * Description: Type สำหรับ query ของประวัติการยืม-คืน (List)
 * Input : getHistoryBorrowTicketQuerySchema
 * Output : TypeScript type ที่ infer จาก Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type GetHistoryBorrowTicketQuery = z.infer<
  typeof getHistoryBorrowTicketQuerySchema
>;

/**
 * Description: Type สำหรับแถวรายการประวัติการยืม-คืน (List item)
 * Input : historyBorrowTicketItemSchema
 * Output : TypeScript type ที่ infer จาก Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTicketItem = z.infer<typeof historyBorrowTicketItemSchema>;

/**
 * Description: Type สำหรับรายละเอียดประวัติการยืม-คืน (Detail)
 * Input : historyBorrowTicketDetailSchema
 * Output : TypeScript type ที่ infer จาก Zod schema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTicketDetail = z.infer<
  typeof historyBorrowTicketDetailSchema
>;

/**
 * Description: Type สำหรับข้อมูลผู้อนุมัติ (Approver)
 * Input : approverUserSchema
 * Output : TypeScript type สำหรับใช้ฝั่ง service / controller / frontend
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type ApproverUser = z.infer<typeof approverUserSchema>;

/**
 * Description: Type สำหรับรายชื่อผู้มีสิทธิ์อนุมัติ (Approver Candidate)
 * Input : approverCandidateSchema
 * Output : TypeScript type สำหรับใช้ฝั่ง service / frontend
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type ApproverCandidate = z.infer<typeof approverCandidateSchema>;



/**
 * Description: Type สำหรับข้อมูล Timeline ของแต่ละ step ในการอนุมัติ (Approval Flow)
 * - ใช้สำหรับแสดงผล Timeline/Stages ในหน้า Detail ของประวัติการยืม-คืน
 * - Source of truth คือ ticketTimelineSchema (Zod schema) เพื่อให้โครงสร้างข้อมูลตรงกับ backend contract
 *
 * Input : ticketTimelineSchema (Zod schema)
 * Output : TypeScript type ของข้อมูล Timeline 1 step (เช่น stepNumber, roleDisplayName, status, approver, approverCandidates, updatedAt)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTimelineStep = z.infer<typeof ticketTimelineSchema>;

/**
 * Description: Type สำหรับข้อมูล Pagination ของ response หน้า List ประวัติการยืม-คืน
 * - ใช้สำหรับควบคุมการแสดงผลหน้า (page) และจำนวนรายการต่อหน้า (limit) ใน UI
 * - รองรับข้อมูลสรุปจำนวนรายการทั้งหมด และจำนวนหน้าทั้งหมด เพื่อคำนวณการเปลี่ยนหน้าได้ถูกต้อง
 *
 * Input : response.pagination จาก backend (page, limit, totalItems, totalPages)
 * Output : TypeScript type ของข้อมูล pagination สำหรับ UI
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowPagination = {
  page: number; // เลขหน้าปัจจุบัน (เริ่มที่ 1)
  limit: number; // จำนวนรายการต่อหน้า
  totalItems: number; // จำนวนรายการทั้งหมดที่ค้นเจอ
  totalPages: number; // จำนวนหน้าทั้งหมด (คำนวณจาก totalItems / limit)
};

/**
 * Description: Type สำหรับ response ของหน้า List ประวัติการยืม-คืน (List Response)
 * - ใช้สำหรับข้อมูลที่คืนจาก endpoint รายการประวัติการยืม-คืน
 * - ประกอบด้วยรายการ items และข้อมูล pagination
 * - Source of truth คือ historyBorrowTicketListResponseSchema (Zod schema) เพื่อให้ตรงกับ backend contract
 *
 * Input : historyBorrowTicketListResponseSchema (Zod schema)
 * Output : TypeScript type ของ response หน้า List (items + pagination)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowListResponse = z.infer<
  typeof historyBorrowTicketListResponseSchema
>;



/**
 * Description: Type สำหรับ response ของ List ประวัติการยืม-คืน
 * Source of truth: historyBorrowTicketListResponseSchema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTicketListResponse = z.infer<
  typeof historyBorrowTicketListResponseSchema
>;

/**
 * Description: Type สำหรับ response ของ Detail ประวัติการยืม-คืน
 * Source of truth: historyBorrowTicketDetailSchema
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTicketDetailResponse = z.infer<
  typeof historyBorrowTicketDetailSchema
>;


