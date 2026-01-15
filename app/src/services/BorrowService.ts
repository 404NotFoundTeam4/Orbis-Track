import api from "../api/axios";

export interface GetDeviceForBorrowPayload {
    de_id: number;
}

export interface DeviceChild {
    dec_id: number;
    dec_status: "READY" | "BORROWED" | "REPAIRING" | "DAMAGED" | "LOST";
}

export interface DeviceAvailability {
    da_id: number;
    da_dec_id: number;
    da_brt_id: number;
    da_start: string;
    da_end: string;
    da_status: "ACTIVE" | "COMPLETED";
    created_at: string | null;
    updated_at: string | null;
}

export interface GetDeviceForBorrow {
    // อุปกรณ์แม่
    de_serial_number: string;
    de_name: string;
    de_description: string | null;
    de_location: string;
    de_max_borrow_days: number;
    de_images: string | null;
    // หมวดหมู่อุปกรณ์
    category?: {
        ca_name: string;
    };
    // อุปกรณ์ย่อย
    accessories?: {
        acc_name: string;
        acc_quantity: number;
    }[];
    // แผนกและฝ่ายย่อย
    department?: string | null;
    section?: string | null;
    // จำนวนทั้งหมดและที่พร้อมใช้งาน
    total: number;
    ready: number;
}

export interface GetAvailablePayload {
    de_id: number;
}

export interface ActiveBorrow {
    start: string;
    end: string;
}

export interface GetAvailable {
    dec_id: number;
    dec_serial_number?: string;
    dec_asset_code: string;
    dec_status: "READY" | "BORROWED" | "REPAIRING" | "DAMAGED" | "LOST";
    availabilities: ActiveBorrow[];
}

export interface CreateBorrowTicketPayload {
    reason: string;
    placeOfUse: string;
    borrowStart: string;
    borrowEnd: string;
    deviceChilds: number[];
}

export interface CreateBorrowTicket {
    brt_id: number;
    brt_status: "PENDING" | "APPROVED" | "IN_USE" | "OVERDUE" | "COMPLETED" | "REJECTED";
    brt_start_date: Date;
    brt_end_date: Date;
    brt_quantity: number;
}

export interface AddToCartPayload {
    deviceId: number;
    borrower: string;
    phone: string;
    reason: string;
    placeOfUse: string;
    borrowStart: string;
    borrowEnd: string;
    quantity: number;
    deviceChilds: number[];
}

export interface AddToCart {
    cartId: number;
    cartItemId: number;
}

export const borrowService = {
    /**
    * Description: ดึงข้อมูลอุปกรณ์สำหรับรายละเอียดในฟอร์ม
    * Input     : de_id - รหัสอุปกรณ์แม่
    * Output    : Promise<GetDeviceForBorrow> - รายละเอียดข้อมูลอุปกรณ์
    * Endpoint  : GET /api/borrow/devices/:id
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    getDeviceForBorrow: async (de_id: GetDeviceForBorrowPayload): Promise<GetDeviceForBorrow> => {
        const { data } = await api.get(`/borrow/devices/${de_id}`);
        return data.data;
    },

    /**
    * Description: ดึงข้อมูลอุปกรณ์ที่กำลังถูกยืม
    * Input     : de_id - รหัสอุปกรณ์แม่
    * Output    : Promise<GetAvailable[]> - รายการอุปกรณ์พร้อมวันที่กำลังถูกยืม
    * Endpoint  : GET /api/borrow/available/:id
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    getAvailable: async (de_id: GetAvailablePayload): Promise<GetAvailable[]> => {
        const { data } = await api.get(`/borrow/available/${de_id}`);
        return data.data;
    },

    /**
    * Description: ส่งคำร้องการยืมอุปกรณ์
    * Input     : payload - ข้อมูลในการยืมอุปกรณ์
    * Output    : Promise<CreateBorrowTicket> - รหัสคำร้องการยืมอุปกรณ์ สถานะ วันที่เริ่มยืม วันสิ้นสุด และอุปกรณ์ลูก
    * Endpoint  : POST /api/borrow/send-ticket
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    createBorrowTicket: async (payload: CreateBorrowTicketPayload): Promise<CreateBorrowTicket> => {
        const { data } = await api.post(`/borrow/send-ticket`, payload);
        return data;
    },

    /**
    * Description: เพิ่มอุปกรณ์ไปยังรถเข็น
    * Input     : payload - ข้อมูลในการยืมอุปกรณ์
    * Output    : Promise<AddToCart> - รหัสรถเข็น และรหัสรายการอุปกรณ์ในรถเข็น
    * Endpoint  : POST /api/borrow/add-cart
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    addToCart: async (payload: AddToCartPayload): Promise<AddToCart> => {
        const { data } = await api.post('/borrow/add-cart', payload);
        return data;
    },

    /**
    * Description: ดึงข้อมูล Device Availabilities ทั้งหมดในระบบ
    * Input     : -
    * Output    : Promise<DeviceAvailability[]> - รายการช่วงเวลาการจอง/ยืมทั้งหมด
    * Endpoint  : GET /api/borrow/device-availabilities
    * Author    : Nontapat Sinthum (guitar) 66160104
    */
    getDeviceAvailabilities: async (): Promise<DeviceAvailability[]> => {
        const { data } = await api.get(`/borrow/device-availabilities`);
        return data.data;
    },
}