import api from "../api/axios";

export type RepairStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type RepairItem = {
  id: number;
  title: string;
  description: string | null;
  device_name: string;
  quantity: number;
  category: string;
  requester_name: string;
  requester_emp_code: string | null;
  request_date: string;
  status: RepairStatus;
};

export type RepairPrefill = {
  issue_id: number;
  device_id: number;
  device_code: string;
  device_name: string;
  quantity: number;
  category: string;
  requester_name: string;
  requester_emp_code: string | null;
};

export type CreateRepairRequestPayload = {
  sourceIssueId?: number | null;
  deviceId: number;
  subDeviceIds?: number[];
  subject: string;
  problemDescription: string;
  quantity?: number;
  category?: string | null;
  requesterName: string;
  requesterEmpCode?: string | null;
  receiveLocation?: string | null;
  images?: File[];
};

export type RepairQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  status?: RepairStatus;
  sortField?: "device_name" | "quantity" | "category" | "requester" | "request_date" | "status";
  sortDirection?: "asc" | "desc";
};

type RepairListResponse = {
  status: number;
  message: string;
  totalNum: number;
  maxPage: number;
  currentPage: number;
  data: RepairItem[];
};

type RepairPrefillResponse = {
  success: boolean;
  message: string;
  data: RepairPrefill;
};

type CreateRepairRequestResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    message: string;
  };
};
/**
   * Description: ดึงรายการงานซ่อมจาก API โดยสามารถใช้พารามิเตอร์สำหรับการค้นหา, กรอง, และเรียงลำดับข้อมูล
   * 
   * Input:
   *  - RepairQuery: พารามิเตอร์ที่ใช้ในการค้นหาหรือกรองข้อมูล
   *  - AccessTokenPayload (optional): ข้อมูลการยืนยันตัวตน (ไม่จำเป็นต้องใช้ในบางกรณี)
   * 
   * Output:
   *  - RepairListResponse: ผลลัพธ์ที่มีการแบ่งหน้า พร้อมข้อมูลของงานซ่อมและข้อมูลการแบ่งหน้า
   */
export const repairService = {
  async getRepairs(params: RepairQuery): Promise<RepairListResponse> {
    const response = await api.get("/repairs", { params });
    return response.data;
  },

  async getRepairPrefill(issueId: number): Promise<RepairPrefill> {
    const response = await api.get<RepairPrefillResponse>(`/repairs/prefill/${issueId}`);
    return response.data.data;
  },

  async createRepairRequest(payload: CreateRepairRequestPayload): Promise<CreateRepairRequestResponse["data"]> {
    const formData = new FormData();

    if (payload.sourceIssueId !== undefined && payload.sourceIssueId !== null) {
      formData.append("sourceIssueId", String(payload.sourceIssueId));
    }

    formData.append("deviceId", String(payload.deviceId));
    (payload.subDeviceIds ?? []).forEach((id) => formData.append("subDeviceIds", String(id)));
    formData.append("subject", payload.subject);
    formData.append("problemDescription", payload.problemDescription);
    formData.append("quantity", String(payload.quantity ?? 1));
    formData.append("requesterName", payload.requesterName);

    if (payload.category) formData.append("category", payload.category);
    if (payload.requesterEmpCode) formData.append("requesterEmpCode", payload.requesterEmpCode);
    if (payload.receiveLocation) formData.append("receiveLocation", payload.receiveLocation);

    (payload.images ?? []).forEach((file) => formData.append("images", file));

    const response = await api.post<CreateRepairRequestResponse>("/repairs/request", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data;
  },
};

