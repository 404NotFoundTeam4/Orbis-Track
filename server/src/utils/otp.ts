/**
 * Description: Utility class สำหรับจัดการ OTP (One-Time Password) - สร้างและยืนยันรหัส OTP
 * Note      : ใช้ crypto module ของ Node.js เพื่อสร้างเลขสุ่มที่ปลอดภัย
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import crypto from 'crypto';

/**
 * Class: OTP Utility สำหรับสร้างและยืนยันรหัส OTP
 * Features:
 *   - สร้าง OTP 6 หลักแบบสุ่ม
 *   - สร้าง OTP ความยาวกำหนดเองได้
 *   - ยืนยันความถูกต้องของ OTP
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export class OtpUtil {
  /**
   * Description: สร้างรหัส OTP 6 หลักแบบสุ่ม (100000-999999)
   * Input     : void
   * Output    : string - รหัส OTP 6 หลัก
   * Note      : ใช้ crypto.randomInt เพื่อความปลอดภัยในการสร้างเลขสุ่ม
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
    static generateOtp(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Description: สร้างรหัส OTP แบบกำหนดความยาวเองได้
     * Input     : length (number) - ความยาวของ OTP ที่ต้องการ (default = 6)
     * Output    : string - รหัส OTP ตามความยาวที่กำหนด
     * Example   : generateOtpWithLength(4) => "1234", generateOtpWithLength(8) => "12345678"
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    static generateOtpWithLength(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return crypto.randomInt(min, max).toString();
    }

    /**
     * Description: ยืนยันความถูกต้องของ OTP โดยเปรียบเทียบกับค่าที่เก็บไว้
     * Input     : inputOtp (string) - OTP ที่ผู้ใช้กรอกเข้ามา
     *             storedOtp (string) - OTP ที่เก็บไว้ในระบบ (เช่น Redis)
     * Output    : boolean - true ถ้า OTP ถูกต้อง, false ถ้าไม่ถูกต้อง
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    static verifyOtp(inputOtp: string, storedOtp: string): boolean {
        return inputOtp === storedOtp;
    }
}