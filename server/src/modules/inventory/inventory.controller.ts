import type { Request, Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  InventorySchema,
  idParamSchema,
} from "./inventory.schema.js";
import { ValidationError } from "../../errors/errors.js";

/**
 * Controller: Inventory Controller
 * Description: ควบคุมการรับ-ส่งข้อมูล (API Endpoints) สำหรับจัดการคลังอุปกรณ์
 * Author: Worrawat Namwat (Wave) 66160372
 */
export class InventoryController extends BaseController {
  constructor() {
    super();
  }

/**
   * Description: ดึงข้อมูลอุปกรณ์ตาม ID
   * Input: req (Request) - params.id
   * Output: BaseResponse - ข้อมูลอุปกรณ์ที่พบ
   * Author: Worrawat Namwat (Wave) 66160372
   */
  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = idParamSchema.parse(req.params);
    const device = await inventoryService.getDeviceById(id);
    return { data: device };
  }

  /**
   * Description: ดึงข้อมูลอุปกรณ์ทั้งหมด
   * Input: req (Request)
   * Output: BaseResponse<IInventoryData[]> - รายการอุปกรณ์ทั้งหมด
   * Author: Worrawat Namwat (Wave) 66160372
   */
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<InventorySchema[]>> {
    const devices = await inventoryService.getAllDevices();
    return { data: devices };
  }

  /**
   * Description: ลบข้อมูลอุปกรณ์แบบ Soft Delete
   * Input: req (Request) - params.id รหัสอุปกรณ์ที่จะลบ
   * Output: BaseResponse - ผลลัพธ์การลบ (ID และเวลาที่ลบ)
   * Author: Worrawat Namwat (Wave) 66160372
   */
  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      throw new ValidationError("Invalid id");
    
    const result = await inventoryService.softDeleteDevice(id);
    
    return {
      data: { de_id: result.de_id, deletedAt: result.deletedAt },
      message: "Device soft-deleted successfully",
    };
  }
}