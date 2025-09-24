import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "../errors/errors.js";
import { HttpStatus } from "../core/http-status.enum.js";
import { authSchema } from "../modules/auth/index.js";
import { isTokenBlacklisted } from "../modules/auth/token-blacklist.service.js";


export async function authMiddleware(req: authSchema.AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Missing or malformed Authorization header");
    }

    const token = authHeader.slice(7).trim();

    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Token revoked");
    }

    try {
        const payload = verifyToken(token) as authSchema.AccessTokenPayload;
        req.user = payload;
        return next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw new HttpError(HttpStatus.UNAUTHORIZED, "Token expired");
        }
        throw new HttpError(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
}
