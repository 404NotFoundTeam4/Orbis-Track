/**
 * Description: นิยามประเภทของ Job และข้อมูลที่ต้องใช้ (Payload) สำหรับระบบ Background Job
 * Note      : เพิ่ม JobType ใหม่และ Payload ที่นี่เมื่อต้องการ Job ประเภทใหม่
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */

export enum JobType {
    EMAIL_WELCOME = "EMAIL_WELCOME",
    EMAIL_TICKET_APPROVED = "EMAIL_TICKET_APPROVED", // สำหรับอนาคต
    NOTIFICATION_GENERIC = "NOTIFICATION_GENERIC",
}

export interface JobPayloads {
    [JobType.EMAIL_WELCOME]: {
        email: string;
        name: string;
        username: string;
        resetPasswordUrl: string;
        expiryHours: string;
    };
    [JobType.NOTIFICATION_GENERIC]: {
        recipient_ids: number[];
        title: string;
        message: string;
        target_route?: string;
    };
}
