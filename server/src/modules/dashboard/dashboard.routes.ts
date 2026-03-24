import { Router } from "../../core/router.js";
import { dashboardIssueController } from "./dashboard.controller.js";
import {
  getIssueStatsQuerySchema,
  getIssueStatsResponseSchema,
  dashboardQuerySchema,
  getBorrowStatsResponseSchema,
  getMostBorrowedStatsResponseSchema,
  getRepairStatusStatsResponseSchema,
  getOverdueTableResponseSchema,
} from "./dashboard.schema.js";

const dashboardController = new dashboardIssueController();
const router = new Router(undefined, "/dashboard");

router.getDoc(
  "/issue-stats",
  {
    tag: "Dashboard",
    auth: true,
    query: getIssueStatsQuerySchema,
    res: getIssueStatsResponseSchema,
  },
  dashboardController.getIssueStats,
);

router.getDoc(
  "/device-child-count",
  {
    tag: "Dashboard",
    auth: true,
    query: getIssueStatsQuerySchema,
    res: getIssueStatsResponseSchema, // Actually should be device child count schema, but re-using the existing signature from original code. Let's make sure things compile as they were.
  },
  dashboardController.getDeviceChildCount,
);

router.getDoc(
  "/borrow-stats",
  {
    tag: "Dashboard",
    auth: true,
    query: dashboardQuerySchema,
    res: getBorrowStatsResponseSchema,
  },
  dashboardController.getBorrowStats,
);

router.getDoc(
  "/most-borrowed",
  {
    tag: "Dashboard",
    auth: true,
    query: dashboardQuerySchema,
    res: getMostBorrowedStatsResponseSchema,
  },
  dashboardController.getMostBorrowedEqStats,
);

router.getDoc(
  "/repair-status",
  {
    tag: "Dashboard",
    auth: true,
    query: dashboardQuerySchema,
    res: getRepairStatusStatsResponseSchema,
  },
  dashboardController.getRepairStatusStats,
);

router.getDoc(
  "/overdue-table",
  {
    tag: "Dashboard",
    auth: true,
    res: getOverdueTableResponseSchema,
  },
  dashboardController.getOverdueTable,
);

export default router.instance;