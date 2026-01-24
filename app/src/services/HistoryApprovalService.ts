// src/services/ApprovalHistoryService.ts
import api from "../api/axios.js";

/**
 * Description: ประเภทผลการอนุมัติที่ใช้ในหน้า "ประวัติการอนุมัติ"
 * - backend ส่ง action = "APPROVED" | "REJECTED"
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type ApprovalDecision = "APPROVED" | "REJECTED";

/**
 * Description: ทิศทางการเรียงลำดับข้อมูล
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type SortDirection = "asc" | "desc";

/**
 * Description: ฟิลด์ที่รองรับการ sort ในหน้า "ประวัติการอนุมัติ"
 * - NOTE: ปรับให้ตรงกับ backend query ได้ภายหลัง
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalSortField =
  | "actionDateTime"
  | "action"
  | "requester"
  | "deviceName";

/**
 * Description: ข้อมูลผู้ใช้แบบย่อสำหรับแสดงในตาราง/โมดัล
 * - เพิ่ม field scope สำหรับ detail (department/section/role) ให้ไม่แดง
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalUserSummary = {
  userId: number;
  fullName: string;
  employeeCode: string | null;

  /**
   * Description: ฟิลด์เสริมจาก backend detail (optional)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  role?: string | null;
  departmentName?: string | null;
  sectionName?: string | null;
};

/**
 * Description: ข้อมูลอุปกรณ์แม่แบบย่อสำหรับแสดงในตาราง/โมดัล
 * - เพิ่ม categoryName ตาม backend
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalDeviceSummary = {
  deviceId: number;
  deviceName: string;
  deviceSerialNumber: string;

  /**
   * Description: หมวดหมู่อุปกรณ์ (อาจเป็น null ได้)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  categoryName: string | null;
};

/**
 * Description: แถวข้อมูล (List item) ของ "ประวัติการอนุมัติ"
 * - backend list ล่าสุด: ไม่มี actor, มี deviceSummary.categoryName
 * - ใช้ ticketId เป็นตัวอ้างอิงสำหรับเปิด detail
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalItem = {
  ticketId: number;
  decision: ApprovalDecision;
  actionDateTime: string;

  requester: HistoryApprovalUserSummary;

  /**
   * Description: กันกรณี backend list บาง record ไม่มี deviceSummary
   * Author: Chanwit Muangma (Boom) 66160224
   */
  device: HistoryApprovalDeviceSummary | null;
};

/**
 * Description: โครงสร้าง pagination มาตรฐาน
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalPagination = {
  page: number;
  limit: number;

  /**
   * Description: backend บางเวอร์ชันใช้ totalItems / บางเวอร์ชันใช้ totalItem
   * Author: Chanwit Muangma (Boom) 66160224
   */
  totalItems?: number;
  totalItem?: number;

  totalPages: number;
};

/**
 * Description: Response ของหน้า List "ประวัติการอนุมัติ"
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalListResponse = {
  items: HistoryApprovalItem[];
  pagination: HistoryApprovalPagination;
};

/**
 * Description: Response ของหน้า Detail "ประวัติการอนุมัติ" (สำหรับ Modal)
 * - เพิ่ม field ใหม่: borrowPurpose, usageLocation, borrowDateRange
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryApprovalDetail = {
  ticketId: number;
  decision: ApprovalDecision;
  actionDateTime: string;

  requester: HistoryApprovalUserSummary;
  device: HistoryApprovalDeviceSummary;
  deviceChildCount: number;

  /**
   * Description: actor มีเฉพาะ detail (backend ส่งมา)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  actor: HistoryApprovalUserSummary | null;

  /**
   * Description: ฟิลด์ใหม่ใน detail ตาม backend
   * Author: Chanwit Muangma (Boom) 66160224
   */
  borrowPurpose: string | null;
  usageLocation: string | null;
  borrowDateRange: {
    startDateTime: string;
    endDateTime: string;
  };

  rejectReason: string | null;
};

/**
 * Description: Normalize ค่าผลการอนุมัติจาก backend ให้เหลือแค่ "APPROVED" | "REJECTED"
 * - กันตัวพิมพ์เล็ก/ช่องว่าง
 *
 * Input : rawAction (any)
 * Output : ApprovalDecision
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
function normalizeApprovalDecision(rawAction: any): ApprovalDecision {
  const normalizedActionText = String(rawAction ?? "").trim().toUpperCase();
  return normalizedActionText === "REJECTED" ? "REJECTED" : "APPROVED";
}

/**
 * Description: unwrap payload ของ list ให้รองรับ wrapper หลายแบบ
 * - รองรับ { success, message, items, pagination }
 * - รองรับ { data: { items, pagination } }
 * - รองรับ { success, message, data: { items, pagination } }
 *
 * Input : payload (any)
 * Output : { items, pagination }
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
function unwrapHistoryApprovalListPayload(payload: any): {
  items: any[];
  pagination: any;
} {
  const normalizedLevel1 = payload?.data ?? payload;
  const normalizedLevel2 = normalizedLevel1?.data ?? normalizedLevel1;

  /**
   * Description: backend ล่าสุดของคุณส่ง items/pagination ไว้ "ระดับเดียวกัน"
   * (มี success/message คู่กัน)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  if (Array.isArray(normalizedLevel2?.items) && normalizedLevel2?.pagination) {
    return { items: normalizedLevel2.items, pagination: normalizedLevel2.pagination };
  }

  // fallback กรณีบาง endpoint ใช้ key item
  if (Array.isArray(normalizedLevel2?.item) && normalizedLevel2?.pagination) {
    return { items: normalizedLevel2.item, pagination: normalizedLevel2.pagination };
  }

  throw new Error("Invalid approval history list response shape");
}

/**
 * Description: Normalize list item ของประวัติการอนุมัติให้ shape ตรงกับ HistoryApprovalItem
 * - รองรับ backend ส่ง deviceSummary เป็นหลัก
 * - กันค่าว่างเพื่อไม่ให้ UI แตก
 *
 * Input : rawItem (any)
 * Output : HistoryApprovalItem
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
function normalizeHistoryApprovalListItem(rawItem: any): HistoryApprovalItem {
  const requesterPayload = rawItem?.requester ?? null;

  /**
   * Description: backend list ส่ง "deviceSummary" เป็นหลัก
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const devicePayload = rawItem?.deviceSummary ?? rawItem?.device ?? null;

  const normalizedDevice: HistoryApprovalDeviceSummary | null = devicePayload
    ? {
        deviceId: Number(devicePayload?.deviceId ?? 0),
        deviceName: String(devicePayload?.deviceName ?? "-"),
        deviceSerialNumber: String(devicePayload?.deviceSerialNumber ?? "-"),
        categoryName:
          devicePayload?.categoryName === null || devicePayload?.categoryName === undefined
            ? null
            : String(devicePayload.categoryName),
      }
    : null;

  return {
    ticketId: Number(rawItem?.ticketId ?? 0),
    decision: normalizeApprovalDecision(rawItem?.action ?? rawItem?.decision),
    actionDateTime: String(rawItem?.actionDateTime ?? ""),

    requester: {
      userId: Number(requesterPayload?.userId ?? 0),
      fullName: String(requesterPayload?.fullName ?? "-"),
      employeeCode: requesterPayload?.employeeCode ?? null,

      // optional fields (list อาจส่งมาด้วยหรือไม่ส่งก็ได้)
      departmentName: requesterPayload?.departmentName ?? null,
      sectionName: requesterPayload?.sectionName ?? null,
    },

    device: normalizedDevice,
  };
}


/**
 * Description: unwrap payload ของ detail ให้รองรับ wrapper หลายแบบ และ map key ให้ตรงกับ UI
 * - รองรับ { success, message, ...detail }   (backend ล่าสุดของคุณเป็นแบบนี้)
 * - รองรับ { data: {...detail} }
 * - รองรับ { success, message, data: {...detail} }
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
function unwrapHistoryApprovalDetailPayload(payload: any): HistoryApprovalDetail {
  const normalizedLevel1 = payload?.data ?? payload;
  const normalizedLevel2 = normalizedLevel1?.data ?? normalizedLevel1;

  // backend detail อย่างน้อยต้องมี ticketId และ action
  if (!normalizedLevel2?.ticketId || !normalizedLevel2?.action) {
    throw new Error("Invalid approval history detail response shape");
  }

  const requesterPayload = normalizedLevel2?.requester ?? {};
  const devicePayload = normalizedLevel2?.deviceSummary ?? normalizedLevel2?.device ?? {};
  const actorPayload = normalizedLevel2?.actor ?? null;

  return {
    ticketId: Number(normalizedLevel2.ticketId),
    decision: normalizeApprovalDecision(normalizedLevel2.action),
    actionDateTime: String(normalizedLevel2.actionDateTime ?? ""),

    requester: {
      userId: Number(requesterPayload?.userId ?? 0),
      fullName: String(requesterPayload?.fullName ?? "-"),
      employeeCode: requesterPayload?.employeeCode ?? null,
      departmentName: requesterPayload?.departmentName ?? null,
      sectionName: requesterPayload?.sectionName ?? null,
    },

    device: {
      deviceId: Number(devicePayload?.deviceId ?? 0),
      deviceName: String(devicePayload?.deviceName ?? "-"),
      deviceSerialNumber: String(devicePayload?.deviceSerialNumber ?? "-"),
      categoryName: devicePayload?.categoryName ?? null,
    },

    deviceChildCount: Number(normalizedLevel2.deviceChildCount ?? 0),

    actor: actorPayload
      ? {
          userId: Number(actorPayload?.userId ?? 0),
          fullName: String(actorPayload?.fullName ?? "-"),
          employeeCode: actorPayload?.employeeCode ?? null,

          /**
           * Description: actor detail ส่ง role/department/section มาด้วย
           * - ใส่ optional fields เพื่อไม่ให้ TypeScript แดง
           * Author: Chanwit Muangma (Boom) 66160224
           */
          role: actorPayload?.role ?? null,
          departmentName: actorPayload?.departmentName ?? null,
          sectionName: actorPayload?.sectionName ?? null,
        }
      : null,

    /**
     * Description: ฟิลด์ใหม่ใน detail (ตาม backend ล่าสุด)
     * Author: Chanwit Muangma (Boom) 66160224
     */
    borrowPurpose: normalizedLevel2.borrowPurpose ?? null,
    usageLocation: normalizedLevel2.usageLocation ?? null,
    borrowDateRange: {
      startDateTime: String(normalizedLevel2?.borrowDateRange?.startDateTime ?? ""),
      endDateTime: String(normalizedLevel2?.borrowDateRange?.endDateTime ?? ""),
    },

    rejectReason: normalizedLevel2.rejectReason ?? null,
  };
}

/**
 * Description: พารามิเตอร์เรียก list "ประวัติการอนุมัติ"
 * - ใช้ชื่อ action ให้ตรงกับ backend
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type GetHistoryApprovalListParams = {
  page?: number;
  limit?: number;
  action?: ApprovalDecision;
  search?: string;
  sortField?: HistoryApprovalSortField;
  sortDirection?: SortDirection;
};

/**
 * Description: เรียก API เพื่อดึง list "ประวัติการอนุมัติ"
 * - unwrap + normalize items เพื่อให้ shape เสถียรสำหรับ UI
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryApprovalList(
  params: GetHistoryApprovalListParams
): Promise<HistoryApprovalListResponse> {
  const response = await api.get("/history-approval", { params });

  const parsedResponse = unwrapHistoryApprovalListPayload(response.data);

  /**
   * Description: normalize items ทุกแถว เพื่อกัน field ขาด/ชื่อ field ไม่ตรง
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const normalizedItems = parsedResponse.items.map(normalizeHistoryApprovalListItem);

  // normalize pagination (รองรับ totalItems/totalItem)
  const rawPagination = parsedResponse.pagination ?? {};
  const normalizedPagination: HistoryApprovalPagination = {
    page: Number(rawPagination.page ?? 1),
    limit: Number(rawPagination.limit ?? params.limit ?? 10),
    totalItems: rawPagination.totalItems ?? rawPagination.totalItem ?? undefined,
    totalItem: rawPagination.totalItem ?? rawPagination.totalItems ?? undefined,
    totalPages: Number(rawPagination.totalPages ?? 1),
  };

  return {
    items: normalizedItems,
    pagination: normalizedPagination,
  };
}

/**
 * Description: เรียก API เพื่อดึง detail สำหรับ Modal
 * - ใช้ ticketId เป็น id อย่างเดียวได้ (ตาม backend: /history-approval/{id})
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryApprovalDetail(ticketId: number): Promise<HistoryApprovalDetail> {
  const response = await api.get(`/history-approval/${ticketId}`);
  return unwrapHistoryApprovalDetailPayload(response.data);
}

/**
 * Description: Export service สำหรับหน้า Approval History
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const approvalHistoryService = {
  getHistoryApprovalList,
  getHistoryApprovalDetail,
};
