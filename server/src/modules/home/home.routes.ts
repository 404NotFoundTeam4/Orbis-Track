import { Router } from "../../core/router.js";
import { HomeController } from "./home.controller.js";
import { GetStatsResponseSchema, GetRecentTicketsResponseSchema } from "./home.schema.js";

const homeController = new HomeController(); 
const router = new Router(undefined, '/home'); 

/**
 * Route: GET /home/stats
 * Description: API ดึงสถิติ Dashboard (Borrowed, Returned, Waiting, Report)
 * Input     : -
 * Output    : { data: HomeStats }
 * Author    : Worrawat Namwat (Wave) 66160372
 */
router.getDoc("/stats", { 
  tag: "Home", 
  res: GetStatsResponseSchema, 
  auth: true 
}, homeController.getStats);

/**
 * Route: GET /home/tickets
 * Description: API ดึงคำร้องล่าสุด 5 รายการ สำหรับหน้า Home 
 * Input     : -  
 * Output    : { data: RecentTicket[] }
 * Author    : Worrawat Namwat (Wave) 66160372
 */
router.getDoc("/tickets", { 
  tag: "Home", 
  res: GetRecentTicketsResponseSchema, 
  auth: true 
}, homeController.getRecentTickets);

export default router.instance;