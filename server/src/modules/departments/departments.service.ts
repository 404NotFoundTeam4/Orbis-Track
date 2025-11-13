import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";
import { prisma } from "../../infrastructure/database/client.js";

import {
  DeleteSectionPayload,
  EditDepartmentPayload,
  EditSectionPayload,
  IdParamDto,
  ParamEditSecSchema,
} from "./departments.schema.js";

/**
 * Description: ดึงข้อมูลทุกแผนกจากฐานข้อมูล
 * Input : void
 * Output : object { departments: Array<{ dept_id: number, dept_name: string }> }
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getAllDepartment() {
  // ดึงข้อมูลแผนกทั้งหมด เลือกเฉพาะ id และชื่อ
  const [departments] = await prisma.departments.findMany({
    select: {
      dept_id: true,
      dept_name: true,
    },
  });

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
  payload: EditDepartmentPayload
) {
  const { id } = params;
  const { department } = payload;

  // clean text: ตัดคำว่า "แผนก" ออกจากชื่อที่ผู้ใช้กรอก
  const cleanedName = department
    .replaceAll(/^แผนก\s*/g, "") // ลบคำว่า "แผนก" ต้นประโยค
    .trim(); // ตัดช่องว่างหัวท้าย

  // จัดรูปแบบชื่อแผนกให้มีคำว่า "แผนก" นำหน้า
  const newDept = isEnglishText(cleanedName)
    ? `แผนก ${cleanedName}` // ภาษาอังกฤษ เว้นวรรค
    : `แผนก${cleanedName}`; // ภาษาไทย ไม่เว้นวรรค

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
  payload: EditSectionPayload
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

  // clean text: ตัดคำว่า "ฝ่าย" หรือ "ฝ่ายย่อย" ออกจากชื่อที่ผู้ใช้กรอก
  const cleanedName = section
    .replaceAll(/^ฝ่ายย่อย\s*/g, "") // ลบคำว่า "ฝ่ายย่อย" ต้นประโยค
    .replaceAll(/^ฝ่าย\s*/g, "") // ลบคำว่า "ฝ่าย" ต้นประโยค
    .trim(); // ตัดช่องว่างหัวท้าย

  // จัดรูปแบบชื่อส่วนงานให้มีชื่อแผนกและคำว่า "ฝ่ายย่อย"
  const newSec = isEnglishText(cleanedName)
    ? `${dept.dept_name} ฝ่ายย่อย ${cleanedName}` // ภาษาอังกฤษ เว้นวรรค
    : `${dept.dept_name} ฝ่ายย่อย${cleanedName}`; // ภาษาไทย ไม่เว้นวรรค

  await prisma.sections.update({
    where: { sec_id: secId },
    data: { sec_name: newSec },
  });

  return { message: "Department updated successfully" };
}

/**
 * Description: เพิ่มฝ่ายย่อย (Section) ใหม่ภายใต้แผนกที่เลือก โดยตรวจสอบชื่อซ้ำ
 * Input     : deptId (number) จาก params, section (string) จาก body
 * Output    : object { sec_id: number, sec_name: string, sec_dept_id: number }
 * Logic     :
 *   - ตรวจสอบว่าแผนกมีอยู่จริงในฐานข้อมูล
 *   - ทำความสะอาดชื่อที่รับเข้ามา โดย:
 *       • ตัดคำว่า "ฝ่าย" หรือ "ฝ่ายย่อย" ออกจากชื่อที่ผู้ใช้กรอก
 *       • เพิ่มคำนำหน้า "ฝ่ายย่อย" ให้โดยอัตโนมัติ เช่น input: "ฝ่ายย่อยจัดการ" หรือ "ฝ่ายจัดการ" → บันทึกเป็น "ฝ่ายย่อยจัดการ"
 *   - ตรวจสอบว่าฝ่ายย่อยชื่อเดียวกันในแผนกนั้นมีอยู่แล้วหรือไม่
 *   - ถ้ามี → ส่ง error "Section name already exists in this department"
 *   - ถ้าไม่มี → เพิ่มข้อมูลใหม่ในตาราง sections
 * Author    : Salsabeela Sa-e (San) 66160349
 */
async function addSection(deptId: number, section: string) {
  // ตรวจสอบว่าแผนกมีอยู่จริง
  const dept = await prisma.departments.findUnique({
    where: { dept_id: deptId },
    select: { dept_name: true },
  });
  if (!dept) throw new HttpError(HttpStatus.NOT_FOUND, "Department Not Found");

  // clean text: ตัดคำว่า "ฝ่าย" หรือ "ฝ่ายย่อย" ออกจากชื่อที่ผู้ใช้กรอก
  const cleanedName = section
    .replaceAll(/^ฝ่ายย่อย\s*/g, "") // ลบคำว่า "ฝ่ายย่อย" ต้นประโยค
    .replaceAll(/^ฝ่าย\s*/g, "") // ลบคำว่า "ฝ่าย" ต้นประโยค
    .trim(); // ตัดช่องว่างหัวท้าย

  // เพิ่มคำว่า "ฝ่ายย่อย" กลับเข้าไปตามรูปแบบที่ถูกต้อง
  const formattedName = isEnglishText(cleanedName)
    ? `ฝ่ายย่อย ${cleanedName}` // ภาษาอังกฤษ เว้นวรรค
    : `ฝ่ายย่อย${cleanedName}`; // ภาษาไทย ไม่เว้นวรรค

  // ตรวจสอบว่าฝ่ายย่อยชื่อเดียวกันในแผนกนั้นมีอยู่แล้วหรือไม่
  const existingSection = await prisma.sections.findFirst({
    where: {
      sec_name: formattedName,
      sec_dept_id: deptId,
    },
  });
  if (existingSection)
    throw new HttpError(
      HttpStatus.CONFLICT,
      "Section name already exists in this department"
    );

  // เพิ่มข้อมูลฝ่ายใหม่ลงในฐานข้อมูล
  const createdSection = await prisma.sections.create({
    data: {
      sec_name: formattedName,
      sec_dept_id: deptId,
    },
    select: {
      sec_id: true,
      sec_name: true,
      sec_dept_id: true,
    },
  });

  console.log("New Section Added:", createdSection);
  return createdSection;
}


//    * Description: ดึงข้อมูลแผนก (Department) พร้อมข้อมูลฝ่ายย่อย (Section) ที่อยู่ภายใต้แต่ละแผนก
//  * Input     : None - ไม่ต้องรับพารามิเตอร์ (ดึงทั้งหมด)
//  * Output    : { deptsection: Array } - รายการแผนกแต่ละรายการ พร้อมข้อมูลฝ่ายย่อยภายใน
//  * Logic     :
//  *   - ใช้ Prisma ORM ดึงข้อมูลจากตาราง deptsection
//  *   - เลือกฟิลด์ dept_id และ dept_name จากตารางแผนก
//  *   - ดึงข้อมูล section ที่สัมพันธ์กับแต่ละแผนก (sec_id, sec_name, sec_dept_id)
//  *   - รวมข้อมูลแผนกและฝ่ายย่อยเป็นออบเจกต์เดียวกัน
//  * Author    : Rachata Jitjeankhan (Tang) 66160369
//  */
async function getDeptSection() {
  const deptsection = await prisma.departments.findMany({
    select: {
      dept_id: true,
      dept_name: true,
      sections: {
        select: {
          sec_id: true,
          sec_name: true,
          sec_dept_id: true,
        },
      },
    },
  });

  // ตัดคำว่า "แผนก" และ "ฝ่ายย่อย" ออกจากชื่อ
  const cleanedDeptSection = deptsection.map((dept: any) => ({
    ...dept,
    dept_name: dept.dept_name.replace(/แผนก/g, "").trim(), // เอา "แผนก" ออก
    sections: dept.sections.map((sec: any) => ({
      ...sec,
      sec_name: sec.sec_name.replace(dept.dept_name, "").trim(),
    })),
  }));

  return { deptsection: cleanedDeptSection };
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
async function deleteSection(params: DeleteSectionPayload) {
  // ดึงค่า sec_id จาก object params
  const sec_id = params.secId;

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
  addSection,
  getDeptSection,
  deleteSection,
};

