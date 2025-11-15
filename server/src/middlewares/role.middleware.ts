import { Response, NextFunction } from "express";
import { authSchema } from "../modules/auth/index.js";
import { HttpStatus } from '../core/http-status.enum.js';
import { HttpError } from "../errors/errors.js";
import { UserRole } from "../core/roles.enum.js";

/**
 * Description: Middleware เช็คสิทธิ์ตามบทบาท (role-based) ผ่านเฉพาะคนที่อยู่ในลิสต์ roles
 * Input : roles (array ของ UserRole ที่อนุญาต)
 * Output : ถ้า role ผ่าน next(); ถ้าไม่ โยน HttpError 401/403
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export function requireRole(roles: UserRole[]) {
    return (req: authSchema.AuthRequest, _res: Response, next: NextFunction) => {
        // ถ้าไม่มี req.user แปลว่ายังไม่ล็อกอิน/ไม่ผ่าน auth
        if (!req.user) {
            throw new HttpError(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        // มี user แล้ว แต่ role ไม่อยู่ในรายการที่อนุญาต ก็ห้ามเข้า
        if (!roles.includes(req.user.role as UserRole)) {
            throw new HttpError(HttpStatus.FORBIDDEN, "Forbidden");
        }

        next();
    };
}