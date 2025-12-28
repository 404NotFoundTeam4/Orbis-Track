import { prisma } from "../../infrastructure/database/client.js";
import { UpdateMyProfilePayload } from "./users.schema.js";
import * as argon2 from "argon2"; 

/**
 * Description: Service สำหรับจัดการข้อมูลโปรไฟล์ผู้ใช้งาน (User Profile)
 * Functions   : 
 * - getProfile: ดึงข้อมูลโปรไฟล์โดยละเอียดพร้อมชื่อแผนกและฝ่ายย่อย
 * - updateProfile: อัปเดตข้อมูลโปรไฟล์และรูปภาพประจำตัว
 * Author      : Niyada Butchan (Da) 66160361
 */
// server/src/modules/users/users.service.ts
async function getProfile(userId: number) {
  const user = await prisma.users.findUnique({
    where: { us_id: userId },
    select: {
      us_id: true,
      us_firstname: true,
      us_lastname: true,
      us_username: true,
      us_emp_code: true,
      us_email: true,
      us_phone: true,
      us_images: true, // เก็บชื่อไฟล์รูปภาพ
      us_role: true,
      department: { select: { dept_name: true } },
      section: { select: { sec_name: true } }
    },
  });

  if (!user) throw new Error("Profile not found");

  const SERVER_URL = process.env.API_URL ;

  // คืนค่า Object เดียวที่รวมข้อมูลทุกอย่างแล้ว
  return {
    ...user,
    // ต้องมี /uploads/ เพื่อให้ตรงกับ static path ที่ตั้งไว้
    us_images: user.us_images 
  ? `${SERVER_URL}/uploads/${user.us_images.replace('uploads/', '')}?t=${new Date().getTime()}` 
  
  : null,
    us_dept_name: user.department?.dept_name || null,
    us_sec_name: user.section?.sec_name || null,
  };
}

// server/src/modules/users/users.service.ts

async function updateProfile(userId: number, body: UpdateMyProfilePayload, imagePath: string | null) {
    const user = await prisma.users.findUnique({ where: { us_id: userId } });
    if (!user) throw new Error("Account not found");

    return await prisma.users.update({
        where: { us_id: userId },
        data: {
            us_firstname: body.us_firstname,
            us_lastname: body.us_lastname,
            us_phone: body.us_phone,
            us_email: body.us_email,           
            us_images: imagePath ? imagePath : user.us_images,
            updated_at: new Date(),
        },
    });
}

export const updatePassword = async (userId: number, oldPassword: string, newPassword: string) => {
  // ดึงข้อมูล User มาจาก DB
  const user = await prisma.users.findUnique({ where: { us_id: userId } });
  
  if (!user) {
    const error: any = new Error("ไม่พบผู้ใช้ในระบบ");
    error.status = 404;
    throw error;
  }

  // ตรวจสอบรหัสผ่าน: คืนค่าเป็น boolean (true/false)

const isMatch = await argon2.verify(user.us_password, oldPassword);

  
  //  ถ้า false ให้หยุดและ throw error ทันที
  if (!isMatch) {
    const error: any = new Error("รหัสผ่านเดิมไม่ถูกต้อง");
    error.status = 400; 
    throw error; // บรรทัดนี้จะหยุดฟังก์ชันนี้ และส่ง error ไปที่ Controller
  }

  // ถ้าผ่านมาถึงตรงนี้แสดงว่ารหัสถูก
  const hashedNewPassword = await argon2.hash(newPassword);

  return await prisma.users.update({
    where: { us_id: userId },
    data: { us_password: hashedNewPassword }
  });
};
    


export const usersService = { getProfile, updateProfile, updatePassword };