import { z } from "zod";
import { $Enums } from "@prisma/client";
import { UserRole } from "../../core/roles.enum.js";
import { sectionSchema, departmentSchema } from "../accounts/accounts.schema.js";
export const idParamSchema = z.object({
    id: z.coerce.number().positive()
});
const createAccessoriesPayload = z.object({
    acc_name: z.string().min(1).max(100),
    acc_quantity: z.coerce.number().int().nonnegative(),
});

const createAccessoriesSchema = z.object({
    acc_id:z.number(),
    acc_name: z.string().min(1).max(100),
    acc_quantity: z.coerce.number().int().nonnegative(),
    acc_de_id:z.number()
});

const createApprovalFlowsPayload = z.object({
    af_name: z.string().min(1).max(100),
    af_is_active: z.boolean().default(true),
    af_us_id: z.coerce.number().int().positive(),

});

const createApprovalFlowsStepPayload = z.object({
    afs_step_approve: z.coerce.number().int().positive(),
    afs_dept_id: z.coerce.number().int().positive(),
    afs_sec_id: z.coerce.number().int().positive().nullable().optional(),
    afs_role: z.enum(Object.values(UserRole) as [string, ...string[]]),
});

export const createDevicePayload = z.object({
    de_serial_number: z.string().min(1).max(100),
    de_name: z.string().min(1).max(200),
    de_description: z.string().max(200).nullable().optional(),
    de_location: z.string().min(1).max(200),
    de_max_borrow_days: z.coerce.number().int().positive(),
    de_images: z.string().nullable().optional(),
    de_ca_id: z.coerce.number().int().positive(),
    de_us_id: z.coerce.number().int().positive(),
    de_sec_id: z.coerce.number().int().positive().nullable().optional(),
    accessories: z.preprocess((val) => {
        if (!val) return undefined;
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            } catch {
                return undefined;
            }
        }
        return val;
    }, z.array(createAccessoriesPayload).optional()),
    approvalflowspayload: createApprovalFlowsPayload,

    approvalflowssteppayload: z.preprocess((val) => {
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            } catch {
                return val;
            }
        }
        return val;
    }, z.array(createApprovalFlowsStepPayload).min(1))

});

export const approvalFlowResponseSchema = z.object({
    af_id: z.number(),
    af_name: z.string(),
    af_is_active: z.boolean(),
    af_us_id: z.number(),
});

export const approvalFlowStepResponseSchema = z.object({
    afs_id: z.number(),
    afs_step_approve: z.number(),
    afs_dept_id: z.number(),
    afs_sec_id: z.number().nullable(),
    afs_role: z.enum(Object.values(UserRole) as [string, ...string[]]),
    afs_af_id: z.number(),
});

export const createDeviceResponseSchema = z.object({
    de_id: z.number(),
    de_serial_number: z.string(),
    de_name: z.string(),
    de_description: z.string().nullable(),
    de_location: z.string(),
    de_max_borrow_days: z.number(),
    de_images: z.string().nullable(),
    de_af_id: z.number(),
    de_ca_id: z.number(),
    de_us_id: z.number(),
    de_sec_id: z.number().nullable(),
    de_acc_id: z.number().nullable(),
    accessories:z.array(createAccessoriesSchema),
    approvalflow: approvalFlowResponseSchema,
    approvalflowsteps: z.array(approvalFlowStepResponseSchema),
});

export const categoriesSchema = z.object({
    ca_id: z.number(),
    ca_name: z.string()
});

export const getDeviceWithSchema = z.object({
    sections: z.array(sectionSchema),
    departments: z.array(departmentSchema),
    categories: z.array(categoriesSchema)
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

export type GetDeviceWithSchema = z.infer<typeof getDeviceWithSchema>;

export type CreateDevicePayload = z.infer<typeof createDevicePayload>;

export type CreateDeviceResponseSchema = z.infer<typeof createDeviceResponseSchema>;

export type CreateDeviceChildPayload = z.infer<typeof createDeviceChildPayload>;

export type CreateDeviceChildSchema = z.infer<typeof createDeviceChildSchema>;

export type UploadFileDeviceChildPayload = z.infer<typeof uploadFileDeviceChildPayload>;

export type UploadFileDeviceChildSchema = z.infer<typeof uploadFileDeviceChildSchema>;

export type DeleteDeviceChildPayload = z.infer<typeof deleteDeviceChildPayload>;