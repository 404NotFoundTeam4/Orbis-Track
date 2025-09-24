import { z } from "zod";
import { Request } from "express";

export const loginPayload = z.object({
    username: z.string().min(1),
    passwords: z.string().min(1),
}).strict();

export const accessTokenPayload = z.object({
    sub: z.coerce.number().int().positive(), // user_id
    username: z.string().min(1),
    role_id: z.coerce.number().int().positive(),
    dept_id: z.coerce.number().int().positive().nullable().optional(),
    sec_id: z.coerce.number().int().positive().nullable().optional(),
    is_active: z.boolean().default(true),
    iat: z.number().optional(),
    exp: z.number().optional(),
}).strict();

export const tokenDto = z.object({
    accessToken: z.string().min(1),
}).strict();

export interface AuthRequest extends Request {
    user?: AccessTokenPayload;
}

export type TokenDto = z.infer<typeof tokenDto>;
export type LoginPayload = z.infer<typeof loginPayload>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayload>;