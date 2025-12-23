import { z } from "zod";
import { $Enums } from "@prisma/client";

export const idParamSchema = z.object({
    id: z.coerce.number().positive()
});

// ข้อมูลอุปกรณ์ลูก
export const devicesChildSchema = z.object({
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
    device_childs: z.array(devicesChildSchema)
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

// Schema ของอุปกรณ์ย่อย
const deviceChildSchema = z.object({
  dec_id: z.number(),
  dec_serial_number: z.string().nullable(),
  dec_status: z.enum(["READY", "BORROWED", "REPAIRING", "DAMAGED", "LOST"]).nullable(), 
});

/**
 * Description: Schema หลักของ Inventory/Device 
 * Note: รวมทั้ง Field จาก Database และ Virtual Fields ที่คำนวณเพิ่ม
 * Author: Worrawat Namwat (Wave) 66160372
 */
export const inventorySchema = z.object({
  //Database Fields
  de_id: z.number(),
  de_serial_number: z.string().nullable(),
  de_name: z.string().nullable(),
  de_description: z.string().nullable(),
  de_location: z.string().nullable(),
  de_max_borrow_days: z.number().nullable(),
  de_images: z.string().nullable(),
  
  //Foreign Keys
  de_af_id: z.number().nullable(),
  de_ca_id: z.number().nullable(),
  de_us_id: z.number().nullable(),
  de_sec_id: z.number().nullable(),
  de_acc_id: z.number().nullable(),

  //Virtual Fields (ข้อมูลที่ได้จากการ Join หรือคำนวณ Logic)
  category_name: z.string().optional().default("-"),
  sub_section_name: z.string().optional().default("-"),
  department_name: z.string().optional().default("-"),
 quantity: z.number().optional().default(0),// จำนวนคงเหลือ
 total_quantity: z.number().optional(),// จำนวนทั้งหมด
  
  //Relations & Computed Status
  device_childs: z.array(deviceChildSchema).optional(),// รายการอุปกรณ์ย่อย
  status_type: z.string().optional(), // สถานะภาพรวม

  //Timestamps
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
});
//Schema สำหรับ Response เมื่อทำการ Soft Delete
export const softDeleteResponseSchema = z.object({
  de_id: z.number().int(),
  deletedAt: z.date(),
});

/**
 * Description:แก้ไขอุปกรณ์แม่
 * Author: Worrawat Namwat (Wave) 66160372
 */
export const updateDevicePayload = z.object({
    device_name: z.string().optional(),
    device_code: z.string().optional(), // รหัสอุปกรณ์ (Serial Number แม่)
    location: z.string().optional(),
    description: z.string().optional(),
    maxBorrowDays: z.coerce.number().optional(),
    totalQuantity: z.coerce.number().optional(),
    imageUrl: z.string().nullable().optional(),

    // Foreign Keys
    department_id: z.coerce.number().nullable().optional(),
    category_id: z.coerce.number().nullable().optional(),
    sub_section_id: z.coerce.number().nullable().optional(),
    approver_flow_id: z.coerce.number().nullable().optional(),
    
    serialNumbers: z.array(z.any()).optional(), 
    accessories: z.array(z.any()).optional(),
});

export type InventorySchema = z.infer<typeof inventorySchema>;

export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type GetDeviceWithChildsSchema = z.infer<typeof getDeviceWithChildsSchema>;

export type CreateDeviceChildPayload = z.infer<typeof createDeviceChildPayload>;

export type CreateDeviceChildSchema = z.infer<typeof createDeviceChildSchema>;

export type UploadFileDeviceChildPayload = z.infer<typeof uploadFileDeviceChildPayload>;

export type UploadFileDeviceChildSchema = z.infer<typeof uploadFileDeviceChildSchema>;

export type DeleteDeviceChildPayload = z.infer<typeof deleteDeviceChildPayload>;

export type UpdateDevicePayload = z.infer<typeof updateDevicePayload>;
