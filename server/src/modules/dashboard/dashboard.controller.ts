import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { dashboardIssueService, dashboardDataService } from "./dashboard.service.js";
import {
  getIssueStatsQuerySchema,
  dashboardQuerySchema,
} from "./dashboard.schema.js";
import { AuthRequest } from "../auth/auth.schema.js";

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
    req: AuthRequest,
    _res: Response,
    _next: NextFunction
  ) {
    if (!req.user) throw new Error("Unauthorized");
    const query = getIssueStatsQuerySchema.parse(req.query);
    const { role, dept, sec } = req.user;
    const data = await dashboardIssueService.getIssueStatsByQuarter(query, { role, dept, sec });
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
    req: AuthRequest,
    _res: Response,
    _next: NextFunction
  ) {
    if (!req.user) throw new Error("Unauthorized");
    const query = dashboardQuerySchema.parse(req.query);
    const { role, dept, sec } = req.user;
    const data = await dashboardDataService.getBorrowStats(query, { role, dept, sec });
    return { data };
  }

  async getMostBorrowedEqStats(
    req: AuthRequest,
    _res: Response,
    _next: NextFunction
  ) {
    if (!req.user) throw new Error("Unauthorized");
    const query = dashboardQuerySchema.parse(req.query);
    const { role, dept, sec } = req.user;
    const data = await dashboardDataService.getMostBorrowedEquipmentStats(query, { role, dept, sec });
    return { data };
  }

  async getRepairStatusStats(
    req: AuthRequest,
    _res: Response,
    _next: NextFunction
  ) {
    if (!req.user) throw new Error("Unauthorized");
    const query = dashboardQuerySchema.parse(req.query);
    const { role, dept, sec } = req.user;
    const data = await dashboardDataService.getRepairStatusStats(query, { role, dept, sec });
    return { data };
  }

  async getOverdueTable(
    req: AuthRequest,
    _res: Response,
    _next: NextFunction
  ) {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const { role, dept, sec } = req.user;
    const data = await dashboardDataService.getOverdueTicketsTable({ role, dept, sec });
    return { data };
  }
}