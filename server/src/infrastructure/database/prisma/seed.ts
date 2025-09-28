/**
 * Description: สคริปต์ seed ข้อมูลตั้งต้นให้ DB ด้วย Prisma
 * Input : ใช้ DATABASE_URL จาก .env / environment
 * Output : ข้อมูลพื้นฐานถูกอัปเซิร์ต (upsert) แบบรันซ้ำได้ไม่พัง
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding start");
    // ใช้ upsert เพราะอยากให้รันซ้ำได้ ถ้ามีก็ข้าม/อัปเดต ถ้าไม่มีค่อยสร้าง
    // ---- SEED ROLES ----
    await prisma.roles.upsert({
        where: { role_id: 1 },
        update: {},
        create: { name: "Admin" },
    });

    await prisma.roles.upsert({
        where: { role_id: 2 },
        update: {},
        create: { name: "Head Dept" },
    });

    await prisma.roles.upsert({
        where: { role_id: 3 },
        update: {},
        create: { name: "Head Sec" },
    });

    await prisma.roles.upsert({
        where: { role_id: 4 },
        update: {},
        create: { name: "Staff" },
    });

    await prisma.roles.upsert({
        where: { role_id: 5 },
        update: {},
        create: { name: "Technical" },
    });

    await prisma.roles.upsert({
        where: { role_id: 6 },
        update: {},
        create: { name: "User" },
    });

    // ---- SEED DEPARTMENTS ----
    await prisma.departments.upsert({
        where: { dept_id: 1 },
        update: {},
        create: { name: "แผนก Media" },
    });

    await prisma.departments.upsert({
        where: { dept_id: 2 },
        update: {},
        create: { name: "แผนกการตลาด" },
    });

    await prisma.departments.upsert({
        where: { dept_id: 3 },
        update: {},
        create: { name: "แผนกไอที" },
    });

    await prisma.departments.upsert({
        where: { dept_id: 4 },
        update: {},
        create: { name: "แผนกการเงิน" },
    });

    // ---- SEED SECTIONS (A–D) ----
    const sections = [
        { section_id: 1, name: "A", dept_id: 1 },
        { section_id: 2, name: "B", dept_id: 1 },
        { section_id: 3, name: "C", dept_id: 1 },
        { section_id: 4, name: "D", dept_id: 1 },

        { section_id: 5, name: "A", dept_id: 2 },
        { section_id: 6, name: "B", dept_id: 2 },
        { section_id: 7, name: "C", dept_id: 2 },
        { section_id: 8, name: "D", dept_id: 2 },

        { section_id: 9, name: "A", dept_id: 3 },
        { section_id: 10, name: "B", dept_id: 3 },
        { section_id: 11, name: "C", dept_id: 3 },
        { section_id: 12, name: "D", dept_id: 3 },

        { section_id: 13, name: "A", dept_id: 4 },
        { section_id: 14, name: "B", dept_id: 4 },
        { section_id: 15, name: "C", dept_id: 4 },
        { section_id: 16, name: "D", dept_id: 4 },
    ];

    for (const sec of sections) {
        await prisma.sections.upsert({
            where: { section_id: sec.section_id },
            update: { name: sec.name, dept_id: sec.dept_id },
            create: sec,
        });
    }

    console.log("✅ Seed completed");
}

// สั่งรัน main() พร้อมจับ error/ปิด connection
main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1); // แจ้ง exit code 1 เผื่อ CI/CD จะได้รู้ว่าพัง
    })
    .finally(async () => {
        await prisma.$disconnect(); // ปิด connection กันค้าง
    });
