import type { Request, Response, NextFunction } from "express";
import { roleService } from "./roles.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { GetAllUsersRole } from "./roles.schema.js";

/**
 * Description: Controller สำหรับจัดการ role ของผู้ใช้
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export class RoleController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงข้อมูล role ของผู้ใช้ทั้งหมด
   * Input : Express Request (req)
   * Output : BaseResponse<GetAllUsersRole> { data: Array<{ role_id, role_name, ... }> }
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAllUsersRole>> {
    // เรียก service เพื่อดึง role ของผู้ใช้ทั้งหมด
    const role = await roleService.getAllUserRoles();
    return { data: role };
  }
}
