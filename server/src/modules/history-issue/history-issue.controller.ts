import { HttpError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { historyIssueService } from "./history-issue.service.js";

/**
 * Description: Controller ของโมดูล History Issue สำหรับจัดการ logic ระดับ controller
 * - รับ request จาก Router.getDoc
 * - เรียก service เพื่อดึงข้อมูล
 * - คืนค่าเป็น response body (ไม่ใช้ res.json ใน controller)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export class HistoryIssueController {
  constructor(private service: typeof historyIssueService) {}

  /**
   * Description: ดึงรายการประวัติการแจ้งซ่อม (List)
   * Input : request.query, request.user.userId
   * Output : { success: true, data: HistoryIssueItem[] }
   * Author: Chanwit Muangma (Boom) 66160224
   */
  async list(request: any): Promise<any> {
    const currentUserId: number = request.user.userId;
    const data = await this.service.getList(request.query, currentUserId);

    return {
      success: true,
      data,
    };
  }

  /**
   * Description: ดึงรายละเอียดประวัติการแจ้งซ่อม (Detail)
   * Input : request.params.id
   * Output : { success: true, data: HistoryIssueDetail }
   * Author: Chanwit Muangma (Boom) 66160224
   */
  async detail(request: any): Promise<any> {
    const issueId = Number(request.params.id);
    const data = await this.service.getDetail(issueId);

    if (!data) {
      // response schema ของคุณกำหนดว่า data ต้องเป็น object (ไม่ใช่ null) → เลยต้อง throw 404
      throw new HttpError(HttpStatus.NOT_FOUND, "Issue not found");
    }

    return {
      success: true,
      data,
    };
  }
}
