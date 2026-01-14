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
  ), // กัน page="" และ page=0

  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).optional()
  ), // กัน limit="" และ limit=0

  status: z.preprocess(emptyToUndefined, z.nativeEnum(BRT_STATUS).optional()),

  search: z.preprocess(emptyToUndefined, z.string().optional()),

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
  ),

  sortDirection: z.preprocess(
    emptyToUndefined,
    z.enum(["asc", "desc"]).optional()
  ),
});

/**
 * Description: Schema สำหรับพารามิเตอร์ id ใน path
 * Input : Params { id }
 * Output : Zod Schema สำหรับ validate และ coerce id เป็น number
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Description: Schema สำหรับข้อมูลสรุปผู้ร้องขอ (Requester)
 * Input : Object ของผู้ร้องขอจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลผู้ร้องขอ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const requesterSummarySchema = z.object({
  userId: z.coerce.number(), // อ้างอิงจาก us_id
  fullName: z.string(), // ชื่อ-นามสกุล
  employeeCode: z.string().nullable(), // อ้างอิงจาก us_emp_code
  phoneNumber: z.string().nullable(), // อ้างอิงจาก us_phone (ใช้ในหน้า detail)

  department_name: z.string().nullable(), // departments.dept_name
  section_name: z.string().nullable(), // sections.sec_name
});

/**
 * Description: Schema สำหรับข้อมูลสรุปอุปกรณ์แม่ (Main Device)
 * Input : Object ของอุปกรณ์แม่จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์แม่
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const deviceSummarySchema = z.object({
  deviceId: z.coerce.number(), // อ้างอิงจาก de_id
  deviceName: z.string(), // อ้างอิงจาก de_name
  deviceSerialNumber: z.string(), // อ้างอิงจาก devices.de_serial_number
  categoryName: z.string(), // อ้างอิงจาก categories.ca_name
  imageUrl: z.string().nullable(), // อ้างอิงจาก devices.de_images
  description: z.string().nullable(), // อ้างอิงจาก devices.de_description
  maximumBorrowDays: z.coerce.number(), // อ้างอิงจาก devices.de_max_borrow_days
  sectionName: z.string().nullable(), // อ้างอิงจาก sections.sec_name
  departmentName: z.string().nullable(), // อ้างอิงจาก departments.dept_name
});

/**
 * Description: Schema สำหรับข้อมูลอุปกรณ์ลูก (Device Child) ที่ถูกผูกจริงใน Ticket
 * Input : Object ของอุปกรณ์ลูกจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์ลูก
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const ticketDeviceChildSchema = z.object({
  deviceChildId: z.coerce.number(), // อ้างอิงจาก dec_id
  assetCode: z.string(), // อ้างอิงจาก dec_asset_code
  serialNumber: z.string().nullable(), // อ้างอิงจาก dec_serial_number
  status: z.nativeEnum(DEVICE_CHILD_STATUS), // อ้างอิงจาก dec_status
});

/**
 * Description: Schema สำหรับข้อมูลอุปกรณ์เสริม (Accessories) ที่แนบมากับ Ticket
 * Input : Object ของอุปกรณ์เสริมจาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลอุปกรณ์เสริม
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const accessorySchema = z.object({
  accessoryId: z.coerce.number(),
  accessoryName: z.string(),
  quantity: z.coerce.number(),
});

/**
 * Description: Schema สำหรับข้อมูลผู้อนุมัติ (Approver) ของแต่ละ step
 * - ใช้ทั้ง "approver" (คนที่อนุมัติจริง) และ "approverCandidates" (รายชื่อผู้ที่มีสิทธิ์อนุมัติ)
 * Input : Object ผู้ใช้จาก backend (users)
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลผู้อนุมัติ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const approverUserSchema = z.object({
  userId: z.coerce.number(), // อ้างอิงจาก users.us_id
  fullName: z.string(), // ชื่อ-นามสกุล (ประกอบจาก us_firstname + us_lastname)
  employeeCode: z.string().nullable(), // อ้างอิงจาก users.us_emp_code
  role: z.nativeEnum(US_ROLE), // อ้างอิงจาก users.us_role
  departmentName: z.string().nullable(), // อ้างอิงจาก departments.dept_name
  sectionName: z.string().nullable(), // อ้างอิงจาก sections.sec_name
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
  stepNumber: z.coerce.number(), // ลำดับขั้นตอน
  roleDisplayName: z.string(), // ชื่อที่แสดงของ step (เช่น หัวหน้าแผนก)
  requiredRole: z.nativeEnum(US_ROLE),
  status: z.nativeEnum(BRTS_STATUS),

  /**
   * Description: ขอบเขต flow ของ step (ใช้สำหรับระบุหน่วยงานที่ต้องอนุมัติจริง)
   * Input : flowDepartmentId/flowSectionId จาก backend
   * Output : number | null และชื่อหน่วยงาน
   * Author: Chanwit Muangma (Boom) 66160224
   */
  flowDepartmentId: z.coerce.number().nullable(),
  flowDepartmentName: z.string().nullable(),
  flowSectionId: z.coerce.number().nullable(),
  flowSectionName: z.string().nullable(),

  /**
   * Description: ผู้อนุมัติจริงของ step (มีค่าเมื่อ status ผ่านแล้ว)
   * Input : Object approver จาก backend หรือ null (ถ้ายังไม่อนุมัติ)
   * Output : approverUserSchema | null
   * Author: Chanwit Muangma (Boom) 66160224
   */
  approver: approverUserSchema.nullable(),

  /**
   * Description: รายชื่อผู้มีสิทธิ์อนุมัติทั้งหมดใน step นี้ (ใช้แสดง 2 ชื่อ + "+N")
   * Input : Array ของผู้มีสิทธิ์อนุมัติ (คำนวณจาก role + dept/sec หรือ flow dept/sec)
   * Output : Array<approverCandidateSchema>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  approverCandidates: z.array(approverCandidateSchema).default([]),

  updatedAt: z.coerce.date().nullable(),

  departmentId: z.coerce.number().nullable(),
  departmentName: z.string().nullable(),
  sectionId: z.coerce.number().nullable(),
  sectionName: z.string().nullable(),
});

/**
 * Description: Schema สำหรับ “แถว” ของรายการ Ticket ในหน้า List (ตารางประวัติ)
 * Input : Object ของรายการ ticket (แบบแถวเดียว) จาก backend
 * Output : Zod Schema สำหรับ validate รูปแบบข้อมูลรายการประวัติ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowTicketItemSchema = z.object({
  ticketId: z.coerce.number(), // อ้างอิงจาก brt_id
  status: z.nativeEnum(BRT_STATUS), // อ้างอิงจาก brt_status
  requestDateTime: z.coerce.date(), // วัน-เวลา ที่ร้องขอ
  deviceChildCount: z.coerce.number(), // จำนวนอุปกรณ์ลูกที่ถูกผูกจริงใน ticket

  requester: z.object({
    userId: z.coerce.number(),
    fullName: z.string(),
    employeeCode: z.string().nullable(),

    department_name: z.string().nullable(),
    section_name: z.string().nullable(),
  }),

  deviceSummary: z.object({
    deviceId: z.coerce.number(),
    deviceName: z.string(),
    deviceSerialNumber: z.string(),
    categoryName: z.string(),
  }),
});

/**
 * Description: Schema สำหรับ response ของ endpoint List (รองรับ pagination)
 * Input : Object response จาก backend { items, pagination }
 * Output : Zod Schema สำหรับ validate โครงสร้าง response รายการประวัติแบบมี pagination
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowTicketListResponseSchema = z.object({
  items: z.array(historyBorrowTicketItemSchema),
  pagination: z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
    totalItems: z.coerce.number(),
    totalPages: z.coerce.number(),
  }),
});

/**
 * Description: Schema สำหรับรายละเอียด Ticket ในหน้า Detail (modal/page)
 * Input : Object response จาก backend ของรายละเอียด ticket
 * Output : Zod Schema สำหรับ validate โครงสร้างข้อมูลรายละเอียด ticket
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowTicketDetailSchema = z.object({
  ticketId: z.coerce.number(),
  status: z.nativeEnum(BRT_STATUS),

  requestDateTime: z.coerce.date(),

  requester: requesterSummarySchema,

  device: deviceSummarySchema,

  deviceChildCount: z.coerce.number(),
  deviceChildren: z.array(ticketDeviceChildSchema),

  borrowPurpose: z.string(),
  usageLocation: z.string(),

  borrowDateRange: z.object({
    startDateTime: z.coerce.date(), // อ้างอิงจาก brt_start_date
    endDateTime: z.coerce.date(), // อ้างอิงจาก brt_end_date
  }),

  /**
   * Description: เวลาที่ใช้งาน (นิยาม: ดึงจากวันที่เริ่มยืม)
   * Input : Date ที่ backend map มาจาก borrowDateRange.startDateTime
   * Output : Date สำหรับ UI ใช้แสดงเวลาที่เริ่มใช้งาน
   * Author: Chanwit Muangma (Boom) 66160224
   */
  inUseDateTime: z.coerce.date(),

  fulfillmentDateTimes: z.object({
    pickupDateTime: z.coerce.date().nullable(), // อ้างอิงจาก brt_pickup_datetime
    returnDateTime: z.coerce.date().nullable(), // อ้างอิงจาก brt_return_datetime
  }),

  /**
   * Description: สถานที่รับ/คืน และเหตุผลปฏิเสธ (กรณีถูกปฏิเสธ)
   * Input : pickupLocation, returnLocation, rejectReason
   * Output : ค่า string หรือ null เพื่อให้ UI แสดงผลตามสถานะ ticket
   * Author: Chanwit Muangma (Boom) 66160224
   */
  pickupLocation: z.string().nullable(),
  returnLocation: z.string().nullable(),
  rejectReason: z.string().nullable(),

  accessories: z.array(accessorySchema),

  timeline: z.array(ticketTimelineSchema),
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
