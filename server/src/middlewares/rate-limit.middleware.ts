import { Request, Response, NextFunction } from 'express';
import type { RequestHandler } from '../core/router.js';
import redisUtils from "./../infrastructure/redis.cjs";
import { HttpStatus } from '../core/http-status.enum.js';

const { redisIncrBy, redisExpire, redisTTL } = redisUtils;

async function checkRateLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
    const current = await redisIncrBy(key, 1);

    if (current === 1) {
        await redisExpire(key, windowSeconds);
    } else {
        // เผื่อกรณี key ไม่มี TTL (เช่น ถูกรีสตาร์ท/เคยตั้งผิด) ให้ใส่ TTL ให้ใหม่
        const ttl = await redisTTL(key);
        if (ttl < 0) {
            await redisExpire(key, windowSeconds);
        }
    }

    const allowed = current <= maxAttempts;
    const remaining = Math.max(0, maxAttempts - current);
    return { allowed, remaining };
}

export class RateLimitMiddleware {
    /**
     * Rate limit สำหรับการขอ OTP
     * 3 ครั้งต่อ 1 ชั่วโมง
     */
    static readonly getOtpLimit: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: 'Email is required' });
                return;
            }

            const key = `rate-limit:send-otp:${email}`;
            const { allowed, remaining } = await checkRateLimit(
                key,
                3, // 3 ครั้ง
                3600 // 1 ชั่วโมง
            );

            if (!allowed) {
                res.status(429).json({
                    error: 'คุณขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
                    retryAfter: 3600,
                });
                return;
            }

            // เพิ่ม remaining ไว้ใน response header
            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            next(error);
        }
        return undefined as any;
    }

    /**
     * Rate limit สำหรับการยืนยัน OTP
     * 5 ครั้งต่อ 15 นาที
     */
    static readonly verifyOtpLimit: RequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: 'Email is required' });
                return;
            }

            const key = `rate-limit:verify-otp:${email}`;
            const { allowed, remaining } = await checkRateLimit(
                key,
                5, // 5 ครั้ง
                900 // 15 นาที
            );

            if (!allowed) {
                res.status(429).json({
                    error: 'คุณพยายามยืนยัน OTP บ่อยเกินไป กรุณารอ 15 นาที',
                    retryAfter: 900,
                });
                return;
            }

            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            next(error);
        }
        return undefined as any;
    }
}