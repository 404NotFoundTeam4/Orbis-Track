import React, { useState, useEffect, useCallback, Fragment } from "react";
import {
  notificationService,
  type GetNotiDto,
  NR_EVENT,
} from "../services/NotificationService";
import type {
  NotificationItemProps,
  NotificationType,
} from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { socketService } from "../services/SocketService";
import { useToast } from "../components/Toast";

// Initialize socket connection outside component to prevent multiple connections
// or use a singleton pattern / context if you prefer.
// For this simple case, we'll creating it inside useEffect to handle auth properly if needed,
// but for simplicity let's assume valid auth is handled via cookies/headers.

/**
 * Description: จัดการ Logic ทั้งหมดเกี่ยวกับการแจ้งเตือน (Fetching, State Management, Mapping, Socket)
 * Input      : { onOpenNotifications?: () => void } - callback เปิดกล่องแจ้งเตือน
 * Output     : { notifications, unreadCount, loading, hasMore, loadMore, refetch, markAllRead }
 * Author     : Pakkapon Chomchoey (Tonnam) 66160080
 */
export const useNotifications = ({
  onOpenNotifications,
}: { onOpenNotifications?: () => void } = {}) => {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const { push } = useToast();

  /**
   * Description: แปลง Event จาก Backend (NR_EVENT) ให้เป็น Type ของ Frontend (NotificationType)
   * Input      : event (NR_EVENT | undefined)
   * Output     : NotificationType
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const mapEventType = useCallback((event?: NR_EVENT): NotificationType => {
    switch (event) {
      case NR_EVENT.YOUR_TICKET_APPROVED:
        return "approved";
      case NR_EVENT.YOUR_TICKET_RETURNED:
        return "returned";
      case NR_EVENT.YOUR_TICKET_IN_USE:
        return "in_use";
      case NR_EVENT.YOUR_TICKET_REJECTED:
        return "rejected";
      case NR_EVENT.DUE_SOON_REMINDER:
        return "warning";
      case NR_EVENT.OVERDUE_ALERT:
        return "overdue";
      case NR_EVENT.ISSUE_RESOLVED_FOR_REPORTER:
        return "repair_success";
      case NR_EVENT.ISSUE_NEW_FOR_TECH:
      case NR_EVENT.ISSUE_ASSIGNED_TO_YOU:
        return "repair_new";
      case NR_EVENT.APPROVAL_REQUESTED:
        return "request_new";
      case NR_EVENT.REQUEST_FULFILLED:
        return "request_fulfill";
      case NR_EVENT.REQUEST_RESOLVED:
        return "request_resolve";
      case NR_EVENT.YOUR_TICKET_STAGE_APPROVED:
      default:
        return "request_pending"; // Default fallback
    }
  }, []);

  /**
   * Description: แปลงข้อความที่มี Tag สีให้เป็น React Nodes
   * เช่น "ลำดับปัจจุบัน : [green:2 / 4]" -> ["ลำดับปัจจุบัน : ", <span class="text-green-500">2 / 4</span>]
   */
  /**
   * Description: แปลงข้อความที่มี Tag สีให้เป็น React Nodes
   * Input     : desc (string) - ข้อความที่มี Tag เช่น [green:...], [blue:...]
   * Output    : React.ReactNode - ข้อความที่แปลงเป็น JSX พร้อมสีแล้ว
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const parseDescription = (desc: string): React.ReactNode => {
    if (!desc) return desc;

    // Split by newlines first
    const lines = desc.split("\n");

    return lines.map((line, lineIdx) => {
      // Regex for multiple color tags: [color:text]
      const parts = line.split(/\[(green|blue|gray|red):(.*?)\]/g);

      const parsedLine =
        parts.length === 1
          ? line
          : parts.map((part, partIndex) => {
            // parts pattern from split with groups: [text, color, content, text, color, content, ...]
            // index partIndex: 0 is text before, 1 is color, 2 is content, 3 is text after...
            if (partIndex % 3 === 1) {
              const color = parts[partIndex];
              const content = parts[partIndex + 1];
              const colorMap: Record<string, string> = {
                green: "#00AA1A",
                blue: "#40A9FF",
                gray: "#565656",
                red: "#FF4D4F",
              };
              return (
                <span
                  key={`${lineIdx}-${partIndex}`}
                  style={{ color: colorMap[color] || "inherit" }}
                  className="font-bold"
                >
                  {content}
                </span>
              );
            }
            if (partIndex % 3 === 2) return null; // Skip content as it's handled by color group
            return part;
          });

      return (
        <Fragment key={lineIdx}>
          {parsedLine}
          {lineIdx < lines.length - 1 && <br />}
        </Fragment>
      );
    });
  };

  /**
   * Description: ศูนย์กลางการจัดการเมื่อมีการคลิกแจ้งเตือน (Mark as read + Navigate)
   * Input      : { route?: string; notiId?: number; status?: string; title?: string; message?: string }
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleNotificationAction = useCallback(
    async (params: {
      route?: string;
      notiId?: number;
      status?: string;
      title?: string;
      message?: string;
      isToast?: boolean;
    }) => {
      const { route, notiId, status, title, isToast } = params;

      // 1. Mark as read (API + State)
      if (notiId && status === "UNREAD") {
        try {
          await notificationService.markAsRead([notiId]);
          // Optimistic update
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === notiId || (title && title === notification.title)
                ? { ...notification, isRead: true }
                : notification,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
          console.error("Failed to mark as read within action:", error);
        }
      }

      // 2. Navigate or Open List
      if (isToast) {
        if (onOpenNotifications) {
          onOpenNotifications();
        }
      } else {
        if (route) {
          navigate(route);
        } else if (onOpenNotifications) {
          onOpenNotifications();
        }
      }
    },
    [navigate, onOpenNotifications],
  );

  /**
   * Description: จัดการเมื่อผู้ใช้คลิกที่การแจ้งเตือนจากรายการ (List)
   * Input     : dto (GetNotiDto) - ข้อมูลการแจ้งเตือนจาก Backend
   * Output    : Promise<void>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleNotificationClick = useCallback(
    async (dto: GetNotiDto) => {
      await handleNotificationAction({
        route: dto.n_target_route || undefined,
        notiId: dto.nr_id,
        status: dto.status,
        title: dto.n_title,
        message: dto.n_message,
      });
    },
    [handleNotificationAction],
  );

  /**
   * Description: แปลงข้อมูลการแจ้งเตือนจาก Backend (GetNotiDto) เป็น Frontend Props (NotificationItemProps)
   * Input     : dto (GetNotiDto) - ข้อมูลจาก API
   * Output    : NotificationItemProps - Props สำหรับ Component
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const mapToNotificationItem = useCallback(
    (dto: GetNotiDto): NotificationItemProps => {
      return {
        id: dto.nr_id,
        type: mapEventType(dto.event),
        title: dto.n_title,
        description: parseDescription(dto.n_message),
        timestamp: new Date(dto.created_at).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: dto.status === "READ",
        onClick: () => handleNotificationClick(dto),
      };
    },
    [mapEventType, handleNotificationClick],
  );

  /**
   * Description: ดึงข้อมูลการแจ้งเตือนจาก API ตามหน้าที่ระบุ
   * Input      : pageNum (number) - หมายเลขหน้าที่ต้องการดึง
   * Output     : void (อัปเดต state โดยตรง)
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const fetchNotifications = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const { data, total } = await notificationService.getUserNotifications(
          pageNum,
          10,
        );

        const newNotis = data.map(mapToNotificationItem);

        setNotifications((prev) => {
          if (pageNum === 1) return newNotis;
          // Filter out duplicates if any (though backend pagination should be clean)
          const existingIds = new Set(prev.map((notification) => notification.id));
          const uniqueNew = newNotis.filter((notification) => !existingIds.has(notification.id));
          return [...prev, ...uniqueNew];
        });

        setHasMore(
          notifications.length + newNotis.length < total && newNotis.length > 0,
        );

        // Only fetch unread count on initial load
        if (pageNum === 1) {
          const countRes = await notificationService.getUnreadCount();
          setUnreadCount(countRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [mapToNotificationItem, notifications.length],
  );

  // Initial load
  useEffect(() => {
    fetchNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  /**
   * Description: โหลดการแจ้งเตือนเพิ่มเติมเมื่อ scroll ถึงท้ายรายการ
   * Output    : void - ดึงข้อมูลหน้าถัดไปและอัปเดต state
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  /**
   * Description: Socket Integration - รับการแจ้งเตือนใหม่แบบ Real-time ผ่าน Socket.IO
   * Note      : แสดง Toast และอัปเดตรายการทันทีเมื่อมี notification ใหม่
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  useEffect(() => {
    // Connect socket (idempotent)
    socketService.connect();

    // Handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewNotification = (payload: any) => {
      // Avoid duplicate processing if needed
      // if (processedNotifIds.current.has(payload.id)) return;
      // processedNotifIds.current.setNotifications(payload.id);

      const type = mapEventType(payload.type);

      const tone = "notification";

      // Show Toast
      push({
        tone: tone,
        message: "มีการแจ้งเตือนใหม่!",
        description: "แตะเพื่อดูรายละเอียดในกล่องแจ้งเตือน",
        duration: 3000,
        onClick: () => {
          handleNotificationAction({
            route: payload.target_route,
            title: payload.title,
            isToast: true,
          });
        },
      });

      // Create notification item for the list
      const newNoti: NotificationItemProps = {
        id: payload.id, // This is n_id for socket notifications (fallback until refetch)
        type: type,
        title: payload.title,
        description: parseDescription(payload.message),
        timestamp: "เมื่อสักครู่",
        isRead: false,
        onClick: () => {
          handleNotificationAction({
            route: payload.target_route,
            title: payload.title,
            isToast: false,
            // notiId is missing for socket until refetch, but handleNotificationAction handles route
          });
        },
      };

      setNotifications((prev) => [newNoti, ...prev]);
      setUnreadCount((prev) => prev + 1);

      fetchNotifications(1);
    };

    const onTicketProcessed = () => {
      fetchNotifications(1);
    };

    socketService.on("NEW_NOTIFICATION", handleNewNotification);
    socketService.on("TICKET_PROCESSED", onTicketProcessed);

    return () => {
      // Do not disconnect socketService here as it might be shared
      // Just satisfy the listener
      socketService.off("NEW_NOTIFICATION", handleNewNotification);
      socketService.off("TICKET_PROCESSED", onTicketProcessed);
    };
  }, [
    mapEventType,
    navigate,
    onOpenNotifications,
    push,
    fetchNotifications,
    handleNotificationAction,
  ]); // usage of socketService doesn't need dep as it is singleton import

  /**
   * Description: ทำเครื่องหมายการแจ้งเตือนทั้งหมดเป็น "อ่านแล้ว"
   * Output    : Promise<void>
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    refetch: () => {
      setPage(1);
      fetchNotifications(1);
    },
    markAllRead,
  };
};
