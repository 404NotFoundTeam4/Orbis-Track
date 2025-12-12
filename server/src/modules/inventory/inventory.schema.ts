import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Schema ของอุปกรณ์ย่อย
const deviceChildSchema = z.object({
  dec_id: z.number(),
  dec_serial_number: z.string().nullable(),
  dec_status: z.enum(["READY", "BORROWED", "REPAIRING", "DAMAGED", "LOST"]).nullable(), 
});

export const inventorySchema = z.object({
  de_id: z.number(),
  de_serial_number: z.string().nullable(),
  de_name: z.string().nullable(),
  de_description: z.string().nullable(),
  de_location: z.string().nullable(),
  de_max_borrow_days: z.number().nullable(),
  de_images: z.string().nullable(),
  
  de_af_id: z.number().nullable(),
  de_ca_id: z.number().nullable(),
  de_us_id: z.number().nullable(),
  de_sec_id: z.number().nullable(),
  de_acc_id: z.number().nullable(),

  // Virtual Fields
  category_name: z.string().optional().default("-"),
  sub_section_name: z.string().optional().default("-"),
  department_name: z.string().optional().default("-"),
 quantity: z.number().optional().default(0),
 total_quantity: z.number().optional(),
  
  // [UPDATED]
  device_childs: z.array(deviceChildSchema).optional(),
  status_type: z.string().optional(), 

  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});

export const softDeleteResponseSchema = z.object({
  de_id: z.number().int(),
  deletedAt: z.date(),
});

export type InventorySchema = z.infer<typeof inventorySchema>;
export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;
export type IdParamDto = z.infer<typeof idParamSchema>;