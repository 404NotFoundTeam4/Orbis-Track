import { z } from "zod";
import { BASE_EVENT, NR_EVENT, NR_STATUS } from "@prisma/client";

export const notificationSchema = z.object({
  n_id: z.coerce.number().int().openapi({ description: "ID การแจ้งเตือน" }),
  n_title: z.string().max(200, "Title must not exceed 200 characters").openapi({ description: "หัวข้อการแจ้งเตือน" }),
  n_message: z.string().min(1, "Message is required").openapi({ description: "ข้อความการแจ้งเตือน" }),

  n_data: z.any().nullable().optional().openapi({ description: "ข้อมูลเพิ่มเติม (JSON)" }),

  n_target_route: z.string().max(255).nullable().optional().openapi({ description: "Route ปลายทาง" }),

  n_base_event: z.nativeEnum(BASE_EVENT).nullable().optional().openapi({ description: "Base Event" }),

  // Foreign Keys
  n_brt_id: z.coerce.number().int().nullable().optional().openapi({ description: "ID การยืมคืน" }),
  n_brts_id: z.coerce.number().int().nullable().optional().openapi({ description: "ID ขั้นตอนการยืมคืน" }),
  n_ti_id: z.coerce.number().int().nullable().optional().openapi({ description: "ID ใบแจ้งซ่อม" }),

  // Dates
  created_at: z.date().openapi({ description: "วันที่สร้าง" }),
  send_at: z.date().nullable().optional().openapi({ description: "วันที่ส่ง" }),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").openapi({ description: "หัวข้อการแจ้งเตือน" }),
  message: z.string().min(1, "Message is required").openapi({ description: "ข้อความการแจ้งเตือน" }),

  recipient_ids: z.array(z.number()).openapi({ description: "รายชื่อผู้รับ (User IDs)" }),

  event: z.nativeEnum(NR_EVENT).openapi({ description: "เหตุการณ์" }),

  base_event: z.nativeEnum(BASE_EVENT).optional().openapi({ description: "Base Event" }),

  target_route: z.string().optional().openapi({ description: "Route ปลายทาง" }), // ลิงก์ตอนกด
  data: z.record(z.string(), z.any()).optional().openapi({ description: "ข้อมูลเพิ่มเติม (JSON)" }), // JSON Data เสริม

  brt_id: z.coerce.number().int().optional().openapi({ description: "ID การยืมคืน" }), // ใบยืม
  brts_id: z.coerce.number().int().optional().openapi({ description: "ID ขั้นตอนการยืมคืน" }), // ขั้นตอนอนุมัติ
  ti_id: z.coerce.number().int().optional().openapi({ description: "ID ใบแจ้งซ่อม" }), // ใบแจ้งซ่อม

  // เวลาส่ง (เผื่อตั้งเวลาล่วงหน้า)
  send_at: z.string().datetime().optional().openapi({ description: "เวลาส่ง (ISO 8601)" }),

  // อัปเดตการแจ้งเตือนเดิมที่มีอยู่แล้ว (Upsert)
  upsert: z.boolean().optional().openapi({ description: "อัปเดตถ้ามีอยู่แล้ว" }),
});

export const markAsReadSchema = z.object({
  ids: z.array(z.number()).openapi({ description: "รายการ ID ที่ต้องการทำเครื่องหมายว่าอ่านแล้ว" }),
});

export const getNotiPayload = z.object({
  userId: z.coerce.number().openapi({ description: "User ID" }),
  page: z.coerce.number().default(1).openapi({ description: "เลขหน้า" }),
  limit: z.coerce.number().default(10).openapi({ description: "จำนวนต่อหน้า" }),
});

export const getNotiDto = notificationSchema.extend({
  nr_id: z.coerce.number().int().openapi({ description: "ID การแจ้งเตือนของผู้รับ" }),
  status: z.nativeEnum(NR_STATUS).openapi({ description: "สถานะการแจ้งเตือน (READ/UNREAD)" }),
  event: z.nativeEnum(NR_EVENT).optional().openapi({ description: "เหตุการณ์" }),

  read_at: z.date().nullable().openapi({ description: "วันที่อ่าน" }),
  dismissed_at: z.date().nullable().openapi({ description: "วันที่ปิดการแจ้งเตือน" }),
})

export const userIdParama = z.object({
  userId: z.coerce.number().openapi({ description: "User ID" }),
});

export const getNotiQuery = z.object({
  page: z.coerce.number().openapi({ description: "เลขหน้า" }),
  limit: z.coerce.number().openapi({ description: "จำนวนต่อหน้า" }),
});

export type UserIdParama = z.infer<typeof userIdParama>;

export type GetNotiQuery = z.infer<typeof getNotiQuery>;

export type GetNotiPayload = z.infer<typeof getNotiPayload>;

export type GetNotiDto = z.infer<typeof getNotiDto>;

export type NotificationSchema = z.infer<typeof notificationSchema>;

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

export type MarkAsReadDto = z.infer<typeof markAsReadSchema>;
