import cron from "node-cron";
import { updateOverdueTickets } from "./dashboard.service.js";

/**
 * Cron Pattern:
 * ┌───────────── minute (0 - 59)
 * │ ┌───────────── hour (0 - 23)
 * │ │ ┌───────────── day of month (1 - 31)
 * │ │ │ ┌───────────── month (1 - 12)
 * │ │ │ │ ┌───────────── day of week (0 - 7)
 * │ │ │ │ │
 * * * * * *
 */

// ทุก 1 นาที
export function startOverdueJob() {
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running overdue check...");
    try {
      await updateOverdueTickets();
    } catch (error) {
      console.error("❌ Overdue job failed:", error);
    }
  }, {
    timezone: "Asia/Bangkok",
  });

  console.log("✅ Overdue Cron Job started");
}