import { Router } from "../../core/router.js";
import { HistoryIssueController } from "./history-issue.controller.js";
import {
  getHistoryIssueQuerySchema,
  historyIssueListResponseSchema,
  historyIssueDetailResponseSchema,
  idParamSchema,
} from "./history-issue.schema.js";
import { historyIssueService } from "./history-issue.service.js";

/**
 * Description: Router ของโมดูล History Issue สำหรับกำหนดเส้นทาง API และเอกสารประกอบ (Swagger/OpenAPI)
 * Input : - (ประกอบด้วย controller, service, schema)
 * Output : Router instance ที่ mount ด้วย base path /history-issue
 * Author: Chanwit Muangma (Boom) 66160224
 */
const historyIssueController = new HistoryIssueController(historyIssueService);

/**
 * Description: สร้าง Router ของโมดูล โดยกำหนด base path สำหรับทุก endpoint ในไฟล์นี้
 * Input : basePath "/history-issue"
 * Output : Router instance สำหรับ register routes
 * Author: Chanwit Muangma (Boom) 66160224
 */
const router = new Router(undefined, "/history-issue");

/**
 * Description: GET /history-issue สำหรับดึงรายการประวัติการแจ้งซ่อม (List)
 * Input : query (getHistoryIssueQuerySchema)
 * Output : response (historyIssueListResponseSchema)
 * Author: Chanwit Muangma (Boom) 66160224
 */
router.getDoc(
  "/",
  {
    tag: "History Issue",
    query: getHistoryIssueQuerySchema,
    res: historyIssueListResponseSchema,
    auth: true,
  },
  (async (request) => {
    return historyIssueController.list(request);
  }) as (request: any) => Promise<any>
);

/**
 * Description: GET /history-issue/:id สำหรับดึงรายละเอียดประวัติการแจ้งซ่อม (Detail) ตาม issue id
 * Input : params (idParamSchema)
 * Output : response (historyIssueDetailResponseSchema)
 * Author: Chanwit Muangma (Boom) 66160224
 */
router.getDoc(
  "/:id",
  {
    tag: "History Issue",
    params: idParamSchema,
    res: historyIssueDetailResponseSchema,
    auth: true,
  },
  (async (request) => {
    return historyIssueController.detail(request);
  }) as (request: any) => Promise<any>
);

export default router.instance;
