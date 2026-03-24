import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import type { BaseResponse } from "../../core/base.response.js";
import { dashboardIssueService } from "./dashboard-issue.service.js";
import {
  getIssueStatsQuerySchema,
  type GetIssueStatsResponseDto,
} from "./dashboard-issue.schema.js";

/**
 * Description: Controller สำหรับ Dashboard Issue APIs
 * Author: Nontapat Sinhum (Guitar) 66160104
 */
export class dashboardIssueController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงสถิติคำร้องแจ้งซ่อมรายเดือน (filter ปี/ไตรมาส)
   * Input : req.query { year, quarter }
   * Output: { data: { year, quarter, range, points[] } }
   * Author: Nontapat Sinhum (Guitar) 66160104
   */
  async getIssueStats(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<BaseResponse<GetIssueStatsResponseDto>> {
    const query = getIssueStatsQuerySchema.parse(req.query);
    const data = await dashboardIssueService.getIssueStatsByQuarter(query);
    return { data };
  }
}