import { z } from "zod";
import { $Enums } from "@prisma/client";

export const idParamSchema = z.object({
    id: z.coerce.number().positive()
});

// ข้อมูลอุปกรณ์ลูก
export const deviceChildSchema = z.object({
    dec_id: z.number(),
    dec_serial_number: z.string().nullable(),
    dec_asset_code: z.string().nullable(),
    dec_status: z.nativeEnum($Enums.DEVICE_CHILD_STATUS),
    dec_has_serial_number: z.boolean(),
    dec_de_id: z.number(),
});

// ข้อมูลอุปกรณ์แม่
export const deviceWithChildsSchema = z.object({
    de_id: z.number(),
    de_name: z.string(),
    de_serial_number: z.string(),
    de_description: z.string().nullable(),
    de_location: z.string(),
    de_max_borrow_days: z.number(),
    de_images: z.string().nullable(),
    device_childs: z.array(deviceChildSchema)
});

// ข้อมูลหลังจากทำการดึงข้อมูล
export const getDeviceWithChildsSchema = z.object({
  device: deviceWithChildsSchema.nullable(),
});

// ข้อมูลที่ส่งเข้ามาตอนเพิ่มอุปกรณ์ลูก
export const createDeviceChildPayload = z.object({
    dec_de_id: z.number(),
    quantity: z.number().positive()
});

// ข้อมูลหลังจากทำการเพิ่มอุปกรณ์ลูก
export const createDeviceChildSchema = z.object({
    dec_id: z.number(),
    dec_serial_number: z.string().nullable(),
    dec_asset_code: z.string(),
    dec_status: z.nativeEnum($Enums.DEVICE_CHILD_STATUS),
    dec_has_serial_number: z.boolean(),
    dec_de_id: z.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
});

// ข้อมูลที่ส่งเข้ามาตอนเพิ่มอุปกรณ์ลูกด้วยไฟล์
export const uploadFileDeviceChildPayload = z.object({
    de_id: z.coerce.number().positive(),
    filePath: z.string().min(1)
});

/** ข้อมูลหลังจาก insert ข้อมูลจากไฟล์ */
export const uploadFileDeviceChildSchema = z.object({
    inserted: z.number()
});

// ข้อมูลที่ส่งเข้ามาตอนลบอุปกรณ์ลูก
export const deleteDeviceChildPayload = z.object({
    dec_id: z.array(z.number())
});

export type IdParamDto = z.infer<typeof idParamSchema>;

export type GetDeviceWithChildsSchema = z.infer<typeof getDeviceWithChildsSchema>;

export type CreateDeviceChildPayload = z.infer<typeof createDeviceChildPayload>;

export type CreateDeviceChildSchema = z.infer<typeof createDeviceChildSchema>;

export type UploadFileDeviceChildPayload = z.infer<typeof uploadFileDeviceChildPayload>;

export type UploadFileDeviceChildSchema = z.infer<typeof uploadFileDeviceChildSchema>;

export type DeleteDeviceChildPayload = z.infer<typeof deleteDeviceChildPayload>;