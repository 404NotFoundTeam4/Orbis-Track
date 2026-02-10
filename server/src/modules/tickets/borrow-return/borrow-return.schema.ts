/**
 * Description: Zod Schema สำหรับ Borrow-Return Tickets API
 * - Query params: page, limit, status, search, sortField, sortDirection
 * - Response schemas: TicketItem, TicketDetail
 * Input : -
 * Output : Zod types สำหรับ validation
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { z } from "zod";
import {
  BRT_STATUS,
  BRTS_STATUS,
  DEVICE_CHILD_STATUS,
  US_ROLE,
} from "@prisma/client";

export const getBorrowTicketDto = z.object({
  userId: z.coerce.number().openapi({ description: "User ID" }),
});

export const getBorrowTicketQuery = z.object({
  page: z.coerce.number().optional().nullable().openapi({ description: "เลขหน้า" }),
  limit: z.coerce.number().optional().nullable().openapi({ description: "จำนวนต่อหน้า" }),
  status: z.nativeEnum(BRT_STATUS).optional().nullable().openapi({ description: "สถานะ" }),
  search: z.string().optional().nullable().openapi({ description: "คำค้นหา" }),
  sortField: z
    .enum([
      "device_name",
      "quantity",
      "category",
      "requester",
      "request_date",
      "status",
    ])
    .optional()
    .nullable().openapi({ description: "เรียงตามฟิลด์" }),
  sortDirection: z.enum(["asc", "desc"]).optional().nullable().openapi({ description: "ทิศทางการเรียง" }),
});

const requesterSchema = z.object({
  id: z.coerce.number().openapi({ description: "ID ผู้ร้องขอ" }),
  fullname: z.string().openapi({ description: "ชื่อ-นามสกุล" }),
  empcode: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),
  image: z.string().nullable().openapi({ description: "รูปภาพ" }),
  department: z.string().nullable().openapi({ description: "แผนก" }),
});

const deviceSummarySchema = z.object({
  deviceId: z.coerce.number().openapi({ description: "ID อุปกรณ์" }),
  name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
  serial_number: z.string().openapi({ description: "Serial Number" }),
  description: z.string().nullable().openapi({ description: "รายละเอียด" }),
  location: z.string().openapi({ description: "สถานที่" }),
  max_borrow_days: z.union([z.coerce.number(), z.string()]).nullable().openapi({ description: "จำนวนวันยืมสูงสุด" }),
  image: z.string().nullable().openapi({ description: "รูปภาพ" }),
  category: z.string().openapi({ description: "หมวดหมู่" }),
  section: z.string().openapi({ description: "ฝ่าย" }),
  department: z.string().openapi({ description: "แผนก" }),
  total_quantity: z.coerce.number().openapi({ description: "จำนวนทั้งหมด" }),
});

// device_child และ current_stage ถูกลบออกจาก list response แล้ว

export const ticketItemSchema = z.object({
  id: z.coerce.number().openapi({ description: "ID Ticket" }),
  status: z.nativeEnum(BRT_STATUS).openapi({ description: "สถานะ" }),
  created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
  request_date: z.date().nullable().openapi({ description: "วันที่ร้องขอ" }),
  requester: requesterSchema.openapi({ description: "ข้อมูลผู้ร้องขอ" }),
  device_summary: deviceSummarySchema.openapi({ description: "ข้อมูลอุปกรณ์" }),
});

const ticketDetailsSchema = z.object({
  purpose: z.string().openapi({ description: "วัตถุประสงค์" }),
  location_use: z.string().openapi({ description: "เน้นใช้งานที่ไหน" }),
  quantity: z.coerce.number().openapi({ description: "จำนวน" }),
  current_stage: z.coerce.number().nullable().openapi({ description: "ขั้นตอนปัจจุบัน" }),
  dates: z.object({
    start: z.date().openapi({ description: "วันที่เริ่ม" }),
    end: z.date().openapi({ description: "วันที่สิ้นสุด" }),
    pickup: z.date().nullable().openapi({ description: "วันที่รับของ" }),
    return: z.date().nullable().openapi({ description: "วันที่คืนของ" }),
  }).openapi({ description: "ข้อมูลวันที่" }),
  locations: z.object({
    pickup: z.string().nullable().openapi({ description: "สถานที่รับของ" }),
    return: z.string().nullable().openapi({ description: "สถานที่คืนของ" }),
  }).openapi({ description: "สถานที่" }),
  reject_reason: z.string().nullable().openapi({ description: "เหตุผลที่ปฏิเสธ" }),
  reject_date: z.date().nullable().openapi({ description: "วันที่ปฏิเสธ" }),
});

const ticketRequesterSchema = z.object({
  us_id: z.number().openapi({ description: "User ID" }),
  us_firstname: z.string().openapi({ description: "ชื่อจริง" }),
  us_lastname: z.string().openapi({ description: "นามสกุล" }),
  us_emp_code: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),
  us_images: z.string().nullable().openapi({ description: "รูปภาพ" }),
  us_email: z.string().nullable().openapi({ description: "อีเมล" }),
  us_phone: z.string().nullable().openapi({ description: "เบอร์โทรศัพท์" }),
  fullname: z.string().openapi({ description: "ชื่อ-นามสกุล" }),
  dept_id: z.coerce.number().nullable().optional().openapi({ description: "ID แผนก" }),
  dept: z.string().nullable().optional().openapi({ description: "ชื่อแผนก" }),
  sec_id: z.coerce.number().nullable().optional().openapi({ description: "ID ฝ่าย" }),
  section: z.string().nullable().optional().openapi({ description: "ชื่อฝ่าย" }),
});

const accessorySchema = z.object({
  acc_id: z.coerce.number().openapi({ description: "ID อุปกรณ์เสริม" }),
  acc_name: z.string().openapi({ description: "ชื่ออุปกรณ์เสริม" }),
  acc_quantity: z.coerce.number().openapi({ description: "จำนวน" }),
});

const ticketDeviceSchema = z.object({
  child_id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
  asset_code: z.string().openapi({ description: "Asset Code" }),
  serial: z.string().openapi({ description: "Serial Number" }),
  current_status: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะปัจจุบัน" }),
  has_serial_number: z.boolean().openapi({ description: "มี Serial Number หรือไม่" }),
});

const ticketTimelineSchema = z.object({
  step: z.coerce.number().openapi({ description: "ขั้นตอนที่" }),
  role_name: z.string().openapi({ description: "ชื่อบทบาท" }),
  required_role: z.nativeEnum(US_ROLE).openapi({ description: "บทบาทที่ต้องการ" }),
  status: z.nativeEnum(BRTS_STATUS).openapi({ description: "สถานะ" }),
  dept_id: z.coerce.number().nullable().openapi({ description: "ID แผนก" }),
  dept_name: z.string().nullable().openapi({ description: "ชื่อแผนก" }),
  sec_id: z.coerce.number().nullable().openapi({ description: "ID ฝ่าย" }),
  sec_name: z.string().nullable().openapi({ description: "ชื่อฝ่าย" }),
  approved_by: z.string().nullable().openapi({ description: "ผู้อนุมัติ" }),
  updated_at: z.date().nullable().openapi({ description: "วันที่อัปเดต" }),
  approvers: z.array(z.string()).optional().openapi({ description: "รายชื่อผู้อนุมัติ" }),
});

export const borrowReturnTicketDetailSchema = z.object({
  id: z.number().openapi({ description: "ID Ticket" }),
  status: z.nativeEnum(BRT_STATUS).openapi({ description: "สถานะ" }),
  details: ticketDetailsSchema.openapi({ description: "รายละเอียด Ticket" }),
  requester: ticketRequesterSchema.openapi({ description: "ข้อมูลผู้ร้องขอ" }),
  devices: z.array(ticketDeviceSchema).openapi({ description: "รายการอุปกรณ์" }),
  accessories: z.array(accessorySchema).openapi({ description: "รายการอุปกรณ์เสริม" }),
  timeline: z.array(ticketTimelineSchema).openapi({ description: "Timeline" }),
});

export const approveTicket = z.object({
  // ticketId: z.coerce.number(),
  currentStage: z.coerce.number().openapi({ description: "ขั้นตอนปัจจุบัน" }),
  pickupLocation: z.string().nullable().optional().openapi({ description: "สถานที่รับของ" }),
});

export const rejectTicket = z.object({
  currentStage: z.coerce.number().openapi({ description: "ขั้นตอนปัจจุบัน" }),
  rejectReason: z.string().openapi({ description: "เหตุผลที่ปฏิเสธ" }),
});

export const getDeviceAvailableQuery = z.object({
  deviceId: z.coerce.number().openapi({ description: "ID อุปกรณ์" }),
  deviceChildIds: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") return [val];
      return [];
    },
    z.array(z.coerce.number()).optional()
  ).openapi({ description: "รายการ ID อุปกรณ์ลูก" }),
  startDate: z.string().openapi({ description: "วันที่เริ่ม" }),
  endDate: z.string().openapi({ description: "วันที่สิ้นสุด" }),
});

export const deviceChildSchema = z.object({
  dec_id: z.number().openapi({ description: "ID อุปกรณ์ลูก" }),
  dec_serial_number: z.string().nullable().openapi({ description: "Serial Number" }),
  dec_asset_code: z.string().openapi({ description: "Asset Code" }),
  dec_has_serial_number: z.boolean().openapi({ description: "มี Serial Number หรือไม่" }),
  dec_status: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะ" }),
  dec_de_id: z.number().openapi({ description: "ID อุปกรณ์แม่" }),
  deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
  created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
  updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
});

export const devicesToAdd = z.object({
  id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
});

export const devicesToRemove = z.object({
  id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
  status: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะ" }),
});

export const devicesToUpdate = z.object({
  id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
  oldStatus: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะเดิม" }),
  status: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะใหม่" }),
  note: z.string().nullable().optional().openapi({ description: "หมายเหตุ" }),
});

export const updateDeviceChildInTicket = z.object({
  devicesToAdd: z.array(devicesToAdd).optional().openapi({ description: "รายการอุปกรณ์ที่เพิ่ม" }),
  devicesToRemove: z.array(devicesToRemove).optional().openapi({ description: "รายการอุปกรณ์ที่ลบ" }),
  devicesToUpdate: z.array(devicesToUpdate).optional().openapi({ description: "รายการอุปกรณ์ที่อัปเดต" }),
});

export const availableDeviceChildsSchema = z.array(deviceChildSchema).openapi({ description: "รายการอุปกรณ์ลูกที่ว่าง" });

// Return Ticket Schema
export const returnDeviceSchema = z.object({
  id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
  status: z.nativeEnum(DEVICE_CHILD_STATUS).openapi({ description: "สถานะ" }),
});

export const returnTicketBody = z.object({
  devices: z.array(returnDeviceSchema).openapi({ description: "รายการอุปกรณ์ที่คืน" }),
});

export type UpdateDeviceChildInTicket = z.infer<
  typeof updateDeviceChildInTicket
>;

export type DeviceChildDto = z.infer<typeof deviceChildSchema>;

export type TicketDeviceSchema = z.infer<typeof ticketDeviceSchema>;

export type GetDeviceAvailableQuery = z.infer<typeof getDeviceAvailableQuery>;

export type ApproveTicket = z.infer<typeof approveTicket>;

export type RejectTicket = z.infer<typeof rejectTicket>;

export type BorrowReturnTicketDetailDto = z.infer<
  typeof borrowReturnTicketDetailSchema
>;

export type GetBorrowTicketQuery = z.infer<typeof getBorrowTicketQuery>;

export type TicketItemDto = z.infer<typeof ticketItemSchema>;

export type ReturnDeviceSchema = z.infer<typeof returnDeviceSchema>;

export type ReturnTicketBody = z.infer<typeof returnTicketBody>;
