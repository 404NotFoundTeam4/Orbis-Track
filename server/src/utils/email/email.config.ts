import { env } from '../../config/env.js';

export const emailConfig = {
    smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        requireTLS: env.SMTP_REQUIRETLS,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    },
    from: {
        name: env.SMTP_FROM_NAME,
        email: env.SMTP_FROM_EMAIL || env.SMTP_USER,
    },
    defaults: {
        appName: env.APP_NAME,
        appUrl: env.APP_URL,
        supportEmail: env.SUPPORT_EMAIL,
    },
};