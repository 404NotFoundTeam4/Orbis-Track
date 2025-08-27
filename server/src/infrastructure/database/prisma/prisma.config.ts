import path from "node:path";
import { defineConfig } from "prisma/config";

import "dotenv/config";

export default defineConfig({
    // ชี้ schema หลัก
    schema: path.join("prisma", "schema.prisma"),

    // ตั้งค่าที่เกี่ยวกับ migrations + seed
    migrations: {
        path: path.join("prisma", "migrations"),
        seed: "tsx prisma/seed.ts"
    },
});
