/**
 * Description: Controller สำหรับ Repair Tickets API
 * - GET / : ดึงรายการงานซ่อมพร้อม pagination, filter, search, sort
 * Input : Express Request (auth required)
 * Output : PaginatedResult<RepairItemDto>
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
import { BaseController } from "../../../core/base.controller.js";
import type { Response, NextFunction } from "express";
import type { PaginatedResult } from "../../../core/paginated-result.interface.js";
import type { AuthRequest } from "../../auth/auth.schema.js";
import { getRepairQuery, type RepairItemDto } from "./repair.schema.js";
import { repairService } from "./repair.service.js";

export class RepairController extends BaseController {
  constructor() {
    super();
  }

  async getRepairs(
    req: AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<PaginatedResult<RepairItemDto>> {
    const query = getRepairQuery.parse(req.query);
    return repairService.getRepairs(query, req.user);
  }
}
