import { $Enums } from "@prisma/client";
import { z } from "zod";

// Author: Sutaphat Thahin (Yeen) 66160378
export const inventorySchema = z.object({
    de_id: z.number(),
    de_serial_number: z.string(),
    de_name: z.string(),
    de_description: z.string().nullable(),
    de_location: z.string(),
    de_max_borrow_days: z.number(),
    de_images: z.string().nullable(),
    category: z.string(),
    department: z.string().nullable().optional(),
    sub_section: z.string().nullable().optional(),
    total: z.number(),
    available: z.number(),
});

export const getInventorySchema = z.array(inventorySchema);

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากดึงข้อมูลอุปกรณ์สำหรับการยืม
export const getDeviceForBorrowSchema = z.object({
    // อุปกรณ์แม่
    de_serial_number: z.string(),
    de_name: z.string(),
    de_description: z.string().nullable(),
    de_location: z.string(),
    de_max_borrow_days: z.number(),
    de_images: z.string().nullable(),

    // หมวดหมู่อุปกรณ์
    category: z.object({
        ca_name: z.string(),
    }).optional(),

    // อุปกรณ์เสริม
    accessories: z.array(
        z.object({
            acc_name: z.string(),
            acc_quantity: z.number(),
        })
    ).optional(),

    // แผนกและฝ่ายย่อย
    department: z.string().nullable().optional(),
    section: z.string().nullable().optional(),
    // จำนวนอุปกรณ์ทั้งหมดและที่พร้อมใช้งาน
    total: z.number(),
    ready: z.number()
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากดึงข้อมูลอุปกรณ์ที่ถูกยืมอยู่
export const getAvailableSchema = z.array(
  z.object({
    dec_id: z.number(),
    dec_serial_number: z.string().nullable(),
    dec_asset_code: z.string(),
    dec_status: z.enum(["READY", "BORROWED", "REPAIRING", "DAMAGED", "LOST"]),
    activeBorrow: z.array(
      z.object({
        da_start: z.coerce.date(),
        da_end: z.coerce.date(),
      })
    ),
  })
);

// โครงสร้างข้อมูลที่ส่งมาตอนส่งคำร้อง
export const createBorrowTicketPayload = z.object({
    deviceChilds: z.array(z.number()).min(1),
    borrowStart: z.coerce.date(),
    borrowEnd: z.coerce.date(),
    reason: z.string(),
    placeOfUse: z.string(),
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากสร้างคำร้อง
export const createBorrowTicketSchema = z.object({
    brt_id: z.number(),
    brt_status: z.enum(["PENDING", "APPROVED", "IN_USE", "COMPLETED", "REJECTED"]),
    brt_start_date: z.date(),
    brt_end_date: z.date(),
    brt_quantity: z.number(),
});

// โครงสร้างข้อมูลที่ส่งมาตอนเพิ่มอุปกรณ์ลงระเข็น
export const addToCartPayload = z.object({
    deviceId: z.number().int().positive(),
    borrower: z.string().min(1),
    phone: z.string().length(10),
    reason: z.string().optional(),
    placeOfUse: z.string().min(1),
    quantity: z.number().int().positive(),
    borrowStart: z.coerce.date(),
    borrowEnd: z.coerce.date(),
    deviceChilds: z.array(z.number()).min(1)
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากเพิ่มอุปกรณ์ลงรถเข็น
export const addToCartSchema = z.object({
    cartId: z.number(),
    cartItemId: z.number()
});

export type GetInventorySchema = z.infer<typeof getInventorySchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type GetDeviceForBorrowSchema = z.infer<typeof getDeviceForBorrowSchema>;

export type GetAvailableSchema = z.infer<typeof getAvailableSchema>;

export type CreateBorrowTicketPayload = z.infer<typeof createBorrowTicketPayload>;

export type CreateBorrowTicketSchema = z.infer<typeof createBorrowTicketSchema>;

export type AddToCartPayload = z.infer<typeof addToCartPayload>;

export type AddToCartSchema = z.infer<typeof addToCartSchema>;