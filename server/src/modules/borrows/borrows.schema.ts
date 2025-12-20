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

    // อุปกรณ์ลูก
    device_childs: z.array(
        z.object({
            dec_id: z.number(),
            dec_status: z.enum(["READY", "BORROWED", "REPAIRING", "DAMAGED", "LOST"])
        })
    ).optional(),
});

export const createBorrowTicketPayload = z.object({
    deviceChilds: z.array(z.number()).min(1),
    borrowStart: z.coerce.date(),
    borrowEnd: z.coerce.date(),
    reason: z.string(),
    placeOfUse: z.string(),
});

export const createBorrowTicketSchema = z.object({
  brt_id: z.number(),
  brt_status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  brt_start_date: z.date(),
  brt_end_date: z.date(),
  brt_quantity: z.number(),
});

export type GetInventorySchema = z.infer<typeof getInventorySchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type GetDeviceForBorrowSchema = z.infer<typeof getDeviceForBorrowSchema>;

export type CreateBorrowTicketPayload = z.infer<typeof createBorrowTicketPayload>;

export type CreateBorrowTicketSchema = z.infer<typeof createBorrowTicketSchema>;