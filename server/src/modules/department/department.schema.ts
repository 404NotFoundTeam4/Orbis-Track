import { z } from "zod";

export const departmentSchema = z.object({
    dept_id: z.coerce.number(),
    dept_name: z.string()
});

export const sectionSchema = z.object({
    sec_id: z.coerce.number(),
    sec_name: z.string(),
    sec_dept_id: z.coerce.number()
});

export const getAllDepartmentSchema = z.object({
    departments: z.array(departmentSchema)
})

export const getAllSectionSchema = z.object({
    sections: z.array(sectionSchema)
})

export type GetAllDepartmentSchema = z.infer<typeof getAllDepartmentSchema>;

export type GetAllSectionSchema = z.infer<typeof getAllSectionSchema>;