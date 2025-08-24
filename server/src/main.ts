import { App } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger.js";
import redisPkg from "./infrastructure/redis.cjs"; // default import ทั้งก้อน

const { closeRedis } = redisPkg;                   // ค่อย destructure เอา closeRedis

const app = App();

const server = app.listen(env.PORT, () => {
    logger.info(`API running on http://localhost:${env.PORT}/api/v1`);
});

for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, async () => {
        await closeRedis();
        process.exit(0);
    });
}

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
