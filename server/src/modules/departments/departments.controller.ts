import type { Request, Response, NextFunction } from "express";
import { departmentService } from "./departments.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  editDepartmentPayload,
  editSectionPayload,
  GetAllDepartmentSchema,
  GetAllSectionSchema,
  idParamSchema,
  paramEditSecSchema,
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

  /**
   * Description: Controller สำหรับแก้ไขข้อมูลแผนก (Department)
   * Input     : req.params.id (รหัสแผนก), req.body (ข้อมูลแผนกที่ต้องการแก้ไข)
   * Output    : { message: string } - ข้อความแจ้งผลการแก้ไข
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async editDepartment(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const id = idParamSchema.parse(req.params);
    const payload = editDepartmentPayload.parse(req.body);
    const { message } = await departmentService.editDepartment(id, payload);
    return { message };
  }

  /**
   * Description: Controller สำหรับแก้ไขข้อมูลฝ่ายย่อย (Section)
   * Input     : req.params (ไอดีแผนกและไอดีฝ่ายย่อย), req.body (ข้อมูลฝ่ายย่อยที่ต้องการแก้ไข)
   * Output    : { message: string } - ข้อความแจ้งผลการแก้ไข
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async editSection(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const id = paramEditSecSchema.parse(req.params);
    const payload = editSectionPayload.parse(req.body);
    const { message } = await departmentService.editSection(id, payload);
    return { message };
  }
}
