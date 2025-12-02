import { Router } from "../../core/router.js";
import { NotificationsController } from "./notifications.controller.js";
import {
  getNotiDto,
  getNotiQuery,
  markAsReadSchema,
} from "./notifications.schema.js";

const notificationsController = new NotificationsController();
const router = new Router(undefined, "/notifications");

router.getDoc(
  "/",
  {
    tag: "Notifications",
    query: getNotiQuery,
    res: getNotiDto,
    auth: true,
  },
  notificationsController.getUserNotifications,
);

router.getDoc(
  "/unread-count",
  {
    tag: "Notifications",
    auth: true,
  },
  notificationsController.getUnreadCount,
);

router.patchDoc(
  "/read",
  {
    tag: "Notifications",
    body: markAsReadSchema,
    auth: true,
  },
  notificationsController.markAsRead,
);

router.patchDoc(
  "/read-all",
  {
    tag: "Notifications",
    auth: true,
  },
  notificationsController.markAllAsRead,
);

export default router.instance;
