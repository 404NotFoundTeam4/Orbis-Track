import { Router } from "../../core/router.js";
import { dashboardBorrowController } from "./dashboard-borrow.controller.js";
import {
  getBorrowStatsQuerySchema,
  getBorrowStatsResponseSchema,
} from "./dashboard-borrow.schema.js";

const dashboardController = new dashboardBorrowController();
const router = new Router(undefined, "/dashboard");

/**
 * GET /dashboard/borrow-stats?year=2026&quarter=1
 */
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

export default router.instance;