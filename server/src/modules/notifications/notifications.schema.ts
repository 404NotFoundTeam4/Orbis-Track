import { z } from "zod";
import { BASE_EVENT, NR_EVENT, NR_STATUS } from "@prisma/client";

export const notificationSchema = z.object({
  n_id: z.coerce.number().int(),
  n_title: z.string().max(200, "Title must not exceed 200 characters"),
  n_message: z.string().min(1, "Message is required"),

  n_data: z.any().nullable().optional(),

  n_target_route: z.string().max(255).nullable().optional(),

  n_base_event: z.nativeEnum(BASE_EVENT).nullable().optional(),

  // Foreign Keys
  n_brt_id: z.coerce.number().int().nullable().optional(),
  n_brts_id: z.coerce.number().int().nullable().optional(),
  n_ti_id: z.coerce.number().int().nullable().optional(),

  // Dates
  created_at: z.date(),
  send_at: z.date().nullable().optional(),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),

  recipient_ids: z.array(z.number()),

  event: z.nativeEnum(NR_EVENT),

  base_event: z.nativeEnum(BASE_EVENT).optional(),

  target_route: z.string().optional(), // ลิงก์ตอนกด
  data: z.record(z.string(), z.any()).optional(), // JSON Data เสริม

  brt_id: z.coerce.number().int().optional(), // ใบยืม
  brts_id: z.coerce.number().int().optional(), // ขั้นตอนอนุมัติ
  ti_id: z.coerce.number().int().optional(), // ใบแจ้งซ่อม

  // เวลาส่ง (เผื่อตั้งเวลาล่วงหน้า)
  send_at: z.string().datetime().optional(),

  // อัปเดตการแจ้งเตือนเดิมที่มีอยู่แล้ว (Upsert)
  upsert: z.boolean().optional(),
});

export const markAsReadSchema = z.object({
  ids: z.array(z.number()),
});

export const getNotiPayload = z.object({
  userId: z.coerce.number(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export const getNotiDto = notificationSchema.extend({
  nr_id: z.coerce.number().int(),
  status: z.nativeEnum(NR_STATUS),
  event: z.nativeEnum(NR_EVENT).optional(),

  read_at: z.date().nullable(),
  dismissed_at: z.date().nullable(),
});

export const userIdParama = z.object({
  userId: z.coerce.number(),
});

export const getNotiQuery = z.object({
  page: z.coerce.number(),
  limit: z.coerce.number(),
});

export type UserIdParama = z.infer<typeof userIdParama>;

export type GetNotiQuery = z.infer<typeof getNotiQuery>;

export type GetNotiPayload = z.infer<typeof getNotiPayload>;

export type GetNotiDto = z.infer<typeof getNotiDto>;

export type NotificationSchema = z.infer<typeof notificationSchema>;

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

export type MarkAsReadDto = z.infer<typeof markAsReadSchema>;
