/**
 * Description: Controller สำหรับ Borrow-Return Tickets API
 * - GET / : ดึงรายการ tickets พร้อม pagination, filter, search, sort
 * - GET /:id : ดึงรายละเอียด ticket ตาม ID
 * Input : Express Request (auth required)
 * Output : PaginatedResult<TicketItem> หรือ TicketDetail
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { BaseController } from "../../../core/base.controller.js";
import type { Request, Response, NextFunction } from "express";
import { BaseResponse } from "../../../core/base.response.js";
import { BorrowReturnService } from "./borrow-return.service.js";
import {
  approveTicket,
  BorrowReturnTicketDetailDto,
  TicketDeviceSchema,
  getBorrowTicketQuery,
  getDeviceAvailableQuery,
  rejectTicket,
  TicketItemDto,
  updateDeviceChildInTicket,
  returnTicketBody,
} from "./borrow-return.schema.js";
import { authSchema } from "../../auth/index.js";
import { PaginatedResult } from "../../../core/paginated-result.interface.js";
import { idParamSchema } from "../../departments/departments.schema.js";

export class BorrowReturnController extends BaseController {
  constructor(private readonly borrowReturnService: BorrowReturnService) {
    super();
  }

  /**
   * Description: ดึงรายการ Borrow-Return Tickets พร้อม pagination
   * Input     : AuthRequest (query: page, limit, status, search, sortField, sortDirection)
   * Output    : PaginatedResult<TicketItemDto>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicket(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<PaginatedResult<TicketItemDto>> {
    const query = getBorrowTicketQuery.parse(req.query);
    const role = req.user?.role;
    const deptId = req.user?.dept;
    const secId = req.user?.sec;
    const userId = req.user?.sub;
    const result = await this.borrowReturnService.getBorrowReturnTicket(
      query,
      role,
      deptId,
      secId,
      userId,
    );

    return result;
  }

  /**
   * Description: ดึงรายละเอียด Ticket ตาม ID
   * Input     : AuthRequest (params: id)
   * Output    : BaseResponse<BorrowReturnTicketDetailDto>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicketById(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<BorrowReturnTicketDetailDto>> {
    const id = idParamSchema.parse(req.params);
    const result = await this.borrowReturnService.getBorrowReturnTicketById(id);

    return { data: result };
  }

  /**
   * Description: อนุมัติ Ticket ตาม ID โดยผู้มีสิทธิ์อนุมัติ
   * Input     : AuthRequest { params: id, body: ApproveTicket { currentStage, pickupLocation? } }
   * Output    : BaseResponse<void> - ผลลัพธ์การอนุมัติ
   * Note      : ตรวจสอบสิทธิ์ผู้อนุมัติตาม Role/Dept/Sec และส่งแจ้งเตือนไปยังผู้เกี่ยวข้อง
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async approveTicketById(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const user = req.user;
    const ticketId = idParamSchema.parse(req.params);
    const payload = approveTicket.parse(req.body);
    const result = await this.borrowReturnService.approveTicketById(
      ticketId,
      user,
      payload,
    );

    return { data: result };
  }

  /**
   * Description: ปฏิเสธ Ticket ตาม ID โดยผู้มีสิทธิ์อนุมัติ
   * Input     : AuthRequest { params: id, body: RejectTicket { currentStage, rejectReason } }
   * Output    : BaseResponse<void> - ผลลัพธ์การปฏิเสธ
   * Note      : ส่งแจ้งเตือนไปยังผู้ร้องขอและบันทึกเหตุผลการปฏิเสธ
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async rejectTicketById(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const user = req.user;
    const ticketId = idParamSchema.parse(req.params);
    const payload = rejectTicket.parse(req.body);
    const result = await this.borrowReturnService.rejectTicketById(
      ticketId,
      user,
      payload,
    );

    return { data: result };
  }

  /**
   * Description: ดึงรายการ device childs ที่ว่างสำหรับเพิ่มเข้า ticket
   * Input     : Request { query: deviceId, deviceChildIds, startDate, endDate }
   * Output    : BaseResponse<TicketDeviceSchema[]> - รายการอุปกรณ์ที่พร้อมใช้งาน
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getDeviceAvailable(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<TicketDeviceSchema[]>> {
    const query = getDeviceAvailableQuery.parse(req.query);
    const result = await this.borrowReturnService.getDeviceAvailable(query);

    return { data: result };
  }

  /**
   * Description: จัดการอุปกรณ์ใน Ticket (เพิ่ม/ลบ/เปลี่ยนสถานะ)
   * Input     : AuthRequest { params: id, body: ManageDevice }
   * Output    : BaseResponse<void> - ผลลัพธ์การจัดการอุปกรณ์
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async manageDeviceChildsInTicket(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const user = req.user;
    const param = idParamSchema.parse(req.params);
    const payload = updateDeviceChildInTicket.parse(req.body);
    const result = await this.borrowReturnService.manageDeviceChildsInTicket(
      user,
      param,
      payload,
    );

    return { success: result.success };
  }

  /**
   * Description: คืนอุปกรณ์ - อัปเดตสถานะ ticket และ device childs
   * Input     : AuthRequest { params: id, body: { devices: { id, status }[] } }
   * Output    : BaseResponse<void>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async returnTicketById(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<void>> {
    const user = req.user;
    const param = idParamSchema.parse(req.params);
    const { devices } = returnTicketBody.parse(req.body);
    const result = await this.borrowReturnService.returnTicket(
      user,
      param,
      devices,
    );

    return { success: result.success };
  }
}

