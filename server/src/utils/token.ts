import crypto from 'node:crypto';
import argon2 from 'argon2';

/**
 * Description: Utility class สำหรับจัดการ Token ที่ใช้ครั้งเดียว (One-Time-Use Tokens)
 * Note      : ใช้สำหรับสร้างลิงก์ที่ปลอดภัย เช่น ลิงก์รีเซ็ตรหัสผ่าน, ลิงก์ยืนยันอีเมล, ลิงก์ต้อนรับผู้ใช้ใหม่
 *             ใช้ Argon2 สำหรับ hash เพื่อความปลอดภัยสูงสุด
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
export class OneTimeTokenUtil {
  /**
   * Description: สร้าง Token แบบสุ่มที่ปลอดภัยสำหรับใช้ใน URL หรือ Header
   * Input     : void
   * Output    : Promise<{ plainTextToken: string, hashedToken: string }>
   *   - plainTextToken: token ต้นฉบับ (64 hex chars) สำหรับใส่ใน URL และส่งให้ผู้ใช้
   *   - hashedToken: token ที่ hash แล้วด้วย Argon2 สำหรับเก็บลงฐานข้อมูล/Redis
   * Note      : plainTextToken ต้องส่งให้ผู้ใช้ทันที และไม่เคยเก็บในฐานข้อมูล
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
    static async generateToken(): Promise<{ plainTextToken: string; hashedToken: string }> {
        const plainTextToken = crypto.randomBytes(32).toString('hex');
        
        const hashedToken = await argon2.hash(plainTextToken);

        return { plainTextToken, hashedToken };
    }

    /**
     * Description: ตรวจสอบความถูกต้องของ token โดยเปรียบเทียบกับ hashed token ในฐานข้อมูล
     * Input     : 
     *   - plainTextToken: string - Token ที่ได้รับจากผู้ใช้ (จาก URL, Header, หรือ Request Body)
     *   - hashedToken: string - Token ที่ hash แล้วจากฐานข้อมูล/Redis
     * Output    : Promise<boolean> - true ถ้า token ถูกต้อง, false ถ้าไม่ถูกต้อง
     * Note      : ใช้ Argon2 verify ซึ่งมีความปลอดภัยสูงและป้องกัน timing attack
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    static async verifyToken(plainTextToken: string, hashedToken: string): Promise<boolean> {
        return argon2.verify(hashedToken, plainTextToken);
    }
}