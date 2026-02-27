import { Prisma, TI_STATUS } from "@prisma/client";
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

export class RepairService {
  private buildWhere(query: GetRepairQuery): Prisma.ticket_issuesWhereInput {
    const where: Prisma.ticket_issuesWhereInput = {
      deleted_at: null,
    };

    if (query.status) {
      where.ti_status = query.status as TI_STATUS;
    }

    return where;
  }

  private buildOrderBy(
    sortField: SortField,
    sortDirection: SortDirection,
  ): (a: any, b: any) => number {
    const factor = sortDirection === "asc" ? 1 : -1;

    return (a: any, b: any) => {
      const aValue =
        sortField === "device_name"
          ? a.device?.de_name ?? ""
          : sortField === "quantity"
            ? Math.max(a.issue_devices?.length ?? 0, 1)
            : sortField === "category"
              ? a.device?.category?.ca_name ?? ""
              : sortField === "requester"
                ? `${a.reporter?.us_firstname ?? ""} ${a.reporter?.us_lastname ?? ""}`.trim()
                : sortField === "request_date"
                  ? new Date(a.created_at).getTime()
                  : sortField === "status"
                    ? a.ti_status ?? ""
                    : "";

      const bValue =
        sortField === "device_name"
          ? b.device?.de_name ?? ""
          : sortField === "quantity"
            ? Math.max(b.issue_devices?.length ?? 0, 1)
            : sortField === "category"
              ? b.device?.category?.ca_name ?? ""
              : sortField === "requester"
                ? `${b.reporter?.us_firstname ?? ""} ${b.reporter?.us_lastname ?? ""}`.trim()
                : sortField === "request_date"
                  ? new Date(b.created_at).getTime()
                  : sortField === "status"
                    ? b.ti_status ?? ""
                    : "";

      if (aValue === bValue) {
        return b.ti_id - a.ti_id;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * factor;
      }

      return String(aValue).localeCompare(String(bValue), "th") * factor;
    };
  }

  /**
   * Description: ดึงรายการงานแจ้งซ่อมแบบแบ่งหน้า พร้อมค้นหา/กรอง/เรียงลำดับ
   */
  async getRepairs(
    query: GetRepairQuery,
    _currentUser?: AccessTokenPayload,
  ): Promise<PaginatedResult<RepairItemDto>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const sortDirection: SortDirection = query.sortDirection ?? "desc";
    const sortField: SortField = query.sortField ?? "request_date";
    const search = query.search?.trim().toLowerCase();
    const where = this.buildWhere(query);
    const skip = (page - 1) * limit;

    const issues = await prisma.ticket_issues.findMany({
      where,
      select: {
        ti_id: true,
        ti_title: true,
        ti_description: true,
        ti_de_id: true,
        ti_reported_by: true,
        created_at: true,
        ti_status: true,
      },
      orderBy: [{ ti_id: "desc" }],
    });

    const deviceIds = Array.from(new Set(issues.map((item) => item.ti_de_id)));
    const userIds = Array.from(new Set(issues.map((item) => item.ti_reported_by)));

    const [devices, users] = await Promise.all([
      prisma.devices.findMany({
        where: { de_id: { in: deviceIds }, deleted_at: null },
        select: {
          de_id: true,
          de_name: true,
          de_ca_id: true,
        },
      }),
      prisma.users.findMany({
        where: { us_id: { in: userIds } },
        select: {
          us_id: true,
          us_firstname: true,
          us_lastname: true,
          us_emp_code: true,
        },
      }),
    ]);

    const categoryIds = Array.from(
      new Set(devices.map((device) => device.de_ca_id).filter(Boolean)),
    );
    const categories = await prisma.categories.findMany({
      where: { ca_id: { in: categoryIds as number[] } },
      select: { ca_id: true, ca_name: true },
    });

    const deviceMap = new Map(devices.map((device) => [device.de_id, device]));
    const userMap = new Map(users.map((user) => [user.us_id, user]));
    const categoryMap = new Map(categories.map((category) => [category.ca_id, category.ca_name]));

    let enriched = issues.map((issue) => {
      const device = deviceMap.get(issue.ti_de_id);
      const reporter = userMap.get(issue.ti_reported_by);
      const categoryName =
        (device?.de_ca_id ? categoryMap.get(device.de_ca_id) : undefined) ?? "-";

      return {
        ...issue,
        device_name: device?.de_name ?? "-",
        category: categoryName,
        requester_name: `${reporter?.us_firstname ?? ""} ${reporter?.us_lastname ?? ""}`.trim(),
        requester_emp_code: reporter?.us_emp_code ?? null,
        quantity: 1,
      };
    });

    if (query.categoryId) {
      enriched = enriched.filter((item) => {
        const device = deviceMap.get(item.ti_de_id);
        return device?.de_ca_id === query.categoryId;
      });
    }

    if (search) {
      enriched = enriched.filter((item) => {
        return (
          item.ti_title.toLowerCase().includes(search) ||
          (item.ti_description ?? "").toLowerCase().includes(search) ||
          item.device_name.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search) ||
          item.requester_name.toLowerCase().includes(search) ||
          (item.requester_emp_code ?? "").toLowerCase().includes(search)
        );
      });
    }

    enriched.sort(this.buildOrderBy(sortField, sortDirection));

    const total = enriched.length;
    const paginatedIssues = enriched.slice(skip, skip + limit);

    const data: RepairItemDto[] = paginatedIssues.map((issue) => ({
      id: issue.ti_id,
      title: issue.ti_title,
      description: issue.ti_description,
      device_name: issue.device_name,
      quantity: issue.quantity,
      category: issue.category,
      requester_name: issue.requester_name,
      requester_emp_code: issue.requester_emp_code,
      request_date: issue.created_at,
      status: issue.ti_status,
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
