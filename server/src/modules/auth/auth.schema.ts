import { z } from "zod";
import { Request } from "express";
import { UserRole } from "../../core/roles.enum.js";

// Author: Pakkapon Chomchoey (Tonnam) 66160080

// login schema ต้องมี username และ passwords (non-empty)
export const loginPayload = z.object({
    username: z.string().min(1),
    passwords: z.string().min(1),
    isRemember: z.boolean().default(false),
}).strict();

// JWT payload schema ข้อมูลผู้ใช้ + iat/exp (Unix seconds)
export const accessTokenPayload = z.object({
    sub: z.coerce.number().int().positive(), // user_id
    role: z.enum(Object.values(UserRole) as [string, ...string[]]),
    iat: z.number().optional(),
    exp: z.number().optional(),
}).strict();

// Token DTO หลัง login ส่ง accessToken ตัวเดียว
export const tokenDto = z.object({
    accessToken: z.string().min(1),
}).strict();

// User DTO สำหรับข้อมูลผู้ใช้ที่ครบถ้วน (ใช้ใน /me endpoint)
export const meDto = z.object({
    us_id: z.coerce.number().int().positive(),
    us_emp_code: z.string().nullable(),
    us_username: z.string().min(1),
    us_firstname: z.string().nullable(),
    us_lastname: z.string().nullable(),
    us_email: z.string().nullable(),
    us_phone: z.string().nullable(),
    us_role: z.enum(Object.values(UserRole) as [string, ...string[]]),
    us_images: z.string().nullable(),
    us_pa_id: z.coerce.number().int().positive().nullable(),
    us_dept_id: z.coerce.number().int().positive().nullable(),
    us_sec_id: z.coerce.number().int().positive().nullable(),
    us_is_active: z.boolean(),
}).strict();

// เพิ่ม user payload จาก token ลงใน Express Request (ใช้ใน auth middleware)
export interface AuthRequest extends Request {
    user?: AccessTokenPayload;
}

export const sendOtpPayload = z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
});

export const verifyOtpPayload = z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    otp: z.string().length(6, 'OTP ต้องมี 6 หลัก'),
});

export const otpSchema = z.object({
    otp: z.string().length(6, 'OTP ต้องมี 6 หลัก'),
    userId: z.coerce.number().int().positive(),
    attempts: z.coerce.number().int(),
});

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
    .refine((val) => /[&*()\-_=+{};]/.test(val), {
        message: 'อักขระพิเศษอย่างน้อย 1 ตัว & * ( ) - _ = + { } ;'
    })
    .refine((val) => !/\s/.test(val), {
        message: 'ห้ามมีการเว้นวรรค'
    });

export const forgotPasswordPayload = z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    newPassword: passwordValidation,
    confirmNewPassword: passwordValidation,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmNewPassword'],
});

// TS types inferred from zod schemas (ใช้ใน controller/service)
export type TokenDto = z.infer<typeof tokenDto>;
export type LoginPayload = z.infer<typeof loginPayload>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayload>;
export type MeDto = z.infer<typeof meDto>;
export type SendOtpPayload = z.infer<typeof sendOtpPayload>;
export type VerifyOtpPayload = z.infer<typeof verifyOtpPayload>;
export type OtpSchema = z.infer<typeof otpSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordPayload>;
