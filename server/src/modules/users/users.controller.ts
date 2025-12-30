import type { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  updateMyProfilePayload,
  changePasswordSchema,
} from "./users.schema.js";
import { ValidationError } from "../../errors/errors.js";

export class UsersController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้งานจาก Identity ใน Token
   * Input : Identity จาก Token (req.user)
   * Output : BaseResponse { data: profile object }
   * Author: Niyada Butchan (Da) 66160361
   */
 async getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<BaseResponse> {
  const user = (req as any).user;
  const userId = Number(user?.us_id || user?.id || user?.sub);
  
  if (!userId || isNaN(userId)) {
    throw new ValidationError("User identity not found in token");
  }

  const profile = await usersService.getProfile(userId);
  return { data: profile };
}

  /**
   * updateMyProfile
   * Description : จัดการคำขออัปเดตข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้งานพร้อมการอัปโหลดรูปภาพ
   * Input       : req (ดึงข้อมูลจาก body และ file), res, next
   * Output      : BaseResponse { data: result, message: "อัปเดตข้อมูลโปรไฟล์สำเร็จ" }
   * Author      : Niyada Butchan (Da) 66160361
   */
 async updateMyProfile(
    req: any, // ใช้ any เพื่อให้รองรับ req.file จาก Multer โดยไม่ต้องใช้ as any ใน Route
    res: any,
    next: any
  ): Promise<BaseResponse> {
    const user = req.user;
    const userId = Number(user?.us_id || user?.id || user?.sub);

    if (!userId || isNaN(userId)) {
      throw new ValidationError("ไม่พบข้อมูลผู้ใช้ในระบบ");
    }

    // จัดการไฟล์รูปภาพ 
    const imagePath = req.file ? req.file.path : null;

    // ตรวจสอบข้อมูลความถูกต้องผ่าน Schema 
    const validatedData = updateMyProfilePayload.parse(req.body);

    // เรียกใช้งาน Service 
    const result = await usersService.updateProfile(userId, validatedData, imagePath);

    return {
      data: result,
      message: "อัปเดตข้อมูลโปรไฟล์สำเร็จ",
    };
    }

  /**
   * Description: จัดการคำขอเปลี่ยนรหัสผ่านของผู้ใช้งาน
   * Input : req.body (oldPassword, newPassword, confirmPassword)
   * Output : BaseResponse { message: string }
   * Author: Niyada Butchan (Da) 66160361
   */
  async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<void>> {
    const user = (req as any).user;
    const userId = Number(user?.us_id || user?.id || user?.sub);

    if (!userId || isNaN(userId)) {
      throw new ValidationError("ไม่พบข้อมูลผู้ใช้ในระบบ");
    }

    // 1. ตรวจสอบ Schema ของข้อมูลรหัสผ่าน
    const validatedData = changePasswordSchema.parse(req.body);

    // 2. เรียก Service เพื่อดำเนินการตรวจสอบและอัปเดต
    await usersService.updatePassword(
      userId,
      validatedData.oldPassword,
      validatedData.newPassword,
      validatedData.confirmPassword
    );

    return {
      message: "เปลี่ยนรหัสผ่านสำเร็จ!",
    };
  }
}

export const usersController = new UsersController();