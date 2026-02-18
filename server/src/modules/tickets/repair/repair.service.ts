import { TI_STATUS } from "@prisma/client";
import { HttpStatus } from "../../../core/http-status.enum.js";
import type { PaginatedResult } from "../../../core/paginated-result.interface.js";
import { HttpError } from "../../../errors/errors.js";
import { prisma } from "../../../infrastructure/database/client.js";
import type { AccessTokenPayload } from "../../auth/auth.schema.js";
import type { GetRepairQuery, RepairItemDto } from "./repair.schema.js";

/**
 * Description: Service สำหรับจัดการข้อมูลงานซ่อม
 * - getRepairs: ดึงรายการงานซ่อมแบบแบ่งหน้า พร้อมค้นหา/กรอง/เรียงลำดับ
 * Input : GetRepairQuery, AccessTokenPayload (optional)
 * Output : PaginatedResult<RepairItemDto>
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
type SortField =
  | "device_name"
  | "quantity"
  | "category"
  | "requester"
  | "request_date"
  | "status";
type SortDirection = "asc" | "desc";

const SORT_SQL_MAP: Record<SortField, string> = {
  device_name: `"device_name"`,
  quantity: `"quantity"`,
  category: `"category"`,
  requester: `"requester_name"`,
  request_date: `"request_date"`,
  status: `"status"`,
};

export class RepairService {
  /**
   * Description: ดึงรายการงานแจ้งซ่อมแบบแบ่งหน้า พร้อมค้นหา/กรอง/เรียงลำดับ
   */
  async getRepairs(
    query: GetRepairQuery,
    _currentUser?: AccessTokenPayload,
  ): Promise<PaginatedResult<RepairItemDto>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const search = query.search?.trim();
    const sortDirection: SortDirection = query.sortDirection ?? "desc";
    const sortField: SortField = query.sortField ?? "request_date";

    const orderBySql = SORT_SQL_MAP[sortField];
    if (!orderBySql) {
      throw new HttpError(HttpStatus.BAD_REQUEST, "Invalid sort field");
    }

    const params: Array<string | number> = [];
    const whereParts: string[] = [`ti.deleted_at IS NULL`];

    if (query.status) {
      params.push(query.status as TI_STATUS);
      whereParts.push(`ti.ti_status = $${params.length}::"TI_STATUS"`);
    }

    if (query.categoryId) {
      params.push(query.categoryId);
      whereParts.push(`d.de_ca_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      whereParts.push(`(
        ti.ti_title ILIKE $${idx}
        OR ti.ti_description ILIKE $${idx}
        OR d.de_name ILIKE $${idx}
        OR u.us_firstname ILIKE $${idx}
        OR u.us_lastname ILIKE $${idx}
        OR COALESCE(u.us_emp_code, '') ILIKE $${idx}
      )`);
    }

    const whereSql = whereParts.join(" AND ");

    params.push(limit, (page - 1) * limit);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const [countRows, rows] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ total: bigint | number }>>(
        `
          SELECT COUNT(*)::bigint AS total
          FROM ticket_issues ti
          JOIN devices d ON d.de_id = ti.ti_de_id
          JOIN users u ON u.us_id = ti.ti_reported_by
          LEFT JOIN categories c ON c.ca_id = d.de_ca_id
          WHERE ${whereSql}
        `,
        ...params.slice(0, params.length - 2),
      ),
      prisma.$queryRawUnsafe<
        Array<{
          id: number;
          title: string;
          description: string | null;
          device_name: string;
          quantity: number;
          category: string;
          requester_name: string;
          requester_emp_code: string | null;
          request_date: Date;
          status: TI_STATUS;
        }>
      >(
        `
          SELECT
            ti.ti_id AS id,
            ti.ti_title AS title,
            ti.ti_description AS description,
            d.de_name AS device_name,
            GREATEST(COUNT(idv.id_id), 1)::int AS quantity,
            COALESCE(c.ca_name, '-') AS category,
            TRIM(CONCAT(u.us_firstname, ' ', u.us_lastname)) AS requester_name,
            u.us_emp_code AS requester_emp_code,
            ti.created_at AS request_date,
            ti.ti_status AS status
          FROM ticket_issues ti
          JOIN devices d ON d.de_id = ti.ti_de_id
          JOIN users u ON u.us_id = ti.ti_reported_by
          LEFT JOIN categories c ON c.ca_id = d.de_ca_id
          LEFT JOIN issue_devices idv ON idv.id_ti_id = ti.ti_id AND idv.deleted_at IS NULL
          WHERE ${whereSql}
          GROUP BY ti.ti_id, d.de_name, c.ca_name, u.us_firstname, u.us_lastname, u.us_emp_code, ti.created_at, ti.ti_status
          ORDER BY ${orderBySql} ${sortDirection.toUpperCase()}, ti.ti_id DESC
          LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `,
        ...params,
      ),
    ]);

    const totalRaw = countRows[0]?.total ?? 0;
    const total = typeof totalRaw === "bigint" ? Number(totalRaw) : Number(totalRaw || 0);

    const data: RepairItemDto[] = rows.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      device_name: issue.device_name,
      quantity: issue.quantity,
      category: issue.category,
      requester_name: issue.requester_name,
      requester_emp_code: issue.requester_emp_code,
      request_date: issue.request_date,
      status: issue.status,
    }));

    return {
      data,
      total,
      page,
      limit,
      maxPage: Math.ceil(total / limit),
      paginated: true,
    };
  }
}

export const repairService = new RepairService();
