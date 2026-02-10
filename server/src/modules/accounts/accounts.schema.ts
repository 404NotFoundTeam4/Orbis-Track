import { z } from "zod";
import { UserRole } from "../../core/roles.enum.js";

// File upload schema สำหรับ Swagger จะแสดง file picker
const fileUploadSchema = z.string().openapi({
  type: "string",
  format: "binary",
  description: "ไฟล์รูปภาพ (jpg, jpeg, png, gif, webp, svg, bmp, ico)",
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({ description: "ID" }),
});

export const genCodeEmpSchema = z.object({
  us_emp_code: z.string().openapi({ description: "รหัสพนักงาน" }),
});

export const genCodeEmpPayload = z.object({
  role: z.string().openapi({ description: "บทบาท" }),
});

// สำหรับตรวจสอบข้อมูลที่ใช้ในการสร้างบัญชีผู้ใช้ใหม่
export const createAccountsPayload = z.object({
  us_emp_code: z.string().min(1).max(50).nullable().optional().openapi({ description: "รหัสพนักงาน" }),
  us_firstname: z.string().min(1).max(120).openapi({ description: "ชื่อ" }),
  us_lastname: z.string().min(1).max(120).openapi({ description: "นามสกุล" }),
  us_username: z.string().min(1).max(120).openapi({ description: "ชื่อผู้ใช้" }),
  us_password: z.string().min(1).max(255).openapi({ description: "รหัสผ่าน" }),
  us_email: z.string().min(1).max(120).openapi({ description: "อีเมล" }),
  us_phone: z.string().min(1).max(20).openapi({ description: "เบอร์โทรศัพท์" }),
  us_images: fileUploadSchema.nullable().optional(),  // ใช้ file upload schema
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional().openapi({ description: "บทบาท" }),
  us_dept_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสแผนก" }),
  us_sec_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสหน่วยงาน" }),
  us_is_active: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return Boolean(val);
  }, z.boolean()).default(true).openapi({ description: "สถานะใช้งาน" }),
}).openapi("CreateAccountsPayload");

// สำหรับตรวจสอบข้อมูลผู้ใช้หลังจากสร้างบัญชีสำเร็จ
export const createAccountsSchema = z.object({
  us_id: z.coerce.number().int().positive().openapi({ description: "รหัสผู้ใช้" }),
  us_emp_code: z.string().min(1).max(50).nullable().optional().openapi({ description: "รหัสพนักงาน" }),
  us_firstname: z.string().openapi({ description: "ชื่อ" }),
  us_lastname: z.string().openapi({ description: "นามสกุล" }),
  us_username: z.string().openapi({ description: "ชื่อผู้ใช้" }),
  us_email: z.string().min(1).max(120).openapi({ description: "อีเมล" }),
  us_phone: z.string().min(1).max(20).openapi({ description: "เบอร์โทรศัพท์" }),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional().openapi({ description: "บทบาท" }),
  us_images: z.string().nullable().optional().openapi({ description: "รูปโปรไฟล์" }),
  us_dept_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสแผนก" }),
  us_sec_id: z.coerce.number().int().positive().nullable().optional().openapi({ description: "รหัสหน่วยงาน" }),
  created_at: z.date().nullable().openapi({ description: "วันที่สร้าง" }),
  updated_at: z.date().nullable().openapi({ description: "วันที่แก้ไข" }),
});

// สำหรับตรวจสอบข้อมูลแผนก
export const departmentSchema = z.object({
  dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
  dept_name: z.string().openapi({ description: "ชื่อแผนก" }),
});

// สำหรับตรวจสอบข้อมูลฝ่ายย่อย
export const sectionSchema = z.object({
  sec_id: z.coerce.number().openapi({ description: "รหัสฝ่าย" }),
  sec_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
  sec_dept_id: z.coerce.number().openapi({ description: "รหัสแผนก" }),
});

// สำหรับตรวจสอบข้อมูลผู้ใช้
export const accountsSchema = z.object({
  us_id: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }),
  us_emp_code: z.string().optional().nullable().openapi({ description: "รหัสพนักงาน" }),
  us_firstname: z.string().openapi({ description: "ชื่อ" }),
  us_lastname: z.string().openapi({ description: "นามสกุล" }),
  us_username: z.string().openapi({ description: "ชื่อผู้ใช้" }),
  us_email: z.string().openapi({ description: "อีเมล" }),
  us_phone: z.string().openapi({ description: "เบอร์โทรศัพท์" }),
  us_images: z.string().optional().nullable().openapi({ description: "รูปโปรไฟล์" }),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional().openapi({ description: "บทบาท" }),
  us_dept_id: z.coerce.number().optional().nullable().openapi({ description: "รหัสแผนก" }),
  us_sec_id: z.coerce.number().optional().nullable().openapi({ description: "รหัสฝ่าย" }),
  us_is_active: z.boolean().openapi({ description: "สถานะการใช้งาน" }),
  created_at: z.coerce.date().nullable().openapi({ description: "วันที่สร้าง" }),
  us_dept_name: z.string().optional().openapi({ description: "ชื่อแผนก" }),
  us_sec_name: z.string().optional().openapi({ description: "ชื่อฝ่าย" }),
});

// สำหรับข้อมูลผลลัพธ์จากการดึงข้อมูลผู้ใช้ทั้งหมดพร้อมแผนกและฝ่ายย่อย
export const getAllAccountsResponseSchema = z.object({
  departments: z.array(departmentSchema).openapi({ description: "รายชื่อแผนก" }),
  sections: z.array(sectionSchema).openapi({ description: "รายชื่อฝ่าย" }),
  accountsWithDetails: z.array(accountsSchema).openapi({ description: "รายชื่อผู้ใช้" }),
});

// Author: Nontapat Sinthum (Guitar) 66160104
export const editAccountSchema = z.object({
  us_emp_code: z.string().optional().openapi({ description: "รหัสพนักงาน" }),
  us_firstname: z.string().optional().openapi({ description: "ชื่อ" }),
  us_lastname: z.string().optional().openapi({ description: "นามสกุล" }),
  us_username: z.string().optional().openapi({ description: "ชื่อผู้ใช้" }),
  us_email: z.string().email().optional().openapi({ description: "อีเมล" }),
  us_phone: z.string().optional().openapi({ description: "เบอร์โทรศัพท์" }),
  us_images: z.string().optional().openapi({ description: "รูปโปรไฟล์" }),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional().openapi({ description: "บทบาท" }),
  us_dept_id: z.coerce.number().optional().nullable().openapi({ description: "รหัสแผนก" }),
  us_sec_id: z.coerce.number().optional().nullable().openapi({ description: "รหัสฝ่าย" }),
});


// Author: Chanwit Muangma (Boom) 66160224
export const softDeleteResponseSchema = z.object({
  us_id: z.number().int().openapi({ description: "รหัสผู้ใช้ที่ลบ" }),
  deletedAt: z.date().openapi({ description: "วันที่ลบ" }),
});

export type EditAccountSchema = z.infer<typeof editAccountSchema>;

export type GetAllAccountsResponseSchema = z.infer<
  typeof getAllAccountsResponseSchema
>;

export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;

export type GenCodeEmpSchema = z.infer<typeof genCodeEmpSchema>;

export type GenCodeEmpPayload = z.infer<typeof genCodeEmpPayload>;

export type CreateAccountsPayload = z.infer<typeof createAccountsPayload>;

export type CreateAccountsSchema = z.infer<typeof createAccountsSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;
