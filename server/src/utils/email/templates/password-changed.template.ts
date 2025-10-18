import { env } from "../../../config/env.js";

interface PasswordChangedTemplateData {
    username?: string;
    changedAt: Date;
    ipAddress?: string;
    userAgent?: string;
}

export const passwordChangedTemplate = (data: PasswordChangedTemplateData): string => {
    const { username, changedAt, ipAddress, userAgent } = data;

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
            .info-box { background: #fafafa; border: 1px solid #d0d0d0; padding: 25px; margin: 25px 0; }
            .info-box h3 { margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; font-weight: 600; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: 600; color: #555555; }
            .info-value { color: #333333; text-align: right; }
            .warning { background: #f8f8f8; border-left: 3px solid #888888; padding: 20px; margin: 25px 0; font-size: 14px; color: #555555; }
            .warning strong { display: block; margin-bottom: 10px; color: #333333; }
            .button { display: inline-block; background: #2c3e50; color: white; padding: 12px 30px; text-decoration: none; margin: 15px 0; font-size: 14px; }
            .button:hover { background: #1a252f; }
            .tips { color: #555555; font-size: 14px; line-height: 1.6; margin: 25px 0; }
            .tips ul { margin: 10px 0; padding-left: 20px; }
            .tips li { margin: 8px 0; }
            .footer { background: #f8f8f8; padding: 25px 40px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #e0e0e0; line-height: 1.6; }
            .footer a { color: #2c3e50; text-decoration: none; }
            @media only screen and (max-width: 600px) {
                .header, .content, .footer { padding: 25px 20px; }
                .info-row { flex-direction: column; }
                .info-value { text-align: left; margin-top: 5px; }
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

                <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                รหัสผ่านของคุณสำหรับบัญชี Obis Track ได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว
                </p>
ห
                <div class="info-box">
                <h3>รายละเอียดการเปลี่ยนแปลง</h3>
                <div class="info-row">
                    <span class="info-label">วันที่และเวลา</span>
                    <span class="info-value">&nbsp${changedAt.toLocaleString('th-TH')}</span>
                </div>
                ${ipAddress ? `
                    <div class="info-row">
                    <span class="info-label">IP Address</span>
                    <span class="info-value">${ipAddress}</span>
                    </div>
                ` : ''}
                ${userAgent ? `
                    <div class="info-row">
                    <span class="info-label">อุปกรณ์</span>
                    <span class="info-value">${userAgent}</span>
                    </div>
                ` : ''}
                </div>

                <div class="warning">
                <strong>หากคุณไม่ได้ทำการเปลี่ยนรหัสผ่าน</strong>
                กรุณาติดต่อทีมสนับสนุนของเราทันทีเพื่อรักษาความปลอดภัยของบัญชี การเข้าถึงที่ไม่ได้รับอนุญาตอาจเป็นสัญญาณของปัญหาด้านความปลอดภัย
                <div style="text-align: center; margin-top: 15px;">
                    <a href="mailto:${env.SUPPORT_EMAIL}?subject=Unauthorized%20Password%20Change" class="button">
                    รายงานปัญหา
                    </a>
                </div>
                </div>

                <div class="tips">
                <strong style="color: #333333;">คำแนะนำด้านความปลอดภัย</strong>
                <ul>
                    <li>ใช้รหัสผ่านที่แข็งแกร่งและไม่ซ้ำกับบัญชีอื่น</li>
                    <li>อย่าแชร์รหัสผ่านให้กับผู้อื่นไม่ว่ากรณีใดๆ</li>
                    <li>เปลี่ยนรหัสผ่านเป็นประจำทุก 3-6 เดือน</li>
                </ul>
                </div>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Obis Track. All rights reserved.</p>
                <p>หากมีคำถาม ติดต่อ <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a></p>
                <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            </div>
            </div>
        </body>
    </html>
`;
};