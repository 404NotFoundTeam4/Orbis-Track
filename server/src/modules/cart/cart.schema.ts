import { z } from "zod";

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

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
    cti_dec_id: z.coerce.number().int().positive().nullable().optional(),
});

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

export const categoriesSchema = z.object({
    ca_id: z.coerce.number(),
    ca_name: z.string().min(1).max(120),
});

export const accessoriesSchema = z.object({
    acc_id: z.coerce.number(),
    acc_name: z.string().min(1).max(120),
    acc_quantity: z.coerce.number().int().positive().nullable().optional(),
});

export const cartItemListResponseSchema = z.object({
    itemData: z.array(cartItemSchema),
});

export type IdParamDto = z.infer<typeof idParamSchema>;
export type CartItemSchema = z.infer<typeof cartItemSchema>;
export type DeviceChildSchema = z.infer<typeof deviceChildSchema>;
export type DeviceSchema = z.infer<typeof deviceSchema>;
export type CategoriesSchema = z.infer<typeof categoriesSchema>;
export type AccessoriesSchema = z.infer<typeof accessoriesSchema>;
export type CartItemListResponse = z.infer<typeof cartItemListResponseSchema>;