import { departments } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";
import { IdParamDto } from "./departments.schema.js";

/**
 * Description: ดึงข้อมูลทุกแผนกจากฐานข้อมูล
 * Input : void
 * Output : object { departments: Array<{ dept_id: number, dept_name: string }> }
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getAllDepartment() {
  // ดึงข้อมูลแผนกทั้งหมด เลือกเฉพาะ id และชื่อ
  const [departments] = await Promise.all([
    prisma.departments.findMany({
      select: {
        dept_id: true,
        dept_name: true,
      },
    }),
  ]);

  return {
    departments,
  };
}

/**
 * Description: ดึง section ของแผนกตาม id
 * Input : IdParamDto { id: number }
 * Output : object { sections: Array<{ sec_id: number, sec_name: string, sec_dept_id: number }> }
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getSectionById(params: IdParamDto) {
  const { id } = params;
  // ตรวจสอบว่าแผนกมีอยู่ใน DB หรือไม่
  const department = await prisma.departments.findUnique({
    where: { dept_id: id },
  });
  if (!department) throw new Error("departments not found");
  // ดึง sections ของแผนกนั้น
  const sections = await prisma.sections.findMany({
    where: { sec_dept_id: id },
    select: {
      sec_id: true,
      sec_name: true,
      sec_dept_id: true,
    },
  });

  return { sections };
}

export const departmentService = { getAllDepartment, getSectionById };
