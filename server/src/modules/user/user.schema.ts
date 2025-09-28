import { z } from "zod";

export const IdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const CreateUserSchema = z.object({
    emp_code: z.string().max(50).nullable().optional(),
    firstname: z.string().max(120),
    lastname: z.string().max(120),
    username: z.string().max(120),
    password: z.string().max(255),
    email: z.string().email().max(120).nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
    images: z.string().nullable().optional(),
    role_id: z.coerce.number().int().positive(),
    dept_id: z.coerce.number().int().positive().nullable().optional(),
    sec_id: z.coerce.number().int().positive().nullable().optional(),
    is_active: z.boolean().default(true),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type IdParamDto = z.infer<typeof IdParamSchema>;