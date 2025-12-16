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
import { borrowReturnService } from "./index.js";
import {
  BorrowReturnTicketDetailDto,
  getBorrowTicketQuery,
  TicketItemDto,
} from "./borrow-return.schema.js";
import { authSchema } from "../../auth/index.js";
import { PaginatedResult } from "../../../core/paginated-result.interface.js";
import { idParamSchema } from "../../departments/departments.schema.js";

export class BorrowReturnController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงรายการ Borrow-Return Tickets พร้อม pagination
   * Input : AuthRequest (query: page, limit, status, search, sortField, sortDirection)
   * Output : PaginatedResult<TicketItemDto>
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicket(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<PaginatedResult<TicketItemDto>> {
    const query = getBorrowTicketQuery.parse(req.query);
    const role = req.user?.role;
    const dept_id = req.user?.dept;
    const sec_id = req.user?.sec;
    const result = await borrowReturnService.getBorrowReturnTicket(
      query,
      role,
      dept_id,
      sec_id,
    );

    return result;
  }

  /**
   * Description: ดึงรายละเอียด Ticket ตาม ID
   * Input : AuthRequest (params: id)
   * Output : BaseResponse<BorrowReturnTicketDetailDto>
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicketById(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<BorrowReturnTicketDetailDto>> {
    const id = idParamSchema.parse(req.params);
    const result = await borrowReturnService.getBorrowReturnTicketById(id);

    return { data: result };
  }
}
