/**
 * Description: Email Service สำหรับจัดการการส่งอีเมลผ่าน SMTP (Nodemailer)
 * Note      : รองรับ connection pooling, rate limiting และการส่งอีเมลหลายรูปแบบ (OTP, Welcome, Password Changed)
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import nodemailer, { Transporter } from 'nodemailer';
import { emailConfig } from './email.config.js';
import {
    otpTemplate,
    welcomeTemplate,
    passwordChangedTemplate,
    ticketDueSoonTemplate,
    ticketOverdueTemplate,
} from './templates/index.js';
import { logger } from '../../infrastructure/logger.js';

/**
 * Interface: ตัวเลือกสำหรับการส่งอีเมล
 * Properties:
 *   - to          : อีเมลผู้รับ (string หรือ array)
 *   - subject     : หัวข้ออีเมล
 *   - html        : เนื้อหาอีเมลในรูปแบบ HTML
 *   - text        : เนื้อหาอีเมลในรูปแบบ plain text
 *   - cc          : อีเมลสำเนา (Carbon Copy)
 *   - bcc         : อีเมลสำเนาลับ (Blind Carbon Copy)
 *   - attachments : ไฟล์แนบ
 */
interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
        filename: string;
        content?: string | Buffer;
        path?: string;
    }>;
}

/**
 * Class: Email Service สำหรับจัดการการส่งอีเมลทุกประเภท
 * Features:
 *   - Connection pooling (5 connections พร้อมกัน)
 *   - Rate limiting (5 emails ต่อวินาที)
 *   - Auto retry เมื่อ connection ล้มเหลว
 *   - รองรับการส่งอีเมลหลายคนพร้อมกัน (bulk email)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
class EmailService {
    private readonly transporter: Transporter;
    private isVerified: boolean = false;

    constructor() {
        this.transporter = nodemailer.createTransport({
            ...emailConfig.smtp,
            pool: true, // ← เปิด connection pooling
            maxConnections: 5, // ส่งพร้อมกันได้ 5 connections
            maxMessages: 100, // ส่งได้ 100 emails ต่อ connection
            rateDelta: 1000, // 1 วินาที
            rateLimit: 5, // ส่งได้ 5 emails ต่อวินาที
        });
    }

    /**
     * Description: ทดสอบการเชื่อมต่อ SMTP เพื่อตรวจสอบว่า configuration ถูกต้อง
     * Input     : void
     * Output    : Promise<void>
     * Note      : จะถูกเรียกอัตโนมัติก่อนส่งอีเมลครั้งแรก
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            this.isVerified = true;
            logger.info('Email service is ready');
        } catch (error) {
            this.isVerified = false;
            logger.debug(`Email service connection failed: ${error}`);
            throw error;
        }
    }

    /**
     * Description: ส่งอีเมลทั่วไปตาม options ที่กำหนด (ฟังก์ชันหลักสำหรับส่งอีเมล)
     * Input     : EmailOptions { to, subject, html?, text?, cc?, bcc?, attachments? }
     * Output    : Promise<void>
     * Note      : จะตรวจสอบ connection ก่อนส่งอัตโนมัติ และ retry หาก connection ล้มเหลว
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async send(options: EmailOptions): Promise<void> {
        try {
            if (!this.isVerified) {
                await this.verifyConnection();
            }

            const { to, subject, html, text, cc, bcc, attachments } = options;

            await this.transporter.sendMail({
                from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                html,
                text,
                cc,
                bcc,
                attachments,
            });

            const recipients = Array.isArray(to) ? to.join(', ') : to;
            logger.info(`Email sent to: ${recipients} Successfully`);
        } catch (error) {
            console.error('Email sending failed:', error);

            if (!this.isVerified) {
                await this.verifyConnection();
            }

            throw new Error('Failed to send email');
        }
    }

    /**
     * Description: ส่งรหัส OTP ไปยังอีเมลผู้ใช้เพื่อยืนยันตัวตน
     * Input     : to (อีเมลผู้รับ), otp (รหัส 6 หลัก), options? { username?, expiryMinutes? }
     * Output    : Promise<void>
     * Note      : ใช้ otpTemplate สำหรับสร้างเนื้อหาอีเมล, default expiryMinutes = 15 นาที
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async sendOtp(
        to: string,
        otp: string,
        options?: {
            username?: string;
            expiryMinutes?: number;
        }
    ): Promise<void> {
        const html = otpTemplate({
            otp,
            username: options?.username,
            expiryMinutes: options?.expiryMinutes || 15,
        });

        await this.send({
            to,
            subject: 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน - Orbis Track',
            html,
        });
    }

    /**
     * Description: ส่งอีเมลต้อนรับผู้ใช้ใหม่พร้อมลิงก์สำหรับตั้งรหัสผ่านครั้งแรก
     * Input     : to (อีเมลผู้รับ), data { name, username, resetPasswordUrl, expiryHours }
     * Output    : Promise<void>
     * Note      : ใช้ welcomeTemplate สำหรับสร้างเนื้อหาอีเมล
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async sendWelcome(
        to: string,
        data: {
            name: string;
            username: string;
            resetPasswordUrl: string;
            expiryHours: string;
        }
    ): Promise<void> {
        const html = welcomeTemplate({
            name: data.name,
            username: data.username,
            userEmail: to,
            resetPasswordUrl: data.resetPasswordUrl,
            expiryHours: data.expiryHours,
        });

        await this.send({
            to,
            subject: `ยินดีต้อนรับสู่ ${emailConfig.defaults.appName}! 🎉`,
            html,
        });
    }

    /**
     * Description: แจ้งเตือนผู้ใช้เมื่อรหัสผ่านถูกเปลี่ยนสำเร็จ
     * Input     : to (อีเมลผู้รับ), data { name, username?, ipAddress?, userAgent? }
     * Output    : Promise<void>
     * Note      : ใช้ passwordChangedTemplate สำหรับสร้างเนื้อหาอีเมล พร้อมรายละเอียดการเปลี่ยนแปลง
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async sendPasswordChanged(
        to: string,
        data: {
            name: string;
            username?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    ): Promise<void> {
        const html = passwordChangedTemplate({
            name: data.name,
            username: data.username,
            changedAt: new Date(),
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        });

        await this.send({
            to,
            subject: '🔒 รหัสผ่านของคุณถูกเปลี่ยนแล้ว - Orbis Track',
            html,
        });
    }

    /**
     * Description: ส่งอีเมลหลายคนพร้อมกัน (Bulk Email)
     * Input     : recipients (array ของอีเมลผู้รับ), subject (หัวข้อ), html (เนื้อหา HTML)
     * Output    : Promise<void>
     * Note      : ใช้ Promise.all เพื่อส่งอีเมลพร้อมกันหลายคน (concurrent sending)
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async sendBulk(
        recipients: string[],
        subject: string,
        html: string
    ): Promise<void> {
        const promises = recipients.map((to) =>
            this.send({ to, subject, html })
        );
        await Promise.all(promises);
    }

    /**
     * Description: ส่งอีเมลแจ้งเตือน Ticket ใกล้ถึงกำหนดคืน (Due Soon)
     * Input     : to (อีเมลผู้รับ), data { name, username, ticketId, deviceName, dueTime, ticketUrl }
     * Output    : Promise<void>
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async sendTicketDueSoon(
        to: string,
        data: {
            name: string;
            username: string;
            ticketId: number;
            deviceName: string;
            dueTime: string;
            ticketUrl: string;
        }
    ): Promise<void> {
        const html = ticketDueSoonTemplate(data);

        await this.send({
            to,
            subject: '⚠️ ใกล้ถึงกำหนดคืนอุปกรณ์ - Orbis Track',
            html,
        });
    }

    /**
     * Description: ส่งอีเมลแจ้งเตือน Ticket เกินกำหนดคืน (Overdue)
     * Input     : to (อีเมลผู้รับ), data { name, username, ticketId, deviceName, overdueSince, ticketUrl }
     * Output    : Promise<void>
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async sendTicketOverdue(
        to: string,
        data: {
            name: string;
            username: string;
            ticketId: number;
            deviceName: string;
            overdueSince: string;
            ticketUrl: string;
        }
    ): Promise<void> {
        const html = ticketOverdueTemplate(data);

        await this.send({
            to,
            subject: '🚨 แจ้งเตือนเกินกำหนดคืนอุปกรณ์ - Orbis Track',
            html,
        });
    }

    /**
     * Description: ปิด connection pool ของ email service
     * Input     : void
     * Output    : Promise<void>
     * Note      : ควรเรียกเมื่อต้องการ shutdown service อย่างสมบูรณ์
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async close(): Promise<void> {
        this.transporter.close();
        console.log('📪 Email service closed');
    }
}

export default new EmailService();