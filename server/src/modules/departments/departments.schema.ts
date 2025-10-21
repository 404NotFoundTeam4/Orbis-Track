import { z } from "zod";

// Author: Nontapat Sinthum (Guitar) 66160104

export const idParamSchema = z.object({
    id: z.coerce.number().positive(),
});

export const paramEditSecSchema = z.object({
    deptId: z.coerce.number().positive(),
    secId: z.coerce.number().positive()
})

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

export const editDepartmentPayload = z.object({
    department: z.string().min(1)
})

export const editSectionPayload = z.object({
    section: z.string().min(1)
})

/**
 * Description: Schema สำหรับตรวจสอบข้อมูลที่ใช้ในการเพิ่มฝ่ายย่อย (Section)
 * Input     : { section: string } - ชื่อฝ่ายย่อยที่ต้องการเพิ่ม (ต้องไม่เป็นค่าว่าง)
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามโครงสร้าง { section: string }
 * Author    : Salsabeela Sa-e (San) 66160349
 */
export const addSectionPayload = z.object({
    sec_name: z.string(), 
});



export type EditDepartmentPayload = z.infer<typeof editDepartmentPayload>;

export type EditSectionPayload = z.infer<typeof editSectionPayload>;

export type GetAllDepartmentSchema = z.infer<typeof getAllDepartmentSchema>;

export type GetAllSectionSchema = z.infer<typeof getAllSectionSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type ParamEditSecSchema = z.infer<typeof paramEditSecSchema>;

export type AddSecSchema = z.infer<typeof addSectionPayload>;