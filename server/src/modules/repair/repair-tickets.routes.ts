import { Router } from "../../core/router.js";
import { approveRepairTicketBodySchema } from "./repair-tickets.schema.js";
import { RepairTicketsController } from "./repair-tickets.controller.js";
import { 
  getRepairTicketsResponseSchema, 
  getRepairTicketsQuerySchema 
} from "./repair-tickets.schema.js";

const controller = new RepairTicketsController();
const router = new Router(undefined, '/repair-tickets');

/**
 * Route: GET /repair-tickets
 * Description: API ดึงรายการแจ้งซ่อมทั้งหมด
 * Input     : Query (page, limit, search, status, dates)
 * Output    : { status, data: [], pagination }
 * Author    : Worrawat Namwat (Wave) 66160372
 */
router.getDoc("/", {
  tag: "Repair-Tickets",
  summary: "ดึงรายการแจ้งซ่อม",
  description: "ดึงข้อมูล Ticket Issues พร้อมฟิลเตอร์ สถานะ, วันที่ และค้นหา",
  query: getRepairTicketsQuerySchema,
  res: getRepairTicketsResponseSchema,
  auth: true
}, controller.getRepairTickets);

/**
 * Route: PATCH /repair-tickets/:id/approve
 * Description: อนุมัติใบแจ้งซ่อม
 * Input     : Path Param (id), Body (user_id)
 * Output    : { success: boolean, message: string }
 * Author    : Worrawat Namwat (Wave) 66160372
 */
router.patchDoc("/:id/approve", {
  tag: "Repair-Tickets",
  summary: "อนุมัติใบแจ้งซ่อม",
  description: "เปลี่ยนสถานะใบแจ้งซ่อมเป็นกำลังดำเนินการ และบันทึกผู้รับเรื่อง",
  body: approveRepairTicketBodySchema, 
  auth: true
}, controller.approveTicket);

export default router.instance;