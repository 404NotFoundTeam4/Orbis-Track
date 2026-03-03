import api from "../api/axios";

export type RepairTicketStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED";

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

export interface GetRepairTicketsQuery {
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

export const repairTicketsService = {
  /**
   * Description: ดึงรายการคำร้องแจ้งซ่อมทั้งหมด พร้อมระบบค้นหา กรองสถานะ และแบ่งหน้า
   * Endpoint  : GET /repair-tickets
   * Input     : params (GetRepairTicketsQuery)
   * Output    : Promise<GetRepairTicketsResponse>
   * Author    : Worrawat Namwat (Wave) 66160372
   */
getRepairTickets: async (
  params?: GetRepairTicketsQuery,
): Promise<GetRepairTicketsResponse> => {
  const response = await api.get("/repair-tickets", { params });
  return response.data;
},

  /**
   * Description: อนุมัติใบแจ้งซ่อม โดยเปลี่ยนสถานะเป็น IN_PROGRESS และบันทึกผู้รับเรื่อง
   * Endpoint  : PATCH /repair-tickets/:id/approve
   * Input     : ticketId (number), userId (number)
   * Output    : Promise<ApproveRepairTicketResponse>
   * Author    : Worrawat Namwat (Wave)  66160372
   * */
  approveTicket: async (
    ticketId: number,
    userId: number,
  ): Promise<ApproveRepairTicketResponse> => {
    const response = await api.patch(`/repair-tickets/${ticketId}/approve`, {
      user_id: userId,
    });
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
