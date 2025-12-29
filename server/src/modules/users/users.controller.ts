import { Request, Response } from "express";
import { usersService } from "./users.service.js";
import { updateMyProfilePayload } from "./users.schema.js"; 
import { changePasswordSchema } from "./users.schema.js";
import { z } from "zod"; // 


/**
 * Description: Controller สำหรับจัดการคำขอ (Request) เกี่ยวกับโปรไฟล์ผู้ใช้งาน
 * Functions   : 
 * - getMyProfile: รับคำขอเพื่อดึงข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้งานจาก Token
 * - updateMyProfile: รับคำขอเพื่ออัปเดตข้อมูลโปรไฟล์และจัดการไฟล์รูปภาพ (Multer)
 * Author      : Niyada Butchan (Da) 66160361
 */

export class UsersController {
   getMyProfile = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = Number(user?.us_id || user?.id || user?.sub);

        if (!userId || isNaN(userId)) {
            return res.status(401).json({ message: "User identity not found in token" });
        }

        const profile = await usersService.getProfile(userId);
        return res.status(200).json(profile);

    } catch (error: any) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            message: error.message || "ไม่สามารถดึงข้อมูลโปรไฟล์ได้"
        });
    }
};

/**
   * updatePassword
   * Description: จัดการคำขอเปลี่ยนรหัสผ่าน โดยมีการตรวจสอบความถูกต้องของข้อมูลและตัวตน
   * Logic      : 
   * 1. ตรวจสอบ Identity ของผู้ใช้จาก Token (userId)
   * 2. ตรวจสอบโครงสร้างข้อมูล (Validation) ด้วย changePasswordSchema
   * 3. เรียกใช้งาน usersService เพื่อเปรียบเทียบรหัสผ่านเดิมและบันทึกรหัสผ่านใหม่
   * 4. จัดการ Error เฉพาะกรณี (เช่น ZodError หรือข้อผิดพลาดจาก Service) เพื่อส่ง Response ที่เหมาะสม
   * Output     : JSON Response แสดงสถานะการดำเนินการ (Success: true/false)
   * Author     : Niyada Butchan (Da) 66160361
   */

updatePassword = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = Number(user?.us_id || user?.id || user?.sub);

        if (!userId || isNaN(userId)) {
            return res.status(401).json({ success: false, message: "ไม่พบข้อมูลผู้ใช้ในระบบ" });
        }

        // 1. ตรวจสอบ Schema (ตรวจสอบว่าได้ import z จาก zod หรือยัง)
        const validatedData = changePasswordSchema.parse(req.body);

        // 2. เรียก Service ตรวจสอบและอัปเดต
        await usersService.updatePassword(
            userId, 
            validatedData.oldPassword, 
            validatedData.newPassword
        );

        // ส่งสำเร็จและจบการทำงาน (ใช้ return เพื่อไม่ให้โค้ดไหลต่อ)
        return res.status(200).json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ!" });

    } catch (error: any) {
        // ป้องกัน ERR_HTTP_HEADERS_SENT: ถ้ามีการส่ง Response ไปแล้วให้หยุดทันที
        if (res.headersSent) return;

        console.error("DEBUG ERROR:", error.message); // Log เฉพาะข้อความเพื่อเลี่ยง Circular structure

        // กรณีเป็น Zod Validation Error (อย่าลืม import { z } from "zod")
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง"
            });
        }

        // กรณีรหัสผ่านไม่ถูกต้อง หรือ Error อื่นๆ ที่เรา throw มาจาก Service
        const statusCode = error.status || 500;
        const message = error.message || "เกิดข้อผิดพลาดภายในระบบ";

        return res.status(statusCode).json({ 
            success: false,
            message: message // ส่งเฉพาะ string message
        });
    }
};
}
export const usersController = new UsersController();