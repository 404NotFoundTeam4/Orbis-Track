import { LBR_ACTION, LDC_ACTION, LI_ACTION } from "@prisma/client";
import { z } from "zod";

// Schema: Borrow Return Log (ตาราง log_borrow_returns)
export const LogBorrowReturnSchema = z.object({
  action: z.nativeEnum(LBR_ACTION),
  brtId: z.number().int(),
  actorId: z.number().int().nullable().optional(),
  oldStatus: z.string().optional().nullable(),
  newStatus: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

// Schema: Issue Log (ตาราง log_issues)
export const LogIssueSchema = z.object({
  action: z.nativeEnum(LI_ACTION),
  tiId: z.number().int(),
  actorId: z.number().int().nullable().optional(),
  oldStatus: z.string().optional().nullable(),
  newStatus: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

// Schema: Device History Log (ตาราง log_device_childs)
export const LogDeviceChildSchema = z.object({
  action: z.nativeEnum(LDC_ACTION),
  decId: z.number().int().nullable().optional(),
  actorId: z.number().int().nullable().optional(),
  brtId: z.number().int().nullable().optional(),
  tiId: z.number().int().nullable().optional(),
  oldStatus: z.string().optional().nullable(),
  newStatus: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export type LogBorrowReturnInput = z.infer<typeof LogBorrowReturnSchema>;
export type LogIssueInput = z.infer<typeof LogIssueSchema>;
export type LogDeviceChildInput = z.infer<typeof LogDeviceChildSchema>;
