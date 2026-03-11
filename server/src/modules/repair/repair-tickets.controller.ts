import { NextFunction, Request, Response } from "express";
import { repairTicketsService } from "./repair-tickets.service.js";
import { approveRepairTicketBodySchema } from "./repair-tickets.schema.js";
import { BaseResponse } from "../../core/base.response.js";
import { BaseController } from "../../core/base.controller.js";
import { 
  getRepairTicketsQuerySchema, 
  RepairTicketsResponse 
} from "./repair-tickets.schema.js";
import { ticket_issues } from "@prisma/client"; 

export type PaginatedBaseResponse<T, P> = BaseResponse<T> & {
  pagination: P;
};

export class RepairTicketsController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงรายการแจ้งซ่อมทั้งหมด พร้อมรองรับระบบตรวจสอบ Query (Zod) และแบ่งหน้า (Pagination)
   * Input     : req, res, next
   * Output    : Promise<PaginatedBaseResponse>
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  async getRepairTickets(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<PaginatedBaseResponse<RepairTicketsResponse["data"], RepairTicketsResponse["pagination"]>> {
    const query = getRepairTicketsQuerySchema.parse(req.query);
    const result = await repairTicketsService.getRepairTickets(query);
    
    return { 
      success: true,
      data: result.data,
      pagination: result.pagination 
    };
  }

  /**
   * Description: อนุมัติรับเรื่องคำร้องแจ้งซ่อม โดยมีการตรวจสอบ Body ผ่าน Zod แบบ safeParse
   * Input     : req (params: id, body: user_id), res, next
   * Output    : Promise<unknown>
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  async approveTicket(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<ticket_issues>> {
    
    const ticketId = Number(req.params.id);
    
    // Zod ตรวจสอบข้อมูล ถ้าไม่ผ่านระบบ Router จะจับโยนเป็น 400 ให้อัตโนมัติ
    const body = approveRepairTicketBodySchema.parse(req.body);
    
    // เรียกใช้ Service อัปเดตข้อมูลใน Database
    const result = await repairTicketsService.approveTicket(ticketId, body.user_id); 
    return { 
      success: true, 
      message: "รับคำร้องแจ้งซ่อมสำเร็จ",
      data: result 
    };
  }
}