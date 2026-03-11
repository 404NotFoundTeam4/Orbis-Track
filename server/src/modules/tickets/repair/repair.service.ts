import { Prisma, TI_RESULT, TI_STATUS } from "@prisma/client";
import { HttpStatus } from "../../../core/http-status.enum.js";
import type { PaginatedResult } from "../../../core/paginated-result.interface.js";
import { HttpError } from "../../../errors/errors.js";
import { prisma } from "../../../infrastructure/database/client.js";
import type { AccessTokenPayload } from "../../auth/auth.schema.js";
import type {
  CreateRepairRequestBody,
  GetRepairQuery,
  RepairItemDto,
  RepairPrefillDto,
} from "./repair.schema.js";

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

  async getPrefillByIssueId(issueId: number): Promise<RepairPrefillDto> {
    const issue = await prisma.ticket_issues.findFirst({
      where: {
        ti_id: issueId,
        deleted_at: null,
      },
      select: {
        ti_id: true,
        ti_de_id: true,
        ti_reported_by: true,
      },
    });

    if (!issue) {
      throw new HttpError(HttpStatus.NOT_FOUND, "ไม่พบรายการสำหรับเติมข้อมูล");
    }

    const [device, reporter] = await Promise.all([
      prisma.devices.findFirst({
        where: { de_id: issue.ti_de_id, deleted_at: null },
        select: {
          de_serial_number: true,
          de_name: true,
          de_ca_id: true,
        },
      }),
      prisma.users.findFirst({
        where: { us_id: issue.ti_reported_by },
        select: {
          us_firstname: true,
          us_lastname: true,
          us_emp_code: true,
        },
      }),
    ]);

    const category = device?.de_ca_id
      ? await prisma.categories.findFirst({
          where: { ca_id: device.de_ca_id },
          select: { ca_name: true },
        })
      : null;

    const requesterName = `${reporter?.us_firstname ?? ""} ${reporter?.us_lastname ?? ""}`.trim() || "-";

    return {
      issue_id: issue.ti_id,
      device_id: issue.ti_de_id,
      device_code: device?.de_serial_number ?? "-",
      device_name: device?.de_name ?? "-",
      quantity: 1,
      category: category?.ca_name ?? "-",
      requester_name: requesterName,
      requester_emp_code: reporter?.us_emp_code ?? null,
    };
  }

  async createRepairRequest(
    payload: CreateRepairRequestBody,
    currentUser?: AccessTokenPayload,
    imagePaths: string[] = [],
  ): Promise<{ id: number; message: string }> {
    const userId = currentUser?.sub;

    if (!userId) {
      throw new HttpError(HttpStatus.UNAUTHORIZED, "กรุณาเข้าสู่ระบบ");
    }

    const device = await prisma.devices.findFirst({
      where: { de_id: payload.deviceId, deleted_at: null },
      select: { de_id: true },
    });

    if (!device) {
      throw new HttpError(HttpStatus.NOT_FOUND, "ไม่พบอุปกรณ์ที่เลือก");
    }

    if (payload.sourceIssueId) {
      const sourceIssue = await prisma.ticket_issues.findFirst({
        where: {
          ti_id: payload.sourceIssueId,
          deleted_at: null,
        },
        select: {
          ti_id: true,
          ti_de_id: true,
        },
      });

      if (!sourceIssue) {
        throw new HttpError(HttpStatus.NOT_FOUND, "ไม่พบรายการอ้างอิงสำหรับแจ้งซ่อม");
      }

      if (sourceIssue.ti_de_id !== payload.deviceId) {
        throw new HttpError(HttpStatus.BAD_REQUEST, "อุปกรณ์ไม่ตรงกับรายการอ้างอิง");
      }
    }

    const validSubDeviceIds = payload.subDeviceIds ?? [];

    if (validSubDeviceIds.length > 0) {
      const matchedSubDevices = await prisma.device_childs.findMany({
        where: {
          dec_id: { in: validSubDeviceIds },
          dec_de_id: payload.deviceId,
          deleted_at: null,
        },
        select: { dec_id: true },
      });

      if (matchedSubDevices.length !== validSubDeviceIds.length) {
        throw new HttpError(
          HttpStatus.BAD_REQUEST,
          "มีอุปกรณ์ย่อยบางรายการไม่ตรงกับอุปกรณ์แม่ที่เลือก",
        );
      }
    }

    const createdIssue = await prisma.$transaction(async (tx) => {
      const created = await tx.ticket_issues.create({
        data: {
          ti_de_id: payload.deviceId,
          ti_brt_id: null,
          ti_title: payload.subject,
          ti_description: payload.problemDescription,
          ti_reported_by: userId,
          ti_assigned_to: null,
          ti_status: TI_STATUS.PENDING,
          ti_result: TI_RESULT.IN_PROGRESS,
          ti_damaged_reason: payload.category ?? null,
          ti_resolved_note: payload.receiveLocation ?? null,
        },
        select: { ti_id: true },
      });

      if (validSubDeviceIds.length > 0) {
        await tx.$executeRaw`
          INSERT INTO issue_devices (id_ti_id, id_dec_id, created_at, updated_at)
          SELECT ${created.ti_id}, dec_id, NOW(), NOW()
          FROM device_childs
          WHERE dec_id = ANY(${validSubDeviceIds}::int[])
        `;
      }

      if (imagePaths.length > 0) {
        await tx.issue_attachments.createMany({
          data: imagePaths.map((path) => ({
            iatt_path_url: path,
            iatt_ti_id: created.ti_id,
            uploaded_by: userId,
          })),
        });
      }

      return created;
    });

    return {
      id: createdIssue.ti_id,
      message: "แจ้งซ่อมเรียบร้อยแล้ว",
    };
  }
}

export const repairService = new RepairService();
