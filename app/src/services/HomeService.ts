/**
 * Description: Service สำหรับหน้าหลัก (Home) และการจัดการข้อมูล Ticket เบื้องต้น
 * Input     : -
 * Output    : Object รวม function สำหรับยิง API
 * Author    : Worrawat Namwat (Wave) 66160372
 */
import api from "../api/axios";

export interface TicketRequester {
  id: number;
  fullname: string;
  empcode: string | null;
  image: string | null;
  department: string | null;
}
// Interface สำหรับสรุปอุปกรณ์ในคำร้อง
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
// Interface สำหรับวันที่ต่างๆ ในคำร้อง
export interface TicketDates {
  start: string;
  end: string;
  pickup: string | null;
  return: string | null;
}

// Interface หลักสำหรับรายการในหน้า Home
export interface TicketHomeItem {
  id: number;
  status: string;
  request_date?: string; 
  return_date?: string; 
  dates: TicketDates;    
  device_summary: TicketDeviceSummary;
  requester: TicketRequester;
}

// --- Interfaces สำหรับ Detail ---
// Interface สำหรับ Timeline ในหน้ารายละเอียดคำร้อง
export interface TicketTimeline {
  status: string;
  role_name: string;
  dept_name: string | null;
  approved_by: string | null;
  updated_at: string | null;
  step: number;
}
// Interface สำหรับอุปกรณ์ในหน้ารายละเอียดคำร้อง
export interface TicketDeviceChild {
  child_id: number;
  serial_number: string;
  asset_code: string;
  has_serial_number: boolean;
  status: string;
  current_status: string;
}
// Interface สำหรับรายละเอียดคำร้อง
export interface TicketDetailData {
  id: number;
  current_stage: number;
  purpose: string;
  reject_reason: string | null;
  reject_date: string | null;
  dates: TicketDates;
  locations: {
    pickup: string | null;
    return: string | null;
  };
}
// Interface หลักสำหรับรายละเอียดคำร้อง
export interface TicketDetail {
  id: number;
  status: string;
  details: TicketDetailData;
  timeline: TicketTimeline[];
  devices: TicketDeviceChild[];
}
// Interface สำหรับสถิติหน้า Home
export interface HomeStats {
  borrowed: number;
  returned: number;
  waiting: number;
  report: number;
}

export const homeService = {
  /**
   * Description: ดึงข้อมูลตัวเลขสรุป (Home Stats) สำหรับแสดง Dashboard
   * Endpoint  : GET /home/stats
   * Input     : -
   * Output    : Promise<{ data: HomeStats }>
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  getHomeStats: async () => {
    const response = await api.get("/home/stats");
    return response.data; 
  },

  /**
   * Description: ดึงรายการคำร้องล่าสุด (Recent Tickets)
   * Endpoint  : GET /home/tickets
   * Input     : -
   * Output    : Promise<{ data: TicketHomeItem[] }>
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  getRecentTickets: async () => {
    const response = await api.get("/home/tickets");
    return response.data;
  },

  /**
   * Description: ดึงรายละเอียด Ticket แบบเต็ม (สำหรับ Expand View หรือหน้ารายละเอียด)
   * Endpoint  : GET /tickets/borrow-return/:id
   * Input     : id (number) - รหัส Ticket ที่ต้องการดึงข้อมูล
   * Output    : Promise<{ data: TicketDetail }>
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  getTicketDetail: async (id: number) => {
    const response = await api.get(`/tickets/borrow-return/${id}`);
    return response.data;
  }
};