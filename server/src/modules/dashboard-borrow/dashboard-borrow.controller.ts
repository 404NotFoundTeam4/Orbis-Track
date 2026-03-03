import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { dashboardBorrowService } from "./dashboard-borrow.service.js";
import {
  getBorrowStatsQuerySchema,
  type GetBorrowStatsResponseDto,
} from "./dashboard-borrow.schema.js";

/**
 * Description: Controller สำหรับ Dashboard APIs
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export class dashboardBorrowController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงสถิติการยืมรายเดือนในไตรมาส (filter ปี/ไตรมาส)
   * Input : req.query { year, quarter }
   * Output: { data: { year, quarter, range, points[] } }
   * Author: Nontapat Sinhum (Guitar) 66160104
   */
  async getBorrowStats(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<GetBorrowStatsResponseDto>> {
    const query = getBorrowStatsQuerySchema.parse(req.query);
    const data = await dashboardBorrowService.getBorrowStatsByQuarter(query);
    return { data };
  }
}