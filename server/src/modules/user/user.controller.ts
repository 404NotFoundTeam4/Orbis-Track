import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { GetAllUsersResponseSchema, editUserSchema } from "./user.schema.js";
import { z } from "zod";

export class UserController extends BaseController {
  constructor() {
    super();
  }

  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("Invalid id");
    const user = await userService.getUserById(id);
    if (!user) throw new HttpError(HttpStatus.NOT_FOUND, "User not found");
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

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("Invalid user id");

    // ✅ ใช้ schema ที่ประกาศไว้แล้ว
    const validatedData = editUserSchema.parse(req.body);

    // ✅ ส่งข้อมูลไปให้ service
    const updatedUser = await userService.updateUser(id, validatedData);

    return {
      message: "User updated successfully",
      data: updatedUser,
    };
  }

}
