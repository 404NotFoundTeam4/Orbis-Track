/**
 * Description: นิยามประเภทของ Job และข้อมูลที่ต้องใช้ (Payload) สำหรับระบบ Background Job
 * Note      : เพิ่ม JobType ใหม่และ Payload ที่นี่เมื่อต้องการ Job ประเภทใหม่
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */

export enum JobType {
  EMAIL_WELCOME = "EMAIL_WELCOME",
  EMAIL_TICKET_APPROVED = "EMAIL_TICKET_APPROVED", // สำหรับอนาคต
  NOTIFICATION_GENERIC = "NOTIFICATION_GENERIC",
  EMAIL_TICKET_DUE_SOON = "EMAIL_TICKET_DUE_SOON",
  EMAIL_TICKET_OVER_DUE = "EMAIL_TICKET_OVER_DUE",
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
  [JobType.EMAIL_TICKET_DUE_SOON]: {
    email: string;
    name: string;
    username: string;
    ticketId: number;
    deviceName: string;
    dueTime: string;
    ticketUrl: string;
  };
  [JobType.EMAIL_TICKET_OVER_DUE]: {
    email: string;
    name: string;
    username: string;
    ticketId: number;
    deviceName: string;
    overdueSince: string;
    ticketUrl: string;
  };
}
