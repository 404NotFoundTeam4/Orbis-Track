/**
 * Description: Email template สำหรับต้อนรับผู้ใช้ใหม่ พร้อมลิงก์สำหรับตั้งรหัสผ่านครั้งแรก
 * Note      : Template รองรับ responsive design และมีขั้นตอนการเริ่มต้นใช้งานที่ชัดเจน
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { env } from "../../../config/env.js";

/**
 * Interface: ข้อมูลที่ใช้ในการสร้าง Welcome email template
 * Properties:
 *   - name             : ชื่อผู้ใช้สำหรับแสดงในอีเมล (required)
 *   - username         : username สำหรับเข้าสู่ระบบ (required)
 *   - userEmail        : อีเมลของผู้ใช้ (required)
 *   - resetPasswordUrl : URL สำหรับตั้งรหัสผ่านครั้งแรก (required)
 *   - expiryHours      : เวลาหมดอายุของลิงก์ (ชั่วโมง) (required)
 */
interface WelcomeTemplateData {
    name: string,
    username: string;
    userEmail: string;
    resetPasswordUrl: string;
    expiryHours: string;
}

/**
 * Description: สร้าง HTML email template สำหรับต้อนรับผู้ใช้ใหม่
 * Input     : WelcomeTemplateData { name, username, userEmail, resetPasswordUrl, expiryHours }
 * Output    : string (HTML email template พร้อม inline CSS)
 * Features  : 
 *   - Responsive design (รองรับมือถือ)
 *   - แสดงข้อมูลบัญชีผู้ใช้ (username)
 *   - ปุ่มสำหรับตั้งรหัสผ่านพร้อมแสดงเวลาหมดอายุ
 *   - มีขั้นตอนการเริ่มต้นใช้งานที่ชัดเจน
 *   - คำเตือนให้ตั้งรหัสผ่านภายในเวลาที่กำหนด
 *   - มีข้อมูลติดต่อทีมสนับสนุน
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
export const welcomeTemplate = (data: WelcomeTemplateData): string => {
    const { name, username, userEmail, resetPasswordUrl, expiryHours } = data;

    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            body { font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; }
            .header { background-color: #ffffff; padding: 30px 40px; border-bottom: 3px solid #2c3e50; }
            .header h1 { color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px; color: #333333; }
            .greeting { font-size: 18px; margin-bottom: 15px; color: #2c3e50; font-weight: 600; }
            .intro { color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 25px; }
            .credentials-box { background: #fafafa; border: 1px solid #d0d0d0; padding: 25px; margin: 30px 0; }
            .credentials-box h3 { color: #2c3e50; margin: 0 0 20px 0; font-size: 16px; font-weight: 600; }
            .credential-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; }
            .credential-row:last-child { border-bottom: none; }
            .credential-label { font-weight: 600; color: #555555; }
            .credential-value { color: #333333; font-family: Consolas, 'Courier New', monospace; }
            .button-box { text-align: center; margin: 25px 0; }
            .button { display: inline-block; background: #2c3e50; color: white; padding: 14px 40px; text-decoration: none; font-size: 14px; font-weight: 600; }
            .button:hover { background: #1a252f; }
            .warning-box { background: #f8f8f8; border-left: 3px solid #888888; padding: 20px; margin: 25px 0; font-size: 14px; color: #555555; }
            .warning-box strong { display: block; margin-bottom: 10px; color: #333333; }
            .steps { background: #fafafa; border: 1px solid #d0d0d0; padding: 25px; margin: 30px 0; }
            .steps h3 { color: #2c3e50; margin: 0 0 20px 0; font-size: 16px; font-weight: 600; }
            .step-item { margin: 15px 0; padding-left: 30px; position: relative; color: #555555; font-size: 14px; line-height: 1.5; }
            .step-item:before { content: attr(data-step); position: absolute; left: 0; color: #2c3e50; font-weight: bold; }
            .info { color: #555555; font-size: 14px; line-height: 1.6; margin: 25px 0; }
            .footer { background: #f8f8f8; padding: 25px 40px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #e0e0e0; line-height: 1.6; }
            .footer a { color: #2c3e50; text-decoration: none; }
            @media only screen and (max-width: 600px) {
                .header, .content, .footer { padding: 25px 20px; }
                .button { padding: 12px 30px; width: 100%; box-sizing: border-box; }
                .credential-row { flex-direction: column; }
                .credential-value { margin-top: 5px; word-break: break-all; }
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <h1>Obis Track</h1>
            </div>
            <div class="content">
                <p class="greeting">เรียนคุณ ${name}</p>
                <p class="intro">
                ผู้ดูแลระบบได้สร้างบัญชีผู้ใช้งานสำหรับคุณในระบบ Obis Track เรียบร้อยแล้ว 
                กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านและเริ่มใช้งาน
                </p>

                <div class="credentials-box">
                <h3>ข้อมูลบัญชีของคุณ</h3>
                <div class="credential-row">
                    <span class="credential-label">ชื่อผู้ใช้</span>
                    <span class="credential-value">&nbsp;${username}</span>
                </div>
                <p style="color: #888; font-size: 13px; margin: 15px 0 0 0;">
                คุณจะใช้ชื่อผู้ใช้นี้ในการเข้าสู่ระบบ
                </p>
                </div>

                <div class="button-box">
                    <a href="${resetPasswordUrl}" class="button">ตั้งรหัสผ่าน</a>
                    <p style="color: #888; font-size: 13px; margin: 15px 0 0 0;">
                      ลิงก์นี้จะหมดอายุภายใน ${Math.floor(Number(expiryHours)/ 86400)} วัน
                    </p>
                </div>

                <div class="warning-box">
                <strong>สำคัญ: กรุณาตั้งรหัสผ่านภายใน ${Math.floor(Number(expiryHours)/ 86400)} วัน</strong>
                เพื่อความปลอดภัยของบัญชี กรุณาคลิกปุ่มด้านบนเพื่อตั้งรหัสผ่านที่คุณต้องการ 
                หากลิงก์หมดอายุ กรุณาติดต่อผู้ดูแลระบบเพื่อขอลิงก์ใหม่
                </div>

                <div class="steps">
                <h3>ขั้นตอนการเริ่มต้นใช้งาน</h3>
                <div class="step-item" data-step="1.">1. คลิกปุ่ม "ตั้งรหัสผ่าน" ด้านบน</div>
                <div class="step-item" data-step="2.">2. สร้างรหัสผ่านใหม่ที่คุณต้องการ</div>
                <div class="step-item" data-step="3.">3. เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่ตั้งไว้</div>
                </div>

                <p class="info">
                หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถติดต่อทีมสนับสนุนได้ที่
                <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>
                </p>

                <p class="info">
                ยินดีต้อนรับสู่ Obis Track
                </p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Obis Track. All rights reserved.</p>
                <p>บัญชีนี้ถูกสร้างโดยผู้ดูแลระบบสำหรับอีเมล ${userEmail}</p>
                <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            </div>
            </div>
        </body>
    </html>
`;
};