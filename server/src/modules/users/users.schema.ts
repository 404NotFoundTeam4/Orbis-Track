import { z } from "zod";

/**
 * Description: Schema สำหรับตรวจสอบข้อมูลที่ใช้ในการแก้ไขโปรไฟล์ผู้ใช้งาน (My Profile)
 * Input     : us_phone?: string
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามโครงสร้างของข้อมูลโปรไฟล์ผู้ใช้งาน
 * Author    : Niyada Butchan (Da) 66160361
 */

export const updateMyProfilePayload = z.object({
  us_phone: z.string().min(10).max(15).optional(),
  
});

/**
 * Description: Schema สำหรับตรวจสอบข้อมูลที่ใช้ในการเปลี่ยนรหัสผ่านผู้ใช้งาน
 * Input     : {
 *   oldPassword: string,
 *   newPassword: string,
 *   confirmPassword: string
 * }
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามเงื่อนไขความปลอดภัยของรหัสผ่าน
 * Logic     :
 *   - ตรวจสอบว่ามีการกรอกรหัสผ่านเดิม
 *   - รหัสผ่านใหม่ต้องมีความยาว 12–16 ตัวอักษร
 *   - ต้องประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ
 *   - ห้ามมีช่องว่าง (whitespace)
 *   - ตรวจสอบว่ารหัสผ่านใหม่และยืนยันรหัสผ่านตรงกัน
 *   - ใช้สำหรับ validate ข้อมูลก่อนดำเนินการเปลี่ยนรหัสผ่าน
 * Author    : Niyada Butchan (Da) 66160361
 */

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "กรุณากรอกรหัสผ่านเดิม"),
  confirmPassword: z.string().min(1, "กรุณากรอกยืนยันรหัสผ่านใหม่"),
  newPassword: z
    .string()
    .min(12, "รหัสผ่านต้องมีความยาวอย่างน้อย 12 ตัวอักษร")
    .max(16, "รหัสผ่านต้องมีความยาวไม่เกิน 16 ตัวอักษร")
    .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่กอย่างน้อย 1 ตัว")
    .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว")
    .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว")
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว")
    .refine((val) => !/\s/.test(val), "ห้ามมีการเว้นวรรค"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"], 
});



export type UpdateMyProfilePayload = z.infer<typeof updateMyProfilePayload>;
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;