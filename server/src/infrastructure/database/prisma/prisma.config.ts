/**
 * Description: คอนฟิก Prisma แบบรวมศูนย์ กำหนดตำแหน่ง schema, โฟลเดอร์ migrations และสคริปต์ seed
 * Input : ใช้ไฟล์ .env (โหลดด้วย dotenv) สำหรับ DATABASE_URL เวลา Prisma CLI ทำงาน
 * Output : ค่าคอนฟิกที่ export ด้วย defineConfig ให้ Prisma ใช้ตอน migrate/seed
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

import "dotenv/config";

// สร้างคอนฟิกหลักของ Prisma
export default defineConfig({
    // ชี้ schema หลัก
    schema: path.join("prisma", "schema.prisma"),

    // ตั้งค่าที่เกี่ยวกับ migrations + seed
    migrations: {
        path: path.join("prisma", "migrations"),
        // เวลาเรียก `prisma db seed` มันจะยิงคำสั่งนี้
        seed: "tsx ./src/infrastructure/database/prisma/seed.ts"
    },
});
