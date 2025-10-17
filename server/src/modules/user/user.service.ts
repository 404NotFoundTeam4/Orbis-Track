import { prisma } from "../../infrastructure/database/client.js";
import { EditUserSchema, IdParamDto } from "./user.schema.js";

/**
 * ดึงข้อมูลผู้ใช้ตาม id
 * Input: params - object { id: number }
 * Output: ข้อมูลผู้ใช้ (select fields)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getUserById(params: IdParamDto) {
  const { id } = params;
  const user = await prisma.users.findUnique({ where: { us_id: id } });
  if (!user) throw new Error("account not found");
  return prisma.users.findUnique({
    where: { us_id: id },
    select: {
      us_id: true,
      us_firstname: true,
      us_lastname: true,
      us_username: true,
      us_emp_code: true,
      us_email: true,
      us_phone: true,
      us_images: true,
      us_role: true,
      us_dept_id: true,
      us_sec_id: true,
      us_is_active: true,
      created_at: true,
      updated_at: true,
    },
  });
}

/**
 * Description: ดึงข้อมูลพนักงานพร้อมแผนก และฝ่ายย่อย
 * Input : -
 * Output : ข้อมูลพนักงานพร้อมแนก และฝ่ายย่อย
 * Author: Thakdanai Makmi (Ryu) 66160355
 */

async function getAllUsers() {
  const [departments, sections, users] = await Promise.all([
    prisma.departments.findMany({
      select: {
        dept_id: true,
        dept_name: true,
      },
    }),
    prisma.sections.findMany({
      select: {
        sec_id: true,
        sec_name: true,
        sec_dept_id: true,
      },
    }),
    prisma.users.findMany({
      select: {
        us_id: true,
        us_emp_code: true,
        us_firstname: true,
        us_lastname: true,
        us_username: true,
        us_email: true,
        us_phone: true,
        us_images: true,
        us_role: true,
        us_dept_id: true,
        us_sec_id: true,
        us_is_active: true,
        created_at: true,
      },
    }),
  ]);

  // แปลงแผนกและฝ่ายย่อยเป็นข้อความ
  const userWithDetails = users.map((user) => {
    // หา dept_id ที่ตรงกับ us_dept_id
    const deptpartment = departments.find(
      (data) => data.dept_id === user.us_dept_id
    );
    // หา sec_id ที่ตรงกับ us_sec_id
    const section = sections.find((data) => data.sec_id === user.us_sec_id);

    // คืนค่าพร้อมขื่อแผนกและฝ่ายย่อย
    return {
      ...user,
      us_dept_name: deptpartment?.dept_name,
      us_sec_name: section?.sec_name,
    };
  });

  return {
    departments,
    sections,
    userWithDetails,
  };
}

/**
 * Description: อัปเดตข้อมูลผู้ใช้ตาม id
 * Input :
 * - id: number
 * - data: Partial<{ us_firstname, us_lastname, us_username, us_emp_code, us_email, us_phone, us_images, us_role, us_dept_id, us_sec_id }>
 * Output : updated user object
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function updateUser(params: IdParamDto, body: EditUserSchema) {
  const { id } = params;
  const user = await prisma.users.findUnique({ where: { us_id: id } });
  if (!user) throw new Error("account not found");
  // ใช้ Prisma fully qualified type
  await prisma.users.update({
    where: { us_id: id },
    data: {
      ...body,
      updated_at: new Date(),
    },
  });
  return { message: "User updated successfully" };
}

export const userService = { getUserById, getAllUsers, updateUser };
