import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { logger } from "../logger.js";

export const prisma = new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
    log: env.NODE_ENV === "production" ? ["error", "warn"] : ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") {
    prisma.$on("query", (e: any) => {
        logger.debug({ ms: e.duration, target: e.target }, e.query);
    });
}
