import type { Request, Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  InventorySchema,
  idParamSchema,
} from "./inventory.schema.js";
import { ValidationError } from "../../errors/errors.js";

export class InventoryController extends BaseController {
  constructor() {
    super();
  }

  /**
   * ดึงข้อมูลอุปกรณ์ตาม ID
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
   * ดึงข้อมูลอุปกรณ์ทั้งหมด
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
   * ลบข้อมูลอุปกรณ์ (Soft Delete)
   */
  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    // แปลง ID และตรวจสอบเบื้องต้น
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