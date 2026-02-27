import cron from "node-cron";
import { prisma } from "../infrastructure/database/client.js";
import {
  BASE_EVENT,
  BRT_STATUS,
  DA_STATUS,
  DEVICE_CHILD_STATUS,
  LBR_ACTION,
  LDC_ACTION,
  NR_EVENT,
  US_ROLE,
} from "@prisma/client";
import { logger } from "../infrastructure/logger.js";
import { auditLogger } from "./audit-logger.js";
import { SocketEmitter } from "../infrastructure/websocket/socket.emitter.js";
import { notificationsService } from "../modules/notifications/notifications.service.js";
import { BorrowReturnRepository } from "../modules/tickets/borrow-return/borrow-return.repository.js";
import { jobDispatcher } from "../infrastructure/queue/job.dispatcher.js";
import { JobType } from "../infrastructure/queue/job.types.js";
import { env } from "../config/env.js";

// ระยะเวลา 30 นาที ในมิลลิวินาที
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

// Repository instance สำหรับ query tickets
const borrowReturnRepository = new BorrowReturnRepository();

/**
 * Description: ระบบตั้งเวลางานอัตโนมัติ (Cron Job) สำหรับจัดการ Ticket และการแจ้งเตือน
 * Input     : ไม่มี
 * Output    : void - ตั้งค่า Cron Jobs สำหรับการเปลี่ยนสถานะ Ticket และแจ้งเตือน
 * Note      : รันทุก 10 นาที - เปลี่ยน APPROVED → IN_USE, แจ้งเตือนก่อนคืน 30 นาที, แจ้งเตือนเกินกำหนด
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
export const initCronJobs = () => {
  /**
   * Description: Cron Job ทุก 10 นาที - ตรวจสอบ Ticket ทุกประเภท
   * Schedule  : every 10 minutes (ทุก 10 นาที)
   * Action    : 1. เปลี่ยน APPROVED → IN_USE 2. แจ้งเตือนก่อนคืน 30 นาที 3. แจ้งเตือนเกินกำหนด
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  cron.schedule("*/10 * * * *", async () => {
    logger.info(
      `Running 10-min cron job at ${new Date().toISOString()}: Processing tickets...`,
    );
    try {
      await handleStatusTransitions();
      await handleDueSoonTickets();
    } catch (error) {
      logger.error({ error }, "Failed to run cron job");
    }
  });

  /**
   * Description: Cron Job ตรวจสอบ Ticket ที่เกินกำหนด (Overdue)
   * Schedule  : 0 9 *\/2 * * (ทุก 2 วัน เวลา 09:00)
   * Action    : ส่งอีเมลและแจ้งเตือน Ticket ที่เกินกำหนด
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  cron.schedule("0 9 */2 * *", async () => {
    logger.info("Running overdue check cron job...");
    try {
      await handleOverdueTickets();
    } catch (error) {
      logger.error({ error }, "Failed to run overdue check cron job");
    }
  });

  /**
   * Description: Cron Job เที่ยงคืน - ทำความสะอาดข้อมูล
   * Schedule  : 0 0 * * * (ทุกวัน เวลา 00:00)
   * Action    : ลบ device_availabilities ที่ COMPLETED
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  cron.schedule("0 0 * * *", async () => {
    logger.info("Running midnight cron job: Cleaning up data...");
    try {
      await cleanupCompletedAvailabilities();
    } catch (error) {
      logger.error({ error }, "Failed to run cleanup cron job");
    }
  });

  logger.info("Cron jobs initialized");
};

/**
 * Description: เปลี่ยนสถานะ Ticket จาก APPROVED เป็น IN_USE อัตโนมัติเมื่อถึงเวลาเริ่มยืม
 * Input     : ไม่มี (ใช้ Repository query)
 * Output    : Promise<void> - อัปเดตสถานะ Ticket และอุปกรณ์ พร้อมบันทึก Audit Log
 * Note      : ใช้ Transaction เพื่อความปลอดภัยของข้อมูล
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function handleStatusTransitions() {
  const now = new Date();

  // ใช้ Repository method แทน inline query
  const pendingStartTickets =
    await borrowReturnRepository.findTicketsNeedingTransition(now);

  if (pendingStartTickets.length === 0) return;

  for (const ticket of pendingStartTickets) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. อัปเดตสถานะ Ticket เป็น IN_USE
        await tx.borrow_return_tickets.update({
          where: { brt_id: ticket.brt_id },
          data: { brt_status: BRT_STATUS.IN_USE },
        });

        // 2. อัปเดตสถานะอุปกรณ์ใน Ticket เป็น BORROWED
        const deviceIds = ticket.ticket_devices.map((td) => td.td_dec_id);
        await tx.device_childs.updateMany({
          where: { dec_id: { in: deviceIds } },
          data: { dec_status: DEVICE_CHILD_STATUS.BORROWED },
        });

        // 3. บันทึก Log สำหรับ Ticket
        await auditLogger.logBorrowReturn(tx, {
          action: LBR_ACTION.UPDATED,
          brtId: ticket.brt_id,
          actorId: null, // null = System / Auto
          oldStatus: BRT_STATUS.APPROVED,
          newStatus: BRT_STATUS.IN_USE,
          note: `System: Auto transition to IN_USE because current time >= start date (${ticket.brt_start_date.toISOString()})`,
        });

        // 4. บันทึก Log สำหรับอุปกรณ์แต่ละชิ้น
        for (const td of ticket.ticket_devices) {
          await auditLogger.logDeviceHistory(tx, {
            action: LDC_ACTION.BORROWED,
            decId: td.td_dec_id,
            brtId: ticket.brt_id,
            actorId: null,
            oldStatus: td.child.dec_status,
            newStatus: DEVICE_CHILD_STATUS.BORROWED,
            note: "System: Auto borrowed based on ticket start date",
          });
        }
      });

      // สร้าง notification แจ้งผู้ยืมว่าถึงเวลายืมอุปกรณ์แล้ว
      await notificationsService.createNotification({
        recipient_ids: [ticket.brt_user_id],
        title: "ถึงเวลาการยืมอุปกรณ์แล้ว",
        message: "โปรดรับอุปกรณ์ภายในเวลาที่กำหนด",
        event: NR_EVENT.YOUR_TICKET_IN_USE,
        base_event: BASE_EVENT.TICKET_APPROVED,
        brt_id: ticket.brt_id,
        upsert: true,
      });

      if (ticket.staffer) {
        SocketEmitter.toRole({
          role: US_ROLE.STAFF,
          dept: ticket.staffer.us_dept_id || 0,
          sec: ticket.staffer.us_sec_id || 0,
          event: "REFRESH_REQUEST_PAGE",
          data: { ticketId: ticket.brt_id },
        });
      }

      logger.info(
        `Ticket #${ticket.brt_id} automatically transitioned to IN_USE`,
      );
    } catch (err) {
      logger.error(
        { err, brt_id: ticket.brt_id },
        "Failed to transition ticket status",
      );
    }
  }
}

/**
 * Description: ตรวจสอบ Ticket ที่ใกล้ถึงกำหนด (30 นาที) และที่เกินกำหนด
 * Input     : ไม่มี (ใช้ Repository query)
 * Output    : Promise<void> - ส่งแจ้งเตือนไปยังผู้ยืม
 * Note      : เรียกใช้ผ่าน Cron Job ทุก 10 นาที
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function handleDueSoonTickets() {
  const now = new Date();
  const thirtyMinutesLater = new Date(now.getTime() + THIRTY_MINUTES_MS);

  // แจ้งเตือน Ticket ที่ต้องคืนใน 30 นาทีข้างหน้า (Due Soon)
  const dueSoonTickets = await borrowReturnRepository.findDueSoonTickets(
    now,
    thirtyMinutesLater,
  );

  for (const ticket of dueSoonTickets) {
    const deviceName =
      ticket.ticket_devices[0]?.child?.device?.de_name || "อุปกรณ์";

    const endTime = ticket.brt_end_date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    await jobDispatcher.dispatch(JobType.EMAIL_TICKET_DUE_SOON, {
      email: ticket.requester.us_email,
      name: ticket.requester.us_firstname,
      username: ticket.requester.us_username,
      ticketId: ticket.brt_id,
      deviceName: deviceName,
      dueTime: endTime,
      ticketUrl: `${env.FRONTEND_URL}/home/${ticket.brt_id}`,
    });

    await notificationsService.createNotification({
      recipient_ids: [ticket.brt_user_id],
      title: "มีอุปกรณ์ใกล้กำหนดคืน",
      message: `กรุณาคืนรายการ${deviceName} ภายในเวลา ${endTime} น.`,
      event: NR_EVENT.DUE_SOON_REMINDER,
      base_event: BASE_EVENT.TICKET_DUE_SOON,
      brt_id: ticket.brt_id,
      upsert: true,
      target_route: `/home/${ticket.brt_id}`,
    });
  }

  if (dueSoonTickets.length > 0) {
    logger.info(`📢 Sent ${dueSoonTickets.length} 'Due Soon' reminders`);
  }
}

/**
 * Description: ตรวจสอบ Ticket ที่ "เกินกำหนด" แล้ว (Overdue) และส่งแจ้งเตือน
 * Input     : ไม่มี (ใช้ Repository query)
 * Output    : Promise<void> - ส่งอีเมลแจ้งเตือนและ Notification ไปยังผู้ยืม
 * Note      : เรียกใช้ผ่าน Cron Job ทุกวัน เวลา 9:00, 11:00, ... (ทุก 2 ชั่วโมง)
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function handleOverdueTickets() {
  const now = new Date();
  //แจ้งเตือน Ticket ที่ "เกินกำหนด" แล้ว (Overdue)
  const overdueTickets = await borrowReturnRepository.findOverdueTickets(now);

  for (const ticket of overdueTickets) {
    const deviceName =
      ticket.ticket_devices[0]?.child?.device?.de_name || "อุปกรณ์";

    const overdueDuration = calculateOverdueDuration(ticket.brt_end_date, now);

    await jobDispatcher.dispatch(JobType.EMAIL_TICKET_OVER_DUE, {
      email: ticket.requester.us_email,
      name: ticket.requester.us_firstname,
      username: ticket.requester.us_username,
      ticketId: ticket.brt_id,
      deviceName: deviceName,
      overdueSince: overdueDuration,
      ticketUrl: `${env.FRONTEND_URL}/home/${ticket.brt_id}`,
    });

    await notificationsService.createNotification({
      recipient_ids: [ticket.brt_user_id],
      title: "มีอุปกรณ์ที่เลยกำหนดคืนแล้ว",
      message: `คำขอยืม${deviceName} เลยกำหนดคืนแล้ว`,
      event: NR_EVENT.OVERDUE_ALERT,
      base_event: BASE_EVENT.TICKET_OVERDUE,
      brt_id: ticket.brt_id,
      upsert: true,
      target_route: `/home/${ticket.brt_id}`,
    });
  }

  if (overdueTickets.length > 0) {
    logger.info(`📢 Sent ${overdueTickets.length} 'Overdue' alerts`);
  }
}

/**
 * Description: ลบ device_availabilities ที่มี status เป็น COMPLETED
 * Input     : ไม่มี
 * Output    : Promise<void> - ลบ records ที่ไม่จำเป็นออก
 * Note      : เรียกใช้ผ่าน Cron Job เที่ยงคืน เพื่อ cleanup ข้อมูล
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function cleanupCompletedAvailabilities() {
  const result = await prisma.device_availabilities.deleteMany({
    where: {
      da_status: DA_STATUS.COMPLETED,
    },
  });

  if (result.count > 0) {
    logger.info(
      `🗑️ Cleaned up ${result.count} completed device availability records`,
    );
  }
}

/**
 * Description: คำนวณระยะเวลาที่เกินกำหนดคืน (วัน, ชั่วโมง, หรือ นาที)
 * Input     : endDate (Date) - วันที่ครบกำหนดคืน, now (Date) - วันที่ปัจจุบัน
 * Output    : string - ระยะเวลาที่เกินกำหนดในรูปแบบข้อความ (เช่น "2 วัน", "5 ชั่วโมง", "30 นาที")
 * Note      : ใช้สำหรับแสดงในอีเมลแจ้งเตือน
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
function calculateOverdueDuration(endDate: Date, now: Date): string {
  const diffMs = now.getTime() - endDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} วัน`;
  if (diffHours > 0) return `${diffHours} ชั่วโมง`;
  return `${diffMins} นาที`;
}
