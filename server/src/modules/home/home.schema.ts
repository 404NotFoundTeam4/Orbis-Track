import { z } from "zod";

//Schema ของข้อมูลภายใน (data) ที่จะส่งกลับใน Response
export const homeStatsSchema = z.object({
  borrowed: z.number().openapi({ description: "จำนวนยืม" }),
  returned: z.number().openapi({ description: "จำนวนคืน" }),
  waiting: z.number().openapi({ description: "จำนวนรออนุมัติ" }),
  report: z.number().openapi({ description: "จำนวนรายการแจ้งปัญหา" }),
});
export const ticketHomeItemSchema = z.object({
  id: z.number().openapi({ description: "ID" }),
  status: z.string().openapi({ description: "สถานะ" }),
  dates: z.object({
    start: z.string().openapi({ description: "วันที่เริ่ม" }),
    end: z.string().openapi({ description: "วันที่สิ้นสุด" }),
    pickup: z.string().nullable().openapi({ description: "วันที่รับของ" }),
    return: z.string().nullable().openapi({ description: "วันที่คืนของ" }),
  }).openapi({ description: "ข้อมูลวันที่" }),
  device_summary: z.object({
    name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
    serial_number: z.string().optional().openapi({ description: "Serial Number" }),
    total_quantity: z.number().openapi({ description: "จำนวนทั้งหมด" }),
    category: z.string().openapi({ description: "หมวดหมู่" }),
    department: z.string().optional().openapi({ description: "แผนก" }),
    section: z.string().optional().openapi({ description: "ฝ่าย" }),
    description: z.string().nullable().openapi({ description: "รายละเอียด" }),
    image: z.string().nullable().openapi({ description: "รูปภาพ" }),
    max_borrow_days: z.number().nullable().openapi({ description: "จำนวนวันยืมสูงสุด" }),
  }).openapi({ description: "ข้อมูลอุปกรณ์" }),
  requester: z.object({
    fullname: z.string().openapi({ description: "ชื่อ-นามสกุล" }),
    empcode: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),
  }).openapi({ description: "ข้อมูลผู้ร้องขอ" }),
});
// Schema สำหรับ Timeline ในหน้ารายละเอียดคำร้อง
export const ticketTimelineStageSchema = z.object({
  step: z.number().openapi({ description: "ขั้นตอนที่" }),
  status: z.string().openapi({ description: "สถานะ" }),
  role_name: z.string().openapi({ description: "ชื่อบทบาท" }),
  dept_name: z.string().nullable().optional().openapi({ description: "ชื่อแผนก" }),
  approved_by: z.string().nullable().optional().openapi({ description: "ผู้อนุมัติ" }),
  updated_at: z.any().optional().openapi({ description: "วันที่อัปเดต" }),
  approvers: z.array(z.string()).optional().openapi({ description: "รายการผู้อนุมัติ" }),
});

// Schema สำหรับรายละเอียดคำร้อง
export const ticketDetailSchema = z.object({
  id: z.number().openapi({ description: "ID" }),
  status: z.string().openapi({ description: "สถานะ" }),
  details: z.object({
    id: z.number().openapi({ description: "ID" }),
    current_stage: z.number().openapi({ description: "ขั้นตอนปัจจุบัน" }),
    purpose: z.string().openapi({ description: "วัตถุประสงค์" }),
    reject_reason: z.string().nullable().openapi({ description: "เหตุผลที่ปฏิเสธ" }),
    reject_date: z.string().nullable().openapi({ description: "วันที่ปฏิเสธ" }),
    dates: z.object({
      start: z.string().openapi({ description: "วันที่เริ่ม" }),
      end: z.string().openapi({ description: "วันที่สิ้นสุด" }),
      pickup: z.string().nullable().openapi({ description: "วันที่รับของ" }),
      return: z.string().nullable().openapi({ description: "วันที่คืนของ" }),
    }),
    locations: z.object({
      pickup: z.string().nullable().openapi({ description: "สถานที่รับของ" }),
      return: z.string().nullable().openapi({ description: "สถานที่คืนของ" }),
    }),
  }).openapi({ description: "รายละเอียดเพิ่มเติม" }),
  // ใช้ Schema Timeline ตัวใหม่
  timeline: z.array(ticketTimelineStageSchema).openapi({ description: "Timeline" }),
  devices: z.array(z.any()).openapi({ description: "รายการอุปกรณ์" }),
  accessories: z.array(z.any()).optional().openapi({ description: "รายการอุปกรณ์เสริม" }),
  requester: z.object({
    id: z.number().openapi({ description: "ID" }),
    fullname: z.string().openapi({ description: "ชื่อ-นามสกุล" }),
    empcode: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),
    image: z.string().nullable().openapi({ description: "รูปภาพ" }),
    department: z.string().nullable().openapi({ description: "แผนก" }),
    us_phone: z.string().nullable().optional().openapi({ description: "เบอร์โทรศัพท์" }),
  }).optional().openapi({ description: "ข้อมูลผู้ร้องขอ" }),
});

// Schema ของ Response ทั้งหมด
export const getStatsResponseSchema = z.object({
  status: z.string().default("success").openapi({ description: "สถานะตอบกลับ" }),
  data: homeStatsSchema.openapi({ description: "ข้อมูลสถิติ" }),
});

// Schema ของ Recent Tickets Response
export const getRecentTicketsResponseSchema = z.object({
  status: z.string().default("success").openapi({ description: "สถานะตอบกลับ" }),
  data: z.array(ticketHomeItemSchema).openapi({ description: "รายการ Ticket ล่าสุด" }),
});

// Schema ของ Ticket Detail Response  
export const getTicketDetailResponseSchema = z.object({
  status: z.string().default("success").openapi({ description: "สถานะตอบกลับ" }),
  data: ticketDetailSchema.openapi({ description: "ข้อมูลรายละเอียด Ticket" }),
});

// Export Type
export type HomeStats = z.infer<typeof homeStatsSchema>;
export type TicketHomeItem = z.infer<typeof ticketHomeItemSchema>;
export type TicketDetailResponse = z.infer<typeof ticketDetailSchema>;