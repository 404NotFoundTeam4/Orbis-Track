// src/services/HistoryBorrowService.ts
import api from "../api/axios.js";

/**
 * Description: โหมดการมองเห็นข้อมูลของหน้า List ประวัติการยืม-คืน
 * Rule :
 * - "mine" = ของฉัน (brt_user_id = current user)
 * - "all"  = ทั้งหมด (ตามสิทธิ์ของ role)
 * Input : string union
 * Output : ใช้ส่งเป็น query parameter viewMode ไปยัง backend
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowViewMode = "mine" | "all";

/**
 * Description: ทิศทางการเรียงลำดับข้อมูลในหน้า List
 * Input : "asc" | "desc"
 * Output : ใช้ส่งเป็น query parameter ไปยัง backend
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type SortDirection = "asc" | "desc";

/**
 * Description: สถานะประวัติการยืม-คืน (ต้องตรงกับ BRT_STATUS ของ backend)
 * Input : string union
 * Output : ใช้เป็น type ของฟิลด์ status และ filter ใน query
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_USE"
  | "COMPLETED"
  | "OVERDUE"
  | "REJECTED";

/**
 * Description: ฟิลด์ที่รองรับการ sort ในหน้า List (ต้องตรงกับ getHistoryBorrowTicketQuerySchema ของ backend)
 * Input : string union
 * Output : ใช้ส่งเป็น query parameter sortField ไปยัง backend
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowSortField =
  | "deviceName"
  | "deviceChildCount"
  | "category"
  | "requester"
  | "requestDate"
  | "status";

/**
 * Description: โครงสร้างข้อมูลผู้ใช้สำหรับ Approval Flow (ใช้ทั้ง approver และ approverCandidates)
 * Input : response จาก backend (timeline.approver / timeline.approverCandidates[])
 * Output : type สำหรับใช้ใน UI แสดงชื่อผู้อนุมัติ/ผู้มีสิทธิ์อนุมัติ
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type ApproverUser = {
  userId: number;
  fullName: string;
  employeeCode: string | null;
  role: string | null; // รองรับ null เผื่อ backend บางกรณีไม่ส่ง role
  departmentName: string | null;
  sectionName: string | null;
};

/**
 * Description: โครงสร้างข้อมูล Timeline ของแต่ละ step ในการอนุมัติ
 * - รองรับ flow scope (flowDepartmentId/flowSectionId) และรายชื่อผู้มีสิทธิ์อนุมัติ (approverCandidates)
 * Input : response จาก backend (detail.timeline[])
 * Output : type สำหรับใช้ใน UI แสดง Timeline + Tooltip flow
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTimelineStep = {
  stepNumber: number;
  roleDisplayName: string;
  requiredRole: string;
  status: string;

  /**
   * Description: scope ที่ UI แสดง “หน่วยงานของ step” (อาจเป็นของคนอนุมัติจริง หรือ fallback จาก flow)
   * Input : departmentId/departmentName/sectionId/sectionName จาก backend
   * Output : ข้อมูลหน่วยงานของ step ที่ใช้แสดงใน Timeline หลัก
   * Author: Chanwit Muangma (Boom) 66160224
   */
  departmentId: number | null;
  departmentName: string | null;
  sectionId: number | null;
  sectionName: string | null;

  /**
   * Description: scope ตาม flow (ขอบเขตจริงของผู้ที่ “ควร” อนุมัติใน step นั้น)
   * Input : flowDepartmentId/flowSectionId จาก backend (optional)
   * Output : ใช้ใน Tooltip / debug / logic เพิ่มเติม
   * Author: Chanwit Muangma (Boom) 66160224
   */
  flowDepartmentId?: number | null;
  flowDepartmentName?: string | null;
  flowSectionId?: number | null;
  flowSectionName?: string | null;

  /**
   * Description: ผู้อนุมัติจริงของ step (มีค่าเมื่อ step ถูกอนุมัติ/ดำเนินการแล้ว)
   * Input : timeline.approver จาก backend
   * Output : ApproverUser | null
   * Author: Chanwit Muangma (Boom) 66160224
   */
  approver: ApproverUser | null;

  /**
   * Description: รายชื่อผู้มีสิทธิ์อนุมัติทั้งหมดของ step (ใช้ทำ UI แบบ 2 ชื่อ + "+N")
   * Input : timeline.approverCandidates จาก backend (optional)
   * Output : ApproverUser[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  approverCandidates?: ApproverUser[];

  updatedAt: string | null;
};

/**
 * Description: โครงสร้างข้อมูลแถวรายการประวัติการยืม-คืน (List item) ให้ตรงกับ backend schema (ชื่อเต็ม)
 * Input : response จาก backend
 * Output : type สำหรับใช้ใน UI table
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTicketItem = {
  ticketId: number;
  status: HistoryBorrowStatus;
  requestDateTime: string; // ISO string

  deviceChildCount: number;

  requester: {
    userId: number;
    fullName: string;
    employeeCode: string | null;
     borrowName: string | null;
      borrowPhone: string | null;
    /**
     * Description: ชื่อหน่วยงานของผู้ร้องขอ (ใส่มาเพื่อให้ UI list แสดงได้)
     * Input : requester.department_name / requester.section_name จาก backend
     * Output : string | null
     * Author: Chanwit Muangma (Boom) 66160224
     */
    department_name?: string | null;
    section_name?: string | null;
  };

  deviceSummary: {
    deviceId: number;
    deviceName: string;
    deviceSerialNumber: string;
    categoryName: string;
  };
};

/**
 * Description: โครงสร้างข้อมูล pagination จาก backend
 * Input : response.pagination
 * Output : type สำหรับใช้ใน UI paging
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

/**
 * Description: โครงสร้าง response สำหรับหน้า List ให้ตรงกับ backend
 * Input : response จาก backend
 * Output : type สำหรับใช้งานในหน้า List
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowListResponse = {
  items: HistoryBorrowTicketItem[];
  pagination: HistoryBorrowPagination;
};

/**
 * Description: โครงสร้างข้อมูลรายละเอียดประวัติการยืม-คืน (Detail) ให้ตรงกับ backend schema (ชื่อเต็ม)
 * Input : response จาก backend
 * Output : type สำหรับใช้ใน UI modal/detail page
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryBorrowTicketDetail = {
  ticketId: number;
  status: HistoryBorrowStatus;
  requestDateTime: string; // ISO string

  requester: {
    userId: number;
    fullName: string;
    employeeCode: string | null;
    phoneNumber: string | null;

    /**
     * Description: ชื่อหน่วยงานของผู้ร้องขอในหน้า detail
     * Input : requester.department_name / requester.section_name จาก backend
     * Output : string | null
     * Author: Chanwit Muangma (Boom) 66160224
     */
    department_name?: string | null;
    section_name?: string | null;
  };

  device: {
    deviceId: number;
    deviceName: string;
    deviceSerialNumber: string;
    categoryName: string;
    imageUrl: string | null;
    description: string | null;
    maximumBorrowDays: number;
    sectionName: string | null;
    departmentName: string | null;
  };

  deviceChildCount: number;
  deviceChildren: Array<{
    deviceChildId: number;
    assetCode: string;
    serialNumber: string | null;
    status: string;
  }>;

  borrowPurpose: string;
  usageLocation: string;

  borrowDateRange: { startDateTime: string; endDateTime: string };
  inUseDateTime: string;

  fulfillmentDateTimes: {
    pickupDateTime: string | null;
    returnDateTime: string | null;
  };

  pickupLocation: string | null;
  returnLocation: string | null;
  rejectReason: string | null;

  accessories: Array<{
    accessoryId: number;
    accessoryName: string;
    quantity: number;
  }>;

  /**
   * Description: Timeline/Approval stages ของ ticket (รองรับ approverCandidates และ flow scope)
   * Input : response.timeline จาก backend
   * Output : HistoryBorrowTimelineStep[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  timeline: HistoryBorrowTimelineStep[];
};

/**
 * Description: พารามิเตอร์สำหรับเรียกหน้า List
 * Input : page, limit, viewMode, status, search, sortField, sortDirection
 * Output : ใช้ส่งเป็น query parameters ไปยัง backend
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type GetHistoryBorrowListParams = {
  page?: number;
  limit?: number;
  status?: HistoryBorrowStatus;
  viewMode?: HistoryBorrowViewMode;
  search?: string;
  sortField?: HistoryBorrowSortField;
  sortDirection?: SortDirection;
};

/**
 * Description: แกะ payload ของ response สำหรับหน้า List ให้รองรับหลายรูปแบบของ backend wrapper
 * Input : payload (any)
 * Output : HistoryBorrowListResponse
 * Author: Chanwit Muangma (Boom) 66160224
 */
function unwrapListPayload(payload: any): HistoryBorrowListResponse {
  // รองรับกรณี backend ห่อด้วย { data: { items, pagination } }
  if (payload?.data?.items && payload?.data?.pagination) return payload.data;

  // รองรับกรณี backend ส่ง { items, pagination }
  if (payload?.items && payload?.pagination) return payload;

  throw new Error("Invalid history-borrow list response shape");
}

/**
 * Description: แกะ payload ของ response สำหรับหน้า Detail ให้รองรับหลายรูปแบบของ backend wrapper
 * - รองรับกรณี backend ส่ง { success, message, ...detail } ด้วย
 * Input : payload (any)
 * Output : HistoryBorrowTicketDetail
 * Author: Chanwit Muangma (Boom) 66160224
 */
function unwrapDetailPayload(payload: any): HistoryBorrowTicketDetail {
  // normalize ให้รองรับทั้ง payload และ payload.data
  const normalized = payload?.data ?? payload;

  // กรณี backend ห่อด้วย { data: { ticketId, ... } }
  if (normalized?.data?.ticketId) return normalized.data;

  // กรณี backend ส่ง { ticketId, ... } ตรง ๆ (รวมถึงแบบมี success/message)
  if (normalized?.ticketId) return normalized;

  throw new Error("Invalid history-borrow detail response shape");
}

/**
 * Description: เรียก API เพื่อดึงรายการประวัติการยืม-คืน (List)
 * Input : params (GetHistoryBorrowListParams)
 * Output : Promise<HistoryBorrowListResponse>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryBorrowTickets(
  params: GetHistoryBorrowListParams
): Promise<HistoryBorrowListResponse> {
  const response = await api.get("/history-borrow", { params });
  return unwrapListPayload(response.data);
}

/**
 * Description: เรียก API เพื่อดึงรายละเอียดประวัติการยืม-คืน (Detail)
 * Input : ticketId (number)
 * Output : Promise<HistoryBorrowTicketDetail>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryBorrowTicketDetail(
  ticketId: number
): Promise<HistoryBorrowTicketDetail> {
  const response = await api.get(`/history-borrow/${ticketId}`);
  return unwrapDetailPayload(response.data);
}

/**
 * Description: Export service สำหรับหน้า History Borrow เพื่อให้ component เรียกใช้งาน
 * Input : - (อ้างอิงฟังก์ชันภายในไฟล์)
 * Output : object ที่รวมเมธอด getHistoryBorrowTickets และ getHistoryBorrowTicketDetail
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowService = {
  getHistoryBorrowTickets,
  getHistoryBorrowTicketDetail,
};
