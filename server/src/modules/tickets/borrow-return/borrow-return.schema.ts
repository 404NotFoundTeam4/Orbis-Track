/**
 * Description: Zod Schema สำหรับ Borrow-Return Tickets API
 * - Query params: page, limit, status, search, sortField, sortDirection
 * - Response schemas: TicketItem, TicketDetail
 * Input : -
 * Output : Zod types สำหรับ validation
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { z } from "zod";
import {
  BRT_STATUS,
  BRTS_STATUS,
  DEVICE_CHILD_STATUS,
  US_ROLE,
} from "@prisma/client";

export const getBorrowTicketDto = z.object({
  userId: z.coerce.number(),
});

export const getBorrowTicketQuery = z.object({
  page: z.coerce.number().optional().nullable(),
  limit: z.coerce.number().optional().nullable(),
  status: z.nativeEnum(BRT_STATUS).optional().nullable(),
  search: z.string().optional().nullable(),
  sortField: z.enum(["device_name", "quantity", "category", "requester", "request_date", "status"]).optional().nullable(),
  sortDirection: z.enum(["asc", "desc"]).optional().nullable(),
});

const requesterSchema = z.object({
  id: z.coerce.number(),
  fullname: z.string(),
  empcode: z.string().nullable(),
  image: z.string().nullable(),
  department: z.string().nullable(),
});

const deviceSummarySchema = z.object({
  name: z.string(),
  serial_number: z.string(),
  description: z.string().nullable(),
  location: z.string(),
  max_borrow_days: z.union([z.coerce.number(), z.string()]).nullable(),
  image: z.string().nullable(),
  category: z.string(),
  section: z.string(),
  department: z.string(),
  total_quantity: z.coerce.number(),
});

// device_child และ current_stage ถูกลบออกจาก list response แล้ว

export const ticketItemSchema = z.object({
  id: z.coerce.number(),
  status: z.nativeEnum(BRT_STATUS),
  created_at: z.date().nullable(),
  request_date: z.date().nullable(),
  requester: requesterSchema,
  device_summary: deviceSummarySchema,
});

const ticketDetailsSchema = z.object({
  purpose: z.string(),
  location_use: z.string(),
  quantity: z.coerce.number(),
  current_stage: z.coerce.number().nullable(),
  dates: z.object({
    start: z.date(),
    end: z.date(),
    pickup: z.date().nullable(),
    return: z.date().nullable(),
  }),
  locations: z.object({
    pickup: z.string().nullable(),
    return: z.string().nullable(),
  }),
  reject_reason: z.string().nullable(),
  reject_date: z.date().nullable(),
});

const ticketRequesterSchema = z.object({
  us_id: z.number(),
  us_firstname: z.string(),
  us_lastname: z.string(),
  us_emp_code: z.string().nullable(),
  us_images: z.string().nullable(),
  us_email: z.string().nullable(),
  us_phone: z.string().nullable(),
  fullname: z.string(),
  dept_id: z.coerce.number().nullable().optional(),
  dept: z.string().nullable().optional(),
  sec_id: z.coerce.number().nullable().optional(),
  section: z.string().nullable().optional(),
});

const accessorySchema = z.object({
  acc_id: z.coerce.number(),
  acc_name: z.string(),
  acc_quantity: z.coerce.number(),
});

const ticketDeviceSchema = z.object({
  child_id: z.coerce.number(),
  asset_code: z.string(),
  serial: z.string(),
  current_status: z.nativeEnum(DEVICE_CHILD_STATUS),
  has_serial_number: z.boolean(),
});

const ticketTimelineSchema = z.object({
  step: z.coerce.number(),
  role_name: z.string(),
  required_role: z.nativeEnum(US_ROLE),
  status: z.nativeEnum(BRTS_STATUS),
  dept_id: z.coerce.number().nullable(),
  dept_name: z.string().nullable(),
  sec_id: z.coerce.number().nullable(),
  sec_name: z.string().nullable(),
  approved_by: z.string().nullable(),
  updated_at: z.date().nullable(),
});

export const borrowReturnTicketDetailSchema = z.object({
  id: z.number(),
  status: z.nativeEnum(BRT_STATUS),
  details: ticketDetailsSchema,
  requester: ticketRequesterSchema,
  devices: z.array(ticketDeviceSchema),
  accessories: z.array(accessorySchema),
  timeline: z.array(ticketTimelineSchema),
});

export type BorrowReturnTicketDetailDto = z.infer<
  typeof borrowReturnTicketDetailSchema
>;

export type GetBorrowTicketQuery = z.infer<typeof getBorrowTicketQuery>;

export type TicketItemDto = z.infer<typeof ticketItemSchema>;
