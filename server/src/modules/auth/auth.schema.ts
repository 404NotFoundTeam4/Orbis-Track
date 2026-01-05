import { z } from "zod";
import { Request } from "express";
import { UserRole } from "../../core/roles.enum.js";

// Author: Pakkapon Chomchoey (Tonnam) 66160080

// ==================== Login Schemas ====================

// login schema ต้องมี username และ passwords (non-empty)
export const loginPayload = z.object({
    username: z.string().min(1).openapi({
        description: "ชื่อผู้ใช้งานสำหรับเข้าสู่ระบบ",
        example: "john.doe"
    }),
    passwords: z.string().min(1).openapi({
        description: "รหัสผ่าน",
        example: "MySecurePassword123!"
    }),
    // รองรับทั้ง boolean และ string จาก form-urlencoded
    isRemember: z.preprocess(
        (val) => val === "true" || val === true,
        z.boolean().default(false)
    ).openapi({
        description: "จดจำการเข้าสู่ระบบ (token จะหมดอายุช้าลง)",
        example: false
    }),
}).strict().openapi("LoginPayload");

// JWT payload schema ข้อมูลผู้ใช้ + iat/exp (Unix seconds)
export const accessTokenPayload = z.object({
    sub: z.coerce.number().int().positive().openapi({ description: "User ID" }), // user_id
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).openapi({ description: "บทบาทของผู้ใช้" }),
    dept: z.coerce.number().int().positive().nullable().openapi({ description: "Department ID" }),
    sec: z.coerce.number().int().positive().nullable().openapi({ description: "Section ID" }),
    iat: z.number().optional().openapi({ description: "Issued At (Unix timestamp)" }),
    exp: z.number().optional().openapi({ description: "Expiration Time (Unix timestamp)" }),
}).strict().openapi("AccessTokenPayload");

// Token DTO หลัง login ส่ง accessToken ตัวเดียว
export const tokenDto = z.object({
    accessToken: z.string().min(1).openapi({
        description: "JWT Access Token สำหรับใช้ใน Authorization header",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }),
}).strict().openapi("TokenDto");

// ==================== User Info Schemas ====================

// User DTO สำหรับข้อมูลผู้ใช้ที่ครบถ้วน (ใช้ใน /me endpoint)
export const meDto = z.object({
    us_id: z.coerce.number().int().positive().openapi({ description: "รหัสผู้ใช้", example: 1 }),
    us_emp_code: z.string().nullable().openapi({ description: "รหัสพนักงาน", example: "EMP001" }),
    us_username: z.string().min(1).openapi({ description: "ชื่อผู้ใช้งาน", example: "john.doe" }),
    us_firstname: z.string().nullable().openapi({ description: "ชื่อจริง", example: "John" }),
    us_lastname: z.string().nullable().openapi({ description: "นามสกุล", example: "Doe" }),
    us_email: z.string().nullable().openapi({ description: "อีเมล", example: "john.doe@example.com" }),
    us_phone: z.string().nullable().openapi({ description: "เบอร์โทรศัพท์", example: "0812345678" }),
    us_role: z.enum(Object.values(UserRole) as [string, ...string[]]).openapi({ description: "บทบาทของผู้ใช้" }),
    us_images: z.string().nullable().openapi({ description: "URL รูปโปรไฟล์" }),
    us_dept_id: z.coerce.number().int().positive().nullable().openapi({ description: "รหัสแผนก" }),
    us_sec_id: z.coerce.number().int().positive().nullable().openapi({ description: "รหัสหน่วยงาน" }),
    us_is_active: z.boolean().openapi({ description: "สถานะใช้งาน", example: true }),
}).strict().openapi("MeDto");

// เพิ่ม user payload จาก token ลงใน Express Request (ใช้ใน auth middleware)
export interface AuthRequest extends Request {
    user?: AccessTokenPayload;
}

// ==================== OTP Schemas ====================

export const sendOtpPayload = z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').openapi({
        description: "อีเมลสำหรับรับรหัส OTP",
        example: "john.doe@example.com"
    }),
}).openapi("SendOtpPayload");

export const verifyOtpPayload = z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').openapi({
        description: "อีเมลที่ใช้ขอ OTP",
        example: "john.doe@example.com"
    }),
    otp: z.string().length(6, 'OTP ต้องมี 6 หลัก').openapi({
        description: "รหัส OTP 6 หลักที่ได้รับทางอีเมล",
        example: "123456"
    }),
}).openapi("VerifyOtpPayload");

export const otpSchema = z.object({
    otp: z.string().length(6, 'OTP ต้องมี 6 หลัก').openapi({ description: "รหัส OTP 6 หลัก" }),
    userId: z.coerce.number().int().positive().openapi({ description: "รหัสผู้ใช้" }),
    attempts: z.coerce.number().int().openapi({ description: "จำนวนครั้งที่พยายาม" }),
}).openapi("OtpSchema");

// ==================== Password Validation ====================

/**
 * Schema: Validation สำหรับรหัสผ่าน (ใช้ร่วมกับ forgot/reset password)
 * Rules : 
 *   - ความยาว 12-16 ตัวอักษร
 *   - ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)
 *   - ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)
 *   - ต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)
 *   - ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (&*()-_=+{};)
 *   - ห้ามมีช่องว่าง (whitespace)
 */
const passwordValidation = z
    .string()
    .min(12, 'อักขระดิบท่า 12 - 16 ตัวอักษร')
    .max(16, 'อักขระดิบท่า 12 - 16 ตัวอักษร')
    .refine((val) => /[A-Z]/.test(val), {
        message: 'อักขระตัวใหญ่อย่างน้อย 1 ตัว'
    })
    .refine((val) => /[a-z]/.test(val), {
        message: 'อักขระตัวเล็กอย่างน้อย 1 ตัว'
    })
    .refine((val) => /\d/.test(val), {
        message: 'เลขอย่างน้อยน้อย 1 ตัว'
    })
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
        message: 'อักขระพิเศษอย่างน้อย 1 ตัว เช่น ! @ # $ % ^ & * ( ) _ - + = { } [ ] ; : " \' < > , . ? / |'
    })
    .refine((val) => !/\s/.test(val), {
        message: 'ห้ามมีการเว้นวรรค'
    })
    .openapi({
        description: "รหัสผ่าน 12-16 ตัวอักษร ต้องมี A-Z, a-z, 0-9 และอักขระพิเศษ",
        example: "MyPassword123!"
    });

// ==================== Forgot/Reset Password Schemas ====================

export const forgotPasswordPayload = z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').openapi({
        description: "อีเมลที่ลงทะเบียนไว้",
        example: "john.doe@example.com"
    }),
    newPassword: passwordValidation.openapi({ description: "รหัสผ่านใหม่" }),
    confirmNewPassword: passwordValidation.openapi({ description: "ยืนยันรหัสผ่านใหม่" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmNewPassword'],
}).openapi("ForgotPasswordPayload");

export const resetPasswordPayload = z.object({
    token: z.string().min(1).openapi({
        description: "Token สำหรับรีเซ็ตรหัสผ่าน (ได้รับจากลิงก์ในอีเมล)",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }),
    newPassword: passwordValidation.openapi({ description: "รหัสผ่านใหม่" }),
    confirmNewPassword: passwordValidation.openapi({ description: "ยืนยันรหัสผ่านใหม่" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmNewPassword'],
}).openapi("ResetPasswordPayload");

// ==================== TypeScript Types ====================
// TS types inferred from zod schemas (ใช้ใน controller/service)

export type TokenDto = z.infer<typeof tokenDto>;
export type LoginPayload = z.infer<typeof loginPayload>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayload>;
export type MeDto = z.infer<typeof meDto>;
export type SendOtpPayload = z.infer<typeof sendOtpPayload>;
export type VerifyOtpPayload = z.infer<typeof verifyOtpPayload>;
export type OtpSchema = z.infer<typeof otpSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordPayload>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordPayload>;
