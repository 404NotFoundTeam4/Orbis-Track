import { App } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger.js";
import redisPkg from "./infrastructure/redis.cjs"; // default import ทั้งก้อน
import emailService from "./utils/email/email.service.js";
const { closeRedis } = redisPkg; // ค่อย destructure เอา closeRedis
import { createServer } from "http";
import { initSocket } from "./infrastructure/websocket/socket.server.js";

/**
 * Description: จุดเริ่มต้นของแอป สตาร์ต Express และจัดการปิดระบบอย่างปลอดภัย (graceful shutdown)
 * Input : -
 * Output: void (ดำเนินโปรเซสจนกว่าจะได้รับสัญญาณหยุด)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
const app = App();

const httpServer = createServer(app);

initSocket(httpServer);

const server = httpServer.listen(env.PORT, () => {
  const base = env.API_URL ?? `http://localhost:${env.PORT}`;
  logger.info(`API running on ${base}/api/v1`);
});

// ตัวช่วยปิด server แบบ Promise เพื่อรอให้ connection เดิมปิดหมดก่อน
const closeHttpServer = () =>
  new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

// ฟังก์ชันปิดระบบแบบเรียงลำดับ: หยุดรับคอนเนกชันใหม่ → ปิดเซิร์ฟเวอร์ → ปิด Redis → ออกจากโปรเซส
const shutdown = (sig: NodeJS.Signals) => async () => {
  try {
    logger.info({ sig }, "Shutting down gracefully...");
    await closeHttpServer();
    await closeRedis();
    await emailService.close();
    logger.info("Shutdown complete. Bye Bye!");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Shutdown failed. Forcing exit.");
    process.exit(1);
  }
};

// ดักสัญญาณจากระบบปฏิบัติการ (กด Ctrl+C หรือถูกหยุดโดยตัวจัดการโปรเซส)
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
