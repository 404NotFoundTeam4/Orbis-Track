/**
 * Description: Schema สำหรับ Repair Tickets API
 * - getRepairQuery: Schema สำหรับ query parameters ในการดึงรายการงานซ่อม
 * - repairItemSchema: Schema สำหรับรายการงานซ่อมแต่ละรายการ
 * Input : Query parameters (page, limit, search, categoryId, status, sortField, sortDirection)
 * Output : GetRepairQuery, RepairItemDto
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
import { TI_STATUS } from "@prisma/client";
import { z } from "zod";

export const getRepairQuery = z.object({
  page: z.coerce.number().optional().nullable().openapi({ description: "เลขหน้า" }),
  limit: z.coerce.number().optional().nullable().openapi({ description: "จำนวนต่อหน้า" }),
  search: z.string().optional().nullable().openapi({ description: "คำค้นหา" }),
  categoryId: z.coerce.number().optional().nullable().openapi({ description: "รหัสหมวดหมู่" }),
  status: z.nativeEnum(TI_STATUS).optional().nullable().openapi({ description: "สถานะงานซ่อม" }),
  sortField: z
    .enum(["device_name", "quantity", "category", "requester", "request_date", "status"])
    .optional()
    .nullable()
    .openapi({ description: "เรียงตามฟิลด์" }),
  sortDirection: z
    .enum(["asc", "desc"])
    .optional()
    .nullable()
    .openapi({ description: "ทิศทางการเรียง" }),
});

export const repairIssueParamSchema = z.object({
  issueId: z.coerce.number().int().positive().openapi({ description: "รหัสรายการอ้างอิง" }),
});

export const repairItemSchema = z.object({
  id: z.coerce.number().openapi({ description: "รหัสงานซ่อม" }),
  title: z.string().openapi({ description: "หัวข้อปัญหา" }),
  description: z.string().nullable().openapi({ description: "รายละเอียดปัญหา" }),
  device_name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
  quantity: z.coerce.number().openapi({ description: "จำนวน" }),
  category: z.string().openapi({ description: "หมวดหมู่" }),
  requester_name: z.string().openapi({ description: "ชื่อผู้ร้องขอ" }),
  requester_emp_code: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),
  request_date: z.date().openapi({ description: "วันที่ร้องขอ" }),
  status: z.nativeEnum(TI_STATUS).openapi({ description: "สถานะงานซ่อม" }),
});

export const repairPrefillSchema = z.object({
  issue_id: z.coerce.number().openapi({ description: "รหัสรายการอ้างอิง" }),
  device_id: z.coerce.number().openapi({ description: "รหัสอุปกรณ์" }),
  device_code: z.string().openapi({ description: "รหัสอุปกรณ์" }),
  device_name: z.string().openapi({ description: "ชื่ออุปกรณ์" }),
  quantity: z.coerce.number().openapi({ description: "จำนวน" }),
  category: z.string().openapi({ description: "หมวดหมู่" }),
  requester_name: z.string().openapi({ description: "ชื่อผู้ร้องขอ" }),
  requester_emp_code: z.string().nullable().openapi({ description: "รหัสพนักงาน" }),
});

export const createRepairRequestBody = z.object({
  sourceIssueId: z.coerce.number().int().positive().optional().nullable(),
  deviceId: z.coerce.number().int().positive(),
  subDeviceIds: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === "") return [];
      return Array.isArray(value) ? value : [value];
    }, z.array(z.coerce.number().int().positive()))
    .optional()
    .default([]),
  subject: z.string().trim().min(1).max(200),
  problemDescription: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive().optional().default(1),
  category: z.string().trim().optional().nullable(),
  requesterName: z.string().trim().min(1),
  requesterEmpCode: z.string().trim().optional().nullable(),
  receiveLocation: z.string().trim().optional().nullable(),
});

export const createRepairRequestResponseSchema = z.object({
  id: z.coerce.number().openapi({ description: "รหัสคำขอแจ้งซ่อมที่สร้างใหม่" }),
  message: z.string().openapi({ description: "ข้อความสถานะ" }),
});

export type GetRepairQuery = z.infer<typeof getRepairQuery>;
export type RepairItemDto = z.infer<typeof repairItemSchema>;
export type RepairPrefillDto = z.infer<typeof repairPrefillSchema>;
export type CreateRepairRequestBody = z.infer<typeof createRepairRequestBody>;
export type RepairIssueParamDto = z.infer<typeof repairIssueParamSchema>;
