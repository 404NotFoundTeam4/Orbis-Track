import { z } from "zod";

// Author: Nontapat Sinthum (Guitar) 66160104

export const idParamSchema = z.object({
    id: z.coerce.number().positive(),
});

export const paramEditSecSchema = z.object({
    deptId: z.coerce.number().positive(),
    secId: z.coerce.number().positive()
})

export const sectionSchema = z.object({
    sec_id: z.coerce.number(),
    sec_name: z.string(),
    sec_dept_id: z.coerce.number()
});

export const departmentSchema = z.object({
    dept_id: z.number(),
    dept_name: z.string(),
    sections: z.array(sectionSchema), // nested sections
});

export const getAllDepartmentSchema = z.object({
    departments: z.array(departmentSchema)
})

export const getAllSectionSchema = z.object({
    sections: z.array(sectionSchema)
})

export const editDepartmentPayload = z.object({
    department: z.string().min(1)
})

export const editSectionPayload = z.object({
    section: z.string().min(1)
})

export const getDeptSection = z.object({
    dept_id: z.coerce.number().positive(),
    dept_name: z.string(),
    sections: z.array(sectionSchema)
})

/** Data wrapper */
export const deptSectionSchema = z.object({
    deptsection: z.array(departmentSchema),
});

export type GetDeptSection = z.infer<typeof getDeptSection>;

export type EditDepartmentPayload = z.infer<typeof editDepartmentPayload>;

export type EditSectionPayload = z.infer<typeof editSectionPayload>;

export type GetAllDepartmentSchema = z.infer<typeof getAllDepartmentSchema>;

export type GetAllSectionSchema = z.infer<typeof getAllSectionSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type ParamEditSecSchema = z.infer<typeof paramEditSecSchema>;

export type DeptSectionSchema = z.infer<typeof deptSectionSchema>;
