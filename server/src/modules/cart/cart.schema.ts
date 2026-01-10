import { z } from "zod";

/**
* Description : Schema สำหรับรับ id จาก params
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

/**
* Description : Schema Payload สำหรับลบ Cart Item (ส่ง cartItemId ผ่าน req.body)
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const deleteCartItemPayload = z.object({
    cartItemId: z.coerce.number().int().positive(),
})

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
    cti_us_name: z.string().max(120).nullable(),
    cti_phone: z.string().max(20).nullable(),
    cti_note: z.string().max(255).nullable(),
    cti_usage_location: z.string().max(255).nullable(),
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
    dec_serial_number: z.string().nullable(),
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
/* ---------- Params ---------- */
/**
 * Description: Param schema สำหรับดึงรายละเอียดอุปกรณ์ในรถเข็น
 * Params : id (number) : รหัส cart item (cti_id)
 * Purpose : ใช้ validate path parameter ก่อนเรียก Service
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const getCartDeviceDetailParamSchema = idParamSchema;
export const updateCartDeviceDetailParamSchema = idParamSchema;


/* ---------- GET Response ---------- */
/**
 * Description: Schema สำหรับแสดงรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : ctiId (number)
 * Output    : Object ของ cart item รวมข้อมูลผู้ยืม, จำนวน, วันที่เริ่ม-สิ้นสุด, และความสัมพันธ์กับ cart และ device_child
 * Logic     :
 *   - Validate ข้อมูลที่ได้จาก database
 *   - ใช้สำหรับ response ของ API GET /borrow/cart/device/:id
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const cartDeviceDetailSchema = cartItemSchema.extend({
    cart: cartSchema,
    cart_device_childs: z.array(
        z.object({
            device_child: deviceChildSchema,
        })
    ).optional().default([]),
});

/* ---------- PATCH Body ---------- */
/**
 * Description: Schema สำหรับแก้ไขรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : Payload สำหรับอัปเดตค่าต่าง ๆ ของอุปกรณ์ เช่น ชื่อผู้ใช้, เบอร์โทร, จำนวน, โน้ต, สถานที่ใช้งาน, วันที่เริ่ม-สิ้นสุด
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามโครงสร้างของ payload
 * Logic     :
 *   - ตรวจสอบแต่ละฟิลด์ว่าเป็น optional และสามารถเป็น null ได้
 *   - ใช้ validate ก่อนส่งไป update database
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const updateCartDeviceDetailBodySchema = z.object({
    cti_us_name: z.string().nullable().optional(),
    cti_phone: z.string().nullable().optional(),
    cti_quantity: z.number().int().positive().optional(),
    cti_note: z.string().nullable().optional(),
    cti_usage_location: z.string().nullable().optional(),
    cti_start_date: z.coerce.date().nullable().optional(),
    cti_end_date: z.coerce.date().nullable().optional(),
    device_childs: z.array(z.coerce.number().int().positive()).optional(),
});

/* ---------- PATCH Response ---------- */
/**
 * Description: Schema สำหรับ response หลังจากแก้ไขรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : ข้อมูล cart item ที่ถูกอัปเดต (รวม relation กับ cart และ device_child)
 * Output    : Object ที่ห่อด้วย key `data` สำหรับส่งกลับ client
 * Logic     :
 *   - ตรวจสอบโครงสร้างข้อมูล response ก่อนส่ง
 *   - รวมข้อมูล relation ของ cart และ device_child ให้ครบ
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export const updateCartDeviceDetailDataSchema = cartDeviceDetailSchema;

/**
* Description: Schema บันทึกการกระทำ/เหตุการณ์ของ Borrow Return Ticket (Audit Log)
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const logBorrowReturnSchema = z.object({
    lbr_id: z.coerce.number(),
    lbr_action: z.enum([
        "CREATED",
        "UPDATED",
        "APPROVED",
        "REJECTED",
        "RETURNED",
        "MARK_DAMAGED",
        "MARK_LOST",
    ]),
    lbr_old_status: z.string().min(1).max(50).nullable(),
    lbr_new_status: z.string().min(1).max(50).nullable(),
    lbr_note: z.string().min(1).max(255).nullable(),
    lbr_actor_id: z.coerce.number(),
    lbr_brt_id: z.coerce.number(),
    created_at: z.date().nullable(),
})

export type IdParamDto = z.infer<typeof idParamSchema>;
export type DeleteCartItemPayload = z.infer<typeof deleteCartItemPayload>;
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
export type UpdateCartDeviceDetailDataSchema = z.infer<typeof updateCartDeviceDetailDataSchema>;
export type UpdateCartDeviceDetailBodySchema = z.infer<typeof updateCartDeviceDetailBodySchema>;
export type CartDeviceDetailSchema = z.infer<typeof cartDeviceDetailSchema>;
export type GetCartDeviceDetailParamDto = z.infer<typeof getCartDeviceDetailParamSchema>;
export type UpdateCartDeviceDetailParamDto = z.infer<typeof updateCartDeviceDetailParamSchema>;
export type UpdateCartDeviceDetailBodyDto = z.infer<typeof updateCartDeviceDetailBodySchema>;
export type LogBorrowReturnSchema = z.infer<typeof logBorrowReturnSchema>;