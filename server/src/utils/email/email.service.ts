import nodemailer, { Transporter } from 'nodemailer';
import { emailConfig } from './email.config.js';
import {
    otpTemplate,
    welcomeTemplate,
    passwordChangedTemplate,
} from './templates/index.js';

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
     * ทดสอบการเชื่อมต่อ SMTP
     */
    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            this.isVerified = true;
            console.log('Email service is ready');
        } catch (error) {
            this.isVerified = false;
            console.error('Email service connection failed:', error);
            throw error;
        }
    }

    /**
     * ส่งอีเมลทั่วไป
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
            console.log(`Email sent to: ${recipients} Successfully`);
        } catch (error) {
            console.error('Email sending failed:', error);

            // ✅ Retry connection if failed
            if (!this.isVerified) {
                await this.verifyConnection();
            }

            throw new Error('Failed to send email');
        }
    }

    /**
     * ส่ง OTP
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
            subject: 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน - Obis Track',
            html,
        });
    }

    /**
     * ส่งอีเมลต้อนรับ
     */
    async sendWelcome(
        to: string,
        data: {
            username: string;
            resetPasswordUrl: string;
        }
    ): Promise<void> {
        const html = welcomeTemplate({
            username: data.username,
            userEmail: to,
            resetPasswordUrl: data.resetPasswordUrl,
        });

        await this.send({
            to,
            subject: `ยินดีต้อนรับสู่ ${emailConfig.defaults.appName}! 🎉`,
            html,
        });
    }

    /**
     * แจ้งเตือนเปลี่ยนรหัสผ่านสำเร็จ
     */
    async sendPasswordChanged(
        to: string,
        data: {
            username?: string;
            ipAddress?: string;
            userAgent?: string;
        }
    ): Promise<void> {
        const html = passwordChangedTemplate({
            username: data.username,
            changedAt: new Date(),
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        });

        await this.send({
            to,
            subject: '🔒 รหัสผ่านของคุณถูกเปลี่ยนแล้ว - Obis Track',
            html,
        });
    }

    /**
     * ส่งอีเมลหลายคนพร้อมกัน (Bulk Email)
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

    async close(): Promise<void> {
        this.transporter.close();
        console.log('📪 Email service closed');
    }
}

export default new EmailService();