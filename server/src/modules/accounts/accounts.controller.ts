import type { Request, Response, NextFunction } from "express";
import { accountsService } from "./accounts.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  createAccountsPayload,
  CreateAccountsSchema,
  GetAllAccountsResponseSchema,
  editAccountSchema,
  idParamSchema,
  genCodeEmpPayload,
  GenCodeEmpSchema,
} from "./accounts.schema.js";
import { ValidationError } from "../../errors/errors.js";
import { UserRole } from "../../core/roles.enum.js";

export class AccountsController extends BaseController {
  constructor() {
    super();
  }

  /**
 * Description: ค้นหารหัสพนักงานล่าสุด (เช่น E000123) และสร้างรหัสถัดไป (E000124)
 * Input: role - UserRole (ตำแหน่งของพนักงาน)
 * Output: string (รหัสพนักงานใหม่)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
  async getNextEmployeeCodeHandler(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<GenCodeEmpSchema>> {
    const { role } = genCodeEmpPayload.parse(req.body);
    const nextCode = await accountsService.generateNextEmployeeCode(role as UserRole);
    return { data: { us_emp_code: nextCode } }
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
    const user = await accountsService.getAccountById(id);
    return { data: user };
  }

  /**
   * Description: ดึงข้อมูลผู้ใช้ทั้งหมด
   * Input : -
   * Output : ข้อมูลบัญชีผู้ใช้ทั้งหมด รวมถึงแผนกและฝ่ายย่อย
   * Author : Thakdanai Makmi (Ryu) 66160355
   */
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAllAccountsResponseSchema>> {
    // เรียกใช้งาน service เพื่อดึงข้อมูลผู้ใช้
    const user = await accountsService.getAllAccounts();
    return { data: user };
  }

  /**
   * Description: เพิ่มข้อมูลบัญชีผู้ใช้ใหม่
   * Input : req.body (ข้อมูลจากฟอร์ม และไฟล์รูปภาพ)
   * Output : ข้อมูลบัญชีผู้ใช้ที่ถูกเพิ่มใหม่
   * Author : Thakdanai Makmi (Ryu) 66160355
   */
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CreateAccountsSchema>> {
    // ถ้ามีไฟล์ที่อัปโหลดเข้ามาให้เก็บชื่อไฟล์
    const images = req.file ? req.file.path : undefined;
    
    console.log('image: ', images)
    // ตรวจสอบและ validate ข้อมูลที่ส่งมา
    const payload = createAccountsPayload.parse(req.body);
    // เรียกใช้งาน service เพื่อบันทึกข้อมูลลงฐานข้อมูล
    const result = await accountsService.createAccounts(payload, images);

    // คืนค่าบัญชีผู้ใช้ใหม่
    return { data: result };
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
    const validatedData = editAccountSchema.parse(req.body);
    const result = await accountsService.updateAccount(id, validatedData);

    return {
      message: result.message,
    };
  }

  /**
   * Description: ปิดการใช้งานข้อมูลผู้ใช้ตาม id
   * Input : req.params.id 
   * Output : user_id ที่ถูกลบ พร้อมระบุวันเวลา
   * Author: Chanwit Muangma (Boom) 66160224
   */

  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = Number(req.params.id); //อ่านตัว ID
    if (!Number.isInteger(id) || id <= 0)
      throw new ValidationError("Invalid id"); //เช็คค่า ID
    const result = await accountsService.softDeleteAccount(id); //เรียกตัว Service SoftDeleteUser
    return {
      data: { us_id: result.userID, deletedAt: result.deleteAt },
      message: "User soft-deleted",
    };
  }
}
