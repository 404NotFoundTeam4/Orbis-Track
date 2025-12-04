import { z } from "zod";

// สำหรับตรวจสอบ ID ที่ส่งมาทาง URL params
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Schema ของข้อมูล Device ที่จะแสดงผล
export const inventorySchema = z.object({
  de_id: z.number(),
  de_serial_number: z.string().nullable(),
  de_name: z.string().nullable(),
  de_description: z.string().nullable(),
  de_location: z.string().nullable(),
  de_max_borrow_days: z.number().nullable(),
  de_images: z.string().nullable(),
  // Foreign Keys (เลือกใส่ตามต้องการ)
  de_af_id: z.number().nullable(),
  de_ca_id: z.number().nullable(),
  de_us_id: z.number().nullable(),
  de_sec_id: z.number().nullable(),
  de_acc_id: z.number().nullable(),
  // Timestamps
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

// Schema สำหรับ Response การลบ
export const softDeleteResponseSchema = z.object({
  de_id: z.number().int(),
  deletedAt: z.date(),
});

// Export Types
export type InventorySchema = z.infer<typeof inventorySchema>;
export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;
export type IdParamDto = z.infer<typeof idParamSchema>;