import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";
import {
  getHistoryBorrowTicketQuerySchema,
  idParamSchema,
  HistoryBorrowTicketListResponse,
  HistoryBorrowTicketDetailResponse,
} from "./history-borrow.schema.js";
import type { US_ROLE } from "@prisma/client";

/**
 * Description: โครงสร้าง user context ขั้นต่ำที่ controller ต้องใช้ เพื่อส่งต่อให้ service ใช้กำหนดเงื่อนไขการมองเห็นข้อมูล
 * Input : - (ถูกสร้างจากข้อมูลผู้ใช้ที่มาจาก auth middleware)
 * Output : Type สำหรับ currentUserContext ที่ส่งเข้า historyBorrowService
 * Author: Chanwit Muangma (Boom) 66160224
 */
type CurrentUserContext = {
  userId: number; // รหัสผู้ใช้ปัจจุบัน
  userRole: US_ROLE; // บทบาทของผู้ใช้ปัจจุบัน
  departmentId: number | null; // แผนกของผู้ใช้ปัจจุบัน (อาจเป็น null)
  sectionId: number | null; // ฝ่ายย่อยของผู้ใช้ปัจจุบัน (อาจเป็น null)
};

/**
 * Description: สร้าง currentUserContext จาก request โดยรองรับรูปแบบโครงสร้าง user หลายแบบจาก middleware ที่ต่างกัน
 * Input : request (any) Express request ที่มีข้อมูล user ถูกแนบมาแล้ว
 * Output : CurrentUserContext (userId, userRole, departmentId, sectionId)
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
 * Description: Controller สำหรับประวัติการยืม-คืน ทำหน้าที่ validate input และส่งต่อไปยัง service
 * Input : historyBorrowService (dependency injection)
 * Output : Class controller ที่ expose handler สำหรับ list และ detail
 * Author: Chanwit Muangma (Boom) 66160224
 */
export class HistoryBorrowController {
  /**
   * Description: สร้าง instance ของ controller โดยรับ service สำหรับใช้งาน business logic
   * Input : historyBorrowService (object) service ที่มีเมธอด getHistoryBorrowTickets และ getHistoryBorrowTicketDetail
   * Output : HistoryBorrowController instance
   * Author: Chanwit Muangma (Boom) 66160224
   */
  constructor(private readonly historyBorrowService: any) {}

  /**
   * Description: Handler สำหรับดึงรายการประวัติการยืม-คืน (List)
   * Input : req (any) Express request
   * Output : Promise ของข้อมูลที่ตรงกับ historyBorrowTicketListResponseSchema
   * Author: Chanwit Muangma (Boom) 66160224
   */
  getHistoryBorrowTickets = async (
    req: any
  ): Promise<HistoryBorrowTicketListResponse> => {
    const currentUserContext = buildCurrentUserContext(req);

    const validatedQuery = getHistoryBorrowTicketQuerySchema.parse(
      req.query ?? {}
    );

    return this.historyBorrowService.getHistoryBorrowTickets(
      validatedQuery,
      currentUserContext
    );
  };

  /**
   * Description: Handler สำหรับดึงรายละเอียดประวัติการยืม-คืน (Detail)
   * Input : req (any) Express request
   * Output : Promise ของข้อมูลที่ตรงกับ historyBorrowTicketDetailSchema
   * Author: Chanwit Muangma (Boom) 66160224
   */
  getHistoryBorrowTicketDetail = async (
    req: any
  ): Promise<HistoryBorrowTicketDetailResponse> => {
    const currentUserContext = buildCurrentUserContext(req);

    const validatedParams = idParamSchema.parse(req.params ?? {});

    return this.historyBorrowService.getHistoryBorrowTicketDetail(
      validatedParams.id,
      currentUserContext
    );
  };
}
