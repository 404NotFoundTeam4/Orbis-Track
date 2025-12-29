import cron from "node-cron";
import { prisma } from "../infrastructure/database/client.js";
import {
  BRT_STATUS,
  DEVICE_CHILD_STATUS,
  LBR_ACTION,
  LDC_ACTION,
  US_ROLE,
} from "@prisma/client";
import { logger } from "../infrastructure/logger.js";
import { auditLogger } from "./audit-logger.js";
import { SocketEmitter } from "../infrastructure/websocket/socket.emitter.js";

/**
 * Description: ระบบตั้งเวลางานอัตโนมัติ (Cron Job) สำหรับจัดการ Ticket และการแจ้งเตือน
 * Input     : ไม่มี
 * Output    : void - ตั้งค่า Cron Jobs สำหรับการเปลี่ยนสถานะ Ticket และแจ้งเตือนรายวัน
 * Note      : รัน 2 งาน: (1) ทุก 10 นาที - เปลี่ยน APPROVED เป็น IN_USE (2) ทุกวัน 00:01 น. - แจ้งเตือนก่อนคืน/เกินกำหนด
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
export const initCronJobs = () => {
  /**
   * Description: Cron Job ทุก 10 นาที - ตรวจสอบและเปลี่ยนสถานะ Ticket
   * Schedule  : every 10 minutes (ทุก 10 นาที)
   * Action    : เปลี่ยน APPROVED → IN_USE เมื่อถึงเวลา brt_start_date
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  cron.schedule("*/10 * * * *", async () => {
    logger.info(
      `Running 10-min cron job at ${new Date().toISOString()}: Checking for status transitions...`,
    );
    try {
      await handleStatusTransitions();
    } catch (error) {
      logger.error({ error }, "Failed to run status transitions cron job");
    }
  });

  /**
   * Description: Cron Job รายวันเวลา 00:01 น. - ตรวจสอบการแจ้งเตือนกำหนดคืน
   * Schedule  : 1 0 * * * (ทุกวัน เวลา 00:01)
   * Action    : แจ้งเตือน Ticket ที่ใกล้ถึงกำหนดคืน (Due Soon) และที่เกินกำหนด (Overdue)
   * Note      : ยังไม่เปิดใช้งาน (handleTicketDeadlines ถูก comment ไว้)
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  cron.schedule("1 0 * * *", async () => {
    logger.info("Running midnight cron job: Checking ticket deadlines...");
    try {
      // await handleTicketDeadlines();
    } catch (error) {
      logger.error({ error }, "Failed to run ticket deadlines cron job");
    }
  });

  logger.info("Cron jobs initialized");
};

/**
 * Description: เปลี่ยนสถานะ Ticket จาก APPROVED เป็น IN_USE อัตโนมัติเมื่อถึงเวลาเริ่มยืม
 * Input     : ไม่มี (ดึงข้อมูลจาก Database โดยตรง)
 * Output    : Promise<void> - อัปเดตสถานะ Ticket และอุปกรณ์ พร้อมบันทึก Audit Log
 * Note      : เรียกใช้ผ่าน Cron Job ทุก 10 นาที ใช้ Transaction เพื่อความปลอดภัยของข้อมูล
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function handleStatusTransitions() {
  const now = new Date();

  // ค้นหา Ticket ที่อนุมัติแล้วและถึงเวลาเริ่มใช้งาน (brt_start_date <= now)
  // Prisma จะเปรียบเทียบข้อมูล DateTime (Date + Time) ให้อย่างแม่นยำ
  const pendingStartTickets = await prisma.borrow_return_tickets.findMany({
    where: {
      brt_status: BRT_STATUS.APPROVED,
      brt_start_date: {
        lte: now,
      },
      deleted_at: null,
    },
    include: {
      ticket_devices: {
        include: {
          child: true,
        },
      },
      staffer: {
        select: {
          us_dept_id: true,
          us_sec_id: true,
        },
      },
    },
  });

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
        `Ticket #${ticket.brt_id} automatically transitioned to IN_USE and notified user`,
      );
    } catch (err) {
      logger.error(
        { err, brt_id: ticket.brt_id },
        "Failed to transition ticket status",
      );
    }
  }
}

// /**
//  * ตรวจสอบ Ticket ที่ใกล้ถึงกำหนด และที่เกินกำหนด
//  */
// async function handleTicketDeadlines() {
//     const now = new Date();
//     const tomorrow = new Date();
//     tomorrow.setDate(now.getDate() + 1);

//     // กำหนดช่วงเวลาสำหรับเปรียบเทียบ (Ignore time, focus on date)
//     const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
//     const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

//     // 1. แจ้งเตือน Ticket ที่ต้องคืน "พรุ่งนี้" (Due Soon)
//     const dueSoonTickets = await prisma.borrow_return_tickets.findMany({
//         where: {
//             brt_status: BRT_STATUS.IN_USE,
//             brt_end_date: {
//                 gte: startOfTomorrow,
//                 lte: endOfTomorrow,
//             },
//             deleted_at: null,
//         },
//         select: { brt_id: true, brt_user_id: true },
//     });

//     for (const ticket of dueSoonTickets) {
//         await notificationsService.createNotification({
//             recipient_ids: [ticket.brt_user_id],
//             title: "⏰ แจ้งเตือน: ใกล้ถึงกำหนดคืนอุปกรณ์",
//             message: `Ticket #${ticket.brt_id} ของคุณมีกำหนดส่งคืนในวันพรุ่งนี้ กรุณาเตรียมส่งคืนตามเวลาที่กำหนด`,
//             event: NR_EVENT.DUE_SOON_REMINDER,
//             base_event: BASE_EVENT.TICKET_DUE_SOON,
//             brt_id: ticket.brt_id,
//             upsert: true, // ป้องกันการส่งซ้ำในวันเดียวกันหากรันหลายรอบ
//             target_route: `/requests/${ticket.brt_id}`,
//         });
//     }

//     if (dueSoonTickets.length > 0) {
//         logger.info(`📢 Sent ${dueSoonTickets.length} 'Due Soon' reminders`);
//     }

//     // 2. แจ้งเตือน Ticket ที่ "เกินกำหนด" แล้ว (Overdue)
//     const overdueTickets = await prisma.borrow_return_tickets.findMany({
//         where: {
//             brt_status: BRT_STATUS.IN_USE,
//             brt_end_date: {
//                 lt: now,
//             },
//             deleted_at: null,
//         },
//         select: { brt_id: true, brt_user_id: true },
//     });

//     for (const ticket of overdueTickets) {
//         await notificationsService.createNotification({
//             recipient_ids: [ticket.brt_user_id],
//             title: "🚨 แจ้งเตือน: คืนอุปกรณ์เกินกำหนด",
//             message: `Ticket #${ticket.brt_id} ของคุณเกินกำหนดส่งคืนแล้ว กรุณาดำเนินการส่งคืนโดยเร็วที่สุด`,
//             event: NR_EVENT.OVERDUE_ALERT,
//             base_event: BASE_EVENT.TICKET_OVERDUE,
//             brt_id: ticket.brt_id,
//             upsert: true,
//             target_route: `/requests/${ticket.brt_id}`,
//         });
//     }

//     if (overdueTickets.length > 0) {
//         logger.info(`📢 Sent ${overdueTickets.length} 'Overdue' alerts`);
//     }
// }
