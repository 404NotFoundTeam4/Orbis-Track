import { z } from "zod";


// Author: Sutaphat Thahin (Yeen) 66160378
export const inventorySchema = z.object({
    de_id: z.number().openapi({ description: "รหัสอุปกรณ์" }),
    de_serial_number: z.string().openapi({ description: "หมายเลขซีเรียลของอุปกรณ์" }),
    de_name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
    de_description: z.string().nullable().openapi({ description: "รายละเอียดอุปกรณ์" }),
    de_location: z.string().openapi({ description: "สถานที่เก็บ" }),
    de_max_borrow_days: z.number().openapi({ description: "จำนวนวันที่ยืมได้สูงสุด" }),
    de_images: z.string().nullable().openapi({ description: "รูปภาพอุปกรณ์" }),
    category: z.string().openapi({ description: "หมวดหมู่" }),
    department: z.string().nullable().optional().openapi({ description: "แผนกเจ้าของอุปกรณ์" }),
    sub_section: z.string().nullable().optional().openapi({ description: "ฝ่ายเจ้าของอุปกรณ์" }),
    total: z.number().openapi({ description: "จำนวนทั้งหมด" }),
    available: z.number().openapi({ description: "จำนวนที่ว่าง" }),
});

export const getInventorySchema = z.array(inventorySchema);

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive().openapi({ description: "ID ของรายการ" }),
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากดึงข้อมูลอุปกรณ์สำหรับการยืม
export const getDeviceForBorrowSchema = z.object({
    // อุปกรณ์แม่
    de_serial_number: z.string().openapi({ description: "หมายเลขซีเรียล" }),
    de_name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
    de_description: z.string().nullable().openapi({ description: "รายละเอียด" }),
    de_location: z.string().openapi({ description: "สถานที่" }),
    de_max_borrow_days: z.number().openapi({ description: "ระยะเวลายืมสูงสุด (วัน)" }),
    de_images: z.string().nullable().openapi({ description: "รูปภาพ" }),

    // หมวดหมู่อุปกรณ์
    category: z.object({
        ca_name: z.string().openapi({ description: "ชื่อหมวดหมู่" }),
    }).optional(),

    // อุปกรณ์เสริม
    accessories: z.array(
        z.object({
            acc_name: z.string().openapi({ description: "ชื่ออุปกรณ์เสริม" }),
            acc_quantity: z.number().openapi({ description: "จำนวน" }),
        })
    ).optional(),

    // แผนกและฝ่ายย่อย
    department: z.string().nullable().optional().openapi({ description: "แผนก" }),
    section: z.string().nullable().optional().openapi({ description: "ฝ่าย" }),
    // จำนวนอุปกรณ์ทั้งหมดและที่พร้อมใช้งาน
    total: z.number().openapi({ description: "จำนวนทั้งหมด" }),
    ready: z.number().openapi({ description: "จำนวนที่พร้อมใช้งาน" })
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากดึงข้อมูลอุปกรณ์ที่ถูกยืมอยู่
export const getAvailableSchema = z.array(
    z.object({
        dec_id: z.number().openapi({ description: "ID อุปกรณ์ลูก" }),
        dec_serial_number: z.string().nullable().openapi({ description: "Serial Number อุปกรณ์ลูก" }),
        dec_asset_code: z.string().openapi({ description: "Asset Code" }),
        dec_status: z.enum(["UNAVAILABLE", "READY", "BORROWED", "REPAIRING", "DAMAGED", "LOST"]).openapi({ description: "สถานะอุปกรณ์" }),
        activeBorrow: z.array(
            z.object({
                da_start: z.coerce.date().openapi({ description: "วันเริ่มยืม" }),
                da_end: z.coerce.date().openapi({ description: "วันคืน" }),
            })
        ).openapi({ description: "รายการการยืมที่กำลังดำเนินการ" }),
    })
);

// โครงสร้างข้อมูลที่ส่งมาตอนส่งคำร้อง
export const createBorrowTicketPayload = z.object({
    borrowerId: z.number().optional(),
    deviceChilds: z.array(z.number()).min(1).openapi({ description: "รายชื่อ ID อุปกรณ์ลูกที่ต้องการยืม" }),
    borrowStart: z.coerce.date().openapi({ description: "วันเวลาที่เริ่มยืม" }),
    borrowEnd: z.coerce.date().openapi({ description: "วันเวลาที่ต้องการคืน" }),
    reason: z.string().openapi({ description: "เหตุผลการยืม" }),
    placeOfUse: z.string().openapi({ description: "สถานที่นำไปใช้งาน" }),
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากสร้างคำร้อง
export const createBorrowTicketSchema = z.object({
    brt_id: z.number().openapi({ description: "ID ใบคำร้อง" }),
    brt_status: z.enum(["PENDING", "APPROVED", "IN_USE", "COMPLETED", "REJECTED", "OVERDUE"]).openapi({ description: "สถานะคำร้อง" }),
    brt_start_date: z.date().openapi({ description: "วันเริ่มยืม" }),
    brt_end_date: z.date().openapi({ description: "วันคืน" }),
    brt_quantity: z.number().openapi({ description: "จำนวน" }),
});

// โครงสร้างข้อมูลที่ส่งมาตอนเพิ่มอุปกรณ์ลงระเข็น
export const addToCartPayload = z.object({
    deviceId: z.number().int().positive().openapi({ description: "ID อุปกรณ์แม่" }),
    borrower: z.string().min(1).openapi({ description: "ชื่อผู้ยืม" }),
    phone: z.string().length(10).openapi({ description: "เบอร์โทรศัพท์" }),
    reason: z.string().optional().openapi({ description: "เหตุผล" }),
    placeOfUse: z.string().min(1).openapi({ description: "สถานที่ใช้งาน" }),
    quantity: z.number().int().positive().openapi({ description: "จำนวน" }),
    borrowStart: z.coerce.date().openapi({ description: "วันเริ่มยืม" }),
    borrowEnd: z.coerce.date().openapi({ description: "วันคืน" }),
    deviceChilds: z.array(z.number()).min(1).openapi({ description: "รายการ ID อุปกรณ์ลูก" })
});

// โครงสร้างข้อมูลที่ตอบกลับหลังจากเพิ่มอุปกรณ์ลงรถเข็น
export const addToCartSchema = z.object({
    cartId: z.number().openapi({ description: "ID ตะกร้า" }),
    cartItemId: z.number().openapi({ description: "ID รายการในตะกร้า" })
});

/**
 * Description: Schema โครงสร้างข้อมูล Device Availabilities (ช่วงเวลาที่อุปกรณ์ถูกจอง/ถูกยืม)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const deviceAvailabilityItemSchema = z.object({
    da_id: z.coerce.number().openapi({ description: "ID Availability" }),
    da_dec_id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
    da_brt_id: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
    da_start: z.date().openapi({ description: "เวลาเริ่มต้น" }),
    da_end: z.date().openapi({ description: "เวลาสิ้นสุด" }),
    da_status: z.enum([
        "ACTIVE",
        "COMPLETED",
    ]).openapi({ description: "สถานะ" }),
    created_at: z.date().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().openapi({ description: "วันที่อัปเดต" }),
})

// โครงสร้างข้อมูลดึงรายชื่อผู้ใช้สำหรับยืมให้ผู้อื่น
export const getBorrowUsersSchema = z.array(
    z.object({
        us_id: z.number(),
        us_firstname: z.string(),
        us_lastname: z.string(),
        us_role: z.string(),
        us_emp_code: z.string().nullable(),
        us_phone: z.string()
    })
);

export const deviceAvailabilitiesSchema = z.array(deviceAvailabilityItemSchema);

export type GetInventorySchema = z.infer<typeof getInventorySchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type GetDeviceForBorrowSchema = z.infer<typeof getDeviceForBorrowSchema>;

export type GetAvailableSchema = z.infer<typeof getAvailableSchema>;

export type CreateBorrowTicketPayload = z.infer<typeof createBorrowTicketPayload>;

export type CreateBorrowTicketSchema = z.infer<typeof createBorrowTicketSchema>;

export type AddToCartPayload = z.infer<typeof addToCartPayload>;

export type AddToCartSchema = z.infer<typeof addToCartSchema>;

export type DeviceAvailabilitiesSchema = z.infer<typeof deviceAvailabilitiesSchema>;

export type GetBorrowUsersSchema = z.infer<typeof getBorrowUsersSchema>;