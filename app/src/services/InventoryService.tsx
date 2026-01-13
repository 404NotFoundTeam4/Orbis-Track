import api from "../api/axios";

// โครงสร้างข้อมูลอุปกรณ์ลูก
export interface DeviceChild {
  dec_id: number;
  dec_serial_number: string | null;
  dec_asset_code: string | null;
  dec_status: "READY" | "BORROWED" | "DAMAGED" | "REPAIRING" | "LOST";
  dec_has_serial_number: boolean;
  dec_de_id: number;
}

// โครงสร้างข้อมูลอุปกรณ์แม่พร้อมอุปกรณ์ลูก
export interface GetDeviceWithChildsResponse {
  de_id: number;
  de_name: string;
  de_serial_number: string;
  device_childs: DeviceChild[];
}

// โครงสร้างข้อมูลตอนเพิ่มอุปกรณ์ลูก
export interface CreateDeviceChildPayload {
  dec_de_id: number;
  quantity: number;
}

// โครงสร้างข้อมูลหลังจากเพิ่มอุปกรณ์ลูก (อัปโหลดไฟล์)
export interface UploadFileDeviceChildResponse {
  inserted: number;
}

export interface DeleteDeviceChlidsPayload {
  dec_id: number[];
}

export interface Section {
  sec_id: number;
  sec_name: string;
  sec_dept_id: number;
}

export interface Department {
  dept_id: number;
  dept_name: string;
}

export interface Category {
  ca_id: number;
  ca_name: string;
}

export interface getAllDevices {
  success: boolean;
  message: string;
  data: {
    sections: Section[];
    departments: Department[];
    categories: Category[];
  };
}
export interface Accessory {
  acc_name: string;
  acc_quantity: number;
}

export interface ApprovalFlowStepPayload {
  afs_step_approve: number;
  afs_dept_id: number | null;
  afs_sec_id: number | null;
  afs_role: "STAFF" | "HOD" | "HOS";
}

export interface CreateApprovalFlowPayload {
  af_name: string;
  af_us_id: number;
  approvalflowsstep: ApprovalFlowStepPayload[];
}

export interface CreateDeviceResponse {
  message: string;
}

export interface CreateDevicePayload {
  de_serial_number: string;
  de_name: string;
  de_description: string;
  de_location: string;
  de_max_borrow_days: number;
  de_images: string | null;

  de_af_id: number;
  de_ca_id: number;
  de_us_id: number;
  de_sec_id: number;

  accessories: Accessory[];
}

export const DeviceService = {
  /**
   * Description: ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
   * Input     : id - รหัสอุปกรณ์แม่
   * Output    : data - ข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
   * Endpoint  : GET /api/inventory/devices/:id
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  getDeviceWithChilds: async (
    id: number
  ): Promise<GetDeviceWithChildsResponse> => {
    const { data } = await api.get(`/inventory/devices/${id}`);
    return data.data;
  },

  /**
   * Description: เพิ่มอุปกรณ์ลูก
   * Input     : payload (dec_de_id, quantity) - รหัสอุปกรณ์แม่และจำนวนอุปกรณ์ลูกที่ต้องการเพิ่ม
   * Output    : data - ข้อมูลอุปกรณ์ลูกที่เพิ่มใหม่
   * Endpoint  : POST /api/inventory/devices-childs
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  createDeviceChild: async (
    payload: CreateDeviceChildPayload
  ): Promise<{ message: string }> => {
    const { data } = await api.post(`/inventory/devices-childs`, payload);
    return data;
  },

  /**
   * Description: ลบอุปกรณ์ลูก
   * Input     : payload (dec_id) - รหัสอุปกรณ์ลูก (รองรับหลายรายการ)
   * Output    : data - ผลการลบอุปกรณ์ลูก
   * Endpoint  : DELETE /api/inventory/devices-childs
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  deleteDeviceChild: async (
    payload: DeleteDeviceChlidsPayload
  ): Promise<{ message: string }> => {
    const { data } = await api.delete(`/inventory/devices-childs`, {
      data: payload,
    });
    return data;
  },

  /**
   * Description: เพิ่มอุปกรณ์ลูกด้วยไฟล์ Excel / CSV
   * Input     : id - รหัสอุปกรณ์แม่, formData - ไฟล์อุปกรณ์ลูก
   * Output    : จำนวนอุปกรณ์ลูกที่เพิ่ม
   * Endpoint  : POST /api/inventory/devices/:id/upload-childs
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  uploadFileDeviceChild: async (
    id: number,
    formData: FormData
  ): Promise<UploadFileDeviceChildResponse> => {
    return await api.post(`/inventory/devices/${id}/upload-childs`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Description: ดึงข้อมูลอุปกรณ์ทั้งหมด สำหรับหน้าเพิ่ม / แสดงอุปกรณ์
   * Input     : -
   * Output    : ข้อมูลอุปกรณ์, หมวดหมู่, แผนก, ฝ่ายย่อย และ approval flow
   * Endpoint  : GET /api/inventory/add-devices
   * Author    : Panyapon Phollert (Ton) 66160086
   */

  getAllDevices: async (): Promise<getAllDevices> => {
    const { data } = await api.get("/inventory/add-devices");
    return data;
  },

  /**
   * Description: เพิ่มอุปกรณ์หลัก พร้อมอุปกรณ์เสริมและอุปกรณ์ลูก
   * Input     : payload - ข้อมูลอุปกรณ์ที่ต้องการสร้าง
   * Output    : ผลลัพธ์การสร้างอุปกรณ์
   * Endpoint  : POST /api/inventory/devices
   * Author    : Panyapon Phollert (Ton) 66160086
   */

  createDevices: async (
    payload: CreateDevicePayload
  ): Promise<CreateDeviceResponse> => {
    const res = await api.post<CreateDeviceResponse>(
      "/inventory/devices",
      payload
    );
    return res.data;
  },

  /**
   * Description: สร้าง Approval Flow และขั้นตอนการอนุมัติ
   * Input     : payload - ข้อมูล approval flow และ steps
   * Output    : ผลลัพธ์การสร้าง approval flow
   * Endpoint  : POST /api/inventory/approval
   * Author    : Panyapon Phollert (Ton) 66160086
   */

  createApprove: async (
    payload: CreateApprovalFlowPayload
  ): Promise<CreateDeviceResponse> => {
    const res = api.post("inventory/approval", payload);
    return res;
  },

  /**
   * Description: ดึงข้อมูล Approval สำหรับหน้าเพิ่ม / ตั้งค่า Flow
   * Input     : -
   * Output    : ข้อมูล departments, sections และ staff
   * Endpoint  : GET /api/inventory/add-approval
   * Author    : Panyapon Phollert (Ton) 66160086
   */

  getApprove: async () => {
    const { data } = await api.get("/inventory/add-approval");
    return data;
  },

  /**
   * Description: ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
   * Input     : id - รหัสอุปกรณ์แม่
   * Output    : data - ข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
   * Endpoint  : GET /api/inventory/devices/:id
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  updateDevices: async (
    id: number,
    payload: CreateDevicePayload
  ): Promise<CreateDeviceResponse> => {
    const { data } = await api.patch(`/inventory/devices/${id}`, payload);
    return data.data;
  },
};

export interface GetInventory {
  de_id: number;
  de_name: string;
  de_serial_number: string;
  de_images: string | null;
  category: string;
  department: string;
  sub_section: string;
  available: number;
  total: number;
}

export const inventoryService = {
  getInventory: async (): Promise<GetInventory[]> => {
    const { data } = await api.get("/inventory");
    return data.data.map((item: any) => ({
      ...item,
      category: item.category_name || "-",
      department: item.department_name || "-",
      sub_section: item.sub_section_name || "-",
      available: item.quantity || 0,
      total: item.total_quantity || 0,
    }));
  },
};
