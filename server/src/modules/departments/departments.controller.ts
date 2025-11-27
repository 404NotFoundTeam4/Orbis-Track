import type { Request, Response, NextFunction } from "express";
import { departmentService } from "./departments.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";

import {
  addSectionPayload,
  AddDepartmentsSchema,
  editDepartmentPayload,
  editSectionPayload,
  GetAllDepartmentSchema,
  GetAllSectionSchema,
  idParamSchema,
  paramEditSecSchema,
  DeptSectionSchema,
  deleteSectionSchema,
  addDepartmentsPayload
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

  /**
   * Description: Controller สำหรับเพิ่มข้อมูลฝ่ายย่อย (Section) ภายใต้แผนกที่เลือก
   * Input     : req.params (deptId - รหัสแผนก), req.body (section - ชื่อฝ่ายย่อยที่ต้องการเพิ่ม)
   * Output    : { data: { sections: [newSection] } } หรือ { message: string } หากเกิดข้อผิดพลาด
   * Author    : Salsabeela Sa-e (San) 66160349
   */
  async addSection(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse> {
    const id = idParamSchema.parse(req.params);

    const payload = addSectionPayload.parse(req.body);

    // เรียกใช้ service เพื่อเพิ่ม section
    const newSection = await departmentService.addSection(
      id.id,
      payload.sec_name,
    );
    // ส่งข้อมูล section ที่ถูกเพิ่มกลับไป
    return { data: newSection };

  }

  async getdeptsection(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<BaseResponse<DeptSectionSchema>> {
    const deptSection = await departmentService.getDeptSection();
    return { data: deptSection };
  }

  /**
   * Description: Controller สำหรับลบฝ่ายย่อย (Section)
   * Input     : req.params (ไอดีฝ่ายย่อย)
   * Output    : { message: string } - ข้อความแจ้งผลการลบ
   * Author    : Niyada Butchan (Da) 66160361
   */
  async deleteSection(
    req: Request,
    _res: Response,
    _next: NextFunction) {

    // deleteSectionSchema จะช่วย validate ให้แน่ใจว่า secId เป็น string ที่ไม่ว่าง
    const params = deleteSectionSchema.parse(req.params);

    //สั่งให้ service ลบ section ที่มีเลขไอดี = secId ในฐานข้อมูล
    await departmentService.deleteSection(params);

    //return response message
    return { message: "Section deleted successfully" };
  }
  
  async deleteDepartment(
    req: Request,
    _res: Response,
    _next: NextFunction) {

    // deleteSectionSchema จะช่วย validate ให้แน่ใจว่า secId เป็น string ที่ไม่ว่าง
    const params = idParamSchema.parse(req.params);

    //สั่งให้ service ลบ section ที่มีเลขไอดี = secId ในฐานข้อมูล
    await departmentService.deleteDepartment(params);

    //return response message
    return { message: "Department deleted successfully" };
  }

  /**
   * Description: Controller สำหรับเพิ่มแผนก (Departments)
   * Input     : req.body (ข้อมูลชื่อแผนก)
   * Output    : { data: result } - ข้อมูลที่เพิ่มเข้ามา
   * Author    : Sutaphat Thahin (Yeen) 66160378
   */
  async addDepartments(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<AddDepartmentsSchema>> {
    const payload = addDepartmentsPayload.parse(req.body);
    const result = await departmentService.addDepartments(payload);
    return { data: result }
  }
}