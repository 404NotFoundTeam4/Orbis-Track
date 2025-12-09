import api from "../api/axios";

/**
 * Description: เหตุการณ์ต่างๆ ที่เกิดขึ้นในระบบแจ้งเตือน (Backend Event Types)
 * Author     : Pakkapon Chomchoey (Tonnam) 66160080
 */
export const NR_EVENT = {
    APPROVAL_REQUESTED: "APPROVAL_REQUESTED", // มีคำขอยืมใหม่
    YOUR_TICKET_APPROVED: "YOUR_TICKET_APPROVED", // คำขอยืมได้รับการอนุมัติ
    YOUR_TICKET_REJECTED: "YOUR_TICKET_REJECTED", // คำขอยืมถูกปฏิเสธ
    YOUR_TICKET_IN_USE: "YOUR_TICKET_IN_USE", // อุปกรณ์กำลังถูกใช้งาน
    YOUR_TICKET_RETURNED: "YOUR_TICKET_RETURNED", // คืนอุปกรณ์แล้ว
    DUE_SOON_REMINDER: "DUE_SOON_REMINDER", // แจ้งเตือนใกล้กำหนดคืน
    OVERDUE_ALERT: "OVERDUE_ALERT", // แจ้งเตือนเลยกำหนดคืน
    ISSUE_NEW_FOR_TECH: "ISSUE_NEW_FOR_TECH", // มีแจ้งซ่อมใหม่ (สำหรับช่าง)
    ISSUE_ASSIGNED_TO_YOU: "ISSUE_ASSIGNED_TO_YOU", // งานซ่อมถูกมอบหมายให้คุณ
    ISSUE_RESOLVED_FOR_REPORTER: "ISSUE_RESOLVED_FOR_REPORTER", // แจ้งซ่อมเสร็จสิ้น (สำหรับผู้แจ้ง)
} as const;

export type NR_EVENT = typeof NR_EVENT[keyof typeof NR_EVENT];

/**
 * Enum: NR_STATUS
 * Description: สถานะของการแจ้งเตือน (Unread/Read)
 */
export const NR_STATUS = {
    UNREAD: "UNREAD",
    READ: "READ",
    DISMISSED: "DISMISSED",
} as const;

export type NR_STATUS = typeof NR_STATUS[keyof typeof NR_STATUS];

/**
 * Interface: GetNotiDto
 * Description: โครงสร้างข้อมูลการแจ้งเตือนที่ได้รับจาก API
 */
export interface GetNotiDto {
    n_id: number;
    n_title: string;
    n_message: string;
    n_data?: unknown;
    n_target_route?: string;
    n_base_event?: string;
    n_brt_id?: number;
    n_brts_id?: number;
    n_ti_id?: number;
    created_at: string; // Date string from JSON
    send_at?: string;

    // From recipients table
    nr_id: number;
    status: NR_STATUS;
    event?: NR_EVENT;
    read_at?: string;
    dismissed_at?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    paginated: boolean;
}

/**
 * Service: notificationService
 * Description: ให้บริการเชื่อมต่อ API เกี่ยวกับการแจ้งเตือน
 */
export const notificationService = {
    /**
     * Description: ดึงรายการแจ้งเตือนของผู้ใช้ปัจจุบัน แบบแบ่งหน้า
     * Input      : page (number), limit (number)
     * Output     : PaginatedResult<GetNotiDto>
     * Author     : Pakkapon Chomchoey (Tonnam) 66160080
     */
    getUserNotifications: async (page: number = 1, limit: number = 10): Promise<PaginatedResult<GetNotiDto>> => {
        const { data } = await api.get(`/notifications`, {
            params: { page, limit },
        });
        return data;
    },

    /**
     * Description: ดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
     * Input      : -
     * Output     : { data: number }
     * Author     : Pakkapon Chomchoey (Tonnam) 66160080
     */
    getUnreadCount: async (): Promise<{ data: number }> => {
        const { data } = await api.get(`/notifications/unread-count`);
        return data;
    },

    /**
     * Description: อัปเดตสถานะการแจ้งเตือนเป็น "อ่านแล้ว" ตาม ID ที่ระบุ
     * Input      : ids (number[]) - รายการ ID ที่ต้องการ mark
     * Output     : { message: string }
     * Author     : Pakkapon Chomchoey (Tonnam) 66160080
     */
    markAsRead: async (ids: number[]): Promise<{ message: string }> => {
        const { data } = await api.patch(`/notifications/read`, { ids });
        return data;
    },

    /**
     * Description: อัปเดตสถานะการแจ้งเตือน "ทั้งหมด" เป็น "อ่านแล้ว"
     * Input      : -
     * Output     : { message: string }
     * Author     : Pakkapon Chomchoey (Tonnam) 66160080
     */
    markAllAsRead: async (): Promise<{ message: string }> => {
        const { data } = await api.patch(`/notifications/read-all`);
        return data;
    },
};
