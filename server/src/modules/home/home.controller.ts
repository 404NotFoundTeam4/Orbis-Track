import { NextFunction, Request, Response } from "express";
import { homeService } from "./home.service.js";
import { BaseResponse } from "../../core/base.response.js";
import { BaseController } from "../../core/base.controller.js";
import { HomeStats,TicketHomeItem,TicketDetailResponse } from "./home.schema.js";

export class HomeController extends BaseController {
  constructor() {
    super();
  }
  /**
   * Description: ดึงข้อมูลสถิติภาพรวมสำหรับ Home (จำนวนยืม, คืน, รออนุมัติ, แจ้งซ่อม)
   * Input     : -
   * Output    : { data: Stats }
   * Author    : Worrawat Namwat (Wave) 66160372
   */
 async getStats(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<BaseResponse<HomeStats>> {
    const stats = await homeService.getHomeStats();
    return { data: stats };
  }

  /**
   * Description: ดึงข้อมูลคำร้องล่าสุดสำหรับแสดงในหน้า Home
   * Input     : -  
   * Output    : { data: Ticket }
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  async getRecentTickets(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<BaseResponse<TicketHomeItem[]>> {
    const tickets = await homeService.getRecentTickets();
    return { data: tickets };
  }

  /**
   * Description: ดึงรายละเอียดคำร้อง
   * Input     : id (number) - รหัสคำร้อง
   * Output    : { data: TicketDetailResponse }
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  async getTicketDetail(
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<BaseResponse<TicketDetailResponse>> {
    const { id } = req.params;
    const detail = await homeService.getTicketDetailById(Number(id));
    return { data: detail };
  }
}