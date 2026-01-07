import type { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  updateMyProfilePayload,
  changePasswordSchema,
  UpdateMyProfilePayload,
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

  // sub และแปลงเป็น Number
  const userId = Number(user?.sub);

  // เช็คว่าแปลงสำเร็จไหม
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
  req: Request, 
  res: Response,
  next: NextFunction
): Promise<BaseResponse> {
  const user = (req as any).user;
    const userId = Number(user?.sub);

    if (!userId || isNaN(userId)) {
      throw new ValidationError("ไม่พบข้อมูลผู้ใช้ในระบบ");
    }
 
    const imagePath = req.file ? req.file.path : null;
    const validatedData = updateMyProfilePayload.parse(req.body);
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
    
    const userId = Number(user?.sub);

    if (!userId || isNaN(userId)) {
      throw new ValidationError("ไม่พบข้อมูลผู้ใช้ในระบบ");
    }

    // ตรวจสอบ Schema ของข้อมูลรหัสผ่าน
    const validatedData = changePasswordSchema.parse(req.body);

    // เรียก Service เพื่อดำเนินการตรวจสอบและอัปเดต
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

