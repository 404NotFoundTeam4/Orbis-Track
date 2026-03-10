import api from "../api/axios";

export type RepairStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface RepairTicketReportedDevice {
  id: number;
  asset_code: string | null;
  serial_number: string | null;
}

export interface UpdateRepairResultBody {
  updates: {
    id: number;
    status: string;
  }[];
}

export interface RepairTicketDeviceInfo {
  name: string;
  asset_code: string | null;
  category: string | null;
  quantity: number;
  location: string | null;
  image: string | null;
  reported_devices: RepairTicketReportedDevice[];
}

export interface RepairTicketProblem {
  title: string;
  description: string;
}

export interface RepairTicketRequester {
  user_id: number;
  emp_code: string | null;
  fullname: string;
  department: string | null;
  section: string | null;
}

export interface RepairTicketItem {
  id: number;
  ticket_no: string;
  status: RepairTicketStatus;
  dates: {
    created: string;
    updated: string | null;
  };
  device_info: RepairTicketDeviceInfo;
  problem: RepairTicketProblem;
  requester: RepairTicketRequester;
  approver: { fullname: string } | null;
}

export interface RepairTicketDeviceDetail {
  id?: number;
  status: string;
  name: string;
  asset_code?: string;
  serial_number?: string;
}

export interface RepairTicketDetail {
  devices: RepairTicketDeviceDetail[];
}

export interface RepairTicketsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetRepairTicketsResponse {
  success: boolean;
  data: {
    data: RepairTicketItem[];
    pagination: RepairTicketsPagination;
  };
}

export type RepairQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RepairTicketStatus;
  start_date?: string;
  end_date?: string;
  assignID?: number;
}
export interface ApproveRepairTicketResponse {
  message: string;
}

type RepairListResponse = {
  status: number;
  message: string;
  totalNum: number;
  maxPage: number;
  currentPage: number;
  data: RepairItem[];
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

  /**
   * Description: บันทึกผลการซ่อมและอัปเดตสถานะอุปกรณ์ โดยส่งข้อมูลอุปกรณ์ที่ซ่อมเสร็จแล้วและสถานะใหม่ไปยัง API
   * Endpoint  : PATCH /repair-tickets/:id/result
   * Input     : ticketId (number), data (UpdateRepairResultBody)
   * Output    : Promise<{ success: boolean; message: string }>
   * Author    : Worrawat Namwat (Wave)  66160372
   * */
  updateRepairResult: async (
    ticketId: number,
    data: UpdateRepairResultBody
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/repair-tickets/${ticketId}/result`, data);
    return response.data;
  },
};

