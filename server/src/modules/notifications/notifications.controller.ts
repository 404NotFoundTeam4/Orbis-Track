import { BaseController } from "../../core/base.controller.js";
import type { Request, Response, NextFunction } from "express";
import { BaseResponse } from "../../core/base.response.js";
import { GetNotiDto, markAsReadSchema } from "./notifications.schema.js";
import { authSchema } from "../auth/index.js";
import { notificationsService } from "./index.js";
import { PaginatedResult } from "../../core/paginated-result.interface.js";

export class NotificationsController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงรายการแจ้งเตือนของผู้ใช้ปัจจุบัน แบบแบ่งหน้า (Pagination)
   * Input : req.user.sub (userId), req.query.page, req.query.limit
   * Output : PaginatedResult<GetNotiDto>
   * Author : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getUserNotifications(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<PaginatedResult<GetNotiDto>> {
    // แปลง userId จาก Token และค่า page/limit จาก Query String ให้เป็น Number เพื่อป้องกัน Error
    const userId = Number(req.user?.sub);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await notificationsService.getUserNotifications({
      userId,
      page,
      limit,
    });

    return result;
  }

  /**
   * Description: อัปเดตสถานะการแจ้งเตือนเป็น "อ่านแล้ว" ตามรายการ ID ที่ระบุ
   * Input : req.user.sub (userId), req.body.ids (Array ของ Notification IDs)
   * Output : { message: string }
   * Author : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async markAsRead(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    // รับค่า ids ที่ต้องการ update จาก Body
    const userId = Number(req.user?.sub);
    const { ids } = req.body;
    const { message } = await notificationsService.markAsRead(userId, ids);
    return { message };
  }

  /**
   * Description: อัปเดตสถานะการแจ้งเตือนทั้งหมดของผู้ใช้คนนั้นเป็น "อ่านแล้ว"
   * Input : req.user.sub (userId)
   * Output : { message: string }
   * Author : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async markAllAsRead(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const userId = Number(req.user?.sub);
    const { message } = await notificationsService.markAllAsRead(userId);
    return { message };
  }

  /**
   * Description: ดึงจำนวนการแจ้งเตือนที่สถานะเป็น "ยังไม่อ่าน" (Unread)
   * Input : req.user.sub (userId)
   * Output : { data: number }
   * Author : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getUnreadCount(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<number>> {
    const userId = Number(req.user?.sub);
    const { count } = await notificationsService.getUnreadCount(userId);
    return { data: count };
  }
}
