/**
 * Description: Email template สำหรับแจ้งเตือนผู้ใช้ว่า Ticket ใกล้ถึงกำหนดส่งคืน
 * Note      : Template แจ้งเตือนล่วงหน้า 30 นาที
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { env } from "../../../config/env.js";

interface TicketDueSoonTemplateData {
    name: string;
    username: string;
    ticketId: number;
    deviceName: string;
    dueTime: string;
    ticketUrl: string;
}

export const ticketDueSoonTemplate = (data: TicketDueSoonTemplateData): string => {
    const { name, ticketId, deviceName, dueTime, ticketUrl } = data;

    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            body { font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; }
            .header { background-color: #ffffff; padding: 30px 40px; border-bottom: 3px solid #f39c12; }
            .header h1 { color: #f39c12; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px; color: #333333; }
            .greeting { font-size: 18px; margin-bottom: 15px; color: #2c3e50; font-weight: 600; }
            .intro { color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 25px; }
            .details-box { background: #fffcf5; border: 1px solid #fae5b0; padding: 25px; margin: 30px 0; }
            .details-box h3 { color: #d35400; margin: 0 0 20px 0; font-size: 16px; font-weight: 600; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #fae5b0; font-size: 14px; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #8e44ad; }
            .detail-value { color: #333333; font-family: Consolas, 'Courier New', monospace; }
            .button-box { text-align: center; margin: 25px 0; }
            .button { display: inline-block; background: #f39c12; color: white; padding: 14px 40px; text-decoration: none; font-size: 14px; font-weight: 600; }
            .button:hover { background: #d68910; }
            .info { color: #555555; font-size: 14px; line-height: 1.6; margin: 25px 0; }
            .footer { background: #f8f8f8; padding: 25px 40px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #e0e0e0; line-height: 1.6; }
            @media only screen and (max-width: 600px) {
                .header, .content, .footer { padding: 25px 20px; }
                .button { padding: 12px 30px; width: 100%; box-sizing: border-box; }
                .detail-row { flex-direction: column; }
                .detail-value { margin-top: 5px; word-break: break-all; }
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <h1>แจ้งเตือนใกล้ถึงกำหนดคืน</h1>
            </div>
            <div class="content">
                <p class="greeting">เรียนคุณ ${name}</p>
                <p class="intro">
                รายการยืมอุปกรณ์ของคุณใกล้ถึงกำหนดส่งคืนแล้ว กรุณาเตรียมส่งคืนอุปกรณ์ภายในเวลาที่กำหนด
                </p>

                <div class="details-box">
                <h3>รายละเอียดการยืม</h3>
                <div class="detail-row">
                    <span class="detail-label">หมายเลข Ticket</span>
                    <span class="detail-value">#${ticketId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">อุปกรณ์</span>
                    <span class="detail-value">${deviceName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">กำหนดคืน</span>
                    <span class="detail-value">${dueTime}</span>
                </div>
                </div>

                <div class="button-box">
                    <a href="${ticketUrl}" class="button">ดูรายละเอียด</a>
                </div>

                <p class="info">
                หากคุณมีข้อสงสัย สามารถติดต่อทีมสนับสนุนได้ที่
                <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>
                </p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Orbis Track. All rights reserved.</p>
                <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            </div>
            </div>
        </body>
    </html>
    `;
};
