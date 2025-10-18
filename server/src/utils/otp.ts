import crypto from 'crypto';

export class OtpUtil {
    /**
     * สร้าง OTP 6 หลัก
     */
    static generateOtp(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * สร้าง OTP แบบกำหนดความยาวเอง
     */
    static generateOtpWithLength(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return crypto.randomInt(min, max).toString();
    }

    /**
     * Verify OTP
     */
    static verifyOtp(inputOtp: string, storedOtp: string): boolean {
        return inputOtp === storedOtp;
    }
}