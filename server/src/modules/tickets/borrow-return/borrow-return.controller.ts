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

  async getBorrowReturnTicket(
    req: authSchema.AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<PaginatedResult<TicketItemDto>> {
    const query = getBorrowTicketQuery.parse(req.query);
    const userId = req.user?.sub;
    const role = req.user?.role;
    const dept_id = req.user?.dept;
    const sec_id = req.user?.sec;
    const result = await borrowReturnService.getBorrowReturnTicket(
      query,
      userId,
      role,
      dept_id,
      sec_id,
    );

    return result;
  }

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
