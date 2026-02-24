import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { authSchema } from "../modules/auth/index.js";
import { env } from "../config/env.js";
import { ValidationError } from "../errors/errors.js";
import type { Response, CookieOptions } from "express";

const JWT_SECRET = env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = (env.JWT_EXPIRES_IN || "2h") as SignOptions["expiresIn"];

// JWT Standard Claims (for SSO with Chatbot)
export const JWT_ISSUER = "orbistrack";
export const JWT_AUDIENCE = "orbistrack-web";
export const COOKIE_NAME = "orbistrack_jwt";

// Cookie configuration for SSO (shared between Main App and Chatbot)
export const cookieConfig: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Domain can be set via env for subdomain sharing: .yourdomain.com
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

/**
 * Description: สร้าง (sign) JWT token จาก payload ที่กำหนด พร้อม standard claims (iss, aud)
 * Input : payload: AccessTokenPayload (without iat, exp, iss, aud)
 * Output : string (access token)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 * Updated: Added iss, aud claims for SSO compatibility with Chatbot
 */
export function signToken(
    payload: Omit<authSchema.AccessTokenPayload, "iat" | "exp" | "iss" | "aud">,
    exp: SignOptions["expiresIn"] = JWT_EXPIRES_IN
): string {
    const fullPayload = {
        ...payload,
        iss: JWT_ISSUER,
        aud: JWT_AUDIENCE,
    };
    return jwt.sign(fullPayload, JWT_SECRET, { algorithm: "HS256", expiresIn: exp });
}

/**
 * Description: ตรวจสอบความถูกต้องของ JWT และแปลงเป็น AccessTokenPayload ที่ผ่านการ validate
 * Input : token: string โทเคนที่ต้องการตรวจสอบ
 * Output : AccessTokenPayload หากไม่ผ่านจะ throw ValidationError
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 * Updated: Verify iss, aud claims for SSO security
 */
export function verifyToken(token: string): authSchema.AccessTokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });
    if (typeof decoded === "string") {
        throw new ValidationError("Invalid token payload");
    }
    // ตรวจรูปแบบ payload ด้วยสคีมา กัน payload แปลกปลอม
    return authSchema.accessTokenPayload.parse(decoded);
}

/**
 * Description: ตรวจสอบความถูกต้องของ JWT แบบ flexible (ไม่บังคับ iss/aud) สำหรับ backward compatibility
 * Input : token: string โทเคนที่ต้องการตรวจสอบ
 * Output : AccessTokenPayload หากไม่ผ่านจะ throw ValidationError
 */
export function verifyTokenLegacy(token: string): authSchema.AccessTokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string") {
        throw new ValidationError("Invalid token payload");
    }
    return authSchema.accessTokenPayload.parse(decoded);
}

/**
 * Description: ถอดรหัส (decode) JWT โดยไม่ตรวจลายเซ็น ใช้เพื่อ inspect เท่านั้น
 * Input : token: string
 * Output : string | jwt.JwtPayload | null ผลลัพธ์อาจเป็น null ถ้า token ไม่ถูกต้อง
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function decodeToken(token: string): JwtPayload | string | null {
    return jwt.decode(token);
}

/**
 * Description: ตั้งค่า JWT cookie สำหรับ SSO (shared with Chatbot)
 * Input : res: Response, token: string, maxAge?: number (milliseconds)
 * Output : void
 */
export function setJwtCookie(res: Response, token: string, maxAge?: number): void {
    const options: CookieOptions = { ...cookieConfig };
    if (maxAge) {
        options.maxAge = maxAge;
    }
    res.cookie(COOKIE_NAME, token, options);
}

/**
 * Description: ลบ JWT cookie (logout)
 * Input : res: Response
 * Output : void
 */
export function clearJwtCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, { path: "/" });
}

/**
 * Description: ดึง token จาก cookie หรือ Authorization header
 * Input : req: Request with cookies and headers
 * Output : string | null
 */
export function extractToken(req: { cookies?: Record<string, string>; headers?: { authorization?: string } }): string | null {
    // Priority 1: Cookie (for SSO with Chatbot)
    if (req.cookies?.[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME];
    }
    // Priority 2: Authorization header (legacy/API clients)
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7).trim();
    }
    return null;
}
