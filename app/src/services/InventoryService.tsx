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

export const DeviceService = {

  /**
  * Description: ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
  * Input     : id - รหัสอุปกรณ์แม่
  * Output    : data - ข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
  * Endpoint  : GET /api/inventory/devices/:id
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  getDeviceWithChilds: async (id: number): Promise<GetDeviceWithChildsResponse> => {
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
  createDeviceChild: async (payload: CreateDeviceChildPayload): Promise<{ message: string }> => {
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
  deleteDeviceChild: async (payload: DeleteDeviceChlidsPayload): Promise<{ message: string }> => {
    const { data } = await api.delete(`/inventory/devices-childs`, {
      data: payload
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
  uploadFileDeviceChild: async (id: number, formData: FormData): Promise<UploadFileDeviceChildResponse> => {
    return await api.post(`/inventory/devices/${id}/upload-childs`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAllDevices: async ():Promise<getAllDevices>=>{
    const {data} = await api.get("/inventory/add")

    return data;
  }
}

  