import { Request, Response, NextFunction } from 'express';
import type { RequestHandler } from '../core/router.js';
import redisUtils from "./../infrastructure/redis.cjs";
import { HttpStatus } from '../core/http-status.enum.js';

const { redisIncrBy, redisExpire, redisTTL } = redisUtils;

/**
 * Description: ฟังก์ชันตรวจสอบ rate limit ผ่าน Redis โดยนับจำนวนครั้งที่เรียกใช้งาน
 * Input     : key (Redis key), maxAttempts (จำนวนครั้งสูงสุด), windowSeconds (ช่วงเวลาที่กำหนด)
 * Output    : { allowed: boolean, remaining: number } - allowed คือผ่านหรือไม่, remaining คือจำนวนครั้งที่เหลือ
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
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
    
    // ตรวจสอบว่าจำนวนครั้งยังไม่เกินที่กำหนดหรือไม่
    const allowed = current <= maxAttempts;
    // คำนวณจำนวนครั้งที่เหลือ (ไม่ให้ติดลบ)
    const remaining = Math.max(0, maxAttempts - current);
    return { allowed, remaining };
}

export class RateLimitMiddleware {
    /**
    * Description: Middleware จำกัดจำนวนครั้งในการขอ OTP เพื่อป้องกันการ spam
    * Input     : req.body.email - อีเมลของผู้ใช้ที่ต้องการขอ OTP
    * Output    : ถ้าผ่าน จะ next() ไปขั้นตอนต่อไป, ถ้าไม่ผ่านจะ return 429 Too Many Requests
    * Note      : จำกัด 3 ครั้งต่อ 1 ชั่วโมง (3600 วินาที)
    * Author    : ชื่อฉัน Pakkapon Chomchoey (Tonnam) 66160080
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
            
            // เช็ค rate limit: 3 ครั้งต่อ 1 ชั่วโมง
            const { allowed, remaining } = await checkRateLimit(
                key,
                3, // 3 ครั้ง
                3600 // 1 ชั่วโมง
            );
            
            // ถ้าเกินจำนวนที่กำหนด ส่ง error กลับไป
            if (!allowed) {
                res.status(429).json({
                    error: 'คุณขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
                    retryAfter: 3600,
                });
                return;
            }

            // เพิ่ม remaining ไว้ใน response header เพื่อบอกจำนวนครั้งที่เหลือ
            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            next(error);
        }
        return undefined as any;
    }

    /**
     * Description: Middleware จำกัดจำนวนครั้งในการยืนยัน OTP เพื่อป้องกันการ brute force
     * Input     : req.body.email - อีเมลของผู้ใช้ที่ต้องการยืนยัน OTP
     * Output    : ถ้าผ่าน จะ next() ไปขั้นตอนต่อไป, ถ้าไม่ผ่านจะ return 429 Too Many Requests
     * Note      : จำกัด 5 ครั้งต่อ 15 นาที (900 วินาที)
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
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
            
            // เช็ค rate limit: 5 ครั้งต่อ 15 นาที
            const { allowed, remaining } = await checkRateLimit(
                key,
                5, // 5 ครั้ง
                900 // 15 นาที
            );

            // ถ้าเกินจำนวนที่กำหนด ส่ง error กลับไป
            if (!allowed) {
                res.status(429).json({
                    error: 'คุณพยายามยืนยัน OTP บ่อยเกินไป กรุณารอ 15 นาที',
                    retryAfter: 900,
                });
                return;
            }

            // เพิ่ม remaining ไว้ใน response header เพื่อบอกจำนวนครั้งที่เหลือ
            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            next(error);
        }
        return undefined as any;
    }
}