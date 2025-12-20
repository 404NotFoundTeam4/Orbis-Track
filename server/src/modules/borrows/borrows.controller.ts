import type { Request, Response, NextFunction } from "express";
import { borrowService } from "./borrows.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  createBorrowTicketPayload,
  GetDeviceForBorrowSchema,
  GetInventorySchema,
  idParamSchema
} from "./borrows.schema.js";
import { AuthRequest } from "../auth/auth.schema.js";

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

  /**
  * Description: ดึงข้อมูลอุปกรณ์สำหรับการยืมอุปกรณ์
  * Input     : req.params (ไอดีอุปกรณ์แม่)
  * Output    : { data: device } - ข้อมูลรายละเอียดอุปกรณ์แม่และอุปกรณ์ลูก
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async getDeviceForBorrow(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetDeviceForBorrowSchema>> {
    const id = idParamSchema.parse(req.params);
    const device = await borrowService.getDeviceForBorrow(id);
    return { data: device }
  }

  async createBorrowTicket(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {

    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const userId = req.user.sub;

    const payload = createBorrowTicketPayload.parse(req.body);

    const result = await borrowService.createBorrowTicket({
      userId,
      ...payload
    })

    return { data: result }
  }
}