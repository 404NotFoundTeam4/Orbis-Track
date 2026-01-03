/**
 * Description: Service สำหรับจัดการ Borrow-Return Tickets
 * - รองรับ Pagination, Filter by status, Search, และ Sorting
 * - ใช้ Repository สำหรับ Query ข้อมูล
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import {
  ApproveTicket,
  BorrowReturnTicketDetailDto,
  GetBorrowTicketQuery,
  GetDeviceAvailableQuery,
  RejectTicket,
  ReturnDeviceSchema,
  TicketDeviceSchema,
  UpdateDeviceChildInTicket,
} from "./borrow-return.schema.js";
import { IdParamDto } from "../../departments/departments.schema.js";
import { BorrowReturnRepository } from "./borrow-return.repository.js";
import { AccessTokenPayload } from "../../auth/auth.schema.js";
import { HttpStatus } from "../../../core/http-status.enum.js";
import { HttpError } from "../../../errors/errors.js";
import { notificationsService } from "../../notifications/notifications.service.js";
import { prisma } from "../../../infrastructure/database/client.js";
import { BASE_EVENT, NR_EVENT, US_ROLE } from "@prisma/client";
import { SocketEmitter } from "../../../infrastructure/websocket/socket.emitter.js";
import { logger } from "../../../infrastructure/logger.js";

export class BorrowReturnService {
  constructor(private readonly repository: BorrowReturnRepository) {}

  /**
   * Description: ดึงรายการ Borrow-Return Tickets พร้อมรายละเอียดสำหรับแต่ละรายการ
   * Input     : GetBorrowTicketQuery { page, limit, status, search, sortField, sortDirection }, role, deptId, secId, userId
   * Output    : PaginatedResult<TicketItemDto> - รายการ Tickets พร้อมข้อมูล Pagination
   * Note      : กรองตาม Role/Department/Section ของผู้ใช้งาน
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicket(
    query: GetBorrowTicketQuery,
    role: string | undefined,
    deptId: number | null | undefined,
    secId: number | null | undefined,
    userId: number | null | undefined,
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortField,
      sortDirection,
    } = query;

    const { total, items } = await this.repository.findPaginated({
      userId,
      role,
      deptId,
      secId,
      page,
      limit,
      status,
      search,
      sortField,
      sortDirection,
    });

    const formattedData = items.map((item: any) => {
      const mainDevice = item.ticket_devices[0]?.child.device;
      const deviceCount = item.brt_quantity;
      const dept = mainDevice?.section?.department?.dept_name ?? "";

      return {
        id: item.brt_id,
        status: item.brt_status,
        created_at: item.created_at,
        request_date: item.brt_start_date,

        requester: {
          id: item.requester.us_id,
          fullname: `${item.requester.us_firstname} ${item.requester.us_lastname}`,
          empcode: item.requester.us_emp_code,
          image: item.requester.us_images,
          department: item.requester.department?.dept_name || "-",
        },

        device_summary: {
          deviceId: mainDevice ? mainDevice.de_id : 0,
          name: mainDevice ? mainDevice.de_name : "Unknown Device",
          serial_number: mainDevice ? mainDevice.de_serial_number : "-",
          description: mainDevice ? mainDevice.de_description : "-",
          location: mainDevice ? mainDevice.de_location : "-",
          max_borrow_days: mainDevice ? mainDevice.de_max_borrow_days : "-",
          image: mainDevice ? mainDevice.de_images : null,
          category: mainDevice ? mainDevice.category.ca_name : "-",
          section:
            mainDevice?.section?.sec_name.replace(dept, "").trim() ?? "-",
          department: dept.replace(/แผนก/g, "").trim() ?? "-",
          total_quantity: deviceCount,
        },
      };
    });

    return {
      data: formattedData,
      total,
      page: page || 1,
      limit: limit || 10,
      maxPage: Math.ceil(total / (limit || 10)),
      paginated: true as const,
    };
  }

  /**
   * Description: ดึงรายละเอียด Borrow-Return Ticket ตาม ID
   * Input     : IdParamDto { id: number }
   * Output    : BorrowReturnTicketDetailDto - ข้อมูลครบถ้วนของ Ticket (รวมอุปกรณ์, Timeline, Accessory)
   * Note      : โยน HttpError ถ้าไม่พบ Ticket
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicketById(
    params: IdParamDto,
  ): Promise<BorrowReturnTicketDetailDto> {
    const { id } = params;
    const ticket = await this.repository.getById(id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return {
      id: ticket.brt_id,
      status: ticket.brt_status,
      details: {
        purpose: ticket.brt_borrow_purpose,
        location_use: ticket.brt_usage_location,
        quantity: ticket.brt_quantity,
        current_stage: ticket.brt_current_stage,
        dates: {
          start: ticket.brt_start_date,
          end: ticket.brt_end_date,
          pickup: ticket.brt_pickup_datetime,
          return: ticket.brt_return_datetime,
        },
        locations: {
          pickup: ticket.brt_pickup_location,
          return: ticket.brt_return_location,
        },
        reject_reason: ticket.brt_reject_reason,
        reject_date: ticket.updated_at,
      },

      requester: {
        ...ticket.requester,
        fullname: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
      },

      devices: ticket.ticket_devices.map((td: any) => ({
        child_id: td.child.dec_id,
        asset_code: td.child.dec_asset_code,
        serial: td.child.dec_serial_number || "-",
        current_status: td.child.dec_status,
        has_serial_number: td.child.dec_has_serial_number,
      })),

      accessories:
        ticket.ticket_devices[0]?.child.device?.accessories?.length > 0
          ? [
            {
              acc_id:
                ticket.ticket_devices[0].child.device.accessories[0].acc_id,
              acc_name:
                ticket.ticket_devices[0].child.device.accessories[0].acc_name,
              acc_quantity:
                ticket.ticket_devices[0].child.device.accessories[0]
                  .acc_quantity,
            },
          ]
          : [],

      timeline: ticket.stages.map((stage: any) => ({
        role_name: stage.brts_name,
        step: stage.brts_step_approve,
        required_role: stage.brts_role,
        dept_id: stage.brts_dept_id,
        dept_name: stage.brts_dept_name,
        sec_id: stage.brts_sec_id,
        sec_name: stage.brts_sec_name,
        status: stage.brts_status,
        approved_by: stage.approver
          ? `${stage.approver.us_firstname} ${stage.approver.us_lastname}`
          : null,
        updated_at: stage.updated_at,
      })),
    };
  }

  /**
   * Description: ดำเนินการอนุมัติ Ticket ตามลำดับขั้นตอน (Stage)
   * Input     : IdParamDto { id }, AccessTokenPayload (approvalUser), ApproveTicket { currentStage, pickupLocation? }
   * Output    : void - อนุมัติสำเร็จและส่งแจ้งเตือนไปยังผู้เกี่ยวข้อง
   * Note      : จัดการแจ้งเตือน3ทิศทาง: (1)ผู้ยืม (2)ผู้อนุมัติคนอื่นในขั้นเดียวกัน (3)ผู้อนุมัติลำดับถัดไป
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async approveTicketById(
    params: IdParamDto,
    approvalUser: AccessTokenPayload | undefined,
    payload: ApproveTicket,
  ): Promise<void> {
    if (!approvalUser)
      throw new HttpError(HttpStatus.UNAUTHORIZED, "Access Denied!");
    const { id: ticketId } = params;
    const { currentStage } = payload;
    const ticket = await this.repository.getFlowApproveById(ticketId);

    if (!ticket) throw new HttpError(HttpStatus.NOT_FOUND, "Ticket Not Found!");

    const ticketStage = ticket.stages;
    const stageLength = ticketStage.length - 1;
    const indexCurrentStage = ticketStage.findIndex(
      (ts) => currentStage === ts.brts_step_approve,
    );

    const borrowUserId = ticket.brt_user_id;

    if (indexCurrentStage === -1)
      throw new HttpError(HttpStatus.NOT_FOUND, "Ticket Stage Not Found!");

    const isLastStage = stageLength === indexCurrentStage;
    const currentStageData = ticketStage[indexCurrentStage];
    const isGrantApproveUser =
      approvalUser?.role === US_ROLE.HOD
        ? currentStageData.brts_dept_id === approvalUser?.dept
        : currentStageData.brts_dept_id === approvalUser?.dept &&
        currentStageData.brts_sec_id === approvalUser?.sec;

    if (!isGrantApproveUser)
      throw new HttpError(
        HttpStatus.FORBIDDEN,
        "You Don't Have Permission to Approve this Ticket!",
      );

    // ดำเนินการอนุมัติผ่าน Transaction ใน Repository
    await this.repository.approveStageTransaction({
      approverId: approvalUser.sub,
      stageId: currentStageData.brts_id,
      ticketId: ticketId,
      currentStage: indexCurrentStage + 1,
      isLastStage,
      pickupLocation: payload?.pickupLocation || undefined,
    });

    // เตรียมแจ้งเตือน
    const totalStages = ticketStage.length;

    if (isLastStage) {
      // เช็คว่าถึงเวลาเริ่มใช้งานแล้วหรือยัง
      const startDate = new Date(ticket.brt_start_date);
      const isInUseYet = startDate <= new Date();

      // แจ้งเตือนผู้ยืม: อนุมัติครบทุกขั้นตอน
      try {
        await notificationsService.createNotification({
          recipient_ids: [borrowUserId],
          title: "คำขอยืมถูกอนุมัติแล้ว",
          message: `[blue:สถานที่รับอุปกรณ์ : ${payload.pickupLocation || "-"}]\nโปรดรับอุปกรณ์ภายในเวลาที่กำหนด`,
          base_event: BASE_EVENT.TICKET_APPROVED,
          event: NR_EVENT.YOUR_TICKET_APPROVED,
          brt_id: ticketId,
          upsert: true,
          // TO DO : add target route to ticket detail page
          // target_route: `/request-borrow-ticket/${ticketId}`,
        });

        // ถ้าถึงเวลาใช้งานแล้ว ส่ง notification เพิ่ม
        if (isInUseYet) {
          await notificationsService.createNotification({
            recipient_ids: [borrowUserId],
            title: "ถึงเวลาการยืมอุปกรณ์แล้ว",
            message: "โปรดรับอุปกรณ์ภายในเวลาที่กำหนด",
            event: NR_EVENT.YOUR_TICKET_IN_USE,
            base_event: BASE_EVENT.TICKET_APPROVED,
            brt_id: ticketId,
            upsert: true,
          });
        }
      } catch (error) {
        logger.error({ err: error }, "Failed to send final notification");
      }
    } else {
      const nextStage = ticketStage[indexCurrentStage + 1];
      const displayStep = `[green:${currentStage} / ${totalStages}]`;

      // แจ้งเตือนผู้ยืม: อนุมัติบางส่วน (สถานะอัปเดต)
      try {
        await notificationsService.createNotification({
          recipient_ids: [borrowUserId],
          title: "มีคำขอยืมที่กำลังรออนุมัติ",
          message: `ลำดับการอนุมัติปัจจุบัน : ${displayStep}`,
          base_event: "TICKET_STAGE_PASSED",
          event: "YOUR_TICKET_STAGE_APPROVED",
          brt_id: ticketId,
          // TO DO : add target route to ticket detail page
          // target_route: `/request-borrow-ticket/${ticketId}`,
          upsert: true,
        });
      } catch (error) {
        logger.error({ err: error }, "Failed to send status notification");
      }

      // ปิดการแจ้งเตือนสำหรับผู้อนุมัติคนอื่นๆ ในขั้นตอนปัจจุบัน (ถ้ามีหลายคน)
      try {
        notificationsService.dismissNotificationsByTicket({
          approvalUser: approvalUser.sub,
          brt_id: ticketId,
          event: "APPROVAL_REQUESTED",
          type: "borrow",
          target_role: currentStageData.brts_role,
          target_dept: currentStageData.brts_dept_id || 0,
          target_sec: currentStageData.brts_sec_id || 0,
        });
      } catch (error) {
        logger.error(
          { err: error },
          "Failed to dismiss old approval notifications",
        );
      }

      // แจ้งเตือนผู้อนุมัติลำดับถัดไป
      try {
        const nextApprovers = await prisma.users.findMany({
          where: {
            us_role: nextStage.brts_role as US_ROLE,
            us_is_active: true,
            ...(nextStage.brts_role === "HOD"
              ? { us_dept_id: nextStage.brts_dept_id }
              : {
                us_dept_id: nextStage.brts_dept_id,
                us_sec_id: nextStage.brts_sec_id,
              }),
          },
          select: { us_id: true },
        });

        if (nextApprovers.length > 0) {
          await notificationsService.createNotification({
            recipient_ids: nextApprovers.map((approver) => approver.us_id),
            title: "แจ้งเตือนคำขอยืมใหม่",
            message: `มีคำขอยืมกำลังรออนุมัติ`,
            base_event: "TICKET_STAGE_PASSED",
            event: "APPROVAL_REQUESTED",
            brt_id: ticketId,
            target_route: `/request-borrow-ticket/${ticketId}`,
            // upsert: true,
          });

          if (nextStage.brts_role === US_ROLE.HOD) {
            SocketEmitter.toRole({
              role: nextStage.brts_role,
              dept: nextStage.brts_dept_id || 0,
              event: "REFRESH_REQUEST_PAGE",
              data: { ticketId: ticketId },
            });
          } else {
            SocketEmitter.toRole({
              role: nextStage.brts_role,
              dept: nextStage.brts_dept_id || 0,
              sec: nextStage.brts_sec_id || 0,
              event: "REFRESH_REQUEST_PAGE",
              data: { ticketId: ticketId },
            });
          }
        }
      } catch (error) {
        logger.error({ err: error }, "Failed to notify next approvers");
      }
    }
  }

  /**
   * Description: ดำเนินการปฏิเสธ Ticket พร้อมบันทึกเหตุผล
   * Input     : IdParamDto { id }, AccessTokenPayload (approvalUser), RejectTicket { currentStage, rejectReason }
   * Output    : void
   * Note      : อัปเดตสถานะ ticket เป็น REJECTED, บันทึกเหตุผล และส่งแจ้งเตือนผู้ร้องขอ
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async rejectTicketById(
    params: IdParamDto,
    approvalUser: AccessTokenPayload | undefined,
    payload: RejectTicket,
  ): Promise<void> {
    if (!approvalUser)
      throw new HttpError(HttpStatus.UNAUTHORIZED, "Access Denied!");
    const { id: ticketId } = params;
    const { currentStage, rejectReason } = payload;
    const ticket = await this.repository.getFlowApproveById(ticketId);

    if (!ticket) throw new HttpError(HttpStatus.NOT_FOUND, "Ticket Not Found!");

    const ticketStage = ticket.stages;
    const stageLength = ticketStage.length - 1;
    const indexCurrentStage = ticketStage.findIndex(
      (ts) => currentStage === ts.brts_step_approve,
    );

    const borrowUserId = ticket.brt_user_id;

    if (indexCurrentStage === -1)
      throw new HttpError(HttpStatus.NOT_FOUND, "Ticket Stage Not Found!");

    const isLastStage = stageLength === indexCurrentStage;
    const currentStageData = ticketStage[indexCurrentStage];
    const isGrantApproveUser =
      approvalUser?.role === US_ROLE.HOD
        ? currentStageData.brts_dept_id === approvalUser?.dept
        : currentStageData.brts_dept_id === approvalUser?.dept &&
        currentStageData.brts_sec_id === approvalUser?.sec;

    if (!isGrantApproveUser)
      throw new HttpError(
        HttpStatus.FORBIDDEN,
        "You Don't Have Permission to Reject this Ticket!",
      );

    await this.repository.rejectTicketByIdTransaction({
      approverId: approvalUser.sub,
      stageId: currentStageData.brts_id,
      ticketId: ticketId,
      currentStage: indexCurrentStage + 1,
      isLastStage,
      rejectReason: rejectReason,
    });

    const results = await Promise.allSettled([
      notificationsService.createNotification({
        recipient_ids: [borrowUserId],
        title: "คำขอยืมถูกปฏิเสธ",
        message: `เหตุผลการปฏิเสธ : ${rejectReason}`,
        base_event: "TICKET_REJECTED",
        event: "YOUR_TICKET_REJECTED",
        brt_id: ticketId,
        // TO DO : add target route to ticket detail page
        // target_route: `/request-borrow-ticket/${ticketId}`,
        upsert: true,
      }),
      notificationsService.dismissNotificationsByTicket({
        approvalUser: approvalUser.sub,
        brt_id: ticketId,
        event: "APPROVAL_REQUESTED",
        type: "borrow",
        target_role: currentStageData.brts_role,
        target_dept: currentStageData.brts_dept_id || 0,
        target_sec: currentStageData.brts_sec_id || 0,
      }),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error(
          { err: result.reason },
          `Reject notification task ${index + 1} failed`,
        );
      }
    });
  }

  /**
   * Description: ดึงรายการ device childs ที่ว่างสำหรับการเพิ่มเข้า ticket
   * Input     : GetDeviceAvailableQuery { deviceId, deviceChildIds, startDate, endDate }
   * Output    : TicketDeviceSchema[] - รายการ device childs ที่พร้อมใช้งาน
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getDeviceAvailable(
    query: GetDeviceAvailableQuery,
  ): Promise<TicketDeviceSchema[]> {
    const devices =
      await this.repository.getAvailableDeviceChildsByDeviceId(query);

    // Transform to frontend format
    return devices.map((deviceChild) => ({
      child_id: deviceChild.dec_id,
      asset_code: deviceChild.dec_asset_code,
      serial: deviceChild.dec_serial_number || "",
      current_status: deviceChild.dec_status,
      has_serial_number: deviceChild.dec_has_serial_number,
    }));
  }

  /**
   * Description: จัดการ device childs ใน ticket (เพิ่ม/ลบ/อัปเดตสถานะ)
   * Input     : user (AccessTokenPayload), param (IdParamDto), deviceChilds (UpdateDeviceChildInTicket)
   * Output    : { success: boolean }
   * Note      : Emit socket event ไปยัง STAFF ใน dept/sec เดียวกันหลังจัดการสำเร็จ
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async manageDeviceChildsInTicket(
    user: AccessTokenPayload | undefined,
    param: IdParamDto,
    deviceChilds: UpdateDeviceChildInTicket,
  ) {
    const { id: ticketId } = param;
    const { devicesToAdd, devicesToRemove, devicesToUpdate } = deviceChilds;
    const ticket = await this.repository.getById(ticketId);

    if (!ticket) {
      throw new HttpError(HttpStatus.NOT_FOUND, "Ticket not found");
    }

    await this.repository.manageDeviceChildsTransaction({
      ticketId,
      ticketStatus: ticket.brt_status,
      startDate: ticket.brt_start_date,
      endDate: ticket.brt_end_date,
      devicesToAdd,
      devicesToRemove,
      devicesToUpdate,
      actorId: user ? user.sub : null,
    });

    // Emit socket event to refresh frontend (all STAFF in same dept/sec)
    if (user) {
      SocketEmitter.toRole({
        role: US_ROLE.STAFF,
        dept: user.dept || 0,
        sec: user.sec || 0,
        event: "TICKET_DEVICES_UPDATED",
        data: { ticketId },
      });
    }

    return { success: true };
  }

  /**
   * Description: คืนอุปกรณ์ - อัปเดตสถานะ ticket และ device childs
   * Input     : user, param (ticketId), devices (รายการอุปกรณ์พร้อมสถานะ)
   * Output    : { success: boolean }
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  async returnTicket(
    user: AccessTokenPayload | undefined,
    param: IdParamDto,
    devices: ReturnDeviceSchema[],
  ) {
    const ticketId = param.id;
    const actorId = user?.sub || null;

    // Query หา requester ของ ticket
    const ticket = await this.repository.getById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    const requesterId = ticket?.requester?.us_id;

    await this.repository.returnTicketTransaction({
      ticketId,
      devices,
      actorId,
    });

    // สร้าง notification แจ้งผู้ยืมว่าคืนอุปกรณ์เรียบร้อยแล้ว
    if (requesterId) {
      await notificationsService.createNotification({
        recipient_ids: [requesterId],
        title: "คืนอุปกรณ์เรียบร้อยแล้ว",
        message: "ระบบบันทึกการคืนเรียบร้อยแล้ว",
        event: NR_EVENT.YOUR_TICKET_RETURNED,
        base_event: BASE_EVENT.TICKET_RETURNED,
        brt_id: ticketId,
        // target_route: `/requests/${ticketId}`, // TODO: add target route
      });
    }

    // ส่ง notification ไปหา staff ในแผนก
    if (user) {
      SocketEmitter.toRole({
        role: US_ROLE.STAFF,
        dept: user.dept || 0,
        sec: user.sec || 0,
        event: "TICKET_RETURNED",
        data: { ticketId },
      });
    }

    return { success: true };
  }
}
