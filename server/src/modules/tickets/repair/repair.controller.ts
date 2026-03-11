/**
 * Description: Controller สำหรับ Repair Tickets API
 * - GET / : ดึงรายการงานซ่อมพร้อม pagination, filter, search, sort
 * Input : Express Request (auth required)
 * Output : PaginatedResult<RepairItemDto>
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
import { BaseController } from "../../../core/base.controller.js";
import type { Response, NextFunction, Request } from "express";
import type { PaginatedResult } from "../../../core/paginated-result.interface.js";
import type { AuthRequest } from "../../auth/auth.schema.js";
import {
  createRepairRequestBody,
  repairIssueParamSchema,
  getRepairQuery,
  type RepairItemDto,
  type RepairPrefillDto,
} from "./repair.schema.js";
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

  async getRepairPrefill(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<{ data: RepairPrefillDto }> {
    const params = repairIssueParamSchema.parse(req.params);
    const data = await repairService.getPrefillByIssueId(params.issueId);
    return { data };
  }

  async createRepairRequest(
    req: AuthRequest,
    _res: Response,
    _next: NextFunction,
  ): Promise<{ data: { id: number; message: string } }> {
    const payload = createRepairRequestBody.parse(req.body);

    const files = req.files;
    const fileList = Array.isArray(files)
      ? files
      : files
        ? Object.values(files).flat()
        : [];

    const imagePaths = fileList
      .map((file) => file.path)
      .filter((path): path is string => Boolean(path));

    const data = await repairService.createRepairRequest(payload, req.user, imagePaths);
    return { data };
  }
}
