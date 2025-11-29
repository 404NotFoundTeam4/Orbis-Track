import { Router } from "../../core/router.js";
import { NotificationsController } from "./notifications.controller.js";
import {
  getNotiDto,
  getNotiQuery,
  markAsReadSchema,
  userIdParama,
} from "./notifications.schema.js";

const notificationsController = new NotificationsController();
const router = new Router();

router.getDoc(
  "/",
  {
    tag: "Notifications",
    params: userIdParama,
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
    params: userIdParama,
    auth: true,
  },
  notificationsController.getUnreadCount,
);

router.patchDoc(
  "/read",
  {
    tag: "Notifications",
    params: userIdParama,
    body: markAsReadSchema,
    auth: true,
  },
  notificationsController.markAsRead,
);

router.patchDoc(
  "/read-all",
  {
    tag: "Notifications",
    params: userIdParama,
    auth: true,
  },
  notificationsController.markAllAsRead,
);

export default router.instance;
