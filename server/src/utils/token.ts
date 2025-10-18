import crypto from 'node:crypto';
import argon2 from 'argon2';

/**
 * Utility class สำหรับจัดการ Token ที่ใช้ครั้งเดียว (One-Time-Use Tokens)
 * เช่น ลิงก์รีเซ็ตรหัสผ่าน, ลิงก์ยืนยันอีเมล
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export class OneTimeTokenUtil {
    /**
     * Description: สร้าง Token แบบสุ่มที่ปลอดภัยสำหรับใช้ใน URL
     * Output: { plainTextToken: string, hashedToken: string }
     * - plainTextToken: สำหรับใส่ใน URL และส่งให้ผู้ใช้
     * - hashedToken: สำหรับเก็บลงฐานข้อมูล
     */
    static async generateToken(): Promise<{ plainTextToken: string; hashedToken: string }> {
        const plainTextToken = crypto.randomBytes(32).toString('hex');
        
        const hashedToken = await argon2.hash(plainTextToken);

        return { plainTextToken, hashedToken };
    }

    /**
     * Description: ตรวจสอบ Plain Text Token กับ Hashed Token ที่เก็บในฐานข้อมูล
     * Input:
     * - plainTextToken: string // Token ที่ได้รับจากผู้ใช้ (เช่น จาก URL หรือ Header)
     * - hashedToken: string // Token ที่แฮชแล้วจากฐานข้อมูล
     * Output: boolean // true หาก Token ถูกต้อง
     */
    static async verifyToken(plainTextToken: string, hashedToken: string): Promise<boolean> {
        return argon2.verify(hashedToken, plainTextToken);
    }
}