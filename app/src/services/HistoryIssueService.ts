/**
 * Description: Service สำหรับเรียก API โมดูล History Issue (ประวัติการแจ้งซ่อม)
 * - List: GET /history-issue
 * - Detail: GET /history-issue/:id
 * Input : params สำหรับ query และ issueId
 * Output : TypeScript types + functions สำหรับดึงข้อมูลไปใช้ในหน้า History
 * Author: Chanwit Muangma (Boom) 66160224
 */
import api from "../api/axios.js";

/**
 * Description: สถานะของ ticket แจ้งซ่อม (ต้องตรงกับ TI_STATUS ของ backend)
 * Input : string union
 * Output : ใช้เป็น type ของฟิลด์ status และ filter ใน query
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryIssueStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

/**
 * Description: ผลการซ่อมของ ticket แจ้งซ่อม (ต้องตรงกับ TI_RESULT ของ backend)
 * Input : string union
 * Output : ใช้เป็น type ของฟิลด์ result
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryIssueResult = "SUCCESS" | "FAILED" | "IN_PROGRESS";

/**
 * Description: Query params สำหรับ list
 * - status: filter ตามสถานะ
 * - assignedToMe: filter เฉพาะงานที่ถูก assign ให้ผู้ใช้ปัจจุบัน
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type GetHistoryIssueListParams = {
  status?: HistoryIssueStatus;
  assignedToMe?: boolean;
};

/**
 * Description: โครงสร้างข้อมูลอุปกรณ์ลูกในหน้า detail
 * - deviceChildAssetCode: รหัสอุปกรณ์ลูก (dec_asset_code)
 * - deviceChildSerialNumber: serial number (nullable)
 * - deviceChildStatus: สถานะล่าสุดของอุปกรณ์ลูก (DEVICE_CHILD_STATUS)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryIssueDeviceChild = {
  deviceChildId: number;
  deviceChildAssetCode: string;
  deviceChildSerialNumber: string | null;
  deviceChildStatus: string;
};

/**
 * Description: โครงสร้างรูปแนบของใบแจ้งซ่อม (attachments)
 * - attachmentId: รหัสไฟล์แนบ (iatt_id)
 * - pathUrl: url/path ของไฟล์ (iatt_path_url)
 * - uploadedAt: วันที่แนบไฟล์ (uploaded_at) (ISO string)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryIssueAttachment = {
  attachmentId: number;
  pathUrl: string;
  uploadedAt: string;
};

/**
 * Description: ข้อมูลรายการในหน้า list
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryIssueItem = {
  issueId: number;

  parentDevice: {
    id: number;
    serialNumber: string;
    name: string;
    categoryName: string;
    departmentName: string | null;
    sectionName: string | null;
    locationName: string;

    /**
     * Description: รูปของอุปกรณ์แม่ (devices.de_images) (nullable)
     * Note: เป็นรูปของ “อุปกรณ์แม่” ไม่ใช่รูปแนบของใบแจ้งซ่อม
     * Author: Chanwit Muangma (Boom) 66160224
     */
    imageUrl: string | null;
  };

  issueTitle: string;
  issueDescription: string;
  issueStatus: HistoryIssueStatus;
  issueResult: HistoryIssueResult;

  /**
   * Description: วันเวลาที่แจ้ง (backend ส่งเป็น ISO string)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  reportedAt: string;

  reporterUser: {
    id: number;
    empCode: string | null;
    fullName: string;
  };

  /**
   * Description: ผู้รับผิดชอบ (nullable)
   * Note: ต้องมี empCode ด้วย ตาม requirement ล่าสุด
   * Author: Chanwit Muangma (Boom) 66160224
   */
  assigneeUser: {
    id: number;
    empCode: string | null;
    fullName: string;
  } | null;

  receiveLocationName: string | null;

  deviceChildCount: number;
};

/**
 * Description: ข้อมูลรายละเอียดในหน้า detail
 * - เพิ่ม attachments เพื่อใช้ทำปุ่ม “ดูรูป” แล้วเปิดรูปใหญ่
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type HistoryIssueDetail = HistoryIssueItem & {
  damagedReason: string | null;
  resolvedNote: string | null;
  deviceChildList: HistoryIssueDeviceChild[];

  /**
   * Description: รูปแนบของใบแจ้งซ่อม (issue_attachments)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  attachments: HistoryIssueAttachment[];
};

/**
 * Description: รูปแบบ response envelope จาก backend (router.getDoc)
 * Author: Chanwit Muangma (Boom) 66160224
 */
type ApiResponseEnvelope<TData> = {
  success: boolean;
  data: TData;
};

/**
 * Description: Service object รวมฟังก์ชันเรียก API
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyIssueService = {
  /**
   * Description: ดึงรายการประวัติการแจ้งซ่อม (List)
   * Input : params (status, assignedToMe)
   * Output : HistoryIssueItem[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  async getHistoryIssueList(
    params: GetHistoryIssueListParams
  ): Promise<HistoryIssueItem[]> {
    const response = await api.get<ApiResponseEnvelope<HistoryIssueItem[]>>(
      "/history-issue",
      { params }
    );

    return response.data.data;
  },

  /**
   * Description: ดึงรายละเอียดประวัติการแจ้งซ่อม (Detail)
   * Input : issueId
   * Output : HistoryIssueDetail
   * Author: Chanwit Muangma (Boom) 66160224
   */
  async getHistoryIssueDetail(issueId: number): Promise<HistoryIssueDetail> {
    const response = await api.get<ApiResponseEnvelope<HistoryIssueDetail>>(
      `/history-issue/${issueId}`
    );

    return response.data.data;
  },
};
