// src/modules/history-approval/history-approval.controller.ts
import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";
import {
  getHistoryApprovalQuerySchema,
  idParamSchema,
} from "./history-approval.schema.js";
import type { US_ROLE } from "@prisma/client";
import type {
  HistoryApprovalDetail,
  HistoryApprovalListResponse,
} from "./history-approval.schema.js";

/**
 * Description: โครงสร้าง user context ขั้นต่ำที่ controller ต้องใช้ เพื่อส่งต่อให้ service ใช้กำหนดเงื่อนไขสิทธิ์
 * Author: Chanwit Muangma (Boom) 66160224
 */
type CurrentUserContext = {
  userId: number;
  userRole: US_ROLE;
  departmentId: number | null;
  sectionId: number | null;
};

/**
 * Description: สร้าง currentUserContext จาก request โดยรองรับรูปแบบโครงสร้าง user หลายแบบจาก middleware ที่ต่างกัน
 * Input : request (any)
 * Output : CurrentUserContext
 * Author: Chanwit Muangma (Boom) 66160224
 */
function buildCurrentUserContext(request: any): CurrentUserContext {
  const rawUserContainer =
    request?.user ??
    request?.currentUser ??
    request?.auth ??
    request?.locals?.user ??
    null;

  const userRecord = rawUserContainer?.user ?? rawUserContainer;

  if (!userRecord) {
    throw new HttpError(HttpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const resolvedUserId =
    userRecord.us_id ??
    userRecord.usId ??
    userRecord.user_id ??
    userRecord.userId ??
    userRecord.id ??
    userRecord.sub;

  const resolvedUserRole =
    userRecord.us_role ??
    userRecord.usRole ??
    userRecord.role ??
    userRecord.user_role ??
    userRecord.userRole;

  if (!resolvedUserId || !resolvedUserRole) {
    throw new HttpError(HttpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const resolvedDepartmentId =
    userRecord.us_dept_id ?? userRecord.dept_id ?? userRecord.dept ?? null;

  const resolvedSectionId =
    userRecord.us_sec_id ?? userRecord.sec_id ?? userRecord.sec ?? null;

  return {
    userId: Number(resolvedUserId),
    userRole: resolvedUserRole as US_ROLE,
    departmentId:
      resolvedDepartmentId === null || resolvedDepartmentId === undefined
        ? null
        : Number(resolvedDepartmentId),
    sectionId:
      resolvedSectionId === null || resolvedSectionId === undefined
        ? null
        : Number(resolvedSectionId),
  };
}

/**
 * Description: Controller สำหรับประวัติการอนุมัติ (ดูประวัติการอนุมัติของตัวเอง)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export class HistoryApprovalController {
  constructor(private readonly historyApprovalService: any) {}

  /**
   * Description: Handler สำหรับดึงรายการประวัติการอนุมัติ (List)
   * Input : req (any)
   * Output : Promise<HistoryApprovalListResponse>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  getHistoryApprovalItems = async (
    req: any
  ): Promise<HistoryApprovalListResponse> => {
    const currentUserContext = buildCurrentUserContext(req);

    const validatedQuery = getHistoryApprovalQuerySchema.parse(req.query ?? {});

    return this.historyApprovalService.getHistoryApprovalItems(
      validatedQuery,
      currentUserContext
    );
  };

  /**
 * Description: Handler สำหรับดึงรายละเอียดประวัติการอนุมัติ (Detail) ของ ticket
 * Input : req (any)
 * Output : Promise<HistoryApprovalDetail>
 * Author: Chanwit Muangma (Boom) 66160224
 */
getHistoryApprovalDetail = async (req: any): Promise<HistoryApprovalDetail> => {
  const currentUserContext = buildCurrentUserContext(req);

  const validatedParams = idParamSchema.parse(req.params ?? {});
  const ticketId = validatedParams.id;

  return this.historyApprovalService.getHistoryApprovalDetail(
    ticketId,
    currentUserContext
  );
};
}
