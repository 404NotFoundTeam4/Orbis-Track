import { z } from "zod";
import { UserRole } from "../../core/roles.enum.js";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// สำหรับตรวจสอบข้อมูลที่ใช้ในการสร้างบัญชีผู้ใช้ใหม่
export const createAccountsPayload = z.object({
  us_emp_code: z.string().min(1).max(50).nullable().optional(),
  us_firstname: z.string().min(1).max(120),
  us_lastname: z.string().min(1).max(120),
  us_username: z.string().min(1).max(120),
  us_password: z.string().min(1).max(255),
  us_email: z.string().min(1).max(120),
  us_phone: z.string().min(1).max(20),
  us_images: z.string().nullable().optional(),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  us_dept_id: z.coerce.number().int().positive().nullable().optional(),
  us_sec_id: z.coerce.number().int().positive().nullable().optional(),
  us_is_active: z.boolean().default(true),
});

// สำหรับตรวจสอบข้อมูลผู้ใช้หลังจากสร้างบัญชีสำเร็จ
export const createAccountsSchema = z.object({
  us_id: z.coerce.number().int().positive(),
  us_emp_code: z.string().min(1).max(50).nullable().optional(),
  us_firstname: z.string(),
  us_lastname: z.string(),
  us_username: z.string(),
  us_email: z.string().min(1).max(120),
  us_phone: z.string().min(1).max(20),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  us_images: z.string().nullable().optional(),
  us_dept_id: z.coerce.number().int().positive().nullable().optional(),
  us_sec_id: z.coerce.number().int().positive().nullable().optional(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

// สำหรับตรวจสอบข้อมูลแผนก
export const departmentSchema = z.object({
  dept_id: z.coerce.number(),
  dept_name: z.string(),
});

// สำหรับตรวจสอบข้อมูลฝ่ายย่อย
export const sectionSchema = z.object({
  sec_id: z.coerce.number(),
  sec_name: z.string(),
  sec_dept_id: z.coerce.number(),
});

// สำหรับตรวจสอบข้อมูลผู้ใช้
export const accountsSchema = z.object({
  us_id: z.coerce.number(),
  us_emp_code: z.string().optional().nullable(),
  us_firstname: z.string(),
  us_lastname: z.string(),
  us_username: z.string(),
  us_email: z.string(),
  us_phone: z.string(),
  us_images: z.string().optional().nullable(),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  us_dept_id: z.coerce.number().optional().nullable(),
  us_sec_id: z.coerce.number().optional().nullable(),
  us_is_active: z.boolean(),
  created_at: z.coerce.date().nullable(),
  us_dept_name: z.string().optional(),
  us_sec_name: z.string().optional(),
});

// สำหรับข้อมูลผลลัพธ์จากการดึงข้อมูลผู้ใช้ทั้งหมดพร้อมแผนกและฝ่ายย่อย
export const getAllAccountsResponseSchema = z.object({
  departments: z.array(departmentSchema),
  sections: z.array(sectionSchema),
  accountsWithDetails: z.array(accountsSchema),
});

// Author: Nontapat Sinthum (Guitar) 66160104
export const editAccountSchema = z.object({
  us_emp_code: z.string().optional(),
  us_firstname: z.string().optional(),
  us_lastname: z.string().optional(),
  us_username: z.string().optional(),
  us_email: z.string().email().optional(),
  us_phone: z.string().optional(),
  us_images: z.string().optional(),
  us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  us_dept_id: z.coerce.number().optional().nullable(),
  us_sec_id: z.coerce.number().optional().nullable(),
});

export const SoftDeleteAccountSchema = z.object({
  Param: idParamSchema
});

export const softDeleteResponseSchema = z.object({
  us_id: z.number().int(),
  deletedAt: z.date(),
});

export type EditAccountSchema = z.infer<typeof editAccountSchema>;

export type GetAllAccountsResponseSchema = z.infer<
  typeof getAllAccountsResponseSchema
>;

export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;

export type SoftDeleteParams = z.infer<typeof idParamSchema>;

export type CreateAccountsPayload = z.infer<typeof createAccountsPayload>;

export type CreateAccountsSchema = z.infer<typeof createAccountsSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;
