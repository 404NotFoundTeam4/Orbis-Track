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
};

