import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  GetAllUsersResponseSchema,
  editUserSchema,
  idParamSchema,
} from "./user.schema.js";

/**
 * Controller สำหรับจัดการผู้ใช้
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export class UserController extends BaseController {
  constructor() {
    super();
  }

  /**
   * ดึงข้อมูลผู้ใช้ตาม id
   * Input: req.params.id
   * Output: BaseResponse { data: user object }
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = idParamSchema.parse(req.params);
    const user = await userService.getUserById(id);
    return { data: user };
  }

  // ดึงพนักงานทั้งหมด
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAllUsersResponseSchema>> {
    const user = await userService.getAllUsers();
    return { data: user };
  }

  /**
   * Description: อัปเดตข้อมูลผู้ใช้ตาม id
   * Input : req.params.id (number), req.body (ตาม editUserSchema)
   * Output : BaseResponse { message: string, data: updated user object }
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<void>> {
    const id = idParamSchema.parse(req.params);
    const validatedData = editUserSchema.parse(req.body);
    const result = await userService.updateUser(id, validatedData);

    return {
      message: result.message,
    };
  }
}
