import { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { HttpError, ValidationError } from '../../errors/errors.js';
import { prisma } from '../../infrastructure/database/client.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import type { AccessTokenPayload, LoginPayload, SendOtpPayload, VerifyOtpPayload, ForgotPasswordPayload, ResetPasswordPayload } from './auth.schema.js';
import { HttpStatus } from '../../core/http-status.enum.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { otpSchema } from './auth.schema.js';
import { blacklistToken } from './token-blacklist.service.js';
import { OtpUtil } from '../../utils/otp.js';
import emailService from '../../utils/email/email.service.js';
import redisUtils from "../../infrastructure/redis.cjs";
import { logger } from '../../infrastructure/logger.js';

const { setJSON, getJSON, redisDel, redisTTL, redisGet } = redisUtils;

/**
 * Description: ตรวจ login จาก DB แล้วออก JWT
 * Input : LoginPayload { username, passwords }
 * Output : string (access token)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
async function checkLogin(payload: LoginPayload) {
    // quick guard: ช่องว่าง/ไม่กรอกมา
    const { username, passwords, isRemember } = payload;
    if (!username || !passwords) {
        throw new ValidationError("Missing required fields: username, passwords");
    }

    // หา user แบบเลือกเฉพาะฟิลด์ที่ต้องใช้
    const result = await prisma.users.findUnique({
        where: { us_username: username },
        select: {
            us_id: true,
            us_password: true,
            us_role: true,
            us_is_active: true,
        },
    });

    if (!result?.us_is_active) {
        throw new ValidationError("Invalid username or password");
    }

    // verify รหัสผ่านกับ hash ใน DB
    const isPasswordCorrect = await verifyPassword(result.us_password, passwords)
    if (!isPasswordCorrect) {
        throw new ValidationError("Invalid password");
    }

    // ออก token พร้อม payload ที่ต้องใช้ต่อฝั่ง server
    const exp = isRemember ? "30d" : env.JWT_EXPIRES_IN as SignOptions["expiresIn"];
    const token = signToken({
        sub: result.us_id,
        role: result.us_role,
    }, exp);

    return token;
}

/**
 * Description: logout แบบใส่ token ลง blacklist ตามเวลาเหลือ (TTL)
 * Input : token: string
 * Output : void
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
async function logout(token: string) {
    try {
        // แกะ exp จาก token เพื่อคำนวณ TTL
        const { exp } = verifyToken(token);
        if (typeof exp !== "number") return;

        const ttl = exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
            await blacklistToken(token, ttl);
        }
    } catch {
        // ถ้า token invalid ก็ไม่ต้องทำอะไร
    }
}

/**
 * Description: ดึงข้อมูลผู้ใช้ปัจจุบันจาก database ตาม user ID ใน token
 * Input : AccessTokenPayload { sub (user_id), role }
 * Output : meDto (ข้อมูลผู้ใช้ครบถ้วนจาก database)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
async function fetchMe(user: AccessTokenPayload) {
    // ตรวจสอบว่ามี user data ใน token หรือไม่
    if (!user) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    // ค้นหาข้อมูลผู้ใช้จาก database โดยใช้ user ID จาก token
    const result = await prisma.users.findUnique({
        where: { us_id: user.sub },
        select: {
            us_id: true,
            us_emp_code: true,
            us_username: true,
            us_firstname: true,
            us_lastname: true,
            us_email: true,
            us_phone: true,
            us_role: true,
            us_images: true,
            us_pa_id: true,
            us_dept_id: true,
            us_sec_id: true,
            us_is_active: true,
        },
    });

    // ตรวจสอบว่าพบข้อมูลผู้ใช้หรือไม่
    if (!result) {
        throw new HttpError(HttpStatus.NOT_FOUND, 'User not found');
    }

    return result;
}

async function sendOtp(payload: SendOtpPayload) {
    const { email } = payload;
    // หา user จากอีเมล
    const user = await prisma.users.findUnique({
        where: { us_email: email },
        select: { us_id: true, us_email: true },
    });

    // ไม่บอกว่าไม่เจออีเมล (เพื่อความปลอดภัย)
    if (!user) {
        return {
            message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งรหัส OTP ไปให้',
        };
    }

    // สร้าง OTP
    const otp = OtpUtil.generateOtp();

    // เก็บ OTP ใน Redis (TTL 5 นาที)
    const redisKey = `otp:send-otp:${email}`;
    await setJSON(
        redisKey,
        {
            otp,
            userId: user?.us_id,
            attempts: 0,
        },
        900 // 5 minutes
    );

    // ส่ง OTP ทางอีเมล
    await emailService.sendOtp(email, otp);

    logger.info(`📧 OTP sent to ${email}: ${otp}`);

    return {
        message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งรหัส OTP ไปให้',
    };
}

async function verifyOtp(payload: VerifyOtpPayload) {
    const { email, otp } = payload;

    const redisKey = `otp:send-otp:${email}`;
    const otpData = await getJSON(redisKey);

    // ไม่มี OTP หรือหมดอายุ
    if (!otpData) {
        return {
            success: false,
            message: 'รหัส OTP หมดอายุหรือไม่ถูกต้อง',
        };
    }

    const otpDataSchema = otpSchema.parse(otpData);

    // เช็คจำนวนครั้งที่พยายาม
    if (otpDataSchema.attempts >= 5) {
        await redisDel(redisKey);
        return {
            success: false,
            message: 'คุณใส่รหัส OTP ผิดเกิน 5 ครั้ง กรุณาขอรหัสใหม่',
        };
    }

    // ตรวจสอบ OTP
    const isValid = OtpUtil.verifyOtp(otp, otpDataSchema.otp);

    if (!isValid) {
        // เพิ่มจำนวนครั้งที่พยายาม
        otpDataSchema.attempts += 1;

        // เก็บ TTL เดิมไว้
        const ttl = await redisTTL(redisKey);
        await setJSON(redisKey, otpDataSchema, ttl);
        return {
            success: false,
            message: `รหัส OTP ไม่ถูกต้อง (เหลือ ${5 - otpDataSchema.attempts} ครั้ง)`,
        };
    }

    return {
        success: true,
        message: 'ยืนยัน OTP สำเร็จ',
    };
}

async function forgotPassword(payload: ForgotPasswordPayload) {
    const { email, newPassword, confirmNewPassword } = payload;
    if (newPassword !== confirmNewPassword) {
        throw new ValidationError("Passwords do not match");
    }

    const redisKey = `otp:send-otp:${email}`

    const result = await prisma.users.update({
        where: { us_email: email, us_is_active: true },
        data: { us_password: await hashPassword(newPassword), updated_at: new Date() },
        select: { us_email: true, us_username: true, us_firstname: true },
    })

    await redisDel(redisKey);

    if (result.us_username && result.us_email && result.us_firstname) {
        await emailService.sendPasswordChanged(
            result.us_email,
            {
                name: result.us_firstname,
                username: result.us_username,
            }
        );
    }

    return {
        message: 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้',
    };
}

async function resetPassword(payload: ResetPasswordPayload) {
  const { token, newPassword, confirmNewPassword } = payload;
  if (newPassword !== confirmNewPassword) {
      throw new ValidationError("Passwords do not match");
  }
  const redisKey = `welcome-token:${token}`;
  const userId = await redisGet(redisKey);
  
  // ถ้าไม่เจอ Key ใน Redis แสดงว่า Token ผิด หรือหมดอายุไปแล้ว
  if (!userId) {
    throw new HttpError(HttpStatus.UNAUTHORIZED, "Token ไม่ถูกต้องหรือหมดอายุแล้ว");
  }
  
  const newPasswordHash = await hashPassword(newPassword);
  const result = await prisma.users.update({
    where: { us_id: Number(userId) },
    data: { us_password: newPasswordHash, updated_at: new Date() },
    select: { us_email: true, us_username: true, us_firstname: true },
  });
      
  await redisDel(redisKey);
      
  if (result.us_username && result.us_email && result.us_firstname) {
    await emailService.sendPasswordChanged(
      result.us_email,
      {
        name: result.us_firstname,
        username: result.us_username,
      }
    );
  }
      
  return {
    message: 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้',
  };
}

export const authService = { checkLogin, logout, sendOtp, verifyOtp, forgotPassword, fetchMe, resetPassword };