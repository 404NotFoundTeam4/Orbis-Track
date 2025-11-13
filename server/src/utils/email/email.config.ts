/**
 * Description: Configuration สำหรับ Email Service (SMTP settings และค่าเริ่มต้น)
 * Note      : ดึงค่า config จาก environment variables เพื่อความยืดหยุ่นและความปลอดภัย
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { env } from '../../config/env.js';

/**
 * Email Configuration Object
 * 
 * smtp: 
 *   - SMTP server settings สำหรับส่งอีเมล
 *   - รองรับ TLS/SSL encryption
 * 
 * from:
 *   - ข้อมูลผู้ส่งเริ่มต้น (ชื่อและอีเมล)
 * 
 * defaults:
 *   - ค่าเริ่มต้นที่ใช้ใน email templates (ชื่อแอป, URL, อีเมลสนับสนุน)
 */
export const emailConfig = {
    // การตั้งค่า SMTP สำหรับการส่งอีเมล
    smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT, // SMTP port (587 = TLS, 465 = SSL, 25 = non-secure)
        secure: env.SMTP_SECURE, // ใช้ SSL/TLS หรือไม่ (true สำหรับ port 465)
        requireTLS: env.SMTP_REQUIRETLS, // บังคับใช้ TLS (true สำหรับ port 587)
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    },
    // ข้อมูลผู้ส่งเริ่มต้น
    from: {
        name: env.SMTP_FROM_NAME,
        email: env.SMTP_FROM_EMAIL || env.SMTP_USER,
    },
    // ค่าเริ่มต้นสำหรับ email templates
    defaults: {
        appName: env.APP_NAME,
        appUrl: env.APP_URL,
        supportEmail: env.SUPPORT_EMAIL,
    },
};