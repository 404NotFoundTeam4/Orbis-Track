import api from "../api/axios";

export type RepairStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type RepairItem = {
  id: number;
  device_id?: number;
  device_code?: string | null;
  title: string;
  description: string | null;
  device_name: string;
  quantity: number;
  category: string;
  requester_name: string;
  requester_emp_code: string | null;
  request_date: string;
  status: RepairStatus;
  can_repair?: boolean;
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

type RepairTicketApiItem = {
  id: number;
  status: RepairStatus;
  dates: {
    created: string;
  };
  device_info: {
    name: string;
    asset_code?: string | null;
    quantity: number;
    category: string | null;
  };
  problem: {
    title: string;
    description: string;
  };
  requester: {
    fullname: string;
    emp_code: string | null;
  };
};

type RepairTicketsApiResponse = {
  success?: boolean;
  message?: string;
  data?: RepairTicketApiItem[] | { data?: RepairTicketApiItem[]; pagination?: { totalPages?: number } };
  pagination?: {
    totalPages?: number;
  };
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
    const response = await api.get<RepairTicketsApiResponse>("/repair-tickets", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
      },
    });

    const payload = response.data;
    const rawList = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.data?.data)
        ? payload.data.data
        : [];

    const mapped: RepairItem[] = rawList.map((item) => ({
      id: item.id,
      device_code: item.device_info?.asset_code ?? null,
      title: item.problem?.title ?? "-",
      description: item.problem?.description ?? null,
      device_name: item.device_info?.name ?? "-",
      quantity: item.device_info?.quantity ?? 1,
      category: item.device_info?.category ?? "-",
      requester_name: item.requester?.fullname ?? "-",
      requester_emp_code: item.requester?.emp_code ?? null,
      request_date: item.dates?.created ?? new Date().toISOString(),
      status: item.status,
    }));

    const sortField = params.sortField;
    const sortDirection = params.sortDirection ?? "desc";
    const factor = sortDirection === "asc" ? 1 : -1;

    const sorted = sortField
      ? [...mapped].sort((a, b) => {
          const aValue =
            sortField === "device_name"
              ? a.device_name
              : sortField === "quantity"
                ? a.quantity
                : sortField === "category"
                  ? a.category
                  : sortField === "requester"
                    ? a.requester_name
                    : sortField === "request_date"
                      ? new Date(a.request_date).getTime()
                      : a.status;

          const bValue =
            sortField === "device_name"
              ? b.device_name
              : sortField === "quantity"
                ? b.quantity
                : sortField === "category"
                  ? b.category
                  : sortField === "requester"
                    ? b.requester_name
                    : sortField === "request_date"
                      ? new Date(b.request_date).getTime()
                      : b.status;

          if (typeof aValue === "number" && typeof bValue === "number") {
            return (aValue - bValue) * factor;
          }

          return String(aValue).localeCompare(String(bValue), "th") * factor;
        })
      : mapped;

    const total = sorted.length;
    const limit = Math.max(1, params.limit ?? 10);
    const page = Math.max(1, params.page ?? 1);

    return {
      status: 200,
      message: payload.message ?? "Request successful",
      totalNum: total,
      maxPage: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
      data: sorted,
    };
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

