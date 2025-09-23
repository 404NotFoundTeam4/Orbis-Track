import { z } from "zod";

export const loginPayload = z.object({
    username: z.string().min(1),
    passwords: z.string().min(1),
});

export const jwtPayload = z.object({
    sub: z.coerce.number().int().positive(), // user_id
    username: z.string().min(1),
    role_id: z.coerce.number().int().positive(),
    dept_id: z.coerce.number().int().positive().nullable().optional(),
    sec_id: z.coerce.number().int().positive().nullable().optional(),
    is_active: z.boolean().default(true),
})

export const tokenDto = z.object({
    token: z.string().min(1),
})


export type TokenDto = z.infer<typeof tokenDto>;
export type LoginPayload = z.infer<typeof loginPayload>;
export type JwtPayload = z.infer<typeof jwtPayload>;