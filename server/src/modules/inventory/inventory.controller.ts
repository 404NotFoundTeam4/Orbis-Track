import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { inventoryService } from "./inventory.service.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  createDeviceChildPayload,
  CreateDeviceChildSchema,
  deleteDeviceChildPayload,
  GetDeviceWithChildsSchema,
  idParamSchema,
  UploadFileDeviceChildSchema
} from "./inventory.schema.js";

export class InventoryController extends BaseController {
  constructor() {
    super();
  }

  /**
  * Description: ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
  * Input     : req.params - รหัสของอุปกรณ์แม่
  * Output    : { data } - ข้อมูลอุปกรณ์แม่พร้อมอุปกรณ์ลูก
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async getDeviceWithChilds(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<GetDeviceWithChildsSchema>> {
    const params = idParamSchema.parse(req.params);
    const result = await inventoryService.getDeviceWithChilds(params);
    return { data: result}
  }

  /**
  * Description: เพิ่มอุปกรณ์ลูก
  * Input     : req.body (รหัสของอุปกรณ์แม่และจำนวนอุปกรณ์ลูกที่ต้องการเพิ่ม)
  * Output    : { data } - ข้อมูลอุปกรณ์ลูกที่เพิ่มใหม่
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async create(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<CreateDeviceChildSchema[]>> {
    const payload = createDeviceChildPayload.parse(req.body);
    const data = await inventoryService.createDeviceChild(payload);
    return { data };
  }

  /**
  * Description: ลบอุปกรณ์ลูก
  * Input     : req.body (รหัสอุปกรณ์ลูก)
  * Output    : { result } - ผลการลบอุปกรณ์ลูก
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async delete(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<void>> {
    const payload = deleteDeviceChildPayload.parse(req.body);
    const result = await inventoryService.deleteDeviceChild(payload);
    return result;
  }

  /**
  * Description: เพิ่มอุปกรณ์ลูกด้วยไฟล์ Excel / CSV
  * Input     : req.body (รหัสอุปกรณ์แม่, ตำแหน่งไฟล์)
  * Output    : { data } - จำนวนอุปกรณ์ลูกที่ถูกเพิ่ม
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  async uploadFileDeviceChild(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<UploadFileDeviceChildSchema>> {
    const params = idParamSchema.parse(req.params);

    if (!req.file?.path) throw new Error("File upload required");

    const payload = { de_id: params.id, filePath: req.file.path }; // สร้าง payload ที่ clean แล้ว

    const data = await inventoryService.uploadFileDeviceChild(payload);

    return { data };
  }
}