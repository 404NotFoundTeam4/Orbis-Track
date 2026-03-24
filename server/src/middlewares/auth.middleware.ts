import { Response, NextFunction } from "express";
import { verifyToken, extractToken, COOKIE_NAME } from "../utils/jwt.js";
import { HttpError } from "../errors/errors.js";
import { HttpStatus } from "../core/http-status.enum.js";
import { authSchema } from "../modules/auth/index.js";
import { isTokenBlacklisted } from "../modules/auth/token-blacklist.service.js";

/**
 * Description: Middleware เช็ค JWT แบบรองรับทั้ง Cookie (SSO) และ Bearer Token
 * Input : รับ token จาก cookie (orbistrack_jwt) หรือ Authorization header ("Bearer <token>")
 * Output : ถ้าผ่านจะผูก req.user แล้ว next(); ถ้าไม่ผ่านจะโยน HttpError 401
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 * Updated : Support cookie-based auth for Chatbot SSO integration
 */
export async function authMiddleware(req: authSchema.AuthRequest, res: Response, next: NextFunction) {
    // Extract token from cookie or Authorization header
    const token = extractToken({
        cookies: req.cookies,
        headers: { authorization: req.headers.authorization }
    });

    if (!token) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Missing authentication token");
    }

    // เช็ค blacklist ถ้าโดน revoke แล้วก็ไม่ให้ผ่าน
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Token revoked");
    }

    try {
        // ถอดรหัส + ตรวจความถูกต้องของ JWT แล้วโยน payload ใส่ req.user ไว้ให้ route ใช้ต่อ
        const payload = verifyToken(token);
        req.user = payload;
        // Also store token for logout operations
        req.token = token;
        return next();
    } catch (err: any) {
        // แยกเคสหมดอายุออกมาให้ข้อความชัด ๆ หน่อย ที่เหลือถือว่า token ใช้ไม่ได้
        if (err.name === "TokenExpiredError") {
            throw new HttpError(HttpStatus.UNAUTHORIZED, "Token expired");
        }
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
}

/**
 * Description: Middleware สำหรับ Chatbot - เช็ค JWT จาก cookie โดยเฉพาะ
 * ถ้าไม่มี token จะไม่ throw error แต่จะตั้ง req.user = null
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 * Input : req.cookies.orbistrack_jwt
 * Output : req.user หรือ null (สำหรับ endpoint ที่ต้องการ optional auth)
 */
export async function optionalAuthMiddleware(req: authSchema.AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        req.user = undefined;
        return next();
    }

    try {
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            req.user = undefined;
            return next();
        }

        const payload = verifyToken(token);
        req.user = payload;
        req.token = token;
    } catch {
        req.user = undefined;
    }

    return next();
}
