import { z } from "zod";
import { UserRole } from "../../core/roles.enum.js";

export const idParamSchema = z.object({
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

export const departmentSchema = z.object({
    dept_id: z.coerce.number(),
    dept_name: z.string()
});

export const sectionSchema = z.object({
    sec_id: z.coerce.number(),
    sec_name: z.string(),
    sec_dept_id: z.coerce.number()
});

export const userSchema = z.object({
    us_id: z.coerce.number(),
    us_emp_code: z.string().optional().nullable(),
    us_firstname: z.string(),
    us_lastname: z.string(),
    us_username: z.string(),
    us_email: z.string(),
    us_phone: z.string(),
    us_images: z.string().optional().nullable(),
    us_role: z.string(),
    us_dept_id: z.coerce.number().optional().nullable(),
    us_sec_id: z.coerce.number().optional().nullable(),
    us_is_active: z.boolean(),
    created_at: z.coerce.date().nullable(),
    us_dept_name: z.string().optional(),
    us_sec_name: z.string().optional(),
});

// Author: Nontapat Sinthum (Guitar) 66160104

export const editUserSchema = z.object({
    us_firstname: z.string().optional(),
    us_lastname: z.string().optional(),
    us_username: z.string().optional(),
    us_emp_code: z.string().optional(),
    us_email: z.string().email().optional(),
    us_phone: z.string().optional(),
    us_images: z.string().optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    us_dept_id: z.number().optional(),
    us_sec_id: z.number().optional(),
})

export const getAllUsersResponseSchema = z.object({
    departments: z.array(departmentSchema),
    sections: z.array(sectionSchema),
    userWithDetails: z.array(userSchema)
});

export type EditUserSchema = z.infer<typeof editUserSchema>;

export type GetAllUsersResponseSchema = z.infer<typeof getAllUsersResponseSchema>;

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;