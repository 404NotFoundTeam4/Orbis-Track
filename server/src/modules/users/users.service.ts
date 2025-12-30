import { prisma } from "../../infrastructure/database/client.js";
import { UpdateMyProfilePayload } from "./users.schema.js";
import * as argon2 from "argon2"; 

/**
 * Description: Service สำหรับจัดการข้อมูลโปรไฟล์ผู้ใช้งาน (User Profile)
 * Logic      : ดึงข้อมูลโปรไฟล์จากฐานข้อมูล Prisma และจัดการรูปภาพให้เป็น URL ที่สามารถใช้งานได้จริง
 * Input       : userId - ID ของผู้ใช้งาน
 * Output      : Object ข้อมูลโปรไฟล์พร้อม URL รูปภาพที่ใช้งานได้จริง
 * Author      : Niyada Butchan (Da) 66160361
 */

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

/**
   * updateProfile
   * Description: ดำเนินการแก้ไขข้อมูลผู้ใช้งานในฐานข้อมูล Prisma
   * Logic      : 
   * 1. ตรวจสอบการมีอยู่ของบัญชีผู้ใช้งานผ่าน userId
   * 2. หากไม่พบผู้ใช้งาน จะทำการ Throw Error เพื่อขัดขวางการทำงาน
   * 3. อัปเดตข้อมูลที่ได้รับจาก Body (ชื่อ, นามสกุล, เบอร์โทร, อีเมล)
   * 4. ตรวจสอบรูปภาพ: หากมีการอัปโหลดใหม่จะใช้ Path ใหม่ หากไม่มีจะคงค่าเดิมในฐานข้อมูลไว้
   * 5. บันทึกเวลาที่มีการแก้ไขล่าสุดลงในฟิลด์ updated_at
   * Input      : 
   * - userId: ID ของผู้ใช้งานที่ต้องการอัปเดต
   * - body: ข้อมูลใหม่จาก Payload (UpdateMyProfilePayload)
   * - imagePath: เส้นทางจัดเก็บรูปภาพ (ถ้ามี)
   * Output     : Object ข้อมูลผู้ใช้งานที่ผ่านการอัปเดตแล้ว
   * Author     : Niyada Butchan (Da) 66160361
   */

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
/**
   * updatePassword
   * Description: ตรวจสอบความถูกต้องของรหัสผ่านเดิม และดำเนินการเปลี่ยนรหัสผ่านใหม่โดยการเข้ารหัสด้วย Argon2
   * Input      : 
   * - userId: รหัสประจำตัวผู้ใช้งาน (ID)
   * - oldPassword: รหัสผ่านปัจจุบันที่ผู้ใช้กรอก
   * - newPassword: รหัสผ่านชุดใหม่ที่ต้องการใช้งาน
   * - confirmPassword: รหัสผ่านเพื่อยืนยันความถูกต้อง (ใช้สำหรับตรวจสอบความตรงกันก่อนบันทึก)
   * Output     : ข้อมูลบันทึกผลการอัปเดตจาก Prisma Database
   * Author     : Niyada Butchan (Da) 66160361
   */

export const updatePassword = async (userId: number, oldPassword: string, newPassword: string, confirmPassword: string) => {
  
  // 1. เช็คว่ารหัสใหม่ตรงกับยืนยันรหัสหรือไม่ 
  if (newPassword !== confirmPassword) {
    const error: any = new Error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
    error.status = 400;
    throw error;
  }

  const user = await prisma.users.findUnique({ where: { us_id: userId } });
  if (!user) {
    const error: any = new Error("ไม่พบผู้ใช้ในระบบ");
    error.status = 404;
    throw error;
  }

  // 2. ตรวจสอบรหัสผ่านเดิม
  const isMatch = await argon2.verify(user.us_password, oldPassword);
  if (!isMatch) {
    const error: any = new Error("รหัสผ่านเดิมไม่ถูกต้อง");
    error.status = 400; 
    throw error;
  }

  // 3. เข้ารหัสและบันทึก
  const hashedNewPassword = await argon2.hash(newPassword);
  return await prisma.users.update({
    where: { us_id: userId },
    data: { us_password: hashedNewPassword }
  });
};
    


export const usersService = { getProfile, updateProfile, updatePassword };