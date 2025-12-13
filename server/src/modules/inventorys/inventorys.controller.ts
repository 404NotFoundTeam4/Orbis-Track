import type { Request, Response, NextFunction } from "express";
import { devicesService } from "./inventorys.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
CreateDevicesSchema,createDevicePayload
} from "./inventorys.schema.js";
import { ValidationError } from "../../errors/errors.js";
import { UserRole } from "../../core/roles.enum.js";

export class DevicesController extends BaseController {
  constructor() {
    super();
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
  ): Promise<BaseResponse<CreateDevicesSchema>> {
    // ถ้ามีไฟล์ที่อัปโหลดเข้ามาให้เก็บชื่อไฟล์
    const images = req.file ? req.file.path : undefined;
    // ตรวจสอบและ validate ข้อมูลที่ส่งมา
    const payload =createDevicePayload.parse(req.body)
    // เรียกใช้งาน service เพื่อบันทึกข้อมูลลงฐานข้อมูล
    const result = await devicesService.createDevice(payload,images)
    
    // คืนค่าบัญชีผู้ใช้ใหม่
    return { data: result };
  }

}
