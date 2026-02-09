import { z } from "zod";
import { $Enums } from "@prisma/client";
import { UserRole } from "../../core/roles.enum.js";

export const idParamSchema = z.object({
  id: z.coerce.number().positive().openapi({ description: "ID ของรายการ" }),
});
const createAccessoriesPayload = z.object({
  acc_id: z.coerce.number().int().openapi({ description: "รหัสอุปกรณ์เสริม" }),
  acc_name: z.string().min(1).max(100).openapi({ description: "ชื่ออุปกรณ์เสริม" }),
  acc_quantity: z.coerce.number().int().nonnegative().openapi({ description: "จำนวน" }),
});

const createAccessoriesSchema = z.object({
  acc_id: z.number().openapi({ description: "รหัสอุปกรณ์เสริม" }),
  acc_name: z.string().min(1).max(100).openapi({ description: "ชื่ออุปกรณ์เสริม" }),
  acc_quantity: z.coerce.number().int().nonnegative().openapi({ description: "จำนวน" }),
  acc_de_id: z.number().openapi({ description: "รหัสอุปกรณ์หลัก" }),
});

const createApprovalFlowsStepPayload = z.object({
  afs_step_approve: z.coerce.number().int().positive().openapi({ description: "ลำดับการอนุมัติ" }),
  afs_dept_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสแผนก" }),
  afs_sec_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสฝ่าย" }),
  afs_role: z.enum(Object.values(UserRole) as [string, ...string[]]).openapi({ description: "บทบาทผู้อนุมัติ" }),
});

export const createApprovalFlowsPayload = z.object({
  af_name: z.string().min(1).max(100).openapi({ description: "ชื่อ Flow การอนุมัติ" }),
  af_us_id: z.coerce.number().int().positive().openapi({ description: "รหัสผู้สร้าง" }),
  approvalflowsstep: z.preprocess((val) => {
    if (typeof val === "string") {
      return JSON.parse(val);
    }
    return val;
  }, z.array(createApprovalFlowsStepPayload).min(1).openapi({ description: "ขั้นตอนการอนุมัติ" })),
});

export const serialNumbersPayload = z.object({
  id: z.coerce.number().int().positive().openapi({ description: "ID" }),
  value: z.string().openapi({ description: "Serial Number" }),
});

export const createDevicePayload = z.object({
  de_serial_number: z.string().min(1).max(100).openapi({ description: "หมายเลขซีเรียล" }),
  de_name: z.string().min(1).max(200).openapi({ description: "ชื่ออุปกรณ์" }),
  de_description: z.string().max(200).nullable().optional().openapi({ description: "รายละเอียด" }),
  de_location: z.string().min(1).max(200).openapi({ description: "สถานที่เก็บ" }),
  de_max_borrow_days: z.coerce.number().int().positive().openapi({ description: "จำนวนวันที่ยืมได้สูงสุด" }),
  totalQuantity: z.coerce.number().int().positive().openapi({ description: "จำนวนทั้งหมด" }),
  de_images: z.string().nullable().optional().openapi({ description: "รูปภาพ" }),
  de_af_id: z.coerce.number().int().positive().openapi({ description: "รหัส Flow การอนุมัติ" }),
  de_ca_id: z.coerce.number().int().positive().openapi({ description: "รหัสหมวดหมู่" }),
  de_us_id: z.coerce.number().int().positive().openapi({ description: "รหัสผู้เพิ่ม" }),
  de_sec_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสฝ่ายเจ้าของ" }),
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
  }, z.array(createAccessoriesPayload).optional().openapi({ description: "รายการอุปกรณ์เสริม" })),
  serialNumbers: z.preprocess((val) => {
    if (!val) return undefined;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return undefined;
      }
    }
    return val;
  }, z.array(serialNumbersPayload).optional().openapi({ description: "รายการ Serial Number" })),
});

export const approvalStepUserSchema = z.object({
  us_id: z.number().openapi({ description: "รหัสผู้ใช้" }),
  fullname: z.string().openapi({ description: "ชื่อ-นามสกุล" }),
});

export const getApprovalFlowStepResponseSchema = z.object({
  afs_id: z.number().openapi({ description: "ID ขั้นตอน" }),
  afs_step_approve: z.number().openapi({ description: "ลำดับการอนุมัติ" }),
  afs_dept_id: z.number().openapi({ description: "รหัสแผนก" }),
  afs_sec_id: z.number().nullable().openapi({ description: "รหัสฝ่าย" }),
  afs_role: z.enum(Object.values(UserRole) as [string, ...string[]]).openapi({ description: "บทบาท" }),
  afs_af_id: z.number().openapi({ description: "รหัส Flow" }),
  afs_name: z.string().nullable().openapi({ description: "ชื่อขั้นตอน" }),
  users: z.array(approvalStepUserSchema).openapi({ description: "รายชื่อผู้อนุมัติในขั้นตอนนี้" }),
});

export const getApprovalFlowOnlySchema = z.object({
  af_id: z.number().openapi({ description: "รหัส Flow" }),
  af_name: z.string().openapi({ description: "ชื่อ Flow" }),
  af_us_id: z.number().openapi({ description: "รหัสผู้สร้าง" }),
  af_is_active: z.boolean().openapi({ description: "สถานะการใช้งาน" }),
});

// Schema สำหรับ getAllApproves - staff users (ใช้ us_name แทน fullname)
export const staffUserSchema = z.object({
  us_id: z.number().openapi({ description: "รหัสผู้ใช้" }),
  us_name: z.string().openapi({ description: "ชื่อผู้ใช้" }),
});

export const getStaffSchema = z.object({
  st_sec_id: z.number().openapi({ description: "รหัสฝ่าย" }),
  st_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
  st_dept_id: z.number().openapi({ description: "รหัสแผนก" }),
  users: z.array(staffUserSchema).openapi({ description: "รายชื่อเจ้าหน้าที่" }),
});

// สำหรับตรวจสอบข้อมูลแผนก (with users for approval flows)
export const departmentWithUsersSchema = z.object({
  dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
  dept_name: z.string().openapi({ description: "ชื่อแผนก" }),
  users: z.array(approvalStepUserSchema).openapi({ description: "รายชื่อผู้อนุมัติ" }),
});

// สำหรับตรวจสอบข้อมูลแผนก (without users for device listing)
export const departmentSchema = z.object({
  dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
  dept_name: z.string().openapi({ description: "ชื่อแผนก" }),
});

// สำหรับตรวจสอบข้อมูลฝ่ายย่อย (with users for approval flows)
export const sectionWithUsersSchema = z.object({
  sec_id: z.coerce.number().openapi({ description: "รหัสฝ่าย" }),
  sec_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
  sec_dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
  users: z.array(approvalStepUserSchema).openapi({ description: "รายชื่อผู้อนุมัติ" }),
});

// สำหรับตรวจสอบข้อมูลฝ่ายย่อย (without users for device listing)
export const sectionSchema = z.object({
  sec_id: z.coerce.number().openapi({ description: "รหัสฝ่าย" }),
  sec_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
  sec_dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
});

// สำหรับ getAllApproves response - departments with us_name
export const departmentWithStaffUsersSchema = z.object({
  dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
  dept_name: z.string().openapi({ description: "ชื่อแผนก" }),
  users: z.array(staffUserSchema).openapi({ description: "รายชื่อเจ้าหน้าที่" }),
});

// สำหรับ getAllApproves response - sections with us_name  
export const sectionWithStaffUsersSchema = z.object({
  sec_id: z.coerce.number().openapi({ description: "รหัสฝ่าย" }),
  sec_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
  sec_dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
  users: z.array(staffUserSchema).openapi({ description: "รายชื่อเจ้าหน้าที่" }),
});

// Schema สำหรับ getAllApproves response
export const getApprovalFlowSchema = z.object({
  sections: z.array(sectionWithStaffUsersSchema).openapi({ description: "รายชื่อฝ่ายและเจ้าหน้าที่" }),
  departments: z.array(departmentWithStaffUsersSchema).openapi({ description: "รายชื่อแผนกและเจ้าหน้าที่" }),
  staff: z.array(getStaffSchema).openapi({ description: "ข้อมูลเจ้าหน้าที่ทั้งหมด" }),
});

export const createapprovalFlowStepResponseSchema = z.object({
  afs_id: z.number().openapi({ description: "ID ขั้นตอน" }),
  afs_step_approve: z.number().openapi({ description: "ลำดับ" }),
  afs_dept_id: z.number().openapi({ description: "รหัสแผนก" }),
  afs_sec_id: z.number().nullable().openapi({ description: "รหัสฝ่าย" }),
  afs_role: z.enum(Object.values(UserRole) as [string, ...string[]]).openapi({ description: "บทบาท" }),
  afs_af_id: z.number().openapi({ description: "รหัส Flow" }),
});

// Schema สำหรับ createApprovalFlows response
export const createApprovalFlowsResponseSchema = z.object({
  approvalflow: z.object({
    af_id: z.number().openapi({ description: "รหัส Flow" }),
    af_name: z.string().openapi({ description: "ชื่อ Flow" }),
    af_is_active: z.boolean().openapi({ description: "สถานะ" }),
    af_us_id: z.number().openapi({ description: "รหัสผู้สร้าง" }),
    deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
    created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
    updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
  }),
  steps: z.object({
    count: z.number().openapi({ description: "จำนวนขั้นตอน" }),
  }),
});

export const serialNumbersSchma = z.object({
  dec_id: z.number().openapi({ description: "รหัสอุปกรณ์ลูก" }),
  dec_serial_number: z.string().nullable().openapi({ description: "Serial Number" }),
  dec_asset_code: z.string().nullable().openapi({ description: "Asset Code" }),
  dec_status: z.nativeEnum($Enums.DEVICE_CHILD_STATUS).openapi({ description: "สถานะ" }),
  dec_has_serial_number: z.boolean().openapi({ description: "มี Serial Number หรือไม่" }),
  dec_de_id: z.number().openapi({ description: "รหัสอุปกรณ์แม่" }),
});

// Schema สำหรับ createDevice response
export const createDeviceResponseSchema = z.object({
  de_id: z.number().openapi({ description: "รหัสอุปกรณ์" }),
  de_serial_number: z.string().openapi({ description: "Serial Number" }),
  de_name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
  de_description: z.string().nullable().openapi({ description: "รายละเอียด" }),
  de_location: z.string().openapi({ description: "สถานที่" }),
  de_max_borrow_days: z.number().openapi({ description: "จำนวนวันที่ยืมได้" }),
  de_images: z.string().nullable().openapi({ description: "รูปภาพ" }),
  de_af_id: z.number().openapi({ description: "รหัส Flow" }),
  de_ca_id: z.number().openapi({ description: "รหัสหมวดหมู่" }),
  de_us_id: z.number().openapi({ description: "รหัสผู้เพิ่ม" }),
  de_sec_id: z.number().openapi({ description: "รหัสฝ่าย" }),
  deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
  created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
  updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
  accessories: z.array(createAccessoriesPayload).optional().openapi({ description: "รายการอุปกรณ์เสริม" }),
});

export const categoriesSchema = z.object({
  ca_id: z.number().openapi({ description: "รหัสหมวดหมู่" }),
  ca_name: z.string().openapi({ description: "ชื่อหมวดหมู่" }),
});

export const approvalFlowWithStepsSchema = z.object({
  af_id: z.number().openapi({ description: "รหัส Flow" }),
  steps: z.array(getApprovalFlowStepResponseSchema).openapi({ description: "รายการขั้นตอน" }),
});

export const getDeviceWithSchema = z.object({
  sections: z.array(sectionSchema).openapi({ description: "รายชื่อฝ่าย" }),
  departments: z.array(departmentSchema).openapi({ description: "รายชื่อแผนก" }),
  categories: z.array(categoriesSchema).openapi({ description: "รายชื่อหมวดหมู่" }),
  approval_flows: z.array(getApprovalFlowOnlySchema).openapi({ description: "รายชื่อ Flow (ย่อ)" }),
  approval_flow_step: z.array(approvalFlowWithStepsSchema).openapi({ description: "รายชื่อ Flow พร้อมขั้นตอน" }),
});

// Schema สำหรับอุปกรณ์ลูก (device child) ใน getDeviceWithChilds
export const deviceChildResponseSchema = z.object({
  dec_id: z.number().openapi({ description: "รหัสอุปกรณ์ลูก" }),
  dec_serial_number: z.string().nullable().openapi({ description: "Serial Number" }),
  dec_asset_code: z.string().openapi({ description: "Asset Code" }),
  dec_status: z.nativeEnum($Enums.DEVICE_CHILD_STATUS).openapi({ description: "สถานะ" }),
  dec_has_serial_number: z.boolean().openapi({ description: "มี Serial Number" }),
  dec_de_id: z.number().openapi({ description: "รหัสอุปกรณ์แม่" }),
});

// Schema สำหรับ category ใน getDeviceWithChilds
export const categoryResponseSchema = z.object({
  ca_id: z.number().openapi({ description: "รหัสหมวดหมู่" }),
  ca_name: z.string().openapi({ description: "ชื่อหมวดหมู่" }),
});

// Schema สำหรับ department ใน section
export const departmentResponseSchema = z.object({
  dept_id: z.number().openapi({ description: "รหัสแผนก" }),
  dept_name: z.string().openapi({ description: "ชื่อแผนก" }),
});

// Schema สำหรับ section ใน getDeviceWithChilds
export const sectionResponseSchema = z.object({
  sec_id: z.number().openapi({ description: "รหัสฝ่าย" }),
  sec_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
  department: departmentResponseSchema.optional().openapi({ description: "ข้อมูลแผนก" }),
});

// Schema สำหรับ accessory ใน getDeviceWithChilds
export const accessoryResponseSchema = z.object({
  acc_id: z.number().openapi({ description: "รหัสอุปกรณ์เสริม" }),
  acc_name: z.string().openapi({ description: "ชื่ออุปกรณ์เสริม" }),
  acc_quantity: z.number().openapi({ description: "จำนวน" }),
});

// Schema สำหรับ approval flow step
export const approvalFlowStepResponseSchema = z.object({
  afs_id: z.number().openapi({ description: "รหัสขั้นตอน" }),
  afs_step_approve: z.number().openapi({ description: "ลำดับการอนุมัติ" }),
  afs_role: z.nativeEnum($Enums.US_ROLE).openapi({ description: "บทบาท" }),
  afs_dept_id: z.number().nullable().openapi({ description: "รหัสแผนก" }),
  afs_sec_id: z.number().nullable().openapi({ description: "รหัสฝ่าย" }),
});

// Schema สำหรับ approval flow ใน getDeviceWithChilds
export const approvalFlowResponseSchema = z.object({
  af_id: z.number().openapi({ description: "รหัส Flow" }),
  af_name: z.string().openapi({ description: "ชื่อ Flow" }),
  steps: z.array(approvalFlowStepResponseSchema).openapi({ description: "รายการขั้นตอน" }),
});

// Schema หลักสำหรับ getDeviceWithChilds response
export const getDeviceWithChildsSchema = z.object({
  de_id: z.number().openapi({ description: "รหัสอุปกรณ์แม่" }),
  de_serial_number: z.string().openapi({ description: "Serial Number" }),
  de_name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
  de_description: z.string().nullable().openapi({ description: "รายละเอียด" }),
  de_location: z.string().openapi({ description: "สถานที่เก็บ" }),
  de_max_borrow_days: z.number().openapi({ description: "จำนวนวันยืมสูงสุด" }),
  de_images: z.string().nullable().openapi({ description: "รูปภาพ" }),
  de_af_id: z.number().openapi({ description: "รหัส Flow" }),
  de_ca_id: z.number().openapi({ description: "รหัสหมวดหมู่" }),
  de_us_id: z.number().openapi({ description: "รหัสผู้เพิ่ม" }),
  de_sec_id: z.number().openapi({ description: "รหัสฝ่าย" }),
  device_childs: z.array(deviceChildResponseSchema).openapi({ description: "รายการอุปกรณ์ลูก" }),
  category: categoryResponseSchema.optional().openapi({ description: "หมวดหมู่" }),
  section: sectionResponseSchema.optional().openapi({ description: "ฝ่ายเจ้าของ" }),
  accessories: z.array(accessoryResponseSchema).openapi({ description: "อุปกรณ์เสริม" }),
  approval_flow: approvalFlowResponseSchema.optional().openapi({ description: "ข้อมูล Flow การอนุมัติ" }),
  total_quantity: z.number().optional().openapi({ description: "จำนวนทั้งหมด" }),
}).nullable();

// ข้อมูลที่ส่งเข้ามาตอนเพิ่มอุปกรณ์ลูก
export const createDeviceChildPayload = z.array(
  z.object({
    dec_de_id: z.number(),
    dec_serial_number: z.string().nullable(),
    dec_asset_code: z.string(),
    dec_status: z.nativeEnum($Enums.DEVICE_CHILD_STATUS),
  })
);

// ข้อมูลหลังจากทำการเพิ่มอุปกรณ์ลูก
export const createDeviceChildSchema = z.object({
  count: z.number(),
});

// ข้อมูลที่ส่งเข้ามาตอนเพิ่มอุปกรณ์ลูกด้วยไฟล์
export const uploadFileDeviceChildPayload = z.object({
  de_id: z.coerce.number().positive().openapi({ description: "รหัสอุปกรณ์แม่" }),
  filePath: z.string().min(1).openapi({ description: "Path ของไฟล์" }),
});

/** ข้อมูลหลังจาก insert ข้อมูลจากไฟล์ */
export const uploadFileDeviceChildSchema = z.object({
  inserted: z.number().openapi({ description: "จำนวนรายการที่เพิ่มสำเร็จ" }),
});

// ข้อมูลที่ส่งเข้ามาตอนลบอุปกรณ์ลูก
export const deleteDeviceChildPayload = z.object({
  dec_id: z.array(z.number()).openapi({ description: "รายการ ID อุปกรณ์ลูกที่ต้องการลบ" }),
});

// Schema ของอุปกรณ์ย่อย
const deviceChildSchema = z.object({
  dec_id: z.number().openapi({ description: "รหัสอุปกรณ์ลูก" }),
  dec_serial_number: z.string().nullable().openapi({ description: "Serial Number" }),
  dec_status: z
    .enum(["READY", "BORROWED", "REPAIRING", "DAMAGED", "LOST"])
    .nullable().openapi({ description: "สถานะ" }),
});

/**
 * Description: Schema หลักของ Inventory/Device
 * Note: รวมทั้ง Field จาก Database และ Virtual Fields ที่คำนวณเพิ่ม
 * Author: Worrawat Namwat (Wave) 66160372
 */
export const inventorySchema = z.object({
  //Database Fields
  de_id: z.number().openapi({ description: "รหัสอุปกรณ์" }),
  de_serial_number: z.string().nullable().openapi({ description: "Serial Number" }),
  de_name: z.string().nullable().openapi({ description: "ชื่ออุปกรณ์" }),
  de_description: z.string().nullable().openapi({ description: "รายละเอียด" }),
  de_location: z.string().nullable().openapi({ description: "สถานที่เก็บ" }),
  de_max_borrow_days: z.number().nullable().openapi({ description: "จำนวนวันยืมสูงสุด" }),
  de_images: z.string().nullable().openapi({ description: "รูปภาพ" }),

  //Foreign Keys
  de_af_id: z.number().nullable().openapi({ description: "รหัส Flow" }),
  de_ca_id: z.number().nullable().openapi({ description: "รหัสหมวดหมู่" }),
  de_us_id: z.number().nullable().openapi({ description: "รหัสผู้เพิ่ม" }),
  de_sec_id: z.number().nullable().openapi({ description: "รหัสฝ่าย" }),

  //Virtual Fields (ข้อมูลที่ได้จากการ Join หรือคำนวณ Logic)
  category_name: z.string().optional().default("-").openapi({ description: "ชื่อหมวดหมู่" }),
  sub_section_name: z.string().optional().default("-").openapi({ description: "ชื่อฝ่าย" }),
  department_name: z.string().optional().default("-").openapi({ description: "ชื่อแผนก" }),
  quantity: z.number().optional().default(0).openapi({ description: "จำนวนคงเหลือ" }), // จำนวนคงเหลือ
  total_quantity: z.number().optional().openapi({ description: "จำนวนทั้งหมด" }), // จำนวนทั้งหมด
  dept_id: z.number().nullable().optional().openapi({ description: "รหัสแผนก" }),
  ca_id: z.number().optional().openapi({ description: "รหัสหมวดหมู่" }),
  sec_id: z.number().optional().openapi({ description: "รหัสฝ่าย" }),
  af_id: z.number().optional().openapi({ description: "รหัส Flow" }),

  //Relations & Computed Status
  device_childs: z.array(deviceChildSchema).optional().openapi({ description: "รายการอุปกรณ์ลูก" }), // รายการอุปกรณ์ย่อย
  status_type: z.string().optional().openapi({ description: "สถานะภาพรวม" }), // สถานะภาพรวม

  //Timestamps
  created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
  updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
  deleted_at: z.date().nullable().openapi({ description: "วันที่ลบ" }),
});
//Schema สำหรับ Response เมื่อทำการ Soft Delete
export const softDeleteResponseSchema = z.object({
  de_id: z.number().int().openapi({ description: "รหัสอุปกรณ์ที่ลบ" }),
  deletedAt: z.date().openapi({ description: "วันที่ลบ" }),
});

/**
 * Description:แก้ไขอุปกรณ์แม่
 * Author: Worrawat Namwat (Wave) 66160372
 */
export const updateDevicePayload = z.object({
  de_serial_number: z.string().min(1).max(100).optional().openapi({ description: "Serial Number" }),
  de_name: z.string().min(1).max(200).optional().openapi({ description: "ชื่ออุปกรณ์" }),
  de_description: z.string().max(200).nullable().optional().openapi({ description: "รายละเอียด" }),
  de_location: z.string().min(1).max(200).optional().openapi({ description: "สถานที่" }),

  de_max_borrow_days: z.coerce.number().int().positive().optional().openapi({ description: "จำนวนวันยืมสูงสุด" }),
  totalQuantity: z.coerce.number().int().positive().optional().openapi({ description: "แก้ไขจำนวนรวม (ถ้าต้องการ)" }),

  de_images: z.string().nullable().optional().openapi({ description: "รูปภาพ" }),

  de_af_id: z.coerce.number().int().positive().optional().openapi({ description: "รหัส Flow" }),
  de_ca_id: z.coerce.number().int().positive().optional().openapi({ description: "รหัสหมวดหมู่" }),
  de_us_id: z.coerce.number().int().positive().optional().openapi({ description: "รหัสผู้แก้ไข" }),
  de_sec_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสฝ่าย" }),

  accessories: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }
      return val;
    },
    z.array(createAccessoriesPayload).optional().openapi({ description: "แก้ไขอุปกรณ์เสริม" })
  ),

  serialNumbers: z.preprocess(
    (val) => {
      if (!val) return undefined;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }
      return val;
    },
    z.array(serialNumbersPayload).optional().openapi({ description: "แก้ไข Serial Number" })
  ),
});

export const getLastAssetCodeResponse = z.object({
  dec_asset_code: z.string()
}).nullable();

export type InventorySchema = z.infer<typeof inventorySchema>;

export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type GetDeviceWithChildsSchema = z.infer<
  typeof getDeviceWithChildsSchema
>;

export type GetDeviceWithSchema = z.infer<typeof getDeviceWithSchema>;

export type GetApprovalFlowSchema = z.infer<typeof getApprovalFlowSchema>;

export type CreateApprovalFlowsPayload = z.infer<
  typeof createApprovalFlowsPayload
>;

export type CreateApprovalFlowResponseSchema = z.infer<
  typeof createApprovalFlowsResponseSchema
>;

// Alias for backward compatibility
export const createApprovalFlowResponseSchema = createApprovalFlowsResponseSchema;

export type CreateDevicePayload = z.infer<typeof createDevicePayload>;

export type CreateDeviceResponseSchema = z.infer<
  typeof createDeviceResponseSchema
>;

export type CreateDeviceChildPayload = z.infer<typeof createDeviceChildPayload>;

export type CreateDeviceChildSchema = z.infer<typeof createDeviceChildSchema>;

export type UploadFileDeviceChildPayload = z.infer<
  typeof uploadFileDeviceChildPayload
>;

export type UploadFileDeviceChildSchema = z.infer<
  typeof uploadFileDeviceChildSchema
>;

export type DeleteDeviceChildPayload = z.infer<typeof deleteDeviceChildPayload>;

export type UpdateDevicePayload = z.infer<typeof updateDevicePayload>;

export type GetLastAssetCodeResponse = z.infer<typeof getLastAssetCodeResponse>;