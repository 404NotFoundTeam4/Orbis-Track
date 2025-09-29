/**
 * Description: ตั้ง PrismaClient แบบ singleton กันสร้างซ้ำตอน dev/hot-reload + เซ็ต log และ event
 * Input : env.DATABASE_URL, env.NODE_ENV (จากไฟล์ env.ts)
 * Output : ตัวแปร prisma อินสแตนซ์เดียว ใช้ได้ทั้งแอป
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { logger } from "../logger.js";

// กันสร้าง PrismaClient หลาย ๆ ตัวเวลา dev ที่มี hot-reload (ไม่งั้น connection บวม)
// ใช้ตัวแปร global เก็บอินสแตนซ์ไว้
declare global {
    // eslint-disable-next-line no-var
    var __prisma__: PrismaClient | undefined;
}

// ถ้ามีใน global แล้วก็ใช้ต่อเลย ถ้ายังไม่มีค่อย new PrismaClient
export const prisma =
    globalThis.__prisma__ ?? new PrismaClient({
        datasources: { db: { url: env.DATABASE_URL } },
        log: env.NODE_ENV === "production"
            ? ["error", "warn"]
            : ["query", "info", "warn", "error"],
    });

// ใน dev ให้เก็บอินสแตนซ์ไว้บน global + ติด event ฟัง query เพื่อดีบักสบาย ๆ
if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma__ = prisma;
}

// ปิด connection ให้เรียบร้อยตอนโปรเซสถูก kill (กัน connection ค้างใน pool)
process.once("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
process.once("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });