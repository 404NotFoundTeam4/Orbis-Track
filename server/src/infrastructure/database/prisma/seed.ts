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

    // ---- DEPARTMENTS ----
    const media = await prisma.departments.upsert({
        where: { dept_name: "แผนก Media" },
        update: {},
        create: { dept_name: "แผนก Media" },
    });
    const marketing = await prisma.departments.upsert({
        where: { dept_name: "แผนกการตลาด" },
        update: {},
        create: { dept_name: "แผนกการตลาด" },
    });
    const it = await prisma.departments.upsert({
        where: { dept_name: "แผนกไอที" },
        update: {},
        create: { dept_name: "แผนกไอที" },
    });
    const finance = await prisma.departments.upsert({
        where: { dept_name: "แผนกการเงิน" },
        update: {},
        create: { dept_name: "แผนกการเงิน" },
    });

    // ---- SECTIONS: "แผนกการเงินฝ่ายย่อย A" เป็นต้น (sec_name ต้อง unique) ----
    const makeSec = async (deptId: number, deptName: string) => {
        for (const letter of ["A", "B", "C", "D"]) {
            const secName = `${deptName}ฝ่ายย่อย ${letter}`;
            await prisma.sections.upsert({
                where: { sec_name: secName },
                update: { sec_dept_id: deptId },
                create: { sec_name: secName, sec_dept_id: deptId },
            });
        }
    };

    await makeSec(media.dept_id, media.dept_name);
    await makeSec(marketing.dept_id, marketing.dept_name);
    await makeSec(it.dept_id, it.dept_name);
    await makeSec(finance.dept_id, finance.dept_name);

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
