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
  status: z.nativeEnum(BRT_STATUS),
  search: z.string().optional().nullable(),
  type: z.enum([
    "ALL",
    "MY_ACTIVE",
    "MY_REQUEST",
    "MY_APPROVAL",
    "MY_HISTORY",
    "MY_APPROVAL_HISTORY",
  ]),
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
  location: z.string(),
  image: z.string().nullable(),
  category: z.string(),
  section: z.union([z.object({ sec_name: z.string() }), z.string(), z.null()]),
  total_quantity: z.coerce.number(),
  more_count: z.coerce.number(),
});

const deviceChildSchema = z.object({
  serial_number: z.string(),
  asset_code: z.string(),
  has_serial_number: z.union([z.boolean(), z.string()]),
  status: z.string(),
});

const currentStageSchema = z
  .object({
    name: z.string(),
    step: z.coerce.number(),
    status: z.string(),
  })
  .nullable();

export const ticketItemSchema = z.object({
  id: z.coerce.number(),
  status: z.string(), // PENDING, APPROVED, etc.
  created_at: z.string().datetime().nullable(),
  request_date: z.string().datetime().nullable(),
  requester: requesterSchema,
  device_summary: deviceSummarySchema,
  device_child: deviceChildSchema,
  current_stage: currentStageSchema,
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

const ticketDeviceSchema = z.object({
  child_id: z.coerce.number(),
  name: z.string(),
  asset_code: z.string(),
  serial: z.string(),
  image: z.string().nullable(),
  category: z.string(),
  current_status: z.nativeEnum(DEVICE_CHILD_STATUS),
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
  approved_by: z.coerce.string().nullable(),
  updated_at: z.date().nullable(),
});

export const borrowReturnTicketDetailSchema = z.object({
  id: z.number(),
  status: z.nativeEnum(BRT_STATUS),
  details: ticketDetailsSchema,
  requester: ticketRequesterSchema,
  devices: z.array(ticketDeviceSchema),
  timeline: z.array(ticketTimelineSchema),
});

export type BorrowReturnTicketDetailDto = z.infer<
  typeof borrowReturnTicketDetailSchema
>;

export type GetBorrowTicketQuery = z.infer<typeof getBorrowTicketQuery>;

export type TicketItemDto = z.infer<typeof ticketItemSchema>;
