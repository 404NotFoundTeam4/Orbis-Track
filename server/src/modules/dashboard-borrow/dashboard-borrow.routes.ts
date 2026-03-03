import { Router } from "../../core/router.js";
import { dashboardBorrowController } from "./dashboard-borrow.controller.js";
import {
  getBorrowStatsQuerySchema,
  getBorrowStatsResponseSchema,
  getDeviceChildCountQuerySchema,
  getDeviceChildCountResponseSchema,
} from "./dashboard-borrow.schema.js";

const dashboardController = new dashboardBorrowController();
const router = new Router(undefined, "/dashboard");

router.getDoc(
  "/borrow-stats",
  {
    tag: "Dashboard",
    auth: true,
    query: getBorrowStatsQuerySchema,
    res: getBorrowStatsResponseSchema,
  },
  dashboardController.getBorrowStats,
);

router.getDoc(
  "/device-child-count",
  {
    tag: "Dashboard",
    auth: true,
    query: getDeviceChildCountQuerySchema,
    res: getDeviceChildCountResponseSchema,
  },
  dashboardController.getDeviceChildCount,
);

export default router.instance;