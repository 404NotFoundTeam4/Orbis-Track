import { prisma } from "../../infrastructure/database/client.js";
import { HttpError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { Prisma, BRT_STATUS, US_ROLE } from "@prisma/client";

import type {
  GetHistoryBorrowTicketQuery,
  HistoryBorrowTicketDetail,
  HistoryBorrowTicketItem,
  ApproverCandidate,
} from "./history-borrow.schema.js";

/**
 * Description: โครงสร้าง user context ขั้นต่ำที่ service ต้องใช้ เพื่อกำหนดเงื่อนไขการมองเห็นข้อมูลตามบทบาทผู้ใช้
 * Input : - (ได้จาก auth middleware เช่น req.user)
 * Output : Type สำหรับใช้เป็นพารามิเตอร์ของ service ในการสร้างเงื่อนไข visibility
 * Author: Chanwit Muangma (Boom) 66160224
 */
type CurrentUserContext = {
  userId: number; // รหัสผู้ใช้ปัจจุบัน (อ้างอิงจาก us_id)
  userRole: US_ROLE; // บทบาทของผู้ใช้ปัจจุบัน
  departmentId: number | null; // แผนกของผู้ใช้ปัจจุบัน (อ้างอิงจาก us_dept_id)
  sectionId: number | null; // ฝ่ายย่อยของผู้ใช้ปัจจุบัน (อ้างอิงจาก us_sec_id)
};

/**
 * Description: รวมชื่อและนามสกุลให้เป็นชื่อเต็ม (full name) เพื่อให้รูปแบบการแสดงผลชื่อเป็นมาตรฐานเดียวกัน
 * Input : firstName (string), lastName (string)
 * Output : string ชื่อเต็มที่ผ่านการ trim แล้ว
 * Author: Chanwit Muangma (Boom) 66160224
 */
function buildFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Description: สร้างเงื่อนไข where สำหรับการมองเห็นข้อมูล (visibility) ตามบทบาทของผู้ใช้
 * Rule :
 * - ADMIN : เห็นประวัติการยืม-คืนของทุกคน (ทั้งระบบ)
 * - HOD   : เห็นประวัติการยืม-คืนของคนที่อยู่ "แผนกเดียวกัน" (ไม่สนฝ่ายย่อย)
 * - HOS   : เห็นประวัติการยืม-คืนของคนที่อยู่ "แผนกเดียวกัน + ฝ่ายย่อยเดียวกัน"
 * - STAFF : เห็นประวัติการยืม-คืนของ "คนที่ยืมอุปกรณ์ในคลังที่ตัวเองดูแล"
 * - อื่นๆ : เห็นเฉพาะของตัวเอง
 * Input : currentUserContext (userId, userRole, departmentId, sectionId)
 * Output : Prisma.borrow_return_ticketsWhereInput เงื่อนไขสำหรับกรอง ticket ตามสิทธิ์การมองเห็น
 * Author: Chanwit Muangma (Boom) 66160224
 */
function buildVisibilityWhere(
  currentUserContext: CurrentUserContext
): Prisma.borrow_return_ticketsWhereInput {
  // ====== ADMIN เห็นทั้งหมด ======
  if (currentUserContext.userRole === "ADMIN") return {};

  // ====== HOD เห็นทั้งแผนก (ไม่สนฝ่ายย่อย) ======
  if (currentUserContext.userRole === "HOD") {
    if (!currentUserContext.departmentId) {
      return { brt_user_id: currentUserContext.userId };
    }
    return { requester: { us_dept_id: currentUserContext.departmentId } };
  }

  // ====== HOS เห็นทั้งแผนก + ฝ่ายย่อยเดียวกัน ======
  if (currentUserContext.userRole === "HOS") {
    if (!currentUserContext.departmentId || !currentUserContext.sectionId) {
      return { brt_user_id: currentUserContext.userId };
    }
    return {
      requester: {
        us_dept_id: currentUserContext.departmentId,
        us_sec_id: currentUserContext.sectionId,
      },
    };
  }

  // ====== STAFF เห็นเฉพาะคำขอที่ยืม "อุปกรณ์ในคลังที่ตัวเองดูแล" ======
  if (currentUserContext.userRole === "STAFF") {
    if (!currentUserContext.departmentId || !currentUserContext.sectionId) {
      return { brt_user_id: currentUserContext.userId };
    }

    return {
      ticket_devices: {
        some: {
          deleted_at: null,
          child: {
            device: {
              section: {
                sec_id: currentUserContext.sectionId,
                department: {
                  dept_id: currentUserContext.departmentId,
                },
              },
            },
          },
        },
      },
    };
  }

  // ====== Role อื่นๆ เห็นเฉพาะของตัวเอง ======
  return { brt_user_id: currentUserContext.userId };
}

/**
 * Description: สร้างเงื่อนไข where สำหรับการค้นหา (search) จากหลายฟิลด์ใน ticket และ relation ที่เกี่ยวข้อง
 * Input : searchText (string) ข้อความค้นหาจากผู้ใช้
 * Output : Prisma.borrow_return_ticketsWhereInput เงื่อนไข OR สำหรับ Prisma
 * Author: Chanwit Muangma (Boom) 66160224
 */
function buildSearchWhere(
  searchText: string
): Prisma.borrow_return_ticketsWhereInput {
  const normalizedSearchText = searchText.trim();
  if (!normalizedSearchText) return {};

  return {
    OR: [
      {
        requester: {
          us_firstname: {
            contains: normalizedSearchText,
            mode: "insensitive",
          },
        },
      },
      {
        requester: {
          us_lastname: {
            contains: normalizedSearchText,
            mode: "insensitive",
          },
        },
      },
      {
        requester: {
          us_emp_code: {
            contains: normalizedSearchText,
            mode: "insensitive",
          },
        },
      },
      {
        ticket_devices: {
          some: {
            deleted_at: null,
            child: {
              device: {
                OR: [
                  {
                    de_name: {
                      contains: normalizedSearchText,
                      mode: "insensitive",
                    },
                  },
                  {
                    de_serial_number: {
                      contains: normalizedSearchText,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ],
  };
}

/**
 * Description: map ticket record เป็น item ของ List (ตาราง)
 * Input : ticketRecord (ผลจาก Prisma findMany พร้อม select ที่จำเป็น)
 * Output : HistoryBorrowTicketItem
 * Author: Chanwit Muangma (Boom) 66160224
 */
function mapTicketToListItem(ticketRecord: any): HistoryBorrowTicketItem {
  const firstTicketDevice = ticketRecord.ticket_devices?.[0];
  const deviceRecord = firstTicketDevice?.child?.device;

  return {
    ticketId: ticketRecord.brt_id,
    status: ticketRecord.brt_status,
    requestDateTime: ticketRecord.created_at ?? new Date(),

    deviceChildCount: Array.isArray(ticketRecord.ticket_devices)
      ? ticketRecord.ticket_devices.length
      : 0,

    requester: {
      userId: ticketRecord.requester.us_id,
      fullName: buildFullName(
        ticketRecord.requester.us_firstname,
        ticketRecord.requester.us_lastname
      ),
      employeeCode: ticketRecord.requester.us_emp_code ?? null,

      department_name: ticketRecord.requester.department?.dept_name ?? null,
      section_name: ticketRecord.requester.section?.sec_name ?? null,
    },

    deviceSummary: {
      deviceId: deviceRecord?.de_id ?? 0,
      deviceName: deviceRecord?.de_name ?? "-",
      deviceSerialNumber: deviceRecord?.de_serial_number ?? "-",
      categoryName: deviceRecord?.category?.ca_name ?? "-",
    },
  };
}


/**
 * Description: สร้าง key สำหรับ cache ผู้มีสิทธิ์อนุมัติ ตาม role + scope (dept/sec)
 * Input : role, deptId, secId
 * Output : string key สำหรับ Map
 * Author: Chanwit Muangma (Boom) 66160224
 */
function buildApproverScopeKey(
  role: US_ROLE,
  deptId: number | null,
  secId: number | null
): string {
  return `${role}::dept=${deptId ?? "null"}::sec=${secId ?? "null"}`;
}

/**
 * Description: ดึงรายชื่อผู้มีสิทธิ์อนุมัติของ step ตาม role + scope ของ flow (dept/sec)
 * Rule :
 * - ถ้ามี secId -> match users.us_sec_id
 * - ถ้าไม่มี secId แต่มี deptId -> match users.us_dept_id
 * - ต้อง active และไม่ถูกลบ
 * Input : role, deptId, secId
 * Output : Promise<ApproverCandidate[]>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getApproverCandidatesByScope(params: {
  role: US_ROLE;
  deptId: number | null;
  secId: number | null;
}): Promise<ApproverCandidate[]> {
  const { role, deptId, secId } = params;

  const where: Prisma.usersWhereInput = {
    us_role: role,
    us_is_active: true,
    deleted_at: null,
  };

  // ใช้ null-check เพื่อกัน case id เป็น 0 หรือค่าถูก parse ผิด
  if (secId !== null) where.us_sec_id = secId;
  else if (deptId !== null) where.us_dept_id = deptId;

  const users = await prisma.users.findMany({
    where,
    select: {
      us_id: true,
      us_emp_code: true,
      us_firstname: true,
      us_lastname: true,
      us_role: true,

      // เพิ่ม id ของหน่วยงาน (ช่วย debug/ขยายในอนาคต)
      department: { select: { dept_id: true, dept_name: true } },
      section: { select: { sec_id: true, sec_name: true } },
    },
    orderBy: [{ us_firstname: "asc" }, { us_lastname: "asc" }],
  });

  return users.map((u) => ({
    userId: u.us_id,
    fullName: buildFullName(u.us_firstname, u.us_lastname),
    employeeCode: u.us_emp_code ?? null,
    role: u.us_role,
    departmentName: u.department?.dept_name ?? null,
    sectionName: u.section?.sec_name ?? null,
  }));
}

/**
 * Description: map ticket record เป็น Detail (ข้อมูลเต็ม)
 * Input : ticketRecord (ผลจาก Prisma findFirst พร้อม select ที่จำเป็น)
 * Output : HistoryBorrowTicketDetail
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function mapTicketToDetail(
  ticketRecord: any
): Promise<HistoryBorrowTicketDetail> {
  const firstTicketDevice = ticketRecord.ticket_devices?.[0];
  const deviceRecord = firstTicketDevice?.child?.device;

  const sectionName = deviceRecord?.section?.sec_name ?? null;
  const departmentName = deviceRecord?.section?.department?.dept_name ?? null;

  const deviceChildren = (ticketRecord.ticket_devices ?? []).map(
    (ticketDevice: any) => {
      const deviceChildRecord = ticketDevice.child;
      return {
        deviceChildId: deviceChildRecord.dec_id,
        assetCode: deviceChildRecord.dec_asset_code,
        serialNumber: deviceChildRecord.dec_serial_number ?? null,
        status: deviceChildRecord.dec_status,
      };
    }
  );

  const accessories = (deviceRecord?.accessories ?? []).map(
    (accessoryRecord: any) => ({
      accessoryId: accessoryRecord.acc_id,
      accessoryName: accessoryRecord.acc_name,
      quantity: accessoryRecord.acc_quantity,
    })
  );

  /**
   * Description: เตรียม cache รายชื่อผู้มีสิทธิ์อนุมัติ (candidates) ต่อ scope ของแต่ละ step
   * - เพื่อไม่ให้ยิง query ซ้ำ ถ้ามีหลาย step ที่ scope เดียวกัน
   * Input : ticketRecord.stages
   * Output : Map<scopeKey, ApproverCandidate[]>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const stagesSorted = (ticketRecord.stages ?? []).sort(
    (leftStage: any, rightStage: any) =>
      leftStage.brts_step_approve - rightStage.brts_step_approve
  );

  const uniqueScopeKeySet = new Set<string>();

  for (const stageRecord of stagesSorted) {
    const flowDeptId = stageRecord.brts_dept_id ?? null;
    const flowSecId = stageRecord.brts_sec_id ?? null;
    const scopeKey = buildApproverScopeKey(
      stageRecord.brts_role,
      flowDeptId,
      flowSecId
    );
    uniqueScopeKeySet.add(scopeKey);
  }

  const scopeKeyList = Array.from(uniqueScopeKeySet);
  const approverCandidatesByScopeMap = new Map<string, ApproverCandidate[]>();

  await Promise.all(
    scopeKeyList.map(async (scopeKey) => {
      const [rolePart, deptPart, secPart] = scopeKey.split("::");
      const role = rolePart as US_ROLE;

      const deptIdText = deptPart.replace("dept=", "");
      const secIdText = secPart.replace("sec=", "");

      const deptIdRaw = deptIdText === "null" ? null : Number(deptIdText);
      const deptId =
        deptIdRaw !== null && Number.isFinite(deptIdRaw) ? deptIdRaw : null;

      // กัน NaN ของ secId ด้วย เพื่อไม่ให้ Prisma where พัง
      const secIdRaw = secIdText === "null" ? null : Number(secIdText);
      const secId =
        secIdRaw !== null && Number.isFinite(secIdRaw) ? secIdRaw : null;

      const candidates = await getApproverCandidatesByScope({ role, deptId, secId });
      approverCandidatesByScopeMap.set(scopeKey, candidates);
    })
  );

  const timeline = stagesSorted.map((stageRecord: any) => {
    // ====== ข้อมูล scope ของ step ตาม Flow (อาจเป็น null ได้ เช่น HOD ระดับแผนก) ======
    const flowDepartmentId = stageRecord.brts_dept_id ?? null;
    const flowDepartmentName =
      stageRecord.department?.dept_name ?? stageRecord.brts_dept_name ?? null;

    const flowSectionId = stageRecord.brts_sec_id ?? null;
    const flowSectionName =
      stageRecord.section?.sec_name ?? stageRecord.brts_sec_name ?? null;

    // ====== ข้อมูลของ "คนอนุมัติจริง" (มาจาก users + relations) ======
    const approverUser = stageRecord.approver ?? null;

    // ใช้ id/name จาก relation ที่ select มาแล้ว (department/section)
    const approverDepartmentId = approverUser?.department?.dept_id ?? null;
    const approverDepartmentName = approverUser?.department?.dept_name ?? null;

    const approverSectionId = approverUser?.section?.sec_id ?? null;
    const approverSectionName = approverUser?.section?.sec_name ?? null;

    const scopeKey = buildApproverScopeKey(
      stageRecord.brts_role,
      flowDepartmentId,
      flowSectionId
    );
    const approverCandidates = approverCandidatesByScopeMap.get(scopeKey) ?? [];

    return {
      stepNumber: stageRecord.brts_step_approve,
      roleDisplayName: stageRecord.brts_name,
      requiredRole: stageRecord.brts_role,
      status: stageRecord.brts_status,

      departmentId: approverDepartmentId ?? flowDepartmentId,
      departmentName: approverDepartmentName ?? flowDepartmentName,

      sectionId: approverSectionId ?? flowSectionId,
      sectionName: approverSectionName ?? flowSectionName,

      flowDepartmentId,
      flowDepartmentName,
      flowSectionId,
      flowSectionName,

      approver: approverUser
        ? {
          userId: approverUser.us_id,
          fullName: buildFullName(
            approverUser.us_firstname,
            approverUser.us_lastname
          ),
          employeeCode: approverUser.us_emp_code ?? null,
          role: approverUser.us_role,
          departmentName: approverDepartmentName,
          sectionName: approverSectionName,
        }
        : null,

      /**
       * Description: รายชื่อผู้มีสิทธิ์อนุมัติทั้งหมดใน step นี้ (ใช้แสดง 2 ชื่อ + "+N")
       * Input : คำนวณจาก role + flowDepartmentId/flowSectionId
       * Output : ApproverCandidate[]
       * Author: Chanwit Muangma (Boom) 66160224
       */
      approverCandidates,

      updatedAt: stageRecord.updated_at ?? null,
    };
  });

  return {
    ticketId: ticketRecord.brt_id,
    status: ticketRecord.brt_status,
    requestDateTime: ticketRecord.created_at ?? new Date(),

    requester: {
      userId: ticketRecord.requester.us_id,
      fullName: buildFullName(
        ticketRecord.requester.us_firstname,
        ticketRecord.requester.us_lastname
      ),
      employeeCode: ticketRecord.requester.us_emp_code ?? null,
      phoneNumber: ticketRecord.requester.us_phone ?? null,
      department_name: ticketRecord.requester.department?.dept_name ?? null,
      section_name: ticketRecord.requester.section?.sec_name ?? null,
    },

    device: {
      deviceId: deviceRecord?.de_id ?? 0,
      deviceName: deviceRecord?.de_name ?? "-",
      deviceSerialNumber: deviceRecord?.de_serial_number ?? "-",
      categoryName: deviceRecord?.category?.ca_name ?? "-",
      imageUrl: deviceRecord?.de_images ?? null,
      description: deviceRecord?.de_description ?? null,
      maximumBorrowDays: deviceRecord?.de_max_borrow_days ?? 0,
      sectionName,
      departmentName,
    },

    deviceChildCount: deviceChildren.length,
    deviceChildren,

    borrowPurpose: ticketRecord.brt_borrow_purpose,
    usageLocation: ticketRecord.brt_usage_location,

    borrowDateRange: {
      startDateTime: ticketRecord.brt_start_date,
      endDateTime: ticketRecord.brt_end_date,
    },

    inUseDateTime: ticketRecord.brt_start_date,

    fulfillmentDateTimes: {
      pickupDateTime: ticketRecord.brt_pickup_datetime ?? null,
      returnDateTime: ticketRecord.brt_return_datetime ?? null,
    },

    pickupLocation: ticketRecord.brt_pickup_location ?? null,
    returnLocation: ticketRecord.brt_return_location ?? null,
    rejectReason: ticketRecord.brt_reject_reason ?? null,

    accessories,
    timeline,
  };
}

/**
 * Description: ดึงรายการประวัติ Ticket การยืม (List) พร้อม pagination และการเรียงลำดับตามเงื่อนไข
 * Input : query (GetHistoryBorrowTicketQuery), currentUserContext (CurrentUserContext)
 * Output : Promise<{ items: HistoryBorrowTicketItem[]; pagination: {...} }>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryBorrowTickets(
  query: GetHistoryBorrowTicketQuery,
  currentUserContext: CurrentUserContext
) {
  const pageNumber = Math.max(1, Number(query.page ?? 1));
  const limitNumber = Math.max(1, Number(query.limit ?? 10));
  const offsetNumber = (pageNumber - 1) * limitNumber;

    /**
     * Description: โหมดการมองเห็นข้อมูลของหน้า List
     * Rule :
     * - viewMode = "mine" : บังคับเห็นเฉพาะรายการของผู้ใช้ปัจจุบัน (ไม่สน role)
     * - viewMode = "all"  : ใช้ rule การมองเห็นตาม role (ADMIN/HOD/HOS/STAFF/อื่นๆ)
     * Input : query.viewMode, currentUserContext
     * Output : Prisma where สำหรับ visibility ที่ใช้กับ baseWhere
     * Author: Chanwit Muangma (Boom) 66160224
     */
    const resolvedViewMode = query.viewMode ?? "all";

    const roleBasedVisibilityWhere = buildVisibilityWhere(currentUserContext);

    const visibilityWhere: Prisma.borrow_return_ticketsWhereInput =
      resolvedViewMode === "mine"
        ? { brt_user_id: currentUserContext.userId }
        : roleBasedVisibilityWhere;

    const searchWhere = query.search ? buildSearchWhere(query.search) : {};

    const baseWhere: Prisma.borrow_return_ticketsWhereInput = {
      deleted_at: null,
      ...(query.status ? { brt_status: query.status as BRT_STATUS } : {}),
      AND: [visibilityWhere, searchWhere],
    };


  const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";
  const sortField = query.sortField ?? "requestDate";

  /**
   * Description: helper สำหรับสร้างชื่อเต็ม (กัน null/undefined)
   */
  const buildFullName = (
    firstName: string | null | undefined,
    lastName: string | null | undefined
  ) => `${firstName ?? ""} ${lastName ?? ""}`.trim();

  /**
   * Description: map requester baseline จาก users (ไว้เป็น fallback + เอา dept/sec/empCode)
   */
  const mapRequesterFromTicketForList = (requester: any) => ({
    userId: requester?.us_id,
    fullName: buildFullName(requester?.us_firstname, requester?.us_lastname),
    employeeCode: requester?.us_emp_code ?? null,
    department_name: requester?.department?.dept_name ?? null,
    section_name: requester?.section?.sec_name ?? null,
  });

  /**
   * Description: helper รวม origin cart item ids จากรายการ tickets
   */
  const collectOriginCartItemIds = (ticketRecords: any[]) => {
    const ids = ticketRecords
      .flatMap((ticket) =>
        (ticket.ticket_devices ?? []).map((td: any) => td.td_origin_cti_id)
      )
      .filter((id: any): id is number => typeof id === "number");

    return Array.from(new Set(ids));
  };

  /**
   * Description: helper ดึง cart_items แบบ batch แล้วทำเป็น Map<cti_id, cartItem>
   */
  const buildCartItemMap = async (ticketRecords: any[]) => {
    const originCartItemIds = collectOriginCartItemIds(ticketRecords);

    if (originCartItemIds.length === 0) {
      return new Map<number, { cti_us_name: string | null; cti_phone: string | null }>();
    }

    const cartItems = await prisma.cart_items.findMany({
      where: {
        deleted_at: null,
        cti_id: { in: originCartItemIds },
      },
      select: {
        cti_id: true,
        cti_us_name: true,
        cti_phone: true,
      },
    });

    return new Map(
      cartItems.map((cartItem) => [
        cartItem.cti_id,
        { cti_us_name: cartItem.cti_us_name, cti_phone: cartItem.cti_phone },
      ])
    );
  };

  /**
   * Description: helper เลือก cart_items snapshot ตัวแรกที่หาเจอจาก ticket_devices ของ ticket นั้น
   */
  const pickCartSnapshotForTicket = (
    ticketRecord: any,
    cartItemById: Map<number, { cti_us_name: string | null; cti_phone: string | null }>
  ) => {
    for (const td of ticketRecord.ticket_devices ?? []) {
      const originId = td?.td_origin_cti_id;
      if (typeof originId === "number") {
        const snapshot = cartItemById.get(originId);
        if (snapshot) return snapshot;
      }
    }
    return null;
  };

  /**
   * Description: กรณี sort ตามจำนวน child ที่ผูกจริง (deviceChildCount) ใช้ groupBy บน ticket_devices
   */
  if (sortField === "deviceChildCount") {
    const totalItems = await prisma.borrow_return_tickets.count({
      where: {
        ...baseWhere,
        ticket_devices: { some: { deleted_at: null } },
      },
    });

    const groupedTicketDeviceCounts = await prisma.ticket_devices.groupBy({
      by: ["td_brt_id"],
      where: {
        deleted_at: null,
        ticket: baseWhere,
      },
      _count: { td_id: true },
      orderBy: { _count: { td_id: sortDirection as Prisma.SortOrder } },
      skip: offsetNumber,
      take: limitNumber,
    });

    const ticketIds = groupedTicketDeviceCounts.map(
      (groupedItem) => groupedItem.td_brt_id
    );

    if (ticketIds.length === 0) {
      return {
        items: [],
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / limitNumber)),
        },
      };
    }

    const ticketRecords = await prisma.borrow_return_tickets.findMany({
      where: {
        ...baseWhere,
        brt_id: { in: ticketIds },
      },
      select: {
        brt_id: true,
        brt_status: true,
        created_at: true,
        brt_user: true,
        brt_phone: true,
        requester: {
          select: {
            us_id: true,
            us_firstname: true,
            us_lastname: true,
            us_emp_code: true,
            department: { select: { dept_name: true } },
            section: { select: { sec_name: true } },
          },
        },

        ticket_devices: {
          where: { deleted_at: null },
          select: {
            td_id: true,
            td_origin_cti_id: true,
            child: {
              select: {
                dec_id: true,
                device: {
                  select: {
                    de_id: true,
                    de_name: true,
                    de_serial_number: true,
                    category: { select: { ca_name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const ticketRecordByIdMap = new Map(
      ticketRecords.map((ticketRecordItem) => [
        ticketRecordItem.brt_id,
        ticketRecordItem,
      ])
    );

    const orderedTicketRecords = ticketIds
      .map((ticketId) => ticketRecordByIdMap.get(ticketId))
      .filter(
        (ticketRecordItem): ticketRecordItem is (typeof ticketRecords)[number] =>
          Boolean(ticketRecordItem)
      );

    // ดึง cart_items แบบ batch 
    const cartItemById = await buildCartItemMap(orderedTicketRecords);

    const items = orderedTicketRecords.map((ticketRecordItem) => {
      const baseItem = mapTicketToListItem(ticketRecordItem);

      const requesterBaseline = mapRequesterFromTicketForList(ticketRecordItem.requester);
      const cartSnapshot = pickCartSnapshotForTicket(ticketRecordItem, cartItemById);
      const cartName = cartSnapshot?.cti_us_name?.trim();

      return {
        ...baseItem,
        requester: {
          ...requesterBaseline,
          // override name จาก cart_items 
          fullName:
            cartName && cartName.length > 0 ? cartName : "",
        },
      };
    });

    return {
      items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limitNumber)),
      },
    };
  }

  const isPrismaSortable =
    sortField === "requestDate" ||
    sortField === "status" ||
    sortField === "requester";

  let prismaOrderBy: Prisma.borrow_return_ticketsOrderByWithRelationInput[] = [
    { created_at: sortDirection as Prisma.SortOrder },
  ];

  if (sortField === "status") {
    prismaOrderBy = [{ brt_status: sortDirection as Prisma.SortOrder }];
  }

  if (sortField === "requester") {
    prismaOrderBy = [
      { requester: { us_firstname: sortDirection as Prisma.SortOrder } },
      { requester: { us_lastname: sortDirection as Prisma.SortOrder } },
      { created_at: "desc" },
    ];
  }

  if (isPrismaSortable) {
    const [totalItems, ticketRecords] = await Promise.all([
      prisma.borrow_return_tickets.count({ where: baseWhere }),
      prisma.borrow_return_tickets.findMany({
        where: baseWhere,
        orderBy: prismaOrderBy,
        skip: offsetNumber,
        take: limitNumber,
        select: {
          brt_id: true,
          brt_status: true,
          created_at: true,
          brt_user: true,
          brt_phone: true,
          requester: {
            select: {
              us_id: true,
              us_firstname: true,
              us_lastname: true,
              us_emp_code: true,
              department: { select: { dept_name: true } },
              section: { select: { sec_name: true } },
            },
          },

          ticket_devices: {
            where: { deleted_at: null },
            select: {
              td_id: true,
              td_origin_cti_id: true,
              child: {
                select: {
                  dec_id: true,
                  device: {
                    select: {
                      de_id: true,
                      de_name: true,
                      de_serial_number: true,
                      category: { select: { ca_name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // ดึง cart_items แบบ batch
    const cartItemById = await buildCartItemMap(ticketRecords);

    const items = ticketRecords.map((ticketRecordItem) => {
      const baseItem = mapTicketToListItem(ticketRecordItem);

      const requesterBaseline = mapRequesterFromTicketForList(ticketRecordItem.requester);
      const cartSnapshot = pickCartSnapshotForTicket(ticketRecordItem, cartItemById);
      const cartName = cartSnapshot?.cti_us_name?.trim();

      return {
        ...baseItem,
        requester: {
          ...requesterBaseline,
          fullName:
            cartName && cartName.length > 0 ? cartName : requesterBaseline.fullName,
          borrowName: ticketRecordItem.brt_user,
          borrowPhone: ticketRecordItem.brt_phone,
        },
      };
    });

    return {
      items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limitNumber)),
      },
    };
  }

  /**
   * Description: กรณี sort ที่ต้องใช้ข้อมูลหลัง relation แบบ to-many จึงต้อง sort ใน memory
   */
  const allTicketRecords = await prisma.borrow_return_tickets.findMany({
    where: baseWhere,
    orderBy: [{ created_at: "desc" }],
    select: {
      brt_id: true,
      brt_status: true,
      created_at: true,

      requester: {
        select: {
          us_id: true,
          us_firstname: true,
          us_lastname: true,
          us_emp_code: true,
          department: { select: { dept_name: true } },
          section: { select: { sec_name: true } },
        },
      },

      ticket_devices: {
        where: { deleted_at: null },
        select: {
          td_id: true,
          td_origin_cti_id: true, // ✅ เพิ่ม
          child: {
            select: {
              device: {
                select: {
                  de_id: true,
                  de_name: true,
                  de_serial_number: true,
                  category: { select: { ca_name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  // ดึง cart_items แบบ batch
  const cartItemById = await buildCartItemMap(allTicketRecords);

  const allItems = allTicketRecords.map((ticketRecordItem) => {
    const baseItem = mapTicketToListItem(ticketRecordItem);

    const requesterBaseline = mapRequesterFromTicketForList(ticketRecordItem.requester);
    const cartSnapshot = pickCartSnapshotForTicket(ticketRecordItem, cartItemById);
    const cartName = cartSnapshot?.cti_us_name?.trim();

    return {
      ...baseItem,
      requester: {
        ...requesterBaseline,
        fullName:
          cartName && cartName.length > 0 ? cartName : requesterBaseline.fullName,
      },
    };
  });

  if (sortField === "deviceName") {
    allItems.sort((leftItem, rightItem) => {
      const leftValue = leftItem.deviceSummary.deviceName ?? "";
      const rightValue = rightItem.deviceSummary.deviceName ?? "";
      return sortDirection === "asc"
        ? leftValue.localeCompare(rightValue)
        : rightValue.localeCompare(leftValue);
    });
  }

  if (sortField === "category") {
    allItems.sort((leftItem, rightItem) => {
      const leftValue = leftItem.deviceSummary.categoryName ?? "";
      const rightValue = rightItem.deviceSummary.categoryName ?? "";
      return sortDirection === "asc"
        ? leftValue.localeCompare(rightValue)
        : rightValue.localeCompare(leftValue);
    });
  }

  const totalItems = allItems.length;
  const pagedItems = allItems.slice(offsetNumber, offsetNumber + limitNumber);

  return {
    items: pagedItems,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limitNumber)),
    },
  };
}

/**
 * Description: ดึงรายละเอียดประวัติ Ticket การยืม (Detail) โดยตรวจสอบสิทธิ์การมองเห็นตาม role ก่อนคืนข้อมูล
 * Input : ticketId (number), currentUserContext (CurrentUserContext)
 * Output : Promise<HistoryBorrowTicketDetail> รายละเอียด ticket สำหรับหน้า detail
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryBorrowTicketDetail(
  ticketId: number,
  currentUserContext: CurrentUserContext
): Promise<HistoryBorrowTicketDetail> {
  const visibilityWhere = buildVisibilityWhere(currentUserContext);

  const ticketRecord = await prisma.borrow_return_tickets.findFirst({
    where: {
      brt_id: ticketId,
      deleted_at: null,
      AND: [visibilityWhere],
    },
    select: {
      brt_id: true,
      brt_status: true,

      brt_usage_location: true,
      brt_borrow_purpose: true,
      brt_start_date: true,
      brt_end_date: true,

      brt_reject_reason: true,
      brt_pickup_location: true,
      brt_pickup_datetime: true,
      brt_return_location: true,
      brt_return_datetime: true,

      created_at: true,

      requester: {
        select: {
          us_id: true,
          us_firstname: true,
          us_lastname: true,
          us_emp_code: true,
          us_phone: true,
          department: { select: { dept_name: true } },
          section: { select: { sec_name: true } },
        },
      },

      ticket_devices: {
        where: { deleted_at: null },
        select: {
          td_id: true,
          td_origin_cti_id: true,
          child: {
            select: {
              dec_id: true,
              dec_asset_code: true,
              dec_serial_number: true,
              dec_status: true,

              device: {
                select: {
                  de_id: true,
                  de_name: true,
                  de_serial_number: true,
                  de_images: true,
                  de_description: true,
                  de_max_borrow_days: true,

                  category: { select: { ca_name: true } },

                  accessories: {
                    where: { deleted_at: null },
                    select: {
                      acc_id: true,
                      acc_name: true,
                      acc_quantity: true,
                    },
                  },

                  section: {
                    select: {
                      sec_name: true,
                      department: { select: { dept_name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },

      stages: {
        where: { deleted_at: null },
        select: {
          brts_status: true,
          brts_name: true,
          brts_step_approve: true,
          brts_role: true,
          brts_dept_id: true,
          brts_sec_id: true,
          brts_dept_name: true,
          brts_sec_name: true,
          updated_at: true,

          department: { select: { dept_id: true, dept_name: true } },
          section: { select: { sec_id: true, sec_name: true } },

          approver: {
            select: {
              us_id: true,
              us_firstname: true,
              us_lastname: true,
              us_emp_code: true,
              us_role: true,
              department: { select: { dept_id: true, dept_name: true } },
              section: { select: { sec_id: true, sec_name: true } },
            },
          },
        },
      },
    },
  });

  if (!ticketRecord) {
    throw new HttpError(HttpStatus.NOT_FOUND, "Ticket not found");
  }

  // หา cart_items snapshot จาก td_origin_cti_id 
  const originCartItemIds = (ticketRecord.ticket_devices ?? [])
    .map((td: any) => td.td_origin_cti_id)
    .filter((id: any): id is number => typeof id === "number");

  let cartName: string | null = null;
  let cartPhone: string | null = null;

  if (originCartItemIds.length > 0) {
    const cartItems = await prisma.cart_items.findMany({
      where: {
        deleted_at: null,
        cti_id: { in: originCartItemIds },
      },
      select: {
        cti_id: true,
        cti_us_name: true,
        cti_phone: true,
      },
    });

    const cartItemById = new Map(cartItems.map((c) => [c.cti_id, c]));

    for (const id of originCartItemIds) {
      const c = cartItemById.get(id);
      if (c) {
        const name = c.cti_us_name?.trim() ?? "";
        const phone = c.cti_phone?.trim() ?? "";
        cartName = name.length > 0 ? name : null;
        cartPhone = phone.length > 0 ? phone : null;
        break;
      }
    }
  }

  const detail = await mapTicketToDetail(ticketRecord);

  // fallback จาก users 
  const requesterFullNameFromUser = `${ticketRecord.requester?.us_firstname ?? ""} ${ticketRecord.requester?.us_lastname ?? ""
    }`.trim();

  return {
    ...detail,
    requester: {
      ...detail.requester,
      userId: ticketRecord.requester?.us_id,
      // ไม่มี cart -> ให้เป็น "" 
      fullName: cartName && cartName.length > 0 ? cartName : "",
      employeeCode: ticketRecord.requester?.us_emp_code ?? null,
      // ไม่มี cart -> ให้เป็น null 
      phoneNumber: cartPhone && cartPhone.length > 0 ? cartPhone : null,
      department_name: ticketRecord.requester?.department?.dept_name ?? null,
      section_name: ticketRecord.requester?.section?.sec_name ?? null,
    },
  };
}

/**
 * Description: Export service สำหรับประวัติการยืม-คืน เพื่อให้ controller เรียกใช้งาน
 * Input : - (อ้างอิงฟังก์ชันภายในไฟล์)
 * Output : object ที่รวมเมธอดของ service
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyBorrowService = {
  getHistoryBorrowTickets,
  getHistoryBorrowTicketDetail,
};
