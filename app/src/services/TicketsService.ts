/**
 * Description: Service สำหรับเรียก API Borrow-Return Tickets
 * - ดึงรายการ tickets พร้อม pagination, search, filter, sort
 * - ดึงรายละเอียด ticket ตาม ID
 * Input : GetTicketsParams
 * Output : PaginatedResult<TicketItem> หรือ TicketDetail
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import api from "../api/axios";
import type { DeviceChildChanges } from "../components/DeviceManageModal";

// Types based on backend borrow-return schema
export interface TicketRequester {
  id: number;
  fullname: string;
  empcode: string | null;
  image: string | null;
  department: string | null;
}

export interface TicketDeviceSummary {
  deviceId: number;
  name: string;
  serial_number: string;
  description: string | null;
  location: string;
  max_borrow_days: number | string | null;
  image: string | null;
  category: string;
  section: string;
  department: string;
  total_quantity: number;
}

export interface TicketDeviceChild {
  serial_number: string;
  asset_code: string;
  has_serial_number: boolean | string;
  status: string;
}

export interface TicketCurrentStage {
  name: string;
  step: number;
  status: string;
}

export type TicketStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_USE"
  | "COMPLETED"
  | "OVERDUE";

export interface TicketItem {
  id: number;
  status: TicketStatus;
  created_at: string | null;
  request_date: string | null;
  requester: TicketRequester;
  device_summary: TicketDeviceSummary;
}

export interface TicketDetailDates {
  start: string;
  end: string;
  pickup: string | null;
  return: string | null;
}

export interface TicketDetailLocations {
  pickup: string | null;
  return: string | null;
}

export interface TicketDetails {
  purpose: string;
  location_use: string;
  quantity: number;
  current_stage: number | null;
  dates: TicketDetailDates;
  locations: TicketDetailLocations;
  reject_reason: string | null;
  reject_date: string | null;
}

export interface TicketDetailRequester {
  us_id: number;
  us_firstname: string;
  us_lastname: string;
  us_emp_code: string | null;
  us_images: string | null;
  us_email: string | null;
  us_phone: string | null;
  fullname: string;
  dept_id?: number | null;
  dept?: string | null;
  sec_id?: number | null;
  section?: string | null;
}

export interface Accessory {
  acc_id: number;
  acc_name: string;
  acc_quantity: number;
}

export interface TicketDevice {
  child_id: number;
  asset_code: string;
  serial: string;
  current_status: string;
  has_serial_number: boolean;
}

export interface TicketTimelineItem {
  step: number;
  role_name: string;
  required_role: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  dept_id: number | null;
  dept_name: string | null;
  sec_id: number | null;
  sec_name: string | null;
  approved_by: string | null;
  updated_at: string | null;
  approvers?: string[];
}

export interface TicketDetail {
  id: number;
  status: TicketStatus;
  details: TicketDetails;
  requester: TicketDetailRequester;
  devices: TicketDevice[];
  accessories: Accessory[];
  timeline: TicketTimelineItem[];
}

// Note: Backend responses are now standardized
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  maxPage: number;
  paginated: true;
}

export type SortField =
  | "device_name"
  | "quantity"
  | "category"
  | "requester"
  | "request_date"
  | "status";
export type SortDirection = "asc" | "desc";

export interface GetTicketsParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  search?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export interface ApproveTicketPayload {
  ticketId: number;
  currentStage: number;
  pickupLocation?: string;
}

export interface RejectTicketPayload {
  ticketId: number;
  currentStage: number;
  rejectReason: string;
}

export interface GetDeviceAvailablePayload {
  deviceId: number;
  deviceChildIds: number[] | undefined;
  startDate: string;
  endDate: string;
}

// Tickets API Service
export const ticketsService = {
  /**
   * Description: ดึงรายการ Borrow-Return Tickets
   * Input     : params - query parameters
   * Output    : Promise<PaginatedResult<TicketItem>>
   * Endpoint  : GET /tickets/borrow-return
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  getTickets: async (
    params?: GetTicketsParams,
  ): Promise<PaginatedResult<TicketItem>> => {
    const { data } = await api.get("/tickets/borrow-return", { params });
    return data;
  },

  /**
   * Description: ดึงรายละเอียด Ticket ตาม ID
   * Input     : id - ticket ID
   * Output    : Promise<TicketDetail>
   * Endpoint  : GET /tickets/borrow-return/:id
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  getTicketById: async (id: number): Promise<TicketDetail> => {
    const { data } = await api.get(`/tickets/borrow-return/${id}`);
    return data.data;
  },

  /**
   * Description: อนุมัติ Ticket ตาม ID และ Stage
   * Input     : payload - { ticketId, currentStage }
   * Output    : Promise<void>
   * Endpoint  : PATCH /tickets/borrow-return/:id/approve
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  approveTicket: async (payload: ApproveTicketPayload): Promise<void> => {
    const { ticketId, currentStage, pickupLocation } = payload;
    await api.patch(`/tickets/borrow-return/${ticketId}/approve`, {
      currentStage,
      pickupLocation,
    });
  },

  /**
   * Description: ปฏิเสธ Ticket ตาม ID พร้อมเหตุผล
   * Input     : payload - { ticketId, currentStage, rejectReason }
   * Output    : Promise<void>
   * Endpoint  : PATCH /tickets/borrow-return/:id/reject
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  rejectTicket: async (payload: RejectTicketPayload): Promise<void> => {
    const { ticketId, currentStage, rejectReason } = payload;
    await api.patch(`/tickets/borrow-return/${ticketId}/reject`, {
      currentStage,
      rejectReason,
    });
  },

  /**
   * Description: ดึงรายการ device childs ที่ว่างสำหรับเพิ่มเข้า ticket
   * Input     : payload - { deviceId, deviceChildIds, startDate, endDate }
   * Output    : Promise<TicketDevice[]>
   * Endpoint  : GET /tickets/borrow-return/device-available
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  getDeviceAvailable: async (
    payload: GetDeviceAvailablePayload,
  ): Promise<TicketDevice[]> => {
    const { deviceId, deviceChildIds, startDate, endDate } = payload;
    // console.log(payload);
    const response = await api.get("/tickets/borrow-return/device-available", {
      params: { deviceId, deviceChildIds, startDate, endDate },
      paramsSerializer: {
        indexes: null,
      },
    });
    return response.data.data || [];
  },

  /**
   * Description: จัดการ device childs ใน ticket (เพิ่ม/ลบ/อัปเดตสถานะ)
   * Input     : ticketId, payload - DeviceChildChanges { devicesToAdd, devicesToRemove, devicesToUpdate }
   * Output    : Promise<void>
   * Endpoint  : PATCH /tickets/borrow-return/:id/manage-device-childs
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  manageDeviceChildsInTicket: async (
    ticketId: number,
    payload: DeviceChildChanges,
  ): Promise<void> => {
    await api.patch(
      `/tickets/borrow-return/${ticketId}/manage-device-childs`,
      payload,
    );
  },

  /**
   * Description: คืนอุปกรณ์ - อัปเดตสถานะอุปกรณ์แต่ละชิ้นและเปลี่ยน ticket เป็น COMPLETED
   * Input     : ticketId, devices - { id, status }[]
   * Output    : Promise<void>
   * Endpoint  : PATCH /tickets/borrow-return/:id/return
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  returnTicket: async (
    ticketId: number,
    devices: { id: number; status: string }[],
  ): Promise<void> => {
    await api.patch(`/tickets/borrow-return/${ticketId}/return`, { devices });
  },
};
