import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { inventoryService } from "./inventory.service.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  createDeviceChildPayload,
  CreateDevicePayload,
  createDevicePayload,
  createApprovalFlowsPayload,
  CreateDeviceChildSchema,
  deleteDeviceChildPayload,
  GetDeviceWithChildsSchema,
  idParamSchema,
  GetDeviceWithSchema,
  CreateApprovalFlowsPayload,
  GetApprovalFlowSchema,
  InventorySchema,
  UploadFileDeviceChildSchema,
  updateDevicePayload
} from "./inventory.schema.js";
import { ValidationError } from "../../errors/errors.js";

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

  /**
   * Description: ดึงข้อมูลอุปกรณ์ทั้งหมด
   * Input     : -
   * Output    : { data } - รายการอุปกรณ์ทั้งหมด
   * Author    : Panyapon Phollert (Ton) 66160086
   */
  async getDevices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetDeviceWithSchema>> {
    const result = await inventoryService.getAllDevices();
    return { data: result };
  }

  /**
   * Description: เพิ่มอุปกรณ์ใหม่ พร้อมรูปภาพ (ถ้ามี)
   * Input     : req.body (ข้อมูลอุปกรณ์), req.file (ไฟล์รูปภาพ)
   * Output    : { data } - ข้อมูลอุปกรณ์ที่ถูกสร้าง
   * Author    : Panyapon Phollert (Ton) 66160086
   */
  async createDevice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CreateDevicePayload>> {
    const payload = createDevicePayload.parse(req.body);
    const imagePath = req.file?.path;

    const result = await inventoryService.createDevice(payload, imagePath);

    return { data: result };
  }

  /**
   * Description: สร้าง Approval Flow สำหรับการอนุมัติอุปกรณ์
   * Input     : req.body (ข้อมูล Approval Flow)
   * Output    : { data } - ข้อมูล Flow ที่ถูกสร้าง
   * Author    : Panyapon Phollert (Ton) 66160086
   */
  async createFlows(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CreateApprovalFlowsPayload>> {
    const payload = createApprovalFlowsPayload.parse(req.body);

    const result = await inventoryService.createApprovesFlows(payload);

    return { data: result };
  }

  /**
   * Description: ดึงข้อมูล Approval Flow ทั้งหมด
   * Input     : -
   * Output    : { data } - รายการ Approval Flow
   * Author    : Panyapon Phollert (Ton) 66160086
   */
  async getFlows(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetApprovalFlowSchema>> {
    const result = await inventoryService.getAllApproves();

    return { data: result };
  }
  
  /**
   * Description: ดึงข้อมูลอุปกรณ์ตาม ID
   * Input: req (Request) - params.id
   * Output: BaseResponse - ข้อมูลอุปกรณ์ที่พบ
   * Author: Worrawat Namwat (Wave) 66160372
   */
  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = idParamSchema.parse(req.params);
    const device = await inventoryService.getDeviceById(id);
    return { data: device };
  }

  /**
   * Description: ดึงข้อมูลอุปกรณ์ทั้งหมด
   * Input: req (Request)
   * Output: BaseResponse<IInventoryData[]> - รายการอุปกรณ์ทั้งหมด
   * Author: Worrawat Namwat (Wave) 66160372
   */
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<InventorySchema[]>> {
    const devices = await inventoryService.getAllWithDevices();
    return { data: devices };
  }

  /**
   * Description: ลบข้อมูลอุปกรณ์แบบ Soft Delete
   * Input: req (Request) - params.id รหัสอุปกรณ์ที่จะลบ
   * Output: BaseResponse - ผลลัพธ์การลบ (ID และเวลาที่ลบ)
   * Author: Worrawat Namwat (Wave) 66160372
   */
  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      throw new ValidationError("Invalid id");
    
    const result = await inventoryService.softDeleteDevice(id);
    
    return {
      data: { de_id: result.de_id, deletedAt: result.deletedAt },
      message: "Device soft-deleted successfully",
    };
  }

  // ดึงข้อมูลแผนก
  async getDepartments(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
    const data = await inventoryService.getDepartments();
    return { data };
  }

  // ดึงข้อมูลหมวดหมู่
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
    const data = await inventoryService.getCategories();
    return { data };
  }

  // ดึงข้อมูลฝ่ายย่อย
  async getSubSections(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
    const data = await inventoryService.getSubSections();
    return { data };
  }

  // ดึงข้อมูลลำดับการอนุมัติ
  async getApprovalFlows(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
    const data = await inventoryService.getApprovalFlows(); 
    return { data };
  }

  /**
   * Description: แก้ไขข้อมูลอุปกรณ์
   * Method: PUT /inventory/:id
   * author: Worrawat Namwat (Wave) 66160372
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
    const { id } = idParamSchema.parse(req.params); 
    const body = updateDevicePayload.parse(req.body);
    const imagePath = req.file?.path;
    const result = await inventoryService.updateDevice(id, body,imagePath);
    return { data: result };
  }
}
