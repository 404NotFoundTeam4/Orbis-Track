/**
 * Description: โหลดและตรวจสอบค่าตัวแปร Environment ต่่าง ๆ (.env / process.env) ด้วย Zod
 * Input : process.env (ค่าจากระบบปฏิบัติการหรือไฟล์ .env)
 * Output : env (อ็อบเจ็กต์ค่าคอนฟิกที่ผ่านการ validate แล้ว), EnvType
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { z } from "zod";
import "dotenv/config"; // โหลดค่าจากไฟล์ .env เข้าสู่ process.env อัตโนมัติ

// สร้างค่าเริ่มต้นให้ REDIS_URL เมื่อไม่ได้ระบุไว้ (encode password เพื่อกันอักขระพิเศษผิดรูปแบบ)
// Author : Pakkapon Chomchoey (Tonnam) 66160080
const DEFAULT_REDIS_URL =
    `redis://default:${encodeURIComponent(process.env.REDIS_PASSWORD ?? "")}` +
    `@${process.env.REDIS_HOST ?? "redis"}:${process.env.REDIS_PORT ?? "6379"}`;

// นิยามสคีมาคอนฟิกด้วย Zod เพื่อ validate และกำหนดค่าเริ่มต้นที่เหมาะสม
const Env = z.object({
    // service
    PORT: z.coerce.number().default(4044),
    API_URL: z
        .string()
        .refine(v => {
            try {
                new URL(v);
                return true;
            } catch {
                return false;
            }
        }, { message: "Invalid URL" })
        .default("http://localhost:4044")
        .optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // database
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().default(5432),
    DATABASE_URL: z.string().min(1),

    // redis
    REDIS_PASSWORD: z.string().min(1),
    REDIS_URL: z.string()
        .transform(v => {
            const s = (v ?? "").trim();
            return s || DEFAULT_REDIS_URL;
        })
        .refine(v => v.startsWith("redis://"), { message: "Must start with redis://" }),

    // auth/jwt
    JWT_SECRET: z.string().min(8),
    JWT_EXPIRES_IN: z.string().default("2h"),

    // email/smtp
    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z.string()
        .transform(v => v === 'true')
        .default(false),
    SMTP_REQUIRETLS: z.coerce.boolean().default(true),
    SMTP_USER: z.string().default(""),
    SMTP_PASS: z.string().default(""),
    SMTP_FROM_NAME: z.string().default("Obis Track"),
    SMTP_FROM_EMAIL: z.string().default(""),
    APP_NAME: z.string().default("Obis Track"),
    APP_URL: z.string().default("https://obistrack.com"),
    SUPPORT_EMAIL: z.string().default("support@obistrack.com"),
    FRONTEND_URL: z.string().default("http://localhost:4042"),
    
    //token/crypto
    EXPIRE_TOKEN: z.string()
});

export type EnvType = z.infer<typeof Env>;

export const env: EnvType = Env.parse(process.env);