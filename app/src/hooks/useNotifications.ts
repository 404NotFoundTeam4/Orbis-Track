import { useState, useEffect, useCallback, useRef } from "react";
import {
    notificationService,
    type GetNotiDto,
    NR_EVENT,
} from "../services/NotificationService";
import type { NotificationItemProps, NotificationType } from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { socketService } from "../services/SocketService";
import { useToast } from "../components/Toast";

// Initialize socket connection outside component to prevent multiple connections
// or use a singleton pattern / context if you prefer.
// For this simple case, we'll creating it inside useEffect to handle auth properly if needed,
// but for simplicity let's assume valid auth is handled via cookies/headers.

/**
 * Hook: useNotifications
 * Description: จัดการ Logic ทั้งหมดเกี่ยวกับการแจ้งเตือน (Fetching, State Management, Mapping, Socket)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export const useNotifications = ({ onOpenNotifications }: { onOpenNotifications?: () => void } = {}) => {
    const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const processedNotifIds = useRef<Set<number>>(new Set()); // Prevent duplicate socket events

    const navigate = useNavigate();
    const { push } = useToast();

    /**
     * Function: mapEventType
     * Description: แปลง Event จาก Backend (NR_EVENT) ให้เป็น Type ของ Frontend (NotificationType)
     */
    const mapEventType = useCallback((event?: NR_EVENT): NotificationType => {
        switch (event) {
            case NR_EVENT.YOUR_TICKET_APPROVED:
                return "approved";
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
            default:
                return "request_pending"; // Default fallback
        }
    }, []);

    /**
     * Function: handleNotificationClick
     */
    const handleNotificationClick = useCallback(async (dto: GetNotiDto) => {
        // Mark as read if unread
        if (dto.status === "UNREAD") {
            try {
                await notificationService.markAsRead([dto.nr_id]);
                // Optimistic update
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.title === dto.n_title && n.description === dto.n_message // Identify purely by props might be risky, better if NotificationItemProps had ID
                            ? { ...n, isRead: true }
                            : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }

        // Navigate if route exists
        if (dto.n_target_route) {
            navigate(dto.n_target_route);
        }
        // User requested: If no target, do nothing (just stay on list).
    }, [navigate]);

    // Map backend DTO to frontend props
    const mapToNotificationItem = useCallback((dto: GetNotiDto): NotificationItemProps => {
        return {
            id: dto.nr_id, // Add ID to props for better keying/identification
            type: mapEventType(dto.event),
            title: dto.n_title,
            description: dto.n_message,
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
    }, [mapEventType, handleNotificationClick]);

    /**
     * Function: fetchNotifications
     * Description: ดึงข้อมูลการแจ้งเตือนตาม page
     */
    const fetchNotifications = useCallback(async (pageNum: number) => {
        try {
            setLoading(true);
            const { data, total } = await notificationService.getUserNotifications(pageNum, 10);

            const newNotis = data.map(mapToNotificationItem);

            setNotifications((prev) => {
                if (pageNum === 1) return newNotis;
                // Filter out duplicates if any (though backend pagination should be clean)
                const existingIds = new Set(prev.map(n => n.id));
                const uniqueNew = newNotis.filter(n => !existingIds.has(n.id));
                return [...prev, ...uniqueNew];
            });

            setHasMore(notifications.length + newNotis.length < total && newNotis.length > 0);

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
    }, [mapToNotificationItem, notifications.length]);

    // Initial load
    useEffect(() => {
        fetchNotifications(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // Load More
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage);
        }
    }, [loading, hasMore, page, fetchNotifications]);

    /**
     * Socket Integration
     */
    useEffect(() => {
        // Connect socket (idempotent)
        socketService.connect();

        // Handler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleNewNotification = (payload: any) => {
            // Avoid duplicate processing if needed
            if (processedNotifIds.current.has(payload.id)) return;
            processedNotifIds.current.add(payload.id);

            const type = mapEventType(payload.type);

            // Map keys to Toast Tone
            let tone: "info" | "success" | "warning" | "danger" | "notification" = "info";
            if (["approved", "repair_success"].includes(type)) tone = "success";
            if (["warning", "request_pending"].includes(type)) tone = "warning";
            if (["overdue", "rejected", "repair_failed"].includes(type)) tone = "danger";
            if (type === "general") tone = "notification";

            // Show Toast
            push({
                tone: tone,
                message: payload.title,
                description: payload.message,
                duration: 3000,
                onClick: () => {
                    // Toast Click Logic
                    if (payload.target_route) {
                        navigate(payload.target_route);
                    } else {
                        // If no target route, open notification list
                        if (onOpenNotifications) {
                            onOpenNotifications();
                        }
                    }
                }
            });

            // Create notification item for the list
            const newNoti: NotificationItemProps = {
                id: payload.id,
                type: type,
                title: payload.title,
                description: payload.message,
                timestamp: "เมื่อสักครู่",
                isRead: false,
                onClick: () => {
                    console.log("New notification clicked");
                    // List Item Click Logic
                    if (payload.target_route) {
                        navigate(payload.target_route);
                    }
                    // If no target route, do nothing (as requested)
                },
            };

            setNotifications(prev => [newNoti, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socketService.on("NEW_NOTIFICATION", handleNewNotification);

        return () => {
            // Do not disconnect socketService here as it might be shared
            // Just satisfy the listener
            socketService.off("NEW_NOTIFICATION", handleNewNotification);
        };
    }, [mapEventType, navigate, onOpenNotifications, push]); // usage of socketService doesn't need dep as it is singleton import


    /**
     * Function: markAllRead
     */
    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        refetch: () => { setPage(1); fetchNotifications(1); },
        markAllRead,
    };
};
