import { z } from "zod";

//Schema ของข้อมูลภายใน (data) ที่จะส่งกลับใน Response
export const homeStatsSchema = z.object({
  borrowed: z.number(),
  returned: z.number(),
  waiting: z.number(),
  report: z.number(),
});
export const ticketHomeItemSchema = z.object({
  id: z.number(),
  status: z.string(),
  dates: z.object({
    start: z.string(),
    end: z.string(),
    pickup: z.string().nullable(),
    return: z.string().nullable(),
  }),
  device_summary: z.object({
    name: z.string(),
    serial_number: z.string().optional(),
    total_quantity: z.number(),
    category: z.string(),
    department: z.string().optional(),
    section: z.string().optional(),
    description: z.string().nullable(),
    image: z.string().nullable(),
    max_borrow_days: z.number().nullable(),
  }),
  requester: z.object({
    fullname: z.string(),
    empcode: z.string().nullable(),
  }),
});
// Schema สำหรับ Timeline ในหน้ารายละเอียดคำร้อง
export const ticketTimelineStageSchema = z.object({
  step: z.number(),
  status: z.string(),
  role_name: z.string(),
  dept_name: z.string().nullable().optional(),
  approved_by: z.string().nullable().optional(),
  updated_at: z.any().optional(),
  approvers: z.array(z.string()).optional(),
});

// Schema สำหรับรายละเอียดคำร้อง
export const ticketDetailSchema = z.object({
  id: z.number(),
  status: z.string(),
  details: z.object({
    id: z.number(),
    current_stage: z.number(),
    purpose: z.string(),
    reject_reason: z.string().nullable(),
    reject_date: z.string().nullable(),
    dates: z.object({
      start: z.string(),
      end: z.string(),
      pickup: z.string().nullable(),
      return: z.string().nullable(),
    }),
    locations: z.object({
      pickup: z.string().nullable(),
      return: z.string().nullable(),
    }),
  }),
  // ใช้ Schema Timeline ตัวใหม่
  timeline: z.array(ticketTimelineStageSchema), 
  devices: z.array(z.any()), 
  accessories: z.array(z.any()).optional(),
  requester: z.object({
    id: z.number(),
    fullname: z.string(),
    empcode: z.string().nullable(),
    image: z.string().nullable(),
    department: z.string().nullable(),
    us_phone: z.string().nullable().optional(),
  }).optional(),
});

// Schema ของ Response ทั้งหมด
export const getStatsResponseSchema = z.object({
  status: z.string().default("success"),
  data: homeStatsSchema,
});

// Schema ของ Recent Tickets Response
export const getRecentTicketsResponseSchema = z.object({
  status: z.string().default("success"),
  data: z.array(ticketHomeItemSchema),
});

// Schema ของ Ticket Detail Response  
export const getTicketDetailResponseSchema = z.object({
  status: z.string().default("success"),
  data: ticketDetailSchema,
});

// Export Type
export type HomeStats = z.infer<typeof homeStatsSchema>;
export type TicketHomeItem = z.infer<typeof ticketHomeItemSchema>;
export type TicketDetailResponse = z.infer<typeof ticketDetailSchema>;