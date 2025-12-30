import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "../errors/errors.js";
import { HttpStatus } from "../core/http-status.enum.js";
import { authSchema } from "../modules/auth/index.js";
import { isTokenBlacklisted } from "../modules/auth/token-blacklist.service.js";

/**
 * Description: Middleware เช็ค JWT แบบง่าย ๆ + รองรับ blacklist (revoke แล้วห้ามใช้)
 * Input : รับ token จากฝั่ง client มา (req.headers.authorization = "Bearer <token>")
 * Output : ถ้าผ่านจะผูก req.user แล้ว next(); ถ้าไม่ผ่านจะโยน HttpError 401
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export async function authMiddleware(req: authSchema.AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Missing or malformed Authorization header");
    }

    const token = authHeader.slice(7).trim();

    // เช็ค blacklist ถ้าโดน revoke แล้วก็ไม่ให้ผ่าน
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Token revoked");
    }

    try {
        // ถอดรหัส + ตรวจความถูกต้องของ JWT แล้วโยน payload ใส่ req.user ไว้ให้ route ใช้ต่อ
        const payload = verifyToken(token);
        req.user = payload;
        return next();
    } catch (err: any) {
        // แยกเคสหมดอายุออกมาให้ข้อความชัด ๆ หน่อย ที่เหลือถือว่า token ใช้ไม่ได้
        if (err.name === "TokenExpiredError") {
            throw new HttpError(HttpStatus.UNAUTHORIZED, "Token expired");
        }
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
}
