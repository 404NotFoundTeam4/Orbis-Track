import { Router } from "../../core/router.js";
import { HomeController } from "./home.controller.js";
import { getStatsResponseSchema, getRecentTicketsResponseSchema,getTicketDetailResponseSchema } from "./home.schema.js";

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
  res: getStatsResponseSchema, 
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
  res: getRecentTicketsResponseSchema, 
  auth: true 
}, homeController.getRecentTickets);

/**
 * Route: GET /home/tickets/borrow-return/:id
 * Description: API ดึงรายละเอียดคำร้อง
 * Input     : id (number) - รหัสคำร้อง
 * Output    : { data: TicketDetailResponse }
 * Author    : Worrawat Namwat (Wave) 66160372
 */
router.getDoc(
  "/tickets/borrow-return/:id",
  {
    tag: "Home",
    res: getTicketDetailResponseSchema,
    auth: true,
  },homeController.getTicketDetail);

export default router.instance;