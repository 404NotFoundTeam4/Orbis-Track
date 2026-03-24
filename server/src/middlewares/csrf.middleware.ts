import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/errors.js";
import { HttpStatus } from "../core/http-status.enum.js";
import { env } from "../config/env.js";
import crypto from "crypto";

// CSRF Token storage (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

const CSRF_COOKIE_NAME = "orbistrack_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Description: Generate CSRF token for double-submit cookie pattern
 * Input : sessionId (can be user sub or session identifier)
 * Output : { token: string, cookieToken: string }
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export function generateCsrfToken(sessionId: string): { token: string; cookieToken: string } {
    const token = crypto.randomBytes(32).toString("hex");
    const cookieToken = crypto.randomBytes(32).toString("hex");

    // Store mapping with expiration (24 hours)
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    csrfTokens.set(sessionId, { token, expires });

    return { token, cookieToken };
}

/**
 * Description: CSRF Protection Middleware - Double Submit Cookie Pattern
 * Validates that the CSRF token in the header matches the one in the cookie
 * Input : req.cookies[CSRF_COOKIE_NAME], req.headers[CSRF_HEADER_NAME]
 * Output : next() if valid, throws HttpError 403 if invalid
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
    // Skip CSRF for safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    // Skip if no cookie-based auth (Bearer token is already stateless protection)
    const hasCookieAuth = req.cookies?.["orbistrack_jwt"];
    if (!hasCookieAuth) {
        return next();
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;

    if (!cookieToken || !headerToken) {
        throw new HttpError(
            HttpStatus.FORBIDDEN,
            "CSRF token missing. Please include x-csrf-token header."
        );
    }

    // In production, verify token against stored value
    // For now, we use double-submit pattern (cookie vs header)
    // In a full implementation, you'd verify the token is valid and not expired

    // Simple timing-safe comparison
    try {
        const cookieBuf = Buffer.from(cookieToken);
        const headerBuf = Buffer.from(headerToken);

        if (cookieBuf.length !== headerBuf.length) {
            throw new HttpError(HttpStatus.FORBIDDEN, "CSRF token mismatch");
        }

        const match = crypto.timingSafeEqual(cookieBuf, headerBuf);
        if (!match) {
            throw new HttpError(HttpStatus.FORBIDDEN, "CSRF token mismatch");
        }
    } catch {
        throw new HttpError(HttpStatus.FORBIDDEN, "CSRF token invalid");
    }

    return next();
}

/**
 * Description: Middleware to set CSRF token cookie
 * Should be called after successful authentication
 * Input : req.user.sub (user ID)
 * Output : Sets CSRF cookie
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user?.sub;
    if (!userId) {
        return next();
    }

    const { token, cookieToken } = generateCsrfToken(userId.toString());

    // Set double-submit cookie (HttpOnly: false, so JS can read it for comparison)
    res.cookie(CSRF_COOKIE_NAME, cookieToken, {
        httpOnly: false, // Must be readable by JavaScript
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Store the server-side token for validation
    // In production, use Redis instead of in-memory Map

    // Return token in header for immediate use
    res.setHeader("X-CSRF-Token", token);

    return next();
}

/**
 * Description: Clear CSRF token on logout
 * Input : res
 * Output : Clears CSRF cookie
 */
export function clearCsrfToken(res: Response): void {
    res.clearCookie(CSRF_COOKIE_NAME, { path: "/" });
}
