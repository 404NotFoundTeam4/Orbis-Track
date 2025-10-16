import type { Request, Response, NextFunction } from "express";
import { departmentService } from "./departments.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import {
  GetAllDepartmentSchema,
  GetAllSectionSchema,
} from "./departments.schema.js";

export class DepartmentController extends BaseController {
  constructor() {
    super();
  }

  // ดึงแผนก
  async getAllDepartment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAllDepartmentSchema>> {
    const department = await departmentService.getAllDepartment();
    return { data: department };
  }

  async getSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError("Invalid id");

    const sections = await departmentService.getSectionById(id);

    // ⚠️ findMany() จะคืน [] ไม่ใช่ null
    if (!sections || sections.length === 0)
      throw new HttpError(HttpStatus.NOT_FOUND, "Section not found");

    return { data: sections };
  }
}
