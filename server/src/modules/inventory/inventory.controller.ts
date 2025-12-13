import type { Request, Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";

export class InventoryController extends BaseController {
  constructor() {
    super();
  }

  async getInventory(
      req: Request,
      res: Response,
      next: NextFunction
    ) {
     
      const devices = await inventoryService.getInventory();
      return { data: devices };
    }
}