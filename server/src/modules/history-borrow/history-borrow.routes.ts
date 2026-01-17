import { Router } from "../../core/router.js";
import { HistoryBorrowController } from "./history-borrow.controller.js";
import {
  getHistoryBorrowTicketQuerySchema,
  historyBorrowTicketListResponseSchema,
  historyBorrowTicketDetailSchema,
  idParamSchema,
} from "./history-borrow.schema.js";
import { historyBorrowService } from "./history-borrow.service.js";

/**
 * Description: Router ของโมดูล History Borrow สำหรับกำหนดเส้นทาง API และเอกสารประกอบ (Swagger/OpenAPI)
 * Input : - (ประกอบด้วย controller, service, schema)
 * Output : Router instance ที่ mount ด้วย base path /history-borrow
 * Author: Chanwit Muangma (Boom) 66160224
 */
const historyBorrowController = new HistoryBorrowController(historyBorrowService);

/**
 * Description: สร้าง Router ของโมดูล โดยกำหนด base path สำหรับทุก endpoint ในไฟล์นี้
 * Input : basePath "/history-borrow"
 * Output : Router instance สำหรับ register routes
 * Author: Chanwit Muangma (Boom) 66160224
 */
const router = new Router(undefined, "/history-borrow");

/**
 * Description: GET /history-borrow สำหรับดึงรายการประวัติการยืม-คืน (List) พร้อม query สำหรับ pagination/filter/sort/search
 * Input : query (getHistoryBorrowTicketQuerySchema)
 * Output : response (historyBorrowTicketListResponseSchema)
 * Author: Chanwit Muangma (Boom) 66160224
 */
router.getDoc(
  "/",
  {
    tag: "History Borrow",
    query: getHistoryBorrowTicketQuerySchema,
    res: historyBorrowTicketListResponseSchema,
    auth: true,
  },
  (async (req) => {
    return historyBorrowController.getHistoryBorrowTickets(req);
  }) as (req: any) => Promise<any>
);

/**
 * Description: GET /history-borrow/:id สำหรับดึงรายละเอียดประวัติการยืม-คืน (Detail) ตาม ticket id
 * Input : params (idParamSchema)
 * Output : response (historyBorrowTicketDetailSchema)
 * Author: Chanwit Muangma (Boom) 66160224
 */
router.getDoc(
  "/:id",
  {
    tag: "History Borrow",
    params: idParamSchema,
    res: historyBorrowTicketDetailSchema,
    auth: true,
  },
  historyBorrowController.getHistoryBorrowTicketDetail as (
    req: any
  ) => Promise<any>
);

export default router.instance;
