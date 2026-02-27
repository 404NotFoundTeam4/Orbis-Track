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

export type GetRepairQuery = z.infer<typeof getRepairQuery>;
export type RepairItemDto = z.infer<typeof repairItemSchema>;
