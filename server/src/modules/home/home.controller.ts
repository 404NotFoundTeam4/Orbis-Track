import { NextFunction, Request, Response } from "express";
import { homeService } from "./home.service.js";
import { BaseResponse } from "../../core/base.response.js";
import { BaseController } from "../../core/base.controller.js";

export class HomeController extends BaseController {
  constructor() {
    super();
  }
  /**
   * Description: ดึงข้อมูลสถิติภาพรวมสำหรับ Home (จำนวนยืม, คืน, รออนุมัติ, แจ้งซ่อม)
   * Input     : -
   * Output    : { data: HomeStats }
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    const stats = await homeService.getHomeStats();
    return { data: stats };
  }

  /**
   * Description: ดึงข้อมูลคำร้องล่าสุดสำหรับแสดงในหน้า Home
   * Input     : -  
   * Output    : { data: RecentTicket[] }
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  async getRecentTickets(req: Request, res: Response, next: NextFunction) {
    const tickets = await homeService.getRecentTickets();
    return { data: tickets };
  }
}