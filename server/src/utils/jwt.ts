import jwt, { SignOptions } from "jsonwebtoken";
import { authSchema } from "../modules/auth/index.js";
import { env } from "../config/env.js";
import { ValidationError } from "../errors/errors.js";

const JWT_SECRET = env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = (env.JWT_EXPIRES_IN || "2h") as SignOptions["expiresIn"];

/**
 * Description: สร้าง (sign) JWT token จาก payload ที่กำหนด
 * Input : payload: AccessTokenPayload
 * Output : string (access token)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function signToken(payload: Omit<authSchema.AccessTokenPayload, "iat" | "exp">, exp: SignOptions["expiresIn"] = JWT_EXPIRES_IN) {
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: exp });
}

/**
 * Description: ตรวจสอบความถูกต้องของ JWT และแปลงเป็น AccessTokenPayload ที่ผ่านการ validate
 * Input : token: string โทเคนที่ต้องการตรวจสอบ
 * Output : AccessTokenPayload หากไม่ผ่านจะ throw ValidationError
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function verifyToken(token: string): authSchema.AccessTokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string") {
        throw new ValidationError("Invalid token payload");
    }
    // ตรวจรูปแบบ payload ด้วยสคีมา กัน payload แปลกปลอม
    return authSchema.accessTokenPayload.parse(decoded);
}

/**
 * Description: ถอดรหัส (decode) JWT โดยไม่ตรวจลายเซ็น ใช้เพื่อ inspect เท่านั้น
 * Input : token: string
 * Output : string | jwt.JwtPayload | null ผลลัพธ์อาจเป็น null ถ้า token ไม่ถูกต้อง
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function decodeToken(token: string) {
    return jwt.decode(token);
}
