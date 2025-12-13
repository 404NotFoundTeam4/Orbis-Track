import type { Request, Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { GetInventorySchema } from "./inventory.schema.js";

export class InventoryController extends BaseController {
  constructor() {
    super();
  }

    /**
   * Description: ดึงข้อมูลรายการอุปกรณ์
   * Input : -
   * Output : { data: device[] }
   * Author : Sutaphat Thahin (Yeen) 66160378
   */
  async getInventory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetInventorySchema>> {
    const devices = await inventoryService.getInventory();
    return { data: devices };
  }
}