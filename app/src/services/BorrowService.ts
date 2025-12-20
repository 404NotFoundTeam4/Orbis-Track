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
    // อุปกรณ์ลูก
    device_childs?: DeviceChild[];
}

export interface CreateBorrowTicketPayload {
    deviceChilds: number[];
    borrowStart: string;
    borrowEnd: string;
    reason: string;
    placeOfUse: string;
}

export const borrowService = {

    getDeviceForBorrow: async (de_id: GetDeviceForBorrowPayload) => {
        const { data } = await api.get(`/borrow/devices/${de_id}`);
        return data;
    },

    createBorrowTicket: async (payload: CreateBorrowTicketPayload) => {
        const { data } = await api.post(`/borrow/send-ticket`, payload);
        return data;
    },
}