import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";
import { prisma } from "../../infrastructure/database/client.js";

import {
  EditDepartmentPayload,
  EditSectionPayload,
  IdParamDto,
  ParamEditSecSchema,
  DeleteSectionPayload,
} from "./departments.schema.js";
import { departmentSchema } from "./index.js";
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

/**
 * Description: ตรวจสอบว่าข้อความเป็นภาษาอังกฤษหรือไม่ (รวมช่องว่าง)
 * Input     : text (string) - ข้อความที่ต้องการตรวจสอบ
 * Output    : boolean - true ถ้าเป็นภาษาอังกฤษ, false ถ้าไม่ใช่
 * Note      : ใช้ regex เพื่อตรวจสอบว่ามีเฉพาะตัวอักษร a-z, A-Z และช่องว่างเท่านั้น
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
function isEnglishText(text: string): boolean {
  // อนุญาตให้มี a-z, A-Z, 0-9, และช่องว่าง
  return /^[a-zA-Z0-9\s]+$/.test(text);
}

/**
 * Description: แก้ไขชื่อแผนก (Department) และอัพเดตชื่อฝ่ายย่อยทั้งหมดที่เกี่ยวข้อง
 * Input     : params { id } - รหัสแผนก, payload { department } - ชื่อแผนกใหม่
 * Output    : { message: string } - ผลการแก้ไข
 * Logic     :
 *   - จัดรูปแบบชื่อแผนกให้มีคำว่า "แผนก" นำหน้าอัตโนมัติ
 *   - ดึงฝ่ายย่อยทั้งหมดในแผนกและอัพเดตชื่อ (แทนที่ชื่อแผนกเก่าด้วยใหม่)
 *   - ใช้ transaction เพื่อความปลอดภัยของข้อมูล
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function editDepartment(
  params: IdParamDto,
  payload: EditDepartmentPayload,
) {
  const { id } = params;
  const { department } = payload;

  // จัดรูปแบบชื่อแผนกให้มีคำว่า "แผนก" นำหน้า
  const newDept = department.includes("แผนก")
    ? department // มี "แผนก" อยู่แล้ว ใช้ตามที่กรอกมา
    : isEnglishText(department)
      ? `แผนก ${department}` // ภาษาอังกฤษ เว้นวรรค
      : `แผนก${department}`; // ภาษาไทย ไม่เว้นวรรค

  await prisma.$transaction(async (tx) => {
    // ดึงข้อมูลแผนกเดิมเพื่อเอาชื่อเก่ามาใช้
    const oldDepartment = await tx.departments.findUnique({
      where: { dept_id: id },
      select: { dept_name: true },
    });

    if (!oldDepartment) {
      throw new Error("Department not found");
    }

    const oldDeptName = oldDepartment.dept_name;

    // อัพเดตชื่อแผนกหลัก
    await tx.departments.update({
      where: { dept_id: id },
      data: { dept_name: newDept },
    });

    // ดึงฝ่ายย่อยทั้งหมดในแผนกนี้
    const sections = await tx.sections.findMany({
      where: { sec_dept_id: id },
    });

    // 4. อัพเดตชื่อฝ่ายย่อยทั้งหมด (แทนที่ชื่อแผนกเก่าด้วยใหม่)
    const updatePromises = sections.map((sec) => {
      const newSectionName = sec.sec_name.replace(oldDeptName, newDept);

      return tx.sections.update({
        where: { sec_id: sec.sec_id },
        data: { sec_name: newSectionName },
      });
    });

    await Promise.all(updatePromises);
  });

  return { message: "Department updated successfully" };
}

/**
 * Description: แก้ไขชื่อฝ่ายย่อย (Section) โดยเพิ่มชื่อแผนกและคำว่า "ฝ่ายย่อย" ให้อัตโนมัติ
 * Input     : params { deptId, secId } - รหัสแผนกและรหัสฝ่ายย่อย, payload { section } - ชื่อฝ่ายย่อย
 * Output    : { message: string } - ข้อความแจ้งผลการแก้ไข
 * Logic     :
 *   - ดึงชื่อแผนกมาจาก database ก่อน (ถ้าไม่เจอโยน 404)
 *   - ถ้าชื่อส่วนงานมีคำว่า "ฝ่ายย่อย" อยู่แล้ว → ใช้ชื่อแผนก + ชื่อที่กรอก
 *   - ถ้าเป็นภาษาอังกฤษ → ใช้ชื่อแผนก + "ฝ่ายย่อย " (มีเว้นวรรค) + ชื่อที่กรอก
 *   - ถ้าเป็นภาษาไทย → ใช้ชื่อแผนก + "ฝ่ายย่อย" (ไม่เว้นวรรค) + ชื่อที่กรอก
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function editSection(
  params: ParamEditSecSchema,
  payload: EditSectionPayload,
) {
  const { deptId, secId } = params;
  const { section } = payload;

  // ดึงชื่อแผนกจาก database
  const dept = await prisma.departments.findUnique({
    where: { dept_id: deptId },
    select: { dept_name: true },
  });

  // ตรวจสอบว่าแผนกมีอยู่หรือไม่
  if (!dept) throw new HttpError(HttpStatus.NOT_FOUND, "Department Not Found");

  // จัดรูปแบบชื่อส่วนงานให้มีชื่อแผนกและคำว่า "ฝ่ายย่อย"
  const newSec = section.includes("ฝ่ายย่อย")
    ? `${dept.dept_name} ${section}` // มี "ฝ่ายย่อย" อยู่แล้ว
    : isEnglishText(section)
      ? `${dept.dept_name} ฝ่ายย่อย ${section}` // ภาษาอังกฤษ เว้นวรรค
      : `${dept.dept_name} ฝ่ายย่อย${section}`; // ภาษาไทย ไม่เว้นวรรค

  await prisma.sections.update({
    where: { sec_id: secId },
    data: { sec_name: newSec },
  });

  return { message: "Department updated successfully" };
}

/**
 * Description: ลบฝ่ายย่อย (Section) ตามรหัสฝ่ายย่อย
 * Input     : params { secId } - รหัสฝ่ายย่อย
 * Output    : { message: string } - ข้อความแจ้งผลการลบ
 * Logic     :
 *   - ตรวจสอบว่าฝ่ายย่อยมีอยู่หรือไม่ ถ้าไม่เจอ → โยน 404
 *   - ถ้ามีอยู่ → ลบฝ่ายย่อยจาก database
 * Author    : Niyada Butchan(Da) 66160361
 */
async function deleteSection(params: { sec_id: number }) {
  // ดึงค่า sec_id จาก object params
  const { sec_id } = params;

 // ค้นหา section จากฐานข้อมูลด้วย sec_id
  const section = await prisma.sections.findUnique({
    where: { sec_id },
    select: { sec_name: true },
  });

  if (!section) {
    throw new HttpError(HttpStatus.NOT_FOUND, "Section Not Found");
  }
  
  //ถ้าพบลบข้อมูล section ออกจากฐานข้อมูล
  await prisma.sections.delete({
    where: { sec_id },
  });
  //ส่งผลลัพธ์กลับไปให้ controller
  return { message: "Section deleted successfully" };
}

export const departmentService = {
  getAllDepartment,
  getSectionById,
  editDepartment,
  editSection,
  deleteSection, 
};

