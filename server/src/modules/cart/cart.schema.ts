import { z } from "zod";

// Schema สำหรับรับ parameter id
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// Schema สำหรับ cart item
export const cartItemSchema = z.object({
    cti_id: z.coerce.number(),
    cti_us_name: z.string().min(1).max(120),
    cti_phone: z.string().min(1).max(20),
    cti_note: z.string().min(1).max(255),
    cti_usage_location: z.string().min(1).max(255),
    cti_quantity: z.coerce.number(),
    cti_start_date: z.date().nullable(),
    cti_end_date: z.date().nullable(),
    cti_ct_id: z.coerce.number().int().positive().nullable().optional(),
    cti_de_id: z.coerce.number().int().positive().nullable().optional(), // แก้จาก cti_dec_id เป็น cti_de_id
});

// Schema สำหรับ device child
export const deviceChildSchema = z.object({
    dec_id: z.coerce.number(),
    dec_serial_number: z.string().min(1).max(120),
    dec_asset_code: z.string().min(1).max(120),
    dec_has_serial_number: z.boolean(),
    dec_status: z.enum([
        "READY",
        "BORROWED",
        "REPAIRING",
        "DAMAGED",
        "LOST",
    ]),
    dec_de_id: z.coerce.number().int().positive().nullable().optional(),
});

// Schema สำหรับ device
export const deviceSchema = z.object({
    de_id: z.coerce.number(),
    de_serial_number: z.string().min(1).max(120),
    de_name: z.string().min(1).max(120),
    de_description: z.string().min(1).max(255),
    de_location: z.string().min(1).max(255),
    de_max_borrow_days: z.coerce.number().int().positive().nullable().optional(),
    de_images: z.string().min(1).max(255),
    de_af_id: z.coerce.number().int().positive().nullable().optional(),
    de_ca_id: z.coerce.number().int().positive().nullable().optional(),
    de_us_id: z.coerce.number().int().positive().nullable().optional(),
    de_sec_id: z.coerce.number().int().positive().nullable().optional(),
    de_acc_id: z.coerce.number().int().positive().nullable().optional(),
});

// Schema สำหรับ categories
export const categoriesSchema = z.object({
    ca_id: z.coerce.number(),
    ca_name: z.string().min(1).max(120),
});

// Schema สำหรับ accessories
export const accessoriesSchema = z.object({
    acc_id: z.coerce.number(),
    acc_name: z.string().min(1).max(120),
    acc_quantity: z.coerce.number().int().positive().nullable().optional(),
    acc_de_id: z.coerce.number().int().positive().nullable().optional(), // เพิ่ม acc_de_id
});

// Schema สำหรับ response ของ list cart item
export const cartItemListResponseSchema = z.object({
    itemData: z.array(cartItemSchema),
});

export const updateCartItemSchema = z.object({
  cti_quantity: z.number().min(1).optional(),
  cti_start_date: z.string().nullable().optional(),
  cti_end_date: z.string().nullable().optional(),
});


// TypeScript types
export type IdParamDto = z.infer<typeof idParamSchema>;
export type CartItemSchema = z.infer<typeof cartItemSchema>;
export type DeviceChildSchema = z.infer<typeof deviceChildSchema>;
export type DeviceSchema = z.infer<typeof deviceSchema>;
export type CategoriesSchema = z.infer<typeof categoriesSchema>;
export type AccessoriesSchema = z.infer<typeof accessoriesSchema>;
export type CartItemListResponse = z.infer<typeof cartItemListResponseSchema>;
export type CartUpdateCartItem = z.infer<typeof updateCartItemSchema>;
