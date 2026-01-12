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

// Schema ของ Response ทั้งหมด
export const getStatsResponseSchema = z.object({
  status: z.string().default("success"),
  data: homeStatsSchema,
});

export const getRecentTicketsResponseSchema = z.object({
  status: z.string().default("success"),
  data: z.array(ticketHomeItemSchema),
});

// Export Type
export type HomeStats = z.infer<typeof homeStatsSchema>;
export type TicketHomeItem = z.infer<typeof ticketHomeItemSchema>;