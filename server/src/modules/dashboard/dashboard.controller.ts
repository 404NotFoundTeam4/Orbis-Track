import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { dashboardIssueService, dashboardDataService } from "./dashboard.service.js";
import {
  getIssueStatsQuerySchema,
  dashboardQuerySchema,
} from "./dashboard.schema.js";

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
   * Author: Nontapat Sinhum (Guitar) 66160104
   */
  async getIssueStats(
    req: Request,
    _res: Response,
    _next: NextFunction
  ) {
    const query = getIssueStatsQuerySchema.parse(req.query);
    const data = await dashboardIssueService.getIssueStatsByQuarter(query);
    return { data };
  }

  async getDeviceChildCount(
    req: Request,
    _res: Response,
    _next: NextFunction
  ) {
    const query = getIssueStatsQuerySchema.parse(req.query);
    const data = await dashboardIssueService.getDeviceChildCount(query);
    return { data };
  }

  async getBorrowStats(
    req: Request,
    _res: Response,
    _next: NextFunction
  ) {
    const query = dashboardQuerySchema.parse(req.query);
    const data = await dashboardDataService.getBorrowStats(query);
    return { data };
  }

  async getMostBorrowedEqStats(
    req: Request,
    _res: Response,
    _next: NextFunction
  ) {
    const query = dashboardQuerySchema.parse(req.query);
    const data = await dashboardDataService.getMostBorrowedEquipmentStats(query);
    return { data };
  }

  async getRepairStatusStats(
    req: Request,
    _res: Response,
    _next: NextFunction
  ) {
    const query = dashboardQuerySchema.parse(req.query);
    const data = await dashboardDataService.getRepairStatusStats(query);
    return { data };
  }

  async getOverdueTable(
    _req: Request,
    _res: Response,
    _next: NextFunction
  ) {
    const data = await dashboardDataService.getOverdueTicketsTable();
    return { data };
  }
}