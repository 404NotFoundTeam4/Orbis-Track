// import { Router } from "../../core/router.js";
// import { dashboardIssueController } from "./dashboard-issue.controller.js";
// import {
//   getIssueStatsQuerySchema,
//   getIssueStatsResponseSchema,
// } from "./dashboard-issue.schema.js";

// const dashboardController = new dashboardIssueController();
// const router = new Router(undefined, "/dashboard");

// router.getDoc(
//   "/issue-stats",
//   {
//     tag: "Dashboard",
//     auth: true,
//     query: getIssueStatsQuerySchema,
//     res: getIssueStatsResponseSchema,
//   },
//   dashboardController.getIssueStats,
// );

// export default router.instance;