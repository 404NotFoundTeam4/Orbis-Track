import { z } from "zod";

/**
* Description : Schema สำหรับรับ id จาก params
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive().openapi({ description: "ID" }),
});

/**
* Description : Schema Payload สำหรับลบ Cart Item (ส่ง cartItemId ผ่าน req.body)
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const deleteCartItemPayload = z.object({
    cartItemId: z.coerce.number().int().positive().openapi({ description: "ID รายการในตะกร้า" }),
})

/**
* Description : Schema โครงสร้างข้อมูล Cart
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const cartSchema = z.object({
    ct_id: z.coerce.number().openapi({ description: "ID ตะกร้า" }),
    ct_quantity: z.coerce.number().openapi({ description: "จำนวนรายการ" }),
    ct_us_id: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
})

/**
* Description : Schema โครงสร้างข้อมูล Cart Item
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const cartItemSchema = z.object({
    cti_id: z.coerce.number().openapi({ description: "ID รายการในตะกร้า" }),
    cti_us_name: z.string().max(120).nullable().openapi({ description: "ชื่อผู้ขอใช้" }),
    cti_phone: z.string().max(20).nullable().openapi({ description: "เบอร์โทรศัพท์" }),
    cti_note: z.string().max(255).nullable().openapi({ description: "หมายเหตุ" }),
    cti_usage_location: z.string().max(255).nullable().openapi({ description: "สถานที่ใช้งาน" }),
    cti_quantity: z.coerce.number().openapi({ description: "จำนวน" }),
    cti_start_date: z.date().nullable().openapi({ description: "วันเริ่มยืม" }),
    cti_end_date: z.date().nullable().openapi({ description: "วันคืน" }),
    cti_ct_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "ID ตะกร้า" }),
    cti_de_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "ID อุปกรณ์" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
});

/**
 * Description: Schema โครงสร้างข้อมูล Cart Device Child (ความสัมพันธ์ Cart Item กับ Device Child)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const cartDeviceChildSchema = z.object({
    cdc_id: z.coerce.number().openapi({ description: "ID ความสัมพันธ์" }),
    cdc_cti_id: z.coerce.number().openapi({ description: "ID รายการในตะกร้า" }),
    cdc_dec_id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
    reserved_at: z.date().nullable().openapi({ description: "วันที่จอง" }),
})

/**
* Description : Schema โครงสร้างข้อมูล Device Child
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const deviceChildSchema = z.object({
    dec_id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
    dec_serial_number: z.string().nullable().openapi({ description: "Serial Number" }),
    dec_asset_code: z.string().min(1).max(120).openapi({ description: "Asset Code" }),
    dec_has_serial_number: z.boolean().openapi({ description: "มี Serial Number" }),
    dec_status: z.enum([
        "READY",
        "BORROWED",
        "REPAIRING",
        "DAMAGED",
        "LOST",
    ]).openapi({ description: "สถานะ" }),
    dec_de_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "ID อุปกรณ์แม่" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
});

/**
* Description : Schema โครงสร้างข้อมูล Device
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const deviceSchema = z.object({
    de_id: z.coerce.number().openapi({ description: "ID อุปกรณ์" }),
    de_serial_number: z.string().min(1).max(120).openapi({ description: "Serial Number" }),
    de_name: z.string().min(1).max(120).openapi({ description: "ชื่ออุปกรณ์" }),
    de_description: z.string().min(1).max(255).openapi({ description: "รายละเอียด" }),
    de_location: z.string().min(1).max(255).openapi({ description: "สถานที่" }),
    de_max_borrow_days: z.coerce.number().int().positive().nullable().optional().openapi({ description: "จำนวนวันยืมสูงสุด" }),
    de_images: z.string().min(1).max(255).openapi({ description: "รูปภาพ" }),
    de_af_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัส Flow" }),
    de_ca_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสหมวดหมู่" }),
    de_us_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสผู้เพิ่ม" }),
    de_sec_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสฝ่าย" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
});

/**
* Description : Schema หมวดหมู่อุปกรณ์
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const categoriesSchema = z.object({
    ca_id: z.coerce.number().openapi({ description: "รหัสหมวดหมู่" }),
    ca_name: z.string().min(1).max(120).openapi({ description: "ชื่อหมวดหมู่" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
});

/**
* Description : Schema อุปกรณ์เสริม
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const accessoriesSchema = z.object({
    acc_id: z.coerce.number().openapi({ description: "รหัสอุปกรณ์เสริม" }),
    acc_name: z.string().min(1).max(120).openapi({ description: "ชื่ออุปกรณ์เสริม" }),
    acc_quantity: z.coerce.number().int().positive().nullable().optional().openapi({ description: "จำนวน" }),
    acc_de_id: z.coerce.number().openapi({ description: "รหัสอุปกรณ์แม่" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
});

/**
* Description : Schema Response รายการ Cart Item
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const cartItemListResponseSchema = z.object({
    itemData: z.array(cartItemSchema).openapi({ description: "รายการในตะกร้า" }),
});

/**
* Description : Schema ข้อมูล Borrow Return Ticket
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const borrowReturnTicketsSchema = z.object({
    brt_id: z.coerce.number().nullable().openapi({ description: "ID ใบคำร้อง" }),
    brt_status: z.enum([
        "PENDING",
        "APPROVED",
        "IN_USE",
        "COMPLETED",
        "REJECTED",
    ]).openapi({ description: "สถานะคำร้อง" }),
    brt_usage_location: z.string().min(1).max(255).openapi({ description: "สถานที่ใช้งาน" }),
    brt_borrow_purpose: z.string().min(1).max(255).openapi({ description: "วัตถุประสงค์" }),
    brt_start_date: z.date().openapi({ description: "วันเริ่มยืม" }),
    brt_end_date: z.date().openapi({ description: "วันคืน" }),
    brt_quantity: z.coerce.number().openapi({ description: "จำนวน" }),
    brt_current_stage: z.coerce.number().nullable().openapi({ description: "ขั้นตอนปัจจุบัน" }),
    brt_reject_reason: z.string().min(1).max(255).nullable().openapi({ description: "เหตุผลที่ปฏิเสธ" }),
    brt_pickup_location: z.string().min(1).max(255).nullable().openapi({ description: "สถานที่รับของ" }),
    brt_pickup_datetime: z.date().nullable().openapi({ description: "เวลารับของ" }),
    brt_return_location: z.string().min(1).max(255).nullable().openapi({ description: "สถานที่คืนของ" }),
    brt_return_datetime: z.date().nullable().openapi({ description: "เวลาคืนของ" }),
    brt_af_id: z.coerce.number().nullable().openapi({ description: "รหัส Flow" }),
    brt_staff_id: z.coerce.number().nullable().openapi({ description: "รหัสเจ้าหน้าที่" }),
    brt_user_id: z.coerce.number().openapi({ description: "รหัสผู้ยืม" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
})

/**
* Description : Schema โครงสร้างข้อมูลขั้นตอนการอนุมัติของ Borrow Return Ticket
* ใช้สำหรับเก็บสถานะและลำดับการอนุมัติในแต่ละขั้นตอน
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const borrowReturnTicketStagesSchema = z.object({
    brts_id: z.coerce.number().nullable().openapi({ description: "ID ขั้นตอนคำร้อง" }),
    brts_name: z.string().min(1).max(255).openapi({ description: "ชื่อขั้นตอน" }),
    brts_step_approve: z.coerce.number().openapi({ description: "ลำดับการอนุมัติ" }),
    brts_role: z.enum([
        "ADMIN",
        "HOD",
        "HOS",
        "TECHNICAL",
        "STAFF",
        "EMPLOYEE",
    ]).openapi({ description: "บทบาท" }),
    brts_dept_id: z.coerce.number().nullable().openapi({ description: "รหัสแผนก" }),
    brts_sec_id: z.coerce.number().nullable().openapi({ description: "รหัสฝ่าย" }),
    brts_dept_name: z.string().min(1).max(255).nullable().openapi({ description: "ชื่อแผนก" }),
    brts_sec_name: z.string().min(1).max(255).nullable().openapi({ description: "ชื่อฝ่าย" }),
    brts_status: z.enum([
        "PENDING",
        "APPROVED",
        "REJECTED",
    ]).openapi({ description: "สถานะการอนุมัติ" }),
    brts_brt_id: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
    brts_us_id: z.coerce.number().nullable().openapi({ description: "รหัสผู้อนุมัติ" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
})

/**
* Description : Schema โครงสร้างข้อมูล Approval Flow
* ใช้กำหนดชุดกระบวนการอนุมัติคำร้องขอยืมอุปกรณ์
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const approvalFlowsSchema = z.object({
    af_id: z.coerce.number().nullable().openapi({ description: "รหัส Flow" }),
    af_name: z.string().min(1).max(255).openapi({ description: "ชื่อ Flow" }),
    af_is_active: z.boolean().nullable().openapi({ description: "สถานะ" }),
    af_us_id: z.coerce.number().openapi({ description: "รหัสผู้สร้าง" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
})

/**
* Description : Schema โครงสร้างข้อมูลขั้นตอนย่อยของ Approval Flow
* ใช้ระบุบทบาทและลำดับการอนุมัติในแต่ละขั้น
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const approvalFlowStepsSchema = z.object({
    afs_id: z.coerce.number().nullable().openapi({ description: "ID ขั้นตอน" }),
    afs_step_approve: z.coerce.number().openapi({ description: "ลำดับ" }),
    afs_af_id: z.coerce.number().openapi({ description: "รหัส Flow" }),
    afs_dept_id: z.coerce.number().nullable().openapi({ description: "รหัสแผนก" }),
    afs_sec_id: z.coerce.number().nullable().openapi({ description: "รหัสฝ่าย" }),
    afs_role: z.enum([
        "ADMIN",
        "HOD",
        "HOS",
        "TECHNICAL",
        "STAFF",
        "EMPLOYEE",
    ]).openapi({ description: "บทบาท" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
})

/**
* Description : Schema Payload สำหรับสร้าง Borrow Ticket
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const createBorrowTicketPayload = z.object({
    cartItemId: z.coerce.number().openapi({ description: "ID รายการในตะกร้า" }),
})

/**
* Description : Schema ความสัมพันธ์ Ticket กับ Device
* Author : Nontapat Sinhum (Guitar) 66160104
*/
export const ticketDevicesSchema = z.object({
    td_id: z.coerce.number().openapi({ description: "ID" }),
    td_brt_id: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
    td_dec_id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
    td_origin_cti_id: z.coerce.number().openapi({ description: "ID รายการตะกร้าต้นทาง" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
})

/**
 * Description: Schema Payload สำหรับสร้าง TicketDevice (ผูก borrowTicketId กับ cartItemId)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const createTicketDevicePayload = z.object({
    cartItemId: z.coerce.number().openapi({ description: "ID รายการในตะกร้า" }),
    borrowTicketId: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
})

/**
 * Description: Schema Payload สำหรับสร้าง BorrowTicketStages
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const createBorrowTicketStagePayload = z.object({
    cartItemId: z.coerce.number().openapi({ description: "ID รายการในตะกร้า" }),
    borrowTicketId: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
})

/**
 * Description: Schema โครงสร้างข้อมูล Device Availabilities (ช่วงเวลาที่อุปกรณ์ถูกจอง/ถูกยืม)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const deviceAvailabilitiesSchema = z.object({
    da_id: z.coerce.number().openapi({ description: "ID Availability" }),
    da_dec_id: z.coerce.number().openapi({ description: "ID อุปกรณ์ลูก" }),
    da_brt_id: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
    da_start: z.date().openapi({ description: "เวลาเริ่มต้น" }),
    da_end: z.date().openapi({ description: "เวลาสิ้นสุด" }),
    da_status: z.enum([
        "ACTIVE",
        "COMPLETED",
    ]).openapi({ description: "สถานะ" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
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
    ).optional().default([]).openapi({ description: "รายการอุปกรณ์ลูกที่ถูกเลือก" }),
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
    cti_us_name: z.string().nullable().optional().openapi({ description: "ชื่อผู้ขอใช้" }),
    cti_phone: z.string().nullable().optional().openapi({ description: "เบอร์โทรศัพท์" }),
    cti_quantity: z.number().int().positive().optional().openapi({ description: "จำนวน" }),
    cti_note: z.string().nullable().optional().openapi({ description: "หมายเหตุ" }),
    cti_usage_location: z.string().nullable().optional().openapi({ description: "สถานที่ใช้งาน" }),
    cti_start_date: z.coerce.date().nullable().optional().openapi({ description: "วันเริ่มยืม" }),
    cti_end_date: z.coerce.date().nullable().optional().openapi({ description: "วันคืน" }),
    device_childs: z.array(z.coerce.number().int().positive()).optional().openapi({ description: "รายการ ID อุปกรณ์ลูกที่เลือก" }),
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
    lbr_id: z.coerce.number().openapi({ description: "ID Log" }),
    lbr_action: z.enum([
        "CREATED",
        "UPDATED",
        "APPROVED",
        "REJECTED",
        "RETURNED",
        "MARK_DAMAGED",
        "MARK_LOST",
    ]).openapi({ description: "การกระทำ" }),
    lbr_old_status: z.string().min(1).max(50).nullable().openapi({ description: "สถานะเดิม" }),
    lbr_new_status: z.string().min(1).max(50).nullable().openapi({ description: "สถานะใหม่" }),
    lbr_note: z.string().min(1).max(255).nullable().openapi({ description: "หมายเหตุ" }),
    lbr_actor_id: z.coerce.number().openapi({ description: "รหัสผู้กระทำ" }),
    lbr_brt_id: z.coerce.number().openapi({ description: "ID ใบคำร้อง" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
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

