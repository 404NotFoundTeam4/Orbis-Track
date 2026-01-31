// src/modules/history-approval/history-approval.route.ts
import { Router } from "../../core/router.js";
import { HistoryApprovalController } from "./history-approval.controller.js";
import {
  getHistoryApprovalQuerySchema,
  historyApprovalListResponseSchema,
  historyApprovalDetailSchema,
  idParamSchema,
} from "./history-approval.schema.js";
import { historyApprovalService } from "./history-approval.service.js";

/**
 * Description: Router ของโมดูล History Approval สำหรับกำหนดเส้นทาง API และเอกสารประกอบ (Swagger/OpenAPI)
 * Author: Chanwit Muangma (Boom) 66160224
 */
const historyApprovalController = new HistoryApprovalController(historyApprovalService);

const router = new Router(undefined, "/history-approval");

/**
 * Description: GET /history-approval
 * - ดึงรายการประวัติการอนุมัติของ “ผู้ใช้ปัจจุบัน”
 * Author: Chanwit Muangma (Boom) 66160224
 */
router.getDoc(
  "/",
  {
    tag: "History Approval",
    query: getHistoryApprovalQuerySchema,
    res: historyApprovalListResponseSchema,
    auth: true,
  },
  historyApprovalController.getHistoryApprovalItems as (req: any) => Promise<any>
);

/**
 * Description: GET /history-approval/:ticketId
 * - ดึงรายละเอียดประวัติการอนุมัติของ ticketId สำหรับ “ผู้ใช้ปัจจุบัน”
 * Author: Chanwit Muangma (Boom) 66160224
 */
router.getDoc(
  "/:id",
  {
    tag: "History Approval",
    params: idParamSchema,
    res: historyApprovalDetailSchema,
    auth: true,
  },
  historyApprovalController.getHistoryApprovalDetail as (req: any) => Promise<any>
);

export default router.instance;
