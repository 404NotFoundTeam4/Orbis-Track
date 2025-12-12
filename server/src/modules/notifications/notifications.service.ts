import { Prisma } from "@prisma/client";
import { SocketEmitter } from "../../infrastructure/websocket/socket.emitter.js";
import { prisma } from "../../infrastructure/database/client.js";
import type {
  CreateNotificationDto,
  GetNotiDto,
  GetNotiPayload,
  MarkAsReadDto,
} from "./notifications.schema.js";
import { PaginatedResult } from "../../core/paginated-result.interface.js";

/**
 * Description: สร้างการแจ้งเตือนใหม่ บันทึกลงฐานข้อมูลและส่ง Socket ไปยังผู้รับ
 * Input : payload (ข้อมูลการแจ้งเตือน + รายชื่อผู้รับ)
 * Output : ข้อมูลการแจ้งเตือนที่ถูกสร้าง (Notification Model)
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
async function createNotification(payload: CreateNotificationDto) {
  const { recipient_ids, event, ...notificationData } = payload;

  // ใช้ Transaction เพื่อให้แน่ใจว่าสร้างทั้งตัว Notification และ Recipient สำเร็จพร้อมกัน
  const notification = await prisma.$transaction(async (tx) => {
    // 1. สร้างข้อมูลหลักของการแจ้งเตือน
    const noti = await tx.notifications.create({
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

    return noti;
  });

  // ส่ง Real-time notification ผ่าน Socket (แยกจาก Transaction เพื่อไม่ให้บล็อกการทำงานหลักหาก Socket ล่ม)
  try {
    recipient_ids.forEach((userId: number) => {
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
    console.error(
      `Failed to send socket notification for notif_id ${notification.n_id}:`,
      error,
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

  const data = recipients.map((r) => ({
    ...r.notification,
    nr_id: r.nr_id,
    status: r.nr_status,
    event: r.nr_event,
    read_at: r.read_at,
    dismissed_at: r.dismissed_at,
  }));

  return {
    data,
    total,
    page,
    limit,
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

export const notificationsService = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
