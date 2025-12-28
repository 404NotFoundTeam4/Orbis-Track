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



updateMyProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const userId = Number(user?.us_id || user?.id || user?.sub);
       console.log("FILE:", req.file);
    console.log("BODY:", req.body);


    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้ในระบบ" });
    }

    const validatedBody = updateMyProfilePayload.parse(req.body);
    const imagePath = req.file ? req.file.filename : null;

    await usersService.updateProfile(userId, validatedBody, imagePath);

    const updatedProfile = await usersService.getProfile(userId);

    return res.status(200).json({
      message: "Updated successfully",
      data: updatedProfile
    });

  } catch (error: any) {
    console.error("Update Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

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