import type { Request, Response, NextFunction } from "express";
import { borrowService } from "./borrows.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { GetInventorySchema } from "./borrows.schema.js";

export class BorrowController extends BaseController {
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
    const devices = await borrowService.getInventory();
    return { data: devices };
  }
}