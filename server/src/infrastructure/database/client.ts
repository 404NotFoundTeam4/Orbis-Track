import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { logger } from "../logger.js";

// ป้องกันสร้าง PrismaClient หลายตัวตอน dev/hot-reload
declare global {
    // eslint-disable-next-line no-var
    var __prisma__: PrismaClient | undefined;
}

export const prisma =
    globalThis.__prisma__ ?? new PrismaClient({
        datasources: { db: { url: env.DATABASE_URL } },
        log: env.NODE_ENV === "production"
            ? ["error", "warn"]
            : ["query", "info", "warn", "error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma__ = prisma;

    prisma.$on("query", (e: any) => {
        logger.debug({ ms: e.duration, target: e.target }, e.query);
    });
}

// ปิด connection ให้เรียบร้อยตอนโปรเซสถูก kill
process.once("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
process.once("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });