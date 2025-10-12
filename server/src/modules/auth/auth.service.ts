import { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { HttpError, ValidationError } from '../../errors/errors.js';
import { prisma } from '../../infrastructure/database/client.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import { verifyPassword } from '../../utils/password.js';
import type { AccessTokenPayload, LoginPayload } from './auth.schema.js';
import { blacklistToken } from './token-blacklist.service.js';
import { HttpStatus } from '../../core/http-status.enum.js';

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

export const authService = { checkLogin, logout, fetchMe };