import type { Request, Response, NextFunction } from "express";
import { borrowService } from "./borrows.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  addToCartPayload,
  AddToCartSchema,
  createBorrowTicketPayload,
  CreateBorrowTicketSchema,
  GetAvailableSchema,
  GetDeviceForBorrowSchema,
  GetInventorySchema,
  idParamSchema,
  DeviceAvailabilitiesSchema,
  GetBorrowUsersSchema
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
  * Description: ดึงข้อมูลรายการอุปกรณ์ที่ถูกยืม
  * Input : req.params (ไอดีอุปกรณ์แม่)
  * Output : { data: device } - รายการอุปกรณ์ลูกที่กำลังถูกยืมอยู่
  * Author : Thakdanai Makmi (Ryu) 66160355
  */
  async getAvailable(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetAvailableSchema>> {
    const id = idParamSchema.parse(req.params);
    const devices = await borrowService.getAvailable(id);
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

  /**
  * Description: สร้าง ticket คำร้องยืมอุปกรณ์
  * Input     : req.body - ข้อมูลในการยืมอุปกรณ์
  * Output    : { data: result } - รหัสคำร้องการยืมอุปกรณ์ สถานะ วันที่เริ่มยืม วันสิ้นสุด และอุปกรณ์ลูก
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async createBorrowTicket(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CreateBorrowTicketSchema>> {

    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const requesterId = req.user.sub; // ไอดีคนที่ส่งคำร้อง
    const requesterRole = req.user.role; // ตำแหน่งคนที่ส่งคำร้อง

    const payload = createBorrowTicketPayload.parse(req.body);

    // กำหนด borrowerId ตามสิทธิ์
    const borrowerId =
      requesterRole === "STAFF" || requesterRole === "ADMIN"
        ? payload.borrowerId ?? requesterId
        : requesterId;

    const result = await borrowService.createBorrowTicket({
      requesterId,
      borrowerId,
      ...payload
    })

    return { data: result }
  }

  /**
  * Description: เพิ่มอุปกรณ์ลงรถเข็น
  * Input     : req.body - ข้อมูลในการยืมอุปกรณ์
  * Output    : { data: result } - รหัสรถเข็น และรหัสรายการอุปกรณ์ในรถเข็น
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async addToCart(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<AddToCartSchema>> {

    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const userId = req.user.sub;

    const cart = await borrowService.checkCart(userId);
    const payload = addToCartPayload.parse(req.body);

    const result = await borrowService.addToCart({
      userId,
      ...payload,
    });

    return { data: result }
  }

  /**
   * Description: ดึงข้อมูล Device Availabilities ทั้งหมดในระบบ
   * Input : -
   * Output : { data: deviceAvailabilities[] }
   * Author : Nontapat Sinthum (Guitar) 66160104
   */
  async getDeviceAvailabilities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<DeviceAvailabilitiesSchema>> {
    const availabilities = await borrowService.getDeviceAvailabilities();
    return { data: availabilities };
  }

  /**
   * Description: ดึงรายชื่อผู้ใช้สำหรับการยืมให้ผู้อื่น
   * Input     : -
   * Output    : { data: users } - รายชื่อผู้ใช้
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  async getBorrowUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetBorrowUsersSchema>> {
    const users = await borrowService.getBorrowUsers();
    return { data: users };
  }
}