import { env } from "../../../config/env.js";

interface OtpTemplateData {
    otp: string;
    expiryMinutes?: number;
    username?: string;
}

export const otpTemplate = (data: OtpTemplateData): string => {
    const { otp, expiryMinutes = 15, username } = data;

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
            .greeting { font-size: 15px; margin-bottom: 20px; line-height: 1.5; }
            .otp-box { background: #fafafa; border: 1px solid #d0d0d0; padding: 25px; text-align: center; margin: 30px 0; }
            .otp-label { color: #666666; font-size: 13px; margin-bottom: 10px; }
            .otp-code { font-size: 32px; font-weight: 600; letter-spacing: 6px; color: #2c3e50; margin: 15px 0; font-family: Consolas, 'Courier New', monospace; }
            .otp-expiry { color: #888888; font-size: 13px; margin-top: 10px; }
            .info { color: #555555; font-size: 14px; line-height: 1.6; margin: 20px 0; }
            .warning { background: #f8f8f8; border-left: 3px solid #888888; padding: 15px; margin: 25px 0; font-size: 13px; color: #555555; }
            .footer { background: #f8f8f8; padding: 25px 40px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #e0e0e0; line-height: 1.6; }
            .footer a { color: #2c3e50; text-decoration: none; }
            @media only screen and (max-width: 600px) {
                .header, .content, .footer { padding: 25px 20px; }
                .otp-code { font-size: 28px; letter-spacing: 4px; }
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <h1>Obis Track</h1>
            </div>
            <div class="content">
                ${username ? `<p class="greeting">เรียนคุณ ${username}</p>` : '<p class="greeting">เรียนผู้ใช้งาน</p>'}
                <p class="info">คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี Obis Track กรุณาใช้รหัส OTP ด้านล่างเพื่อดำเนินการต่อ</p>

                <div class="otp-box">
                <div class="otp-label">รหัส OTP</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-expiry">รหัสนี้มีอายุ ${expiryMinutes} นาที</div>
                </div>

                <p class="info">หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้ และอย่าแชร์รหัส OTP นี้ให้กับผู้อื่น</p>

                <div class="warning">
                เพื่อความปลอดภัยของบัญชี:<br>
                • อย่าแชร์รหัส OTP ให้ผู้อื่นไม่ว่ากรณีใด ๆ<br>
                • Obis Track จะไม่ขอรหัส OTP จากคุณทางโทรศัพท์<br>
                • หากมีข้อสงสัย กรุณาติดต่อทีมสนับสนุนทันที
                </div>

                <p class="info">
                หากต้องการความช่วยเหลือ ติดต่อ <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>
                </p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Obis Track. All rights reserved.</p>
                <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            </div>
            </div>
        </body>
    </html>
`;
};