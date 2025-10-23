import type { Request, Response, NextFunction } from "express";
import { departmentService } from "./departments.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  GetAllDepartmentSchema,
  GetAllSectionSchema,
  idParamSchema,
} from "./departments.schema.js";

/**
 * Description: คอนโทรลเลอร์ Department ดูแลการจัดการข้อมูลแผนกและฝ่ายย่อย (Section)
 * Input : req/res/next ของ Express
 * Output : Response ตามรูปแบบ BaseResponse<GetAllDepartmentSchema | GetAllSectionSchema>
 * Author : Nontapat Sinthum (Guitar) 66160104
 */
export class DepartmentController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงข้อมูลรายการแผนกทั้งหมดจากฐานข้อมูล
   * Input : ไม่มี input เพิ่มเติม (ใช้ req/res/next ของ Express)
   * Output : { data: { departments: [{ dept_id, dept_name }, ...] } }
   * Author : Nontapat Sinthum (Guitar) 66160104
   */
  async getAllDepartment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAllDepartmentSchema>> {
    const department = await departmentService.getAllDepartment();
    return { data: department };
  }

  /**
   * Description: ดึงข้อมูล "ฝ่ายย่อย (Sections)" ของแผนกตาม dept_id ที่ส่งมาใน path parameter
   * Input : req.params.id (number) ผ่านการตรวจสอบด้วย zod (idParamSchema)
   * Output : { data: { sections: [{ sec_id, sec_name, sec_dept_id }, ...] } }
   * Author : Nontapat Sinthum (Guitar) 66160104
   */
  async getSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAllSectionSchema>> {
    const id = idParamSchema.parse(req.params);
    const sections = await departmentService.getSectionById(id);
    return { data: sections };
  }
}
