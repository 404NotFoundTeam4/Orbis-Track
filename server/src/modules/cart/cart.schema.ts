import { z } from "zod";

/**
 * Description : Schema สำหรับรับ id จาก params
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

/**
 * Description : Schema โครงสร้างข้อมูล Cart
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const cartSchema = z.object({
    ct_id: z.coerce.number(),
    ct_quantity: z.coerce.number(),
    ct_us_id: z.coerce.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
})

/**
 * Description : Schema โครงสร้างข้อมูล Cart Item
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
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
    cti_de_id: z.coerce.number().int().positive().nullable().optional(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
});

/**
 * Description: Schema โครงสร้างข้อมูล Cart Device Child (ความสัมพันธ์ Cart Item กับ Device Child)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const cartDeviceChildSchema = z.object({
    cdc_id: z.coerce.number(),
    cdc_cti_id: z.coerce.number(),
    cdc_dec_id: z.coerce.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
    reserved_at: z.date().nullable(),
})
/**
 * Description : Schema โครงสร้างข้อมูล Device Child
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
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
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
});

/**
 * Description : Schema โครงสร้างข้อมูล Device
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
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
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
});

/**
 * Description : Schema หมวดหมู่อุปกรณ์
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const categoriesSchema = z.object({
    ca_id: z.coerce.number(),
    ca_name: z.string().min(1).max(120),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
});

/**
 * Description : Schema อุปกรณ์เสริม
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const accessoriesSchema = z.object({
    acc_id: z.coerce.number(),
    acc_name: z.string().min(1).max(120),
    acc_quantity: z.coerce.number().int().positive().nullable().optional(),
    acc_de_id: z.coerce.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
});

/**
 * Description : Schema Response รายการ Cart Item
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const cartItemListResponseSchema = z.object({
    itemData: z.array(cartItemSchema),
});

/**
 * Description : Schema ข้อมูล Borrow Return Ticket
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const borrowReturnTicketsSchema = z.object({
    brt_id: z.coerce.number().nullable(),
    brt_status: z.enum([
        "PENDING",
        "APPROVED",
        "IN_USE",
        "COMPLETED",
        "REJECTED",
    ]),
    brt_usage_location: z.string().min(1).max(255),
    brt_borrow_purpose: z.string().min(1).max(255),
    brt_start_date: z.date(),
    brt_end_date: z.date(),
    brt_quantity: z.coerce.number(),
    brt_current_stage: z.coerce.number().nullable(),
    brt_reject_reason: z.string().min(1).max(255).nullable(),
    brt_pickup_location: z.string().min(1).max(255).nullable(),
    brt_pickup_datetime: z.date().nullable(),
    brt_return_location: z.string().min(1).max(255).nullable(),
    brt_return_datetime: z.date().nullable(),
    brt_af_id: z.coerce.number().nullable(),
    brt_staff_id: z.coerce.number().nullable(),
    brt_user_id: z.coerce.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
})

/**
 * Description : Schema โครงสร้างข้อมูลขั้นตอนการอนุมัติของ Borrow Return Ticket
 * ใช้สำหรับเก็บสถานะและลำดับการอนุมัติในแต่ละขั้นตอน
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const borrowReturnTicketStagesSchema = z.object({
    brts_id: z.coerce.number().nullable(),
    brts_name: z.string().min(1).max(255),
    brts_step_approve: z.coerce.number(),
    brts_role: z.enum([
        "ADMIN",
        "HOD",
        "HOS",
        "TECHNICAL",
        "STAFF",
        "EMPLOYEE",
    ]),
    brts_dept_id: z.coerce.number().nullable(),
    brts_sec_id: z.coerce.number().nullable(),
    brts_dept_name: z.string().min(1).max(255),
    brts_sec_name: z.string().min(1).max(255),
    brts_status: z.enum([
        "PENDING",
        "APPROVED",
        "REJECTED",
    ]),
    brts_brt_id: z.coerce.number(),
    brts_us_id: z.coerce.number().nullable(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
})

/**
 * Description : Schema โครงสร้างข้อมูล Approval Flow
 * ใช้กำหนดชุดกระบวนการอนุมัติคำร้องขอยืมอุปกรณ์
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const approvalFlowsSchema = z.object({
    af_id: z.coerce.number().nullable(),
    af_name: z.string().min(1).max(255),
    af_is_active: z.boolean().nullable(),
    af_us_id: z.coerce.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
})

/**
 * Description : Schema โครงสร้างข้อมูลขั้นตอนย่อยของ Approval Flow
 * ใช้ระบุบทบาทและลำดับการอนุมัติในแต่ละขั้น
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const approvalFlowStepsSchema = z.object({
    afs_id: z.coerce.number().nullable(),
    afs_step_approve: z.coerce.number(),
    afs_af_id: z.coerce.number(),
    afs_dept_id: z.coerce.number().nullable(),
    afs_sec_id: z.coerce.number().nullable(),
    afs_role: z.enum([
        "ADMIN",
        "HOD",
        "HOS",
        "TECHNICAL",
        "STAFF",
        "EMPLOYEE",
    ]),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
})

/**
 * Description : Schema Payload สำหรับสร้าง Borrow Ticket
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const createBorrowTicketPayload = z.object({
    cartItemId: z.coerce.number(),
})

/**
 * Description : Schema ความสัมพันธ์ Ticket กับ Device
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export const ticketDevicesSchema = z.object({
    td_id: z.coerce.number(),
    td_brt_id: z.coerce.number(),
    td_dec_id: z.coerce.number(),
    td_origin_cti_id: z.coerce.number(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
    deleted_at: z.date().nullable(),
})

/**
 * Description: Schema Payload สำหรับสร้าง TicketDevice (ผูก borrowTicketId กับ cartItemId)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const createTicketDevicePayload = z.object({
    cartItemId: z.coerce.number(),
    borrowTicketId: z.coerce.number(),
})

/**
 * Description: Schema Payload สำหรับสร้าง BorrowTicketStages
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const createBorrowTicketStagePayload = z.object({
    cartItemId: z.coerce.number(),
    borrowTicketId: z.coerce.number(),
})

/**
 * Description: Schema โครงสร้างข้อมูล Device Availabilities (ช่วงเวลาที่อุปกรณ์ถูกจอง/ถูกยืม)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const deviceAvailabilitiesSchema = z.object({
    da_id: z.coerce.number(),
    da_dec_id: z.coerce.number(),
    da_brt_id: z.coerce.number(),
    da_start: z.date(),
    da_end: z.date(),
    da_status: z.enum([
        "ACTIVE",
        "COMPLETED",
    ]),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
})

export type IdParamDto = z.infer<typeof idParamSchema>;
export type CartSchema = z.infer<typeof cartSchema>;
export type CartItemSchema = z.infer<typeof cartItemSchema>;
export type CartDeviceChildSchema = z.infer<typeof cartDeviceChildSchema>;
export type DeviceChildSchema = z.infer<typeof deviceChildSchema>;
export type DeviceSchema = z.infer<typeof deviceSchema>;
export type CategoriesSchema = z.infer<typeof categoriesSchema>;
export type AccessoriesSchema = z.infer<typeof accessoriesSchema>;
export type CartItemListResponse = z.infer<typeof cartItemListResponseSchema>;
export type BorrowReturnTicketsSchema = z.infer<typeof borrowReturnTicketsSchema>;
export type BorrowReturnTicketStagesSchema = z.infer<typeof borrowReturnTicketStagesSchema>;
export type ApprovalFlowsSchema = z.infer<typeof approvalFlowsSchema>;
export type ApprovalFlowStepsSchema = z.infer<typeof approvalFlowStepsSchema>;
export type CreateBorrowTicketPayload = z.infer<typeof createBorrowTicketPayload>;
export type TicketDevicesSchema = z.infer<typeof ticketDevicesSchema>;
export type CreateTicketDevicePayload = z.infer<typeof createTicketDevicePayload>;
export type CreateBorrowTicketStagePayload = z.infer<typeof createBorrowTicketStagePayload>;
export type DeviceAvailabilitiesSchema = z.infer<typeof deviceAvailabilitiesSchema>;