import { prisma } from "../../infrastructure/database/client.js";
import { UpdateMyProfilePayload } from "./users.schema.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";

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
      us_images: true, 
      us_role: true,
      department: { select: { dept_name: true } }, 
      section: { select: { sec_name: true } }
    },
  });

  if (!user) throw new Error("Profile not found");

  return user; // ส่ง raw data ไปเลย
}

/**
   * updateProfile
   * Description: ดำเนินการแก้ไขข้อมูลผู้ใช้งานในฐานข้อมูล Prisma
   * Logic      : 
   * 1. ตรวจสอบการมีอยู่ของบัญชีผู้ใช้งานผ่าน userId
   * 2. หากไม่พบผู้ใช้งาน จะทำการ Throw Error เพื่อขัดขวางการทำงาน
   * 3. อัปเดตข้อมูลที่ได้รับจาก Body (เบอร์โทร)
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

    // 1. เตรียมข้อมูล (ตอนนี้ Schema ปล่อยมาแล้ว เราต้องหยิบมาใช้)
    const updateData: any = {
        us_phone: body.us_phone,
        updated_at: new Date(),
    };

    if (imagePath) {
      updateData.us_images = imagePath;
    }

    // 3. บันทึก
    return await prisma.users.update({
        where: { us_id: userId },
        data: updateData,
    });
}
/**
 * updatePassword
 * Description: ฟังก์ชันสำหรับเปลี่ยนรหัสผ่านผู้ใช้งาน โดยตรวจสอบความถูกต้องของรหัสผ่านเดิม 
 * ตรวจสอบการยืนยันรหัสผ่านใหม่ และทำการเข้ารหัส (Hash) ด้วย Argon2 ก่อนบันทึกลงฐานข้อมูล
 * Input      : 
 * - userId (number)         : รหัสประจำตัวผู้ใช้งาน (ID)
 * - oldPassword (string)    : รหัสผ่านปัจจุบันที่ผู้ใช้กรอก
 * - newPassword (string)    : รหัสผ่านชุดใหม่ที่ต้องการใช้งาน
 * - confirmPassword (string): รหัสผ่านสำหรับยืนยันความถูกต้อง (ต้องตรงกับรหัสผ่านใหม่)
 * Output     : Promise<object> - ข้อมูลผู้ใช้งานที่ได้รับการอัปเดตจาก Prisma
 * Author     : Niyada Butchan (Da) 66160361
 */

async function updatePassword(userId: number, oldPassword: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) throw new Error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");

    const user = await prisma.users.findUnique({ where: { us_id: userId } });
    if (!user) throw new Error("ไม่พบผู้ใช้ในระบบ");

    // เรียกใช้ verifyPassword 
    const isMatch = await verifyPassword(user.us_password, oldPassword);
    if (!isMatch) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");

    // เรียกใช้ hashPassword 
    const hashedNewPassword = await hashPassword(newPassword);
    
    return await prisma.users.update({
        where: { us_id: userId },
        data: { us_password: hashedNewPassword }
    });
}
    


export const usersService = { getProfile, updateProfile, updatePassword };