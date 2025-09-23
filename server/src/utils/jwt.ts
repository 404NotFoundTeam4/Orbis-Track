import jwt, { SignOptions } from "jsonwebtoken";
import { authSchema } from "../modules/auth/index.js";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = (env.JWT_EXPIRES_IN || "24h") as SignOptions["expiresIn"];


export function signToken(payload: authSchema.JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
}

export function decodeToken(token: string) {
    return jwt.decode(token);
}
