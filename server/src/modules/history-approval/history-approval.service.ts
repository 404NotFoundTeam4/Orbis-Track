// src/modules/history-approval/history-approval.service.ts
import { prisma } from "../../infrastructure/database/client.js";
import { HttpError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { Prisma, BRTS_STATUS, US_ROLE } from "@prisma/client";

import type {
  ApprovalAction,
  GetHistoryApprovalQuery,
  HistoryApprovalDetail,
  HistoryApprovalItem,
  HistoryApprovalListResponse,
} from "./history-approval.schema.js";
import { isApprovalActionStatus } from "./history-approval.schema.js";

/**
 * Description: โครงสร้าง user context ขั้นต่ำที่ service ต้องใช้ เพื่อกำหนดเงื่อนไขการมองเห็นข้อมูลตามบทบาทผู้ใช้
 * Input : - (ได้จาก auth middleware เช่น req.user)
 * Output : Type สำหรับใช้เป็นพารามิเตอร์ของ service
 * Author: Chanwit Muangma (Boom) 66160224
 */
type CurrentUserContext = {
  userId: number;
  userRole: US_ROLE;
  departmentId: number | null;
  sectionId: number | null;
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
 * Description: ตรวจสอบสิทธิ์การเข้าถึงหน้าประวัติการอนุมัติ
 * Rule :
 * - อนุญาตเฉพาะ ADMIN, STAFF, HOD, HOS
 * Input : userRole (US_ROLE)
 * Output : void (throw error ถ้าไม่มีสิทธิ์)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function assertHistoryApprovalAllowed(userRole: US_ROLE): void {
  const allowedRoles: US_ROLE[] = ["ADMIN", "STAFF", "HOD", "HOS"];
  if (!allowedRoles.includes(userRole)) {
    throw new HttpError(HttpStatus.FORBIDDEN, "Forbidden");
  }
}

/**
 * Description: สร้างเงื่อนไขค้นหา (search) จากหลายฟิลด์ของ ticket ที่เกี่ยวข้องกับประวัติการอนุมัติ
 * - ค้นจากชื่อ/นามสกุล/รหัสพนักงานของผู้ส่งคำขอ
 * - ค้นจากชื่อ/serial ของอุปกรณ์แม่ใน ticket
 *
 * Input : searchText (string)
 * Output : Prisma.borrow_return_ticket_stagesWhereInput (ส่วน OR ที่ผูกกับ ticket/relation)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function buildSearchWhere(
  searchText: string
): Prisma.borrow_return_ticket_stagesWhereInput {
  const normalizedSearchText = searchText.trim();
  if (!normalizedSearchText) return {};

  return {
    OR: [
      {
        ticket: {
          requester: {
            us_firstname: {
              contains: normalizedSearchText,
              mode: "insensitive",
            },
          },
        },
      },
      {
        ticket: {
          requester: {
            us_lastname: {
              contains: normalizedSearchText,
              mode: "insensitive",
            },
          },
        },
      },
      {
        ticket: {
          requester: {
            us_emp_code: {
              contains: normalizedSearchText,
              mode: "insensitive",
            },
          },
        },
      },
      {
        ticket: {
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
      },
    ],
  };
}

/**
 * Description: ตรวจสอบว่า stageRecord มีข้อมูล approver ครบถ้วนก่อนนำไป map
 * - Prisma relation approver อาจถูกพิมพ์ว่า nullable จึงต้องมีการ guard เพื่อให้ TypeScript มั่นใจ
 * - ถ้าไม่พบ approver ให้ throw error เพื่อกันการคืนข้อมูลผิดรูปแบบ
 *
 * Input : stageRecord (any) ข้อมูล stage จาก Prisma
 * Output : approverUserRecord (object) ข้อมูล approver ที่ไม่เป็น null
 * Author: Chanwit Muangma (Boom) 66160224
 */
function getApproverUserRecordOrThrow(stageRecord: any) {
  const approverUserRecord = stageRecord?.approver ?? null;

  if (!approverUserRecord) {
    throw new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Approver not found");
  }

  return approverUserRecord;
}

/**
 * Description: map stage record เป็นรายการแถวของหน้า List ประวัติการอนุมัติ
 * NOTE:
 * - ตาม requirement ใหม่: เอา "actor" ออก (ไม่คืนค่าใน list แล้ว)
 * - list จะใช้ "หมวดหมู่อุปกรณ์" ผ่าน deviceSummary.categoryName
 *
 * Input : stageRecord (ผลจาก Prisma findMany พร้อม select ที่จำเป็น)
 * Output : HistoryApprovalItem
 * Author: Chanwit Muangma (Boom) 66160224
 */
function mapStageRecordToListItem(stageRecord: any): HistoryApprovalItem {
  const ticketRecord = stageRecord.ticket;
  const requesterRecord = ticketRecord.requester;

  const firstTicketDevice = ticketRecord.ticket_devices?.[0];
  const deviceRecord = firstTicketDevice?.child?.device;

  const stageStatus = stageRecord.brts_status as BRTS_STATUS;
  const action: ApprovalAction = isApprovalActionStatus(stageStatus)
    ? stageStatus
    : "APPROVED";

  return {
    ticketId: ticketRecord.brt_id,
    action,

    /**
     * Description: แปลงเป็น ISO string เพื่อให้ FE จัด format ได้ง่าย
     * Author: Chanwit Muangma (Boom) 66160224
     */
    actionDateTime: (stageRecord.updated_at ?? new Date()).toISOString(),

    requester: {
      userId: requesterRecord.us_id,
      fullName: buildFullName(
        requesterRecord.us_firstname,
        requesterRecord.us_lastname
      ),
      employeeCode: requesterRecord.us_emp_code ?? null,
      departmentName: requesterRecord.department?.dept_name ?? null,
      sectionName: requesterRecord.section?.sec_name ?? null,
    },

    /**
     * Description: deviceSummary สำหรับ list
     * - เพิ่ม categoryName เพื่อให้หน้า list แสดง "หมวดหมู่อุปกรณ์"
     * Author: Chanwit Muangma (Boom) 66160224
     */
    deviceSummary: {
      deviceId: deviceRecord?.de_id ?? 0,
      deviceName: deviceRecord?.de_name ?? "-",
      deviceSerialNumber: deviceRecord?.de_serial_number ?? "-",
      categoryName: deviceRecord?.category?.ca_name ?? null,
    },
  };
}

/**
 * Description: ดึงรายการประวัติการอนุมัติ (List) ของ “ผู้ใช้ปัจจุบัน”
 * Rule :
 * - เฉพาะ role: ADMIN/STAFF/HOD/HOS
 * - ดึงจาก stages ที่ผู้ใช้เป็น approver และ status เป็น APPROVED หรือ REJECTED
 *
 * Input : query (GetHistoryApprovalQuery), currentUserContext (CurrentUserContext)
 * Output : Promise<HistoryApprovalListResponse>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryApprovalItems(
  query: GetHistoryApprovalQuery,
  currentUserContext: CurrentUserContext
): Promise<HistoryApprovalListResponse> {
  assertHistoryApprovalAllowed(currentUserContext.userRole);

  const pageNumber = Math.max(1, Number(query.page ?? 1));
  const limitNumber = Math.max(1, Number(query.limit ?? 10));
  const offsetNumber = (pageNumber - 1) * limitNumber;

  const actionFilter = query.action
    ? ([query.action] as ApprovalAction[])
    : (["APPROVED", "REJECTED"] as ApprovalAction[]);

  const searchWhere = query.search ? buildSearchWhere(query.search) : {};

  const baseWhere: Prisma.borrow_return_ticket_stagesWhereInput = {
    deleted_at: null,
    brts_status: { in: actionFilter as unknown as BRTS_STATUS[] },
    approver: { us_id: currentUserContext.userId },
    ticket: { deleted_at: null },
    AND: [searchWhere],
  };

  const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";
  const sortField = query.sortField ?? "actionDateTime";

  /**
   * Description: Sort ที่ Prisma รองรับตรง ๆ (updated_at, brts_status, requester)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const isPrismaSortable =
    sortField === "actionDateTime" ||
    sortField === "action" ||
    sortField === "requester";

  let prismaOrderBy: Prisma.borrow_return_ticket_stagesOrderByWithRelationInput[] =
    [{ updated_at: sortDirection }];

  if (sortField === "action") {
    prismaOrderBy = [{ brts_status: sortDirection }];
  }

  if (sortField === "requester") {
    prismaOrderBy = [
      { ticket: { requester: { us_firstname: sortDirection } } },
      { ticket: { requester: { us_lastname: sortDirection } } },
      { updated_at: "desc" },
    ];
  }

  if (isPrismaSortable) {
    const [totalItems, stageRecords] = await Promise.all([
      prisma.borrow_return_ticket_stages.count({ where: baseWhere }),
      prisma.borrow_return_ticket_stages.findMany({
        where: baseWhere,
        orderBy: prismaOrderBy,
        skip: offsetNumber,
        take: limitNumber,
        select: {
          brts_status: true,
          updated_at: true,

          /**
           * Description: list ไม่ใช้ actor แล้ว จึงไม่ต้อง select approver detail
           * - where ยัง filter ด้วย approver อยู่แล้ว
           * Author: Chanwit Muangma (Boom) 66160224
           */

          ticket: {
            select: {
              brt_id: true,
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
                  child: {
                    select: {
                      device: {
                        select: {
                          de_id: true,
                          de_name: true,
                          de_serial_number: true,
                          category: {
                            select: {
                              ca_name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const items = stageRecords.map(mapStageRecordToListItem);

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
   * Description: กรณี sort ตาม deviceName ต้อง sort ใน memory (เพราะ device อยู่ใน relation to-many)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const allStageRecords = await prisma.borrow_return_ticket_stages.findMany({
    where: baseWhere,
    orderBy: [{ updated_at: "desc" }],
    select: {
      brts_status: true,
      updated_at: true,

      ticket: {
        select: {
          brt_id: true,
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
      },
    },
  });

  const allItems = allStageRecords.map(mapStageRecordToListItem);

  if (sortField === "deviceName") {
    allItems.sort((leftItem, rightItem) => {
      const leftValue = leftItem.deviceSummary.deviceName ?? "";
      const rightValue = rightItem.deviceSummary.deviceName ?? "";
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
 * Description: ดึงรายละเอียดประวัติการอนุมัติ (Detail) ของ ticketId สำหรับ “ผู้ใช้ปัจจุบัน”
 * Rule :
 * - เฉพาะ role: ADMIN/STAFF/HOD/HOS
 * - ต้องมี stage ของ ticket นั้น ที่ผู้ใช้ปัจจุบันเป็น approver และ status เป็น APPROVED/REJECTED
 *
 * Input : ticketId (number), currentUserContext (CurrentUserContext)
 * Output : Promise<HistoryApprovalDetail>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getHistoryApprovalDetail(
  ticketId: number,
  currentUserContext: CurrentUserContext
): Promise<HistoryApprovalDetail> {
  assertHistoryApprovalAllowed(currentUserContext.userRole);

  const stageRecord = await prisma.borrow_return_ticket_stages.findFirst({
    where: {
      deleted_at: null,
      approver: { us_id: currentUserContext.userId },
      brts_status: { in: ["APPROVED", "REJECTED"] as unknown as BRTS_STATUS[] },
      ticket: { brt_id: ticketId, deleted_at: null },
    },
    orderBy: [{ updated_at: "desc" }],
    select: {
      brts_status: true,
      updated_at: true,

      /**
       * Description: detail ยังต้องใช้ actor (approver) ใน modal
       * Author: Chanwit Muangma (Boom) 66160224
       */
      approver: {
        select: {
          us_id: true,
          us_firstname: true,
          us_lastname: true,
          us_emp_code: true,
          us_role: true,
          department: { select: { dept_name: true } },
          section: { select: { sec_name: true } },
        },
      },

      ticket: {
        select: {
          brt_id: true,
          brt_reject_reason: true,

          
          brt_borrow_purpose: true,
          brt_usage_location: true,
          brt_start_date: true,
          brt_end_date: true,

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
              child: {
                select: {
                  device: {
                    select: {
                      de_id: true,
                      de_name: true,
                      de_serial_number: true,
                      category: {
                        select: {
                          ca_name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!stageRecord) {
    throw new HttpError(HttpStatus.NOT_FOUND, "Approval history not found");
  }

  const approverUserRecord = getApproverUserRecordOrThrow(stageRecord);

  const ticketRecord = stageRecord.ticket;
  const requesterRecord = ticketRecord.requester;

  const firstTicketDevice = ticketRecord.ticket_devices?.[0];
  const deviceRecord = firstTicketDevice?.child?.device;

  const stageStatus = stageRecord.brts_status as BRTS_STATUS;
  const action: ApprovalAction = isApprovalActionStatus(stageStatus)
    ? stageStatus
    : "APPROVED";

  const rejectReason =
    action === "REJECTED" ? ticketRecord.brt_reject_reason ?? null : null;

  return {
    ticketId: ticketRecord.brt_id,
    action,

    /**
     * Description: แปลงเป็น ISO string เพื่อให้ตรงกับ schema ฝั่ง FE และ format ได้ง่าย
     * Author: Chanwit Muangma (Boom) 66160224
     */
    actionDateTime: (stageRecord.updated_at ?? new Date()).toISOString(),

    deviceSummary: {
      deviceId: deviceRecord?.de_id ?? 0,
      deviceName: deviceRecord?.de_name ?? "-",
      deviceSerialNumber: deviceRecord?.de_serial_number ?? "-",

      /**
       * Description: ชื่อหมวดหมู่อุปกรณ์ (อาจไม่มีได้)
       * Author: Chanwit Muangma (Boom) 66160224
       */
      categoryName: deviceRecord?.category?.ca_name ?? null,
    },

    deviceChildCount: Array.isArray(ticketRecord.ticket_devices)
      ? ticketRecord.ticket_devices.length
      : 0,

    requester: {
      userId: requesterRecord.us_id,
      fullName: buildFullName(
        requesterRecord.us_firstname,
        requesterRecord.us_lastname
      ),
      employeeCode: requesterRecord.us_emp_code ?? null,
      departmentName: requesterRecord.department?.dept_name ?? null,
      sectionName: requesterRecord.section?.sec_name ?? null,
    },

    /**
     * Description: ผู้กระทำ/ผู้ดำเนินการ (actor)
     * - สำหรับ modal คุณสามารถให้ FE เลือกแสดงเฉพาะ ADMIN/STAFF ได้
     * Author: Chanwit Muangma (Boom) 66160224
     */
    actor: {
      userId: approverUserRecord.us_id,
      fullName: buildFullName(
        approverUserRecord.us_firstname,
        approverUserRecord.us_lastname
      ),
      employeeCode: approverUserRecord.us_emp_code ?? null,
      role: approverUserRecord.us_role,
      departmentName: approverUserRecord.department?.dept_name ?? null,
      sectionName: approverUserRecord.section?.sec_name ?? null,
    },

    /**
     * Description: ฟิลด์ใหม่ในหน้า Detail
     * - map ให้ตรงกับ column ในตาราง borrow_return_tickets (ตาม prisma model)
     * Author: Chanwit Muangma (Boom) 66160224
     */
    borrowPurpose: ticketRecord.brt_borrow_purpose ?? null,
    usageLocation: ticketRecord.brt_usage_location ?? null,

    /**
     * Description: ช่วงวันเวลา "วันที่ยืม - วันที่คืน"
     * - ส่งเป็น string (ISO) เพื่อให้ FE format ได้
     * - ถ้า null ให้เป็น "" (กัน schema ที่บังคับเป็น string)
     * Author: Chanwit Muangma (Boom) 66160224
     */
    borrowDateRange: {
      startDateTime: ticketRecord.brt_start_date
        ? ticketRecord.brt_start_date.toISOString()
        : null,
      endDateTime: ticketRecord.brt_end_date
        ? ticketRecord.brt_end_date.toISOString()
        : null,
    },

    /**
     * Description: เหตุผลการปฏิเสธ (เฉพาะ action = "REJECTED")
     * Author: Chanwit Muangma (Boom) 66160224
     */
    rejectReason,
  };
}

/**
 * Description: Export service สำหรับประวัติการอนุมัติ เพื่อให้ controller เรียกใช้งาน
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const historyApprovalService = {
  getHistoryApprovalItems,
  getHistoryApprovalDetail,
};
