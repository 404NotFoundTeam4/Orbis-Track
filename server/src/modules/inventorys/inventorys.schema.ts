import { z } from "zod";
import { DevicesStatus } from "../../core/devices.enum.js"

const deviceChildCreate = z.object({
  dec_serial_number: z.string().min(1).max(250).nullable().optional(),
  dec_asset_code: z.string().min(1).max(200).nullable().optional(),
  dec_has_serial_number: z
    .preprocess((v) => {
      if (v === "true" || v === true) return true;
      if (v === "false" || v === false) return false;
      return Boolean(v);
    }, z.boolean())
    .optional(),
  dec_status: z.preprocess((val) => {
  if (!val) return "READY"; 
  if (typeof val === "string") return val.trim().toUpperCase();
  return val;
}, z.enum(Object.values(DevicesStatus) as [string, ...string[]])),
});

export const createDevicePayload = z.object({
  de_serial_number: z.string().min(1).max(100),
  de_name: z.string().min(1).max(200),
  de_description: z.string().max(200).nullable().optional(),
  de_location: z.string().min(1).max(200),
  de_max_borrow_days: z.coerce.number().int().positive(),
  de_images: z.string().nullable().optional(),

  de_af_id: z.coerce.number().int().positive(),
  de_ca_id: z.coerce.number().int().positive(),
  de_us_id: z.coerce.number().int().positive(),
  de_sec_id: z.coerce.number().int().positive().nullable().optional(),
  de_acc_id: z.coerce.number().int().positive().nullable().optional(),

 
  children: z.preprocess((val) => {
    if (!val) return undefined;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return undefined;
      }
    }
    return val;
  }, z.array(deviceChildCreate).optional()),
});

export const createDeviceSchema = z.object({
  de_id: z.coerce.number().int().positive(),
  de_serial_number: z.string().min(1).max(100),
  de_name: z.string().min(1).max(200),
  de_description: z.string().min(1).max(200).nullable(),
  de_location: z.string().min(1).max(200),
  de_max_borrow_days: z.coerce.number().int().positive(),
  de_images: z.string().nullable().optional(),
  de_af_id: z.coerce.number().int().positive(),
  de_ca_id: z.coerce.number().int().positive(),
  de_us_id: z.coerce.number().int().positive(),
  de_sec_id: z.coerce.number().int().positive().nullable().optional(),
  de_acc_id: z.coerce.number().int().positive().nullable().optional(),
  created_at: z.date().nullable(),
});

// export const editDeviceSchema = z.object({
//   us_emp_code: z.string().optional(),
//   us_firstname: z.string().optional(),
//   us_lastname: z.string().optional(),
//   us_username: z.string().optional(),
//   us_email: z.string().email().optional(),
//   us_phone: z.string().optional(),
//   us_images: z.string().optional(),
//   us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
//   us_dept_id: z.coerce.number().optional().nullable(),
//   us_sec_id: z.coerce.number().optional().nullable(),
// });

export const idParamDeviceSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createDeviceChillPLayload = z.object({
  dec_id: z.coerce.number().int().positive(),
  dec_serial_number: z.string().min(1).max(250).optional().nullable(),
  dec_asset_code: z.string().min(1).max(200),
  dec_has_serial_number: z.boolean().default(false),
});

export type CreateDevicePayload = z.infer<typeof createDevicePayload>;
export type CreateDevicesSchema = z.infer<typeof createDeviceSchema>;
export type IdParamDeviceSchema = z.infer<typeof idParamDeviceSchema>;
// export const genCodeEmpSchema = z.object({
//   us_emp_code: z.string(),
// });

// export const genCodeEmpPayload = z.object({
//   role: z.string(),
// });

// // สำหรับตรวจสอบข้อมูลที่ใช้ในการสร้างบัญชีผู้ใช้ใหม่
// export const createAccountsPayload = z.object({
//   us_emp_code: z.string().min(1).max(50).nullable().optional(),
//   us_firstname: z.string().min(1).max(120),
//   us_lastname: z.string().min(1).max(120),
//   us_username: z.string().min(1).max(120),
//   us_password: z.string().min(1).max(255),
//   us_email: z.string().min(1).max(120),
//   us_phone: z.string().min(1).max(20),
//   us_images: z.string().nullable().optional(),
//   us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
//   us_dept_id: z.coerce.number().int().positive().nullable().optional(),
//   us_sec_id: z.coerce.number().int().positive().nullable().optional(),
//   us_is_active: z.boolean().default(true),
// });

// // สำหรับตรวจสอบข้อมูลผู้ใช้หลังจากสร้างบัญชีสำเร็จ
// export const createAccountsSchema = z.object({
//   us_id: z.coerce.number().int().positive(),
//   us_emp_code: z.string().min(1).max(50).nullable().optional(),
//   us_firstname: z.string(),
//   us_lastname: z.string(),
//   us_username: z.string(),
//   us_email: z.string().min(1).max(120),
//   us_phone: z.string().min(1).max(20),
//   us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
//   us_images: z.string().nullable().optional(),
//   us_dept_id: z.coerce.number().int().positive().nullable().optional(),
//   us_sec_id: z.coerce.number().int().positive().nullable().optional(),
//   created_at: z.date().nullable(),
//   updated_at: z.date().nullable(),
// });

// // สำหรับตรวจสอบข้อมูลแผนก
// export const departmentSchema = z.object({
//   dept_id: z.coerce.number(),
//   dept_name: z.string(),
// });

// // สำหรับตรวจสอบข้อมูลฝ่ายย่อย
// export const sectionSchema = z.object({
//   sec_id: z.coerce.number(),
//   sec_name: z.string(),
//   sec_dept_id: z.coerce.number(),
// });

// // สำหรับตรวจสอบข้อมูลผู้ใช้
// export const accountsSchema = z.object({
//   us_id: z.coerce.number(),
//   us_emp_code: z.string().optional().nullable(),
//   us_firstname: z.string(),
//   us_lastname: z.string(),
//   us_username: z.string(),
//   us_email: z.string(),
//   us_phone: z.string(),
//   us_images: z.string().optional().nullable(),
//   us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
//   us_dept_id: z.coerce.number().optional().nullable(),
//   us_sec_id: z.coerce.number().optional().nullable(),
//   us_is_active: z.boolean(),
//   created_at: z.coerce.date().nullable(),
//   us_dept_name: z.string().optional(),
//   us_sec_name: z.string().optional(),
// });

// // สำหรับข้อมูลผลลัพธ์จากการดึงข้อมูลผู้ใช้ทั้งหมดพร้อมแผนกและฝ่ายย่อย
// export const getAllAccountsResponseSchema = z.object({
//   departments: z.array(departmentSchema),
//   sections: z.array(sectionSchema),
//   accountsWithDetails: z.array(accountsSchema),
// });

// // Author: Nontapat Sinthum (Guitar) 66160104
// export const editAccountSchema = z.object({
//   us_emp_code: z.string().optional(),
//   us_firstname: z.string().optional(),
//   us_lastname: z.string().optional(),
//   us_username: z.string().optional(),
//   us_email: z.string().email().optional(),
//   us_phone: z.string().optional(),
//   us_images: z.string().optional(),
//   us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
//   us_dept_id: z.coerce.number().optional().nullable(),
//   us_sec_id: z.coerce.number().optional().nullable(),
// });

// // Author: Chanwit Muangma (Boom) 66160224
// export const softDeleteResponseSchema = z.object({
//   us_id: z.number().int(),
//   deletedAt: z.date(),
// });

// export type EditAccountSchema = z.infer<typeof editAccountSchema>;

// export type GetAllAccountsResponseSchema = z.infer<
//   typeof getAllAccountsResponseSchema
// >;

// export type SoftDeleteResponseSchema = z.infer<typeof softDeleteResponseSchema>;

// export type GenCodeEmpSchema = z.infer<typeof genCodeEmpSchema>;

// export type GenCodeEmpPayload = z.infer<typeof genCodeEmpPayload>;

// export type CreateAccountsPayload = z.infer<typeof createAccountsPayload>;

// export type CreateAccountsSchema = z.infer<typeof createAccountsSchema>;

// export type IdParamDto = z.infer<typeof idParamSchema>;
