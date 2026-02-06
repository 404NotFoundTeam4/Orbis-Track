import { z } from "zod";
import { US_ROLE } from "@prisma/client";

/**
 * Description: Schema สำหรับตรวจสอบข้อมูลที่ใช้ในการแก้ไขโปรไฟล์ผู้ใช้งาน (My Profile)
 * Input     : us_phone?: string, us_images?: binary
 * Output    : Object ที่ผ่านการตรวจสอบแล้ว
 * Author    : Niyada Butchan (Da) 66160361
 */
export const updateMyProfilePayload = z.object({
  us_phone: z.string().min(10).max(15).optional().openapi({ description: "เบอร์โทรศัพท์" }),
  us_images: z.any().openapi({ type: "string", format: "binary", description: "รูปโปรไฟล์" }).optional(),
});

// --- สร้าง Schema ข้อมูล User (ขาออก) ---
const userProfileData = z.object({
  us_id: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }),
  us_firstname: z.string().openapi({ description: "ชื่อจริง" }),
  us_lastname: z.string().openapi({ description: "นามสกุล" }),
  us_email: z.string().openapi({ description: "อีเมล" }),
  us_phone: z.string().nullable().optional().openapi({ description: "เบอร์โทรศัพท์" }),
  us_images: z.string().nullable().optional().openapi({ description: "รูปโปรไฟล์" }),
});

// สำหรับตรวจสอบข้อมูลแผนก
export const departmentSchema = z.object({
  dept_name: z.string().openapi({ description: "ชื่อแผนก" }),
});

// สำหรับตรวจสอบข้อมูลฝ่ายย่อย
export const sectionSchema = z.object({
  sec_name: z.string().openapi({ description: "ชื่อฝ่าย" }),
});

/**
 * Description: Schema สำหรับ Response ข้อมูลโปรไฟล์ผู้ใช้งาน (GET)
 * Author    : Niyada Butchan (Da) 66160361
 */
export const getMyProfileResponseSchema = z.object({
  us_id: z.coerce.number().openapi({ description: "รหัสผู้ใช้" }),
  us_firstname: z.string().openapi({ description: "ชื่อจริง" }),
  us_lastname: z.string().openapi({ description: "นามสกุล" }),
  us_username: z.string().openapi({ description: "ชื่อผู้ใช้งาน" }),
  us_emp_code: z.string().openapi({ description: "รหัสพนักงาน" }),
  us_email: z.string().openapi({ description: "อีเมล" }),
  us_phone: z.string().nullable().optional().openapi({ description: "เบอร์โทรศัพท์" }),
  us_images: z.string().nullable().optional().openapi({ description: "รูปโปรไฟล์" }),
  us_role: z.nativeEnum(US_ROLE).openapi({ description: "บทบาท" }),
  department: departmentSchema.openapi({ description: "ข้อมูลแผนก" }),
  section: sectionSchema.openapi({ description: "ข้อมูลฝ่าย" }),
});

/**
 * Description: Schema สำหรับตรวจสอบข้อมูลที่ใช้ในการเปลี่ยนรหัสผ่านผู้ใช้งาน
 * Author    : Niyada Butchan (Da) 66160361
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "กรุณากรอกรหัสผ่านเดิม").openapi({ description: "รหัสผ่านเดิม" }),
    confirmPassword: z.string().min(1, "กรุณากรอกยืนยันรหัสผ่านใหม่").openapi({ description: "ยืนยันรหัสผ่านใหม่" }),
    newPassword: z
      .string()
      .min(12, "รหัสผ่านต้องมีความยาวอย่างน้อย 12 ตัวอักษร")
      .max(16, "รหัสผ่านต้องมีความยาวไม่เกิน 16 ตัวอักษร")
      .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่กอย่างน้อย 1 ตัว")
      .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว")
      .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว")
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
      )
      .refine((val) => !/\s/.test(val), "ห้ามมีการเว้นวรรค")
      .openapi({ description: "รหัสผ่านใหม่" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

// --- Export Types ---
export type UpdateMyProfilePayload = z.infer<typeof updateMyProfilePayload>;
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
export type GetMyProfileResponseSchema = z.infer<
  typeof getMyProfileResponseSchema
>;
