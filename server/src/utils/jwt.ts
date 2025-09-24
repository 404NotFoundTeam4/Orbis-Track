import jwt, { SignOptions } from "jsonwebtoken";
import { authSchema } from "../modules/auth/index.js";
import { env } from "../config/env.js";
import { ValidationError } from "../errors/errors.js";

const JWT_SECRET = env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = (env.JWT_EXPIRES_IN || "24h") as SignOptions["expiresIn"];


export function signToken(payload: Omit<authSchema.AccessTokenPayload, "iat" | "exp">) {
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): authSchema.AccessTokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string") {
        throw new ValidationError("Invalid token payload");
    }
    return authSchema.accessTokenPayload.parse(decoded);
}

export function decodeToken(token: string) {
    return jwt.decode(token);
}
