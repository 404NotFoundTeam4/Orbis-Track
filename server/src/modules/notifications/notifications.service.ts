import { BASE_EVENT, Prisma, NR_EVENT } from "@prisma/client";
import { SocketEmitter } from "../../infrastructure/websocket/socket.emitter.js";
import { prisma } from "../../infrastructure/database/client.js";
import type {
  CreateNotificationDto,
  GetNotiDto,
  GetNotiPayload,
  MarkAsReadDto,
} from "./notifications.schema.js";
import { PaginatedResult } from "../../core/paginated-result.interface.js";
import { logger } from "../../infrastructure/logger.js";

/**
 * Description: สร้างการแจ้งเตือนใหม่ บันทึกลงฐานข้อมูลและส่ง Socket ไปยังผู้รับ
 * Input : payload (ข้อมูลการแจ้งเตือน + รายชื่อผู้รับ)
 * Output : ข้อมูลการแจ้งเตือนที่ถูกสร้าง (Notification Model)
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function createNotification(payload: CreateNotificationDto) {
  const { recipient_ids, event, upsert, ...notificationData } = payload;

  // ใช้ Transaction เพื่อให้แน่ใจว่าสร้างทั้งตัว Notification และ Recipient สำเร็จพร้อมกัน
  const notification = await prisma.$transaction(async (tx) => {
    let existingNotiId: number | null = null;

    if (upsert && notificationData.brt_id) {
      // ค้นหาการแจ้งเตือนเดิมที่มี brt_id เดียวกันและมีผู้รับกลุ่มเดียวกัน
      // สำหรับกรณีง่ายที่สุดคือเช็คว่ามีแจ้งเตือนที่ n_brt_id นี้ และผู้รับคนนี้ (ถ้า recipient_ids มีคนเดียว)
      // หรือเช็ค n_brt_id และ n_base_event
      const existing = await tx.notifications.findFirst({
        where: {
          n_brt_id: notificationData.brt_id,
          recipients: {
            some: {
              nr_us_id: { in: recipient_ids },
              // nr_event: event,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      if (existing) {
        existingNotiId = existing.n_id;
      }
    }

    let noti: any;
    if (existingNotiId) {
      // 1. อัปเดตข้อมูลหลักของการแจ้งเตือนเดิม
      noti = await tx.notifications.update({
        where: { n_id: existingNotiId },
        data: {
          n_title: notificationData.title,
          n_message: notificationData.message,
          n_data: notificationData.data ?? Prisma.JsonNull,
          n_target_route: notificationData.target_route,
          n_base_event: notificationData.base_event,
          n_brts_id: notificationData.brts_id,
          n_ti_id: notificationData.ti_id,
          send_at: notificationData.send_at
            ? new Date(notificationData.send_at)
            : new Date(),
          created_at: new Date(), // อัปเดตเพื่อให้เด้งขึ้นมาข้างบน
        },
      });

      // 2. อัปเดตสถานะผู้รับให้เป็น UNREAD อีกครั้ง
      await tx.notification_recipients.updateMany({
        where: {
          nr_n_id: noti.n_id,
          nr_us_id: { in: recipient_ids },
        },
        data: {
          nr_status: "UNREAD",
          read_at: null,
          dismissed_at: null,
          nr_event: event,
        },
      });
    } else {
      // 1. สร้างข้อมูลหลักของการแจ้งเตือนใหม่
      noti = await tx.notifications.create({
        data: {
          n_title: notificationData.title,
          n_message: notificationData.message,
          n_data: notificationData.data ?? Prisma.JsonNull,
          n_target_route: notificationData.target_route,
          n_base_event: notificationData.base_event,
          n_brt_id: notificationData.brt_id,
          n_brts_id: notificationData.brts_id,
          n_ti_id: notificationData.ti_id,
          send_at: notificationData.send_at
            ? new Date(notificationData.send_at)
            : undefined,
        },
      });

      // 2. เตรียมข้อมูลสำหรับตารางผู้รับ (Many-to-Many logic)
      const recipientsData = recipient_ids.map((userId: number) => ({
        nr_n_id: noti.n_id,
        nr_us_id: userId,
        nr_status: "UNREAD" as const,
        nr_event: event,
      }));

      // 3. บันทึกผู้รับทั้งหมดในครั้งเดียว
      await tx.notification_recipients.createMany({
        data: recipientsData,
      });
    }

    return noti;
  });

  // ส่ง Real-time notification ผ่าน Socket (แยกจาก Transaction เพื่อไม่ให้บล็อกการทำงานหลักหาก Socket ล่ม)
  try {
    recipient_ids.forEach((userId: number) => {
      // logger.debug(`==================== ${userId}`);
      SocketEmitter.toUser(userId, "NEW_NOTIFICATION", {
        id: notification.n_id,
        title: notification.n_title,
        message: notification.n_message,
        link: notification.n_target_route,
        type: event,
        timestamp: notification.created_at,
        isRead: false,
      });
    });
  } catch (error) {
    logger.error(
      { err: error, notifId: notification.n_id },
      "Failed to send socket notification",
    );
  }

  return notification;
}

/**
 * Description: ดึงรายการแจ้งเตือนของผู้ใช้ตาม User ID แบบแบ่งหน้า (Pagination)
 * Input : payload ({ userId, page, limit })
 * Output : PaginatedResult<GetNotiDto> (ข้อมูลแจ้งเตือนพร้อมจำนวนทั้งหมด)
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function getUserNotifications(
  payload: GetNotiPayload,
): Promise<PaginatedResult<GetNotiDto>> {
  const { userId, page, limit } = payload;
  const skip = (page - 1) * limit;

  const total = await prisma.notification_recipients.count({
    where: {
      nr_us_id: userId,
    },
  });

  // ดึงข้อมูลผู้รับ Join กับตาราง Notification หลัก
  const recipients = await prisma.notification_recipients.findMany({
    where: {
      nr_us_id: userId,
    },
    include: {
      notification: true,
    },
    orderBy: {
      notification: {
        created_at: "desc",
      },
    },
    skip,
    take: limit,
  });

  const data = recipients.map((recipient) => ({
    ...recipient.notification,
    nr_id: recipient.nr_id,
    status: recipient.nr_status,
    event: recipient.nr_event,
    read_at: recipient.read_at,
    dismissed_at: recipient.dismissed_at,
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

/**
 * Description: อัปเดตสถานะการแจ้งเตือนเฉพาะรายการที่ระบุเป็น "อ่านแล้ว"
 * Input : userId, payload (รายการ IDs)
 * Output : { message: string }
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function markAsRead(userId: number, payload: MarkAsReadDto) {
  const { ids } = payload;

  // อัปเดตหลายแถวพร้อมกัน โดยเช็คว่าเป็นของผู้ใช้นั้นจริงๆ และสถานะยังเป็น UNREAD
  await prisma.notification_recipients.updateMany({
    where: {
      nr_us_id: userId,
      nr_id: {
        in: ids,
      },
      nr_status: "UNREAD",
    },
    data: {
      nr_status: "READ",
      read_at: new Date(),
    },
  });

  return { message: "Notifications marked as read" };
}

/**
 * Description: อัปเดตสถานะการแจ้งเตือน "ทั้งหมด" ของผู้ใช้เป็น "อ่านแล้ว"
 * Input : userId
 * Output : { message: string }
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function markAllAsRead(userId: number) {
  await prisma.notification_recipients.updateMany({
    where: {
      nr_us_id: userId,
      nr_status: "UNREAD",
    },
    data: {
      nr_status: "READ",
      read_at: new Date(),
    },
  });

  return { message: "All notifications marked as read" };
}

/**
 * Description: นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน (Unread badge count)
 * Input : userId
 * Output : { count: number }
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function getUnreadCount(userId: number) {
  const count = await prisma.notification_recipients.count({
    where: {
      nr_us_id: userId,
      nr_status: "UNREAD",
    },
  });

  return { count };
}

/**
 * Description: ยกเลิกการแสดงผลการแจ้งเตือนสำหรับ Ticket ที่ระบุ (เช่น เมื่อมีคนอื่นอนุมัติไปแล้ว)
 * พร้อมอัปเดตข้อความว่า "มีผู้ดำเนินการแล้ว"
 * Input : params { brt_id, ti_id, event, approvalUser, type }
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function dismissNotificationsByTicket(params: {
  brtId?: number;
  tiId?: number;
  event: NR_EVENT;
  approvalUser: number;
  type: "borrow" | "repair";
  targetRole?: string;
  targetDept?: number;
  targetSec?: number;
}) {
  const {
    brtId,
    tiId,
    event,
    approvalUser,
    type,
    targetRole,
    targetDept,
    targetSec,
  } = params;

  // หาผู้รับการแจ้งเตือนที่มี nr_event นี้ และ n_brt_id หรือ n_ti_id นี้
  const [recipients, approvalUserName] = await Promise.all([
    prisma.notification_recipients.findMany({
      where: {
        nr_event: event,
        notification: {
          ...(brtId ? { n_brt_id: brtId } : { n_ti_id: tiId }),
        },
        // nr_status: "UNREAD",
      },
    }),
    prisma.users.findFirst({
      where: { us_id: approvalUser },
      select: { us_firstname: true, us_lastname: true },
    }),
  ]);

  if (recipients.length === 0) return;

  const notificationIds = Array.from(new Set(recipients.map((recipient) => recipient.nr_n_id)));
  const recipientIds = recipients.map((recipient) => recipient.nr_id);
  const fullnameApprovalUser = approvalUserName
    ? `${approvalUserName.us_firstname} ${approvalUserName.us_lastname}`
    : "Unknown User";

  const title =
    type === "borrow"
      ? "คำขอยืม (มีผู้ดำเนินการแล้ว)"
      : "คำขอแจ้งซ่อม (มีผู้ดำเนินการแล้ว)";
  const messagePrefix = type === "borrow" ? "ผู้อนุมัติ" : "ผู้รับคำขอ";
  const baseEventPrefix =
    type === "borrow"
      ? BASE_EVENT.NOTIFICATION_FULFILLED
      : BASE_EVENT.NOTIFICATION_RESOLVED;

  const nrEventPrefix =
    type === "borrow" ? NR_EVENT.REQUEST_FULFILLED : NR_EVENT.REQUEST_RESOLVED;

  await prisma.$transaction([
    prisma.notifications.updateMany({
      where: { n_id: { in: notificationIds } },
      data: {
        n_title: title,
        n_message: `${messagePrefix} : ${fullnameApprovalUser}`,
        n_target_route: null,
        n_base_event: baseEventPrefix,
      },
    }),
    prisma.notification_recipients.updateMany({
      where: {
        nr_id: { in: recipientIds },
        // nr_us_id: { not: approvalUser }, // Commented out to include the approver
      },
      data: {
        nr_status: "READ",
        nr_event: nrEventPrefix,
        read_at: new Date(),
      },
    }),
  ]);

  // console.log(`Updated ${notificationUpdate.count} notifications and ${recipientUpdate.count} recipients`);

  // ส่ง socket เพื่อบอกให้ frontend ลบออก หรือ อัปเดตสถานะ
  try {
    const socketPayload = {
      id: notificationIds[0], // ใช้ ID แรกเป็นตัวแทนสำหรับ refresh
      nrId: recipientIds[0],
      ticketId: brtId || tiId,
      newTitle: title,
      newMessage: `${messagePrefix} : ${fullnameApprovalUser}`,
      actorId: approvalUser,
    };

    if (targetRole) {
      // ส่งแบบ Room (เร็วกว่า)
      SocketEmitter.toRole({
        role: targetRole,
        dept: targetDept || 0,
        sec: targetSec || 0,
        event: "TICKET_PROCESSED",
        data: socketPayload,
      });
    } else {
      // Fallback: ส่งรายคน
      recipients.forEach((recipient) => {
        if (recipient.nr_us_id !== approvalUser) {
          SocketEmitter.toUser(recipient.nr_us_id, "TICKET_PROCESSED", {
            ...socketPayload,
            id: recipient.nr_n_id,
            nrId: recipient.nr_id,
          });
        }
      });
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to send dismissal socket");
  }
}

export const notificationsService = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  dismissNotificationsByTicket,
};
