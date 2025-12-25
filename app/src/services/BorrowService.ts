import api from "../api/axios";

export interface GetDeviceForBorrowPayload {
    de_id: number;
}

export interface DeviceChild {
    dec_id: number;
    dec_status: "READY" | "BORROWED" | "REPAIRING" | "DAMAGED" | "LOST";
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
    brt_status: "PENDING" | "APPROVED" | "IN_USE" | "COMPLETED" | "REJECTED";
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
    // ดึงข้อมูลอุปกรณ์สำหรับรายละเอียดในฟอร์ม
    getDeviceForBorrow: async (de_id: GetDeviceForBorrowPayload): Promise<GetDeviceForBorrow> => {
        const { data } = await api.get(`/borrow/devices/${de_id}`);
        return data.data;
    },
    // ดึงข้อมูลอุปกรณ์ที่กำลังถูกยืม
    getAvailable: async (de_id: GetAvailablePayload): Promise<GetAvailable[]> => {
        const { data } = await api.get(`/borrow/available/${de_id}`);
        return data.data;
    },
    // ส่งคำร้องการยืมอุปกรณ์
    createBorrowTicket: async (payload: CreateBorrowTicketPayload): Promise<CreateBorrowTicket> => {
        const { data } = await api.post(`/borrow/send-ticket`, payload);
        return data;
    },
    // เพิ่มอุปกรณ์ไปยังรถเข็น
    addToCart: async (payload: AddToCartPayload): Promise<AddToCart> => {
        const { data } = await api.post('/borrow/add-cart', payload);
        return data;
    }
}