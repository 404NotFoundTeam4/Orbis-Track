import { z } from "zod";
import { TI_STATUS } from "@prisma/client";

// Schema สำหรับข้อมูลภายใน (Data Item)
export const repairTicketItemSchema = z.object({
  id: z.number().openapi({ description: "ID ของ Ticket" }),
  ticket_no: z.string().openapi({ description: "เลขที่ใบแจ้งซ่อม (TI-xxxxx)" }),
  status: z.nativeEnum(TI_STATUS).openapi({ description: "สถานะงานซ่อม" }),
  dates: z.object({
    created: z.string().openapi({ description: "วันที่แจ้ง" }),
    updated: z.string().nullable().openapi({ description: "อัปเดตล่าสุด" }),
  }).openapi({ description: "ข้อมูลวันที่" }),
  device_info: z.object({
    name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
    asset_code: z.string().nullable().openapi({ description: "รหัสทรัพย์สิน" }),
    category: z.string().nullable().openapi({ description: "หมวดหมู่อุปกรณ์" }), 
    quantity: z.number().openapi({ description: "จำนวนอุปกรณ์" }), 
    location: z.string().nullable().openapi({ description: "สถานที่ตั้งอุปกรณ์/รับอุปกรณ์" }), 
    image: z.string().nullable().openapi({ description: "รูปภาพอุปกรณ์" }),
    reported_devices: z.array(z.object({
      asset_code: z.string().nullable(),
      serial_number: z.string().nullable(),
    })).openapi({ description: "รายการอุปกรณ์ลูกที่แจ้งซ่อม" }),
  }).openapi({ description: "ข้อมูลอุปกรณ์" }),
  problem: z.object({
    title: z.string().openapi({ description: "หัวข้ออาการเสีย" }),
    description: z.string().openapi({ description: "รายละเอียดเพิ่มเติม" }),
  }).openapi({ description: "ข้อมูลปัญหา" }),
  requester: z.object({
    user_id: z.number().openapi({ description: "ID ของผู้แจ้ง" }),
    emp_code: z.string().nullable().openapi({ description: "รหัสพนักงาน" }), 
    fullname: z.string().openapi({ description: "ชื่อผู้แจ้ง" }),
    department: z.string().nullable().openapi({ description: "แผนก" }),
    section: z.string().nullable().openapi({ description: "ฝ่ายย่อย" }),
  }).openapi({ description: "ผู้แจ้ง" }),
  approver: z.object({
    fullname: z.string().openapi({ description: "ชื่อผู้อนุมัติ/ผู้รับงาน" }),
  }).nullable().openapi({ description: "ข้อมูลผู้อนุมัติ" }),
});

// Schema สำหรับ Query String (Search & Filter)
export const getRepairTicketsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(TI_STATUS).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// Schema สำหรับ Response รวม
export const getRepairTicketsResponseSchema = z.object({
  status: z.string().default("success"),
  data: z.array(repairTicketItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total_items: z.number(),
    total_pages: z.number(),
  }),
});

// Schema สำหรับ Body ตอนกดอนุมัติ
export const approveRepairTicketBodySchema = z.object({
  user_id: z.coerce.number().openapi({ description: "ID ของผู้ที่กดอนุมัติ/รับเรื่อง" }),
});

export type GetRepairTicketsQuery = z.infer<typeof getRepairTicketsQuerySchema>;
export type RepairTicketItem = z.infer<typeof repairTicketItemSchema>;
export type ApproveRepairTicketBody = z.infer<typeof approveRepairTicketBodySchema>;
export type RepairTicketsResponse = z.infer<typeof getRepairTicketsResponseSchema>;