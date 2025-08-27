// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding start");
    // ---- SEED ROLES ----
    await prisma.roles.upsert({
        where: { role_id: 1 },
        update: {},
        create: { name: "Admin" },
    });

    await prisma.roles.upsert({
        where: { role_id: 2 },
        update: {},
        create: { name: "User" },
    });

    await prisma.roles.upsert({
        where: { role_id: 3 },
        update: {},
        create: { name: "Staff" },
    });

    await prisma.roles.upsert({
        where: { role_id: 4 },
        update: {},
        create: { name: "Manager" },
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

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
