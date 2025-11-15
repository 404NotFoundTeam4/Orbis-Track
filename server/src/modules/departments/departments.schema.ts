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
});

export const sectionWithPeopleSchema = z.object({
    sec_id: z.coerce.number(),
    sec_name: z.string(),
    sec_dept_id: z.coerce.number(),
    people_count: z.number(),
});

export const departmentSectionSchema = z.object({
    dept_id: z.number(),
    dept_name: z.string(),
    people_count: z.number().optional(),
    sections: z.array(sectionWithPeopleSchema), // nested sections
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
 * Input     : { sec_name: string } - ชื่อฝ่ายย่อยที่ต้องการเพิ่ม
 * Output    : Object ที่ผ่านการตรวจสอบแล้วตามโครงสร้าง { sec_name: string }
 * Logic     :
 *   - ตรวจสอบว่าค่าที่ส่งเข้ามาเป็น string
 *   - ใช้สำหรับ validate ข้อมูลก่อนส่งต่อไปยัง service หรือ controller
 * Author    : Salsabeela Sa-e (San) 66160349
 */
export const addSectionPayload = z.object({
    sec_name: z.string(),
});

export const getDeptSection = z.object({
    dept_id: z.coerce.number().positive(),
    dept_name: z.string(),
    sections: z.array(sectionSchema)
})

/** Data wrapper */
export const deptSectionSchema = z.object({
    deptsection: z.array(departmentSectionSchema),
});

//Schema สำหรับ delete section
export const deleteSectionSchema = z.object({
    secId: z.coerce.number().positive(),
});

// Author: Sutaphat Thahin (Yeen) 66160378

// ตรวจสอบข้อมูลที่ใช้ในการเพิ่มแผนกใหม่ (รับเข้ามา)
export const addDepartmentsPayload = z.object({
    dept_name: z.string()
})

// ตรวรสอบข้อมูลแผนกหลังเพิ่มแผนกสำเร็จ
export const addDepartmentsSchema = z.object({
    dept_id: z.coerce.number(),
    dept_name: z.string(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable()
})

//Type สำหรับใช้ใน TypeScript
export type GetDeptSection = z.infer<typeof getDeptSection>;

export type DeleteSectionPayload = z.infer<typeof deleteSectionSchema>;

export type EditDepartmentPayload = z.infer<typeof editDepartmentPayload>;

export type EditSectionPayload = z.infer<typeof editSectionPayload>;

export type GetAllDepartmentSchema = z.infer<typeof getAllDepartmentSchema>;

export type GetAllSectionSchema = z.infer<typeof getAllSectionSchema>;

export type IdParamDto = z.infer<typeof idParamSchema>;

export type ParamEditSecSchema = z.infer<typeof paramEditSecSchema>;

/**
 * Description: กำหนดชนิดข้อมูล (Type) สำหรับการเพิ่มฝ่ายย่อย (Section)
 * Source     : อ้างอิงจาก Schema addSectionPayload ที่สร้างด้วย Zod
 * Usage      : ใช้สำหรับระบุชนิดข้อมูลของ payload ที่ผ่านการตรวจสอบแล้ว
 * Output     : TypeScript type - { sec_name: string }
 * Author     : Salsabeela Sa-e (San) 66160349
 */
export type AddSecSchema = z.infer<typeof addSectionPayload>;

export type DeptSectionSchema = z.infer<typeof deptSectionSchema>;

export type AddDepartmentsPayload = z.infer<typeof addDepartmentsPayload>

export type AddDepartmentsSchema = z.infer<typeof addDepartmentsSchema>
