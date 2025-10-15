import type { Request, Response, NextFunction } from "express";
import { roleService } from "./role.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { GetAllUsersRole } from "./role.schema.js";

export class RoleController extends BaseController {
    constructor() {
        super()
    }

    // ดึงพนักงานทั้งหมด
    // async getAll(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<UserRole>> {
    //     const role = await roleService.getAllUserRoles();
    //     return { data: role };
    // }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<GetAllUsersRole>> {
        const role = await roleService.getAllUserRoles();
        return { data: role };
    }
};