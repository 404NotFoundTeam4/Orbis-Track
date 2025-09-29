import { ValidationError } from '../../errors/errors.js';
import { prisma } from '../../infrastructure/database/client.js';
import { signToken, verifyToken } from '../../utils/jwt.js';
import { verifyPassword } from '../../utils/password.js';
import type { AccessTokenPayload, LoginPayload } from './auth.schema.js';
import { blacklistToken } from './token-blacklist.service.js';

/**
 * Description: ตรวจ login จาก DB แล้วออก JWT
 * Input : LoginPayload { username, passwords }
 * Output : string (access token)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
async function checkLogin(payload: LoginPayload) {
    // quick guard: ช่องว่าง/ไม่กรอกมา
    const { username, passwords } = payload;
    if (!username || !passwords) {
        throw new ValidationError("Missing required fields");
    }

    // หา user แบบเลือกเฉพาะฟิลด์ที่ต้องใช้
    const result = await prisma.users.findUnique({
        where: { us_username: username },
        select: {
            us_id: true,
            us_username: true,
            us_password: true,
            us_role: true,
            us_dept_id: true,
            us_sec_id: true,
            us_is_active: true,
        },
    });

    if (!result || !result.us_is_active) {
        throw new ValidationError("Invalid username or password");
    }

    // verify รหัสผ่านกับ hash ใน DB
    const isPasswordCorrect = await verifyPassword(result.us_password, passwords)
    if (!isPasswordCorrect) {
        throw new ValidationError("Invalid password");
    }

    // ออก token พร้อม payload ที่ต้องใช้ต่อฝั่ง server
    const token = signToken({
        sub: result.us_id,
        username: result.us_username,
        role: result.us_role,
        dept_id: result.us_dept_id,
        sec_id: result.us_sec_id,
        is_active: result.us_is_active,
    });

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
        const decoded = verifyToken(token) as AccessTokenPayload;
        const exp = decoded.exp as number;

        const ttl = exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
            await blacklistToken(token, ttl);
        }
    } catch {
        // ถ้า token invalid ก็ไม่ต้องทำอะไร
    }
}

export const authService = { checkLogin, logout };