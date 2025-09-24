import { Response, NextFunction } from "express";
import { authSchema } from "../modules/auth/index.js";
import { HttpStatus } from '../core/http-status.enum.js';
import { HttpError } from "../errors/errors.js";
import { UserRole } from "../core/roles.enum.js";

export function requireRole(roles: UserRole[]) {
    return (req: authSchema.AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new HttpError(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        if (!roles.includes(req.user.role_id)) {
            throw new HttpError(HttpStatus.FORBIDDEN, "Forbidden");
        }

        next();
    };
}