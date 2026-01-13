import {
  BRTS_STATUS,
  BRT_STATUS,
  DA_STATUS,
  DEVICE_CHILD_STATUS,
  LBR_ACTION,
  LDC_ACTION,
  Prisma,
  US_ROLE,
} from "@prisma/client";
import { prisma } from "../../../infrastructure/database/client.js";
import { auditLogger } from "../../../utils/audit-logger.js";
import {
  GetDeviceAvailableQuery,
  ReturnDeviceSchema,
} from "./borrow-return.schema.js";

export class BorrowReturnRepository {
  /**
   * Description: ดึงรายการ Borrow-Return Tickets พร้อม Pagination, Filtering และ Sorting
   * Input     : params { user_id, role, dept_id, sec_id, page, limit, status, search, sortField, sortDirection }
   * Output    : Promise<{ total: number, items: BorrowReturnTicket[] }> - จำนวนทั้งหมดและรายการตามหน้า
   * Note      : ใช้ Raw SQL Query สำหรับกรอง Tickets ที่ถึงคิวอนุมัติของผู้ใช้งาน (brt_current_stage = brts_step_approve)
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async findPaginated(params: {
    userId: number | null | undefined;
    role: string | undefined;
    deptId: number | null | undefined;
    secId: number | null | undefined;
    page?: number | null;
    limit?: number | null;
    status?: any;
    search?: string | null;
    sortField?: string | null;
    sortDirection?: "asc" | "desc" | null;
  }) {
    const {
      userId,
      role,
      deptId,
      secId,
      page: pageParam,
      limit: limitParam,
      status,
      search,
      sortField,
      sortDirection,
    } = params;
    const page = pageParam || 1;
    const limit = limitParam || 10;
    const skip = (page - 1) * limit;

    // สร้าง orderBy ตาม sortField
    let orderBy: Prisma.borrow_return_ticketsOrderByWithRelationInput = {
      created_at: "desc",
    };
    if (sortField) {
      const direction = sortDirection || "asc";
      switch (sortField) {
        case "device_name":
          orderBy = { ticket_devices: { _count: direction } };
          break;
        case "quantity":
          orderBy = { brt_quantity: direction };
          break;
        case "requester":
          orderBy = { requester: { us_firstname: direction } };
          break;
        case "request_date":
          orderBy = { brt_start_date: direction };
          break;
        case "status":
          orderBy = { brt_status: direction };
          break;
      }
    }

    const where: Prisma.borrow_return_ticketsWhereInput = {
      deleted_at: null,
      brt_status: status
        ? status
        : {
          in: [BRT_STATUS.PENDING, BRT_STATUS.IN_USE, BRT_STATUS.APPROVED],
        },
    };

    if (search) {
      const searchNum = Number(search);
      where.OR = [
        {
          requester: {
            us_firstname: { contains: search, mode: "insensitive" },
          },
        },
        {
          requester: { us_lastname: { contains: search, mode: "insensitive" } },
        },
        {
          requester: { us_emp_code: { contains: search, mode: "insensitive" } },
        },
        {
          ticket_devices: {
            some: {
              child: {
                device: {
                  de_name: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        },
        {
          ticket_devices: {
            some: {
              child: {
                device: {
                  de_serial_number: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        },
        {
          ticket_devices: {
            some: {
              child: {
                device: {
                  category: {
                    ca_name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          },
        },
      ];
      if (!isNaN(searchNum)) {
        where.OR.push({ brt_id: searchNum });
      }
    }

    // Filter: เห็นเฉพาะ request ที่ถึงคิว stage ของตัวเอง และสถานะยังเป็น PENDING
    // เนื่องจาก Prisma ไม่รองรับ field-to-field comparison (brt_current_stage = brts_step_approve)
    // เราจึงใช้ SQL ช่วยดึง IDs ที่ "ถึงคิว" มากรองเพื่อความถูกต้อง
    if (role) {
      const matchingTickets = await prisma.$queryRaw<any[]>`
                SELECT DISTINCT t."brt_id" as id
                FROM "borrow_return_tickets" t
                LEFT JOIN "borrow_return_ticket_stages" s ON t."brt_id" = s."brts_brt_id"
                WHERE (
                  (s."brts_status" = ${BRTS_STATUS.PENDING}::"BRTS_STATUS"
                    AND s."brts_role" = ${role}::"US_ROLE"
                    AND (
                        (${role} = ${US_ROLE.HOD} AND s."brts_dept_id" = ${deptId})
                        OR
                        (${role} != ${US_ROLE.HOD} AND (s."brts_dept_id" = ${deptId}) AND (s."brts_sec_id" = ${secId}))
                    )
                    AND s."brts_step_approve" = t."brt_current_stage"
                  )
                  OR (t."brt_staff_id" = ${userId})
                )
            `;
      const allowedIds = matchingTickets.map((ticket) => ticket.id);
      where.brt_id = { in: allowedIds };
    }

    const [total, items] = await Promise.all([
      prisma.borrow_return_tickets.count({ where }),
      prisma.borrow_return_tickets.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          requester: {
            select: {
              us_id: true,
              us_firstname: true,
              us_lastname: true,
              us_emp_code: true,
              us_images: true,
              department: { select: { dept_name: true, dept_id: true } },
              section: { select: { sec_name: true, sec_id: true } },
            },
          },
          ticket_devices: {
            include: {
              child: {
                select: {
                  device: {
                    select: {
                      de_id: true,
                      de_serial_number: true,
                      de_name: true,
                      de_description: true,
                      de_location: true,
                      de_max_borrow_days: true,
                      de_images: true,
                      category: { select: { ca_name: true } },
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
        },
      }),
    ]);

    return { total, items };
  }

  /**
   * Description: ดึงรายละเอียด Borrow-Return Ticket ตาม ID พร้อมข้อมูลครบถ้วน
   * Input     : id: number - Ticket ID
   * Output    : Promise<BorrowReturnTicketWithRelations | null> - ข้อมูล Ticket รวมอุปกรณ์, Stages และ Accessories
   * Note      : Include ข้อมูล requester, ticket_devices, stages พร้อมผู้อนุมัติ
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getById(id: number) {
    const ticket: any = await prisma.borrow_return_tickets.findUnique({
      where: { brt_id: id },
      include: {
        requester: {
          select: {
            us_id: true,
            us_firstname: true,
            us_lastname: true,
            us_emp_code: true,
            us_images: true,
            us_email: true,
            us_phone: true,
            department: { select: { dept_name: true } },
          },
        },
        ticket_devices: {
          include: {
            child: {
              select: {
                dec_id: true,
                dec_serial_number: true,
                dec_asset_code: true,
                dec_has_serial_number: true,
                dec_status: true,
                device: {
                  select: {
                    accessories: {
                      select: {
                        acc_id: true,
                        acc_name: true,
                        acc_quantity: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        stages: {
          orderBy: { brts_step_approve: "asc" },
          include: {
            approver: {
              select: { us_firstname: true, us_lastname: true, us_role: true },
            },
            department: { select: { dept_name: true } },
            section: { select: { sec_name: true } },
          },
        },
      },
    });

    if (!ticket) return null;

    // Fetch potential approvers for each stage
    const stagesWithApprovers = await Promise.all(
      ticket.stages.map(async (stage: any) => {
        const users = await this.findPotentialApprovers(
          stage.brts_role as US_ROLE,
          stage.brts_dept_id,
          stage.brts_sec_id,
        );
        return {
          ...stage,
          approvers: users.map((u) => `${u.us_firstname} ${u.us_lastname}`),
        };
      }),
    );

    return {
      ...ticket,
      stages: stagesWithApprovers,
    };
  }

  /**
   * Description: ดึงข้อมูล Ticket พร้อมลำดับขั้นตอนการอนุมัติ (Stages) สำหรับตรวจสอบสิทธิ์
   * Input     : ticket_id: number - Ticket ID
   * Output    : Promise<BorrowReturnTicketWithStages | null> - Ticket พร้อมลำดับ Stages
   * Note      : ใช้สำหรับตรวจสอบว่าผู้อนุมัติมีสิทธิ์หรือไม่
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getFlowApproveById(ticket_id: number) {
    return await prisma.borrow_return_tickets.findUnique({
      where: { brt_id: ticket_id },
      include: {
        stages: {
          orderBy: {
            brts_id: "asc",
          },
        },
      },
    });
  }

  /**
   * Description: อนุมัติขั้นตอนของตั๋ว (Transaction) พร้อมจัดการสถานะอุปกรณ์และ Audit Log
   * Input     : params { approverId, stageId, ticketId, currentStage, isLastStage, pickupLocation? }
   * Output    : Promise<true> - สำเร็จ (โยน Error ถ้าผิดพลาด)
   * Note      : ถ้าเป็นขั้นสุดท้ายจะเปลี่ยนสถานะตั๋วเป็น APPROVED/IN_USE และอัปเดตสถานะอุปกรณ์ด้วย
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async approveStageTransaction(params: {
    approverId: number;
    stageId: number;
    ticketId: number;
    currentStage: number;
    isLastStage: boolean;
    pickupLocation?: string;
  }) {
    const {
      approverId,
      stageId,
      ticketId,
      currentStage,
      isLastStage,
      pickupLocation,
    } = params;

    return await prisma.$transaction(async (tx) => {
      // 1. ดึงข้อมูลตั๋วและอุปกรณ์ที่เกี่ยวข้อง (รวมสถานะเพื่อทำ Log)
      const ticket = await tx.borrow_return_tickets.findUnique({
        where: { brt_id: ticketId },
        include: { ticket_devices: { include: { child: true } } },
      });
      if (!ticket) throw new Error("TICKET_NOT_FOUND");

      // 2. อัปเดตสถานะขั้นตอน (Stage) เป็น APPROVED
      const result = await tx.borrow_return_ticket_stages.updateMany({
        where: {
          brts_id: stageId,
          brts_status: BRTS_STATUS.PENDING,
        },
        data: {
          brts_us_id: approverId,
          brts_status: BRTS_STATUS.APPROVED,
        },
      });

      if (result.count === 0) {
        throw new Error("STAGE_ALREADY_PROCESSED_OR_NOT_PENDING");
      }

      // 3. จัดการสถานะตั๋วและอุปกรณ์
      if (isLastStage) {
        if (!pickupLocation) throw new Error("DON'T_HAVE_PICKUP_LOCATION_YET");

        const now = new Date();
        const startDate = new Date(ticket.brt_start_date);
        const isInUseYet = startDate <= now;
        const newStatus = isInUseYet ? BRT_STATUS.IN_USE : BRT_STATUS.APPROVED;

        await Promise.all([
          // อัปเดตตั๋ว
          tx.borrow_return_tickets.update({
            where: { brt_id: ticketId, brt_current_stage: currentStage },
            data: {
              brt_pickup_location: pickupLocation,
              brt_status: newStatus,
              brt_staff_id: approverId,
            },
          }),

          // บันทึก Log การอนุมัติตั๋ว
          auditLogger.logBorrowReturn(tx, {
            action: LBR_ACTION.APPROVED,
            brtId: ticketId,
            actorId: approverId,
            oldStatus: ticket.brt_status,
            newStatus: newStatus,
            note: `Final stage approved by ${approverId}. Pickup: ${pickupLocation}`,
          }),
        ]);

        // หากถึงเวลาใช้งานแล้ว ให้เปลี่ยนสถานะอุปกรณ์ทันที
        if (isInUseYet) {
          // อัปเดตอุปกรณ์ยกชุด
          await tx.device_childs.updateMany({
            where: {
              ticket_devices: {
                some: {
                  td_brt_id: ticketId,
                  deleted_at: null,
                },
              },
            },
            data: {
              dec_status: DEVICE_CHILD_STATUS.BORROWED,
            },
          });

          // บันทึก Log สำหรับอุปกรณ์แต่ละชิ้น
          for (const td of ticket.ticket_devices) {
            await auditLogger.logDeviceHistory(tx, {
              action: LDC_ACTION.BORROWED,
              decId: td.td_dec_id,
              actorId: approverId,
              brtId: ticketId,
              oldStatus: td.child.dec_status,
              newStatus: DEVICE_CHILD_STATUS.BORROWED,
              note: `Status changed to BORROWED upon ticket ${ticketId} final approval (Immediate start).`,
            });
          }
        }
      } else {
        // เลื่อนไปยังขั้นตอนถัดไป
        await tx.borrow_return_tickets.update({
          where: { brt_id: ticketId, brt_current_stage: currentStage },
          data: {
            brt_current_stage: currentStage + 1,
          },
        });

        // บันทึก Log ความคืบหน้าขั้นตอน
        await auditLogger.logBorrowReturn(tx, {
          action: LBR_ACTION.UPDATED,
          brtId: ticketId,
          actorId: approverId,
          oldStatus: ticket.brt_status,
          newStatus: ticket.brt_status,
          note: `Stage ${currentStage} approved. Advancing to stage ${currentStage + 1}.`,
        });
      }

      return true;
    });
  }

  /**
   * Description: ปฏิเสธ Ticket (Transaction) พร้อมอัปเดตสถานะและบันทึกเหตุผล
   * Input     : params { approverId, stageId, ticketId, currentStage, isLastStage, rejectReason }
   * Output    : Promise<boolean> - ผลลัพธ์การ transaction
   * Note      : อัปเดต stage เป็น REJECTED, บันทึกเหตุผลและสร้าง Audit Log
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async rejectTicketByIdTransaction(params: {
    approverId: number;
    stageId: number;
    ticketId: number;
    currentStage: number;
    isLastStage: boolean;
    rejectReason?: string;
  }) {
    const {
      approverId,
      stageId,
      ticketId,
      currentStage,
      isLastStage,
      rejectReason,
    } = params;

    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.borrow_return_tickets.findUnique({
        where: { brt_id: ticketId },
        include: { ticket_devices: { include: { child: true } } },
      });
      if (!ticket) throw new Error("TICKET_NOT_FOUND");

      const result = await tx.borrow_return_ticket_stages.updateMany({
        where: {
          brts_id: stageId,
          brts_status: BRTS_STATUS.PENDING,
        },
        data: {
          brts_us_id: approverId,
          brts_status: BRTS_STATUS.REJECTED,
        },
      });

      if (result.count === 0) {
        throw new Error("STAGE_ALREADY_PROCESSED_OR_NOT_PENDING");
      }

      await Promise.all([
        tx.borrow_return_tickets.update({
          where: { brt_id: ticketId, brt_current_stage: currentStage },
          data: {
            brt_status: BRT_STATUS.REJECTED,
            brt_reject_reason: rejectReason,
            brt_staff_id: isLastStage ? approverId : null,
          },
        }),

        tx.device_availabilities.updateMany({
          where: {
            da_brt_id: ticketId,
          },
          data: {
            da_status: DA_STATUS.COMPLETED,
          },
        }),

        auditLogger.logBorrowReturn(tx, {
          action: LBR_ACTION.REJECTED,
          brtId: ticketId,
          actorId: approverId,
          oldStatus: ticket.brt_status,
          newStatus: LBR_ACTION.REJECTED,
          note: `Stage ${currentStage} rejected By ${approverId}.`,
        }),
      ]);

      return true;
    });
  }

  /**
   * Description: ดึงรายการ device childs ที่พร้อมใช้งานสำหรับเพิ่มเข้า ticket
   * Input     : GetDeviceAvailableQuery { deviceId, deviceChildIds, startDate, endDate }
   * Output    : Promise<device_childs[]> - Device childs ที่สถานะ READY และไม่มีการจองในช่วงเวลาที่ระบุ
   * Note      : ใช้ none filter เพื่อหา devices ที่ไม่มี overlapping ACTIVE availability
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getAvailableDeviceChildsByDeviceId(query: GetDeviceAvailableQuery) {
    const { deviceId, deviceChildIds, startDate, endDate } = query;
    return await prisma.device_childs.findMany({
      where: {
        device: {
          de_id: deviceId,
        },
        dec_id: {
          notIn: deviceChildIds || [],
        },
        dec_status: DEVICE_CHILD_STATUS.READY,
        availabilities: {
          none: {
            da_start: { lt: endDate },
            da_end: { gt: startDate },
            da_status: DA_STATUS.ACTIVE,
          },
        },
      },
    });
  }

  /**
   * Description: จัดการ device childs ใน ticket (เพิ่ม/ลบ/อัปเดต) ภายใน transaction
   * Input     : params { ticketId, ticketStatus, startDate, endDate, devicesToAdd, devicesToRemove, devicesToUpdate, actorId }
   * Output    : Promise<boolean>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async manageDeviceChildsTransaction(params: {
    ticketId: number;
    ticketStatus: BRT_STATUS;
    startDate: Date;
    endDate: Date;
    devicesToAdd?: { id: number }[];
    devicesToRemove?: { id: number; status: DEVICE_CHILD_STATUS }[];
    devicesToUpdate?: {
      id: number;
      oldStatus: DEVICE_CHILD_STATUS;
      status: DEVICE_CHILD_STATUS;
      note?: string | null;
    }[];
    actorId: number | null;
  }) {
    const {
      ticketId,
      ticketStatus,
      startDate,
      endDate,
      devicesToAdd,
      devicesToRemove,
      devicesToUpdate,
      actorId,
    } = params;
    const changes: string[] = [];
    return await prisma.$transaction(async (tx) => {
      // เพิ่ม devices ใหม่
      if (devicesToAdd && devicesToAdd.length > 0) {
        changes.push(`เพิ่ม ${devicesToAdd.length} อุปกรณ์`);
        await Promise.all([
          tx.ticket_devices.createMany({
            data: devicesToAdd.map((deviceChild) => ({
              td_brt_id: ticketId,
              td_dec_id: deviceChild.id,
            })),
          }),
          tx.device_availabilities.createMany({
            data: devicesToAdd.map((deviceChild) => ({
              da_dec_id: deviceChild.id,
              da_brt_id: ticketId,
              da_start: startDate,
              da_end: endDate,
              da_status: DA_STATUS.ACTIVE,
            })),
          }),
        ]);

        if (ticketStatus === BRT_STATUS.IN_USE) {
          await Promise.all([
            tx.device_childs.updateMany({
              where: {
                dec_id: {
                  in: devicesToAdd.map((deviceChild) => deviceChild.id),
                },
              },
              data: {
                dec_status: DEVICE_CHILD_STATUS.BORROWED,
              },
            }),
            tx.log_device_childs.createMany({
              data: devicesToAdd.map((deviceChild) => ({
                ldc_action: LDC_ACTION.BORROWED,
                ldc_old_status: DEVICE_CHILD_STATUS.READY,
                ldc_new_status: DEVICE_CHILD_STATUS.BORROWED,
                ldc_note: `เพิ่มอุปกรณ์ในคำขอยืมระหว่างใช้งาน (Ticket ID: ${ticketId})`,
                ldc_actor_id: actorId,
                ldc_brt_id: ticketId,
                ldc_dec_id: deviceChild.id,
              })),
            }),
          ]);
        }
      }

      // ลบ devices
      if (devicesToRemove && devicesToRemove.length > 0) {
        changes.push(`ลบ ${devicesToRemove.length} อุปกรณ์`);
        await Promise.all([
          tx.ticket_devices.deleteMany({
            where: {
              td_brt_id: ticketId,
              td_dec_id: {
                in: devicesToRemove.map((deviceChild) => deviceChild.id),
              },
            },
          }),
          tx.device_availabilities.updateMany({
            where: {
              da_brt_id: ticketId,
              da_dec_id: {
                in: devicesToRemove.map((deviceChild) => deviceChild.id),
              },
            },
            data: { da_status: DA_STATUS.COMPLETED },
          }),
        ]);

        if (ticketStatus === BRT_STATUS.IN_USE) {
          for (const device of devicesToRemove) {
            const currentStatus =
              device.status === DEVICE_CHILD_STATUS.BORROWED
                ? DEVICE_CHILD_STATUS.READY
                : device.status;
            await Promise.all([
              tx.device_childs.updateMany({
                where: {
                  dec_id: {
                    in: devicesToRemove.map((deviceChild) => deviceChild.id),
                  },
                },
                data: {
                  dec_status: currentStatus,
                },
              }),
              tx.log_device_childs.createMany({
                data: devicesToRemove.map((deviceChild) => ({
                  ldc_action: LDC_ACTION.RETURNED,
                  ldc_old_status: DEVICE_CHILD_STATUS.BORROWED,
                  ldc_new_status: currentStatus,
                  ldc_note: `ลบอุปกรณ์ออกจากคำขอยืม (Ticket ID: ${ticketId})`,
                  ldc_actor_id: actorId,
                  ldc_brt_id: ticketId,
                  ldc_dec_id: deviceChild.id,
                })),
              }),
            ]);
          }
        }
      }

      // อัปเดต status ของ devices
      if (devicesToUpdate && devicesToUpdate.length > 0) {
        changes.push(`อัปเดต ${devicesToUpdate.length} อุปกรณ์`);
        for (const device of devicesToUpdate) {
          await Promise.all([
            tx.device_childs.update({
              where: { dec_id: device.id },
              data: {
                dec_status: device.status,
              },
            }),
            tx.log_device_childs.create({
              data: {
                ldc_action: LDC_ACTION.CHANGED,
                ldc_old_status: device.oldStatus,
                ldc_new_status: device.status,
                ldc_note:
                  device.note || `อัปเดตสถานะอุปกรณ์ (Ticket ID: ${ticketId})`,
                ldc_actor_id: actorId,
                ldc_brt_id: ticketId,
                ldc_dec_id: device.id,
              },
            }),
          ]);
        }
      }

      // Log การจัดการอุปกรณ์ใน ticket
      if (changes.length > 0) {
        await auditLogger.logBorrowReturn(tx, {
          action: LBR_ACTION.UPDATED,
          brtId: ticketId,
          actorId: actorId,
          oldStatus: ticketStatus,
          newStatus: ticketStatus,
          note: `จัดการอุปกรณ์: ${changes.join(", ")}`,
        });
      }

      return true;
    });
  }

  /**
   * Description: คืนอุปกรณ์ - อัปเดตสถานะ ticket เป็น COMPLETED และอัปเดตสถานะ device childs
   * Input     : params { ticketId, devices, actorId }
   * Output    : Promise<boolean>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async returnTicketTransaction(params: {
    ticketId: number;
    devices: ReturnDeviceSchema[];
    actorId: number | null;
  }) {
    const { ticketId, devices, actorId } = params;

    return await prisma.$transaction(async (tx) => {
      // Get old ticket status before update
      const ticket = await tx.borrow_return_tickets.findUnique({
        where: { brt_id: ticketId },
        select: { brt_status: true },
      });

      await Promise.all([
        // Update Ticket status to COMPLETED
        tx.borrow_return_tickets.update({
          where: { brt_id: ticketId },
          data: {
            brt_status: BRT_STATUS.COMPLETED,
            brt_return_datetime: new Date(),
            updated_at: new Date(),
          },
        }),

        // Update Device Availability status to COMPLETED
        tx.device_availabilities.updateMany({
          where: { da_brt_id: ticketId },
          data: { da_status: DA_STATUS.COMPLETED },
        }),
      ]);

      // Update Device Child status following input from Ticket
      for (const device of devices) {
        // Get old status before update
        const oldDevice = await tx.device_childs.findUnique({
          where: { dec_id: device.id },
          select: { dec_status: true },
        });

        await Promise.all([
          tx.device_childs.update({
            where: { dec_id: device.id },
            data: { dec_status: device.status },
          }),

          tx.log_device_childs.create({
            data: {
              ldc_action: LDC_ACTION.RETURNED,
              ldc_old_status:
                oldDevice?.dec_status || DEVICE_CHILD_STATUS.BORROWED,
              ldc_new_status: device.status,
              ldc_note: `คืนอุปกรณ์ (Ticket ID: ${ticketId})`,
              ldc_actor_id: actorId,
              ldc_brt_id: ticketId,
              ldc_dec_id: device.id,
            },
          }),
        ]);
      }

      // Save Log Borrow Return
      await auditLogger.logBorrowReturn(tx, {
        action: LBR_ACTION.RETURNED,
        brtId: ticketId,
        actorId: actorId,
        oldStatus: ticket?.brt_status || BRT_STATUS.IN_USE,
        newStatus: BRT_STATUS.COMPLETED,
        note: `คืนอุปกรณ์ทั้งหมด ${devices.length} ชิ้น`,
      });

      return true;
    });
  }

  // ================== Cron Job Queries ==================

  /**
   * Description: ค้นหา Ticket ที่อนุมัติแล้วและถึงเวลาเริ่มใช้งาน (สำหรับ Cron Job)
   * Input     : now (Date) - เวลาปัจจุบัน
   * Output    : Promise<Ticket[]> - รายการ Ticket ที่ต้องเปลี่ยนเป็น IN_USE
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async findTicketsNeedingTransition(now: Date) {
    return prisma.borrow_return_tickets.findMany({
      where: {
        brt_status: BRT_STATUS.APPROVED,
        brt_start_date: { lte: now },
        deleted_at: null,
      },
      include: {
        ticket_devices: {
          include: { child: true },
        },
        staffer: {
          select: { us_dept_id: true, us_sec_id: true },
        },
      },
    });
  }

  /**
   * Description: ค้นหา Ticket ที่ใกล้ถึงกำหนดคืน (30 นาที)
   * Input     : now (Date), thirtyMinutesLater (Date)
   * Output    : Promise<Ticket[]> - รายการ Ticket ใกล้กำหนดคืน
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async findDueSoonTickets(now: Date, thirtyMinutesLater: Date) {
    return prisma.borrow_return_tickets.findMany({
      where: {
        brt_status: BRT_STATUS.IN_USE,
        brt_end_date: { gte: now, lte: thirtyMinutesLater },
        deleted_at: null,
      },
      include: {
        ticket_devices: {
          include: {
            child: {
              include: {
                device: { select: { de_name: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Description: ค้นหา Ticket ที่เกินกำหนดคืนแล้ว
   * Input     : now (Date)
   * Output    : Promise<Ticket[]> - รายการ Ticket เกินกำหนด
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async findOverdueTickets(now: Date) {
    return prisma.borrow_return_tickets.findMany({
      where: {
        brt_status: BRT_STATUS.IN_USE,
        brt_end_date: { lt: now },
        deleted_at: null,
      },
      include: {
        ticket_devices: {
          include: {
            child: {
              include: {
                device: { select: { de_name: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Description: ค้นหาผู้ใช้งานที่มีสิทธิ์อนุมัติในขั้นตอนนั้นๆ
   * Input     : role, deptId, secId
   * Output    : Promise<User[]> - รายการผู้อนุมัติ
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async findPotentialApprovers(
    role: US_ROLE,
    deptId: number | null,
    secId: number | null,
  ) {
    return prisma.users.findMany({
      where: {
        us_role: role,
        us_is_active: true,
        ...(role === US_ROLE.HOD
          ? { us_dept_id: deptId }
          : {
            us_dept_id: deptId,
            us_sec_id: secId,
          }),
      },
      select: { us_firstname: true, us_lastname: true },
    });
  }
}
