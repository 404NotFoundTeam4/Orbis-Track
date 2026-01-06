/**
 * Description: สคริปต์ seed ข้อมูลตั้งต้นให้ DB ด้วย Prisma
 * Input : ใช้ DATABASE_URL จาก .env / environment
 * Output : ข้อมูลพื้นฐานถูกอัปเซิร์ต (upsert) แบบรันซ้ำได้ไม่พัง
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

// ---- DATE HELPERS ----
// สร้างวันที่ในอดีต (n วันที่แล้ว)
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// สร้างวันที่ในอนาคต (อีก n วัน)
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  console.log("🌱 Seeding start");

  // ---- DEPARTMENTS ----
  console.log("📁 Creating departments...");
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

  // ---- SECTIONS ----
  console.log("📂 Creating sections...");
  const sections: Record<string, any[]> = {
    media: [],
    marketing: [],
    it: [],
    finance: [],
  };

  const makeSec = async (
    deptId: number,
    deptName: string,
    key: keyof typeof sections,
  ) => {
    for (const letter of ["A", "B", "C", "D"]) {
      const secName = `${deptName} ฝ่ายย่อย ${letter}`;
      const sec = await prisma.sections.upsert({
        where: { sec_name: secName },
        update: { sec_dept_id: deptId },
        create: { sec_name: secName, sec_dept_id: deptId },
      });
      sections[key].push(sec);
    }
  };

  await makeSec(media.dept_id, media.dept_name, "media");
  await makeSec(marketing.dept_id, marketing.dept_name, "marketing");
  await makeSec(it.dept_id, it.dept_name, "it");
  await makeSec(finance.dept_id, finance.dept_name, "finance");

  // ---- USERS ----
  console.log("👥 Creating users...");
  const defaultPassword = await argon2.hash("password123");

  // Admin
  const admin = await prisma.users.upsert({
    where: { us_username: "admin" },
    update: {},
    create: {
      us_emp_code: "ADM-0001",
      us_firstname: "ธนากร",
      us_lastname: "วงษ์ศรี",
      us_username: "admin",
      us_password: defaultPassword,
      us_email: "admin@company.com",
      us_phone: "0891234501",
      us_role: "ADMIN",
      us_dept_id: it.dept_id,
      us_sec_id: sections.it[0].sec_id,
    },
  });

  // HOD
  const hodMedia = await prisma.users.upsert({
    where: { us_username: "hod.media" },
    update: {},
    create: {
      us_emp_code: "HOD-0001",
      us_firstname: "สมชาย",
      us_lastname: "พงษ์พิทักษ์",
      us_username: "hod.media",
      us_password: defaultPassword,
      us_email: "hod.media@company.com",
      us_phone: "0891234502",
      us_role: "HOD",
      us_dept_id: media.dept_id,
      us_sec_id: sections.media[0].sec_id,
    },
  });

  const hodIT = await prisma.users.upsert({
    where: { us_username: "hod.it" },
    update: {},
    create: {
      us_emp_code: "HOD-0002",
      us_firstname: "วิชัย",
      us_lastname: "สุริยะวงศ์",
      us_username: "hod.it",
      us_password: defaultPassword,
      us_email: "hod.it@company.com",
      us_phone: "0891234503",
      us_role: "HOD",
      us_dept_id: it.dept_id,
      us_sec_id: sections.it[0].sec_id,
    },
  });

  // HOS
  const hosMedia = await prisma.users.upsert({
    where: { us_username: "hos.media.a" },
    update: {},
    create: {
      us_emp_code: "HOS-0001",
      us_firstname: "สุพรรณี",
      us_lastname: "กันตรังศี",
      us_username: "hos.media.a",
      us_password: defaultPassword,
      us_email: "hos.media.a@company.com",
      us_phone: "0891234504",
      us_role: "HOS",
      us_dept_id: media.dept_id,
      us_sec_id: sections.media[0].sec_id,
    },
  });

  // Technical
  const techIT = await prisma.users.upsert({
    where: { us_username: "tech.it" },
    update: {},
    create: {
      us_emp_code: "TEC-0001",
      us_firstname: "ประสิทธิ์",
      us_lastname: "ใจเปี่ยม",
      us_username: "tech.it",
      us_password: defaultPassword,
      us_email: "tech.it@company.com",
      us_phone: "0891234505",
      us_role: "TECHNICAL",
      us_dept_id: it.dept_id,
      us_sec_id: sections.it[0].sec_id,
    },
  });

  // STAFF
  const staffMedia = await prisma.users.upsert({
    where: { us_username: "staff.media" },
    update: {},
    create: {
      us_emp_code: "STF-0001",
      us_firstname: "นันทวัฒน์",
      us_lastname: "เจริญผล",
      us_username: "staff.media",
      us_password: defaultPassword,
      us_email: "staff.media@company.com",
      us_phone: "0891234506",
      us_role: "STAFF",
      us_dept_id: media.dept_id,
      us_sec_id: sections.media[0].sec_id,
    },
  });

  // Employee
  const empMedia = await prisma.users.upsert({
    where: { us_username: "emp.media" },
    update: {},
    create: {
      us_emp_code: "EMP-0001",
      us_firstname: "ชาติชาย",
      us_lastname: "มานะสิน",
      us_username: "emp.media",
      us_password: defaultPassword,
      us_email: "emp.media@company.com",
      us_phone: "0891234507",
      us_role: "EMPLOYEE",
      us_dept_id: media.dept_id,
      us_sec_id: sections.media[0].sec_id,
    },
  });

  const empIT = await prisma.users.upsert({
    where: { us_username: "emp.it" },
    update: {},
    create: {
      us_emp_code: "EMP-0002",
      us_firstname: "อภิชาติ",
      us_lastname: "กิติศักดิ์",
      us_username: "emp.it",
      us_password: defaultPassword,
      us_email: "emp.it@company.com",
      us_phone: "0891234508",
      us_role: "EMPLOYEE",
      us_dept_id: it.dept_id,
      us_sec_id: sections.it[0].sec_id,
    },
  });

   // ---- CATEGORIES & ACCESSORIES ----
  console.log("📦 Creating categories & accessories...");
  const catCamera = await prisma.categories.upsert({
    where: { ca_id: 1 },
    update: { ca_name: "กล้อง" },
    create: { ca_name: "กล้อง" },
  });
  const catLaptop = await prisma.categories.upsert({
    where: { ca_id: 2 },
    update: { ca_name: "โน้ตบุ๊ค" },
    create: { ca_name: "โน้ตบุ๊ค" },
  });
  const catProjector = await prisma.categories.upsert({
    where: { ca_id: 3 },
    update: { ca_name: "โปรเจคเตอร์" },
    create: { ca_name: "โปรเจคเตอร์" },
  });


  console.log("✅ Seed completed successfully!");
  console.log("\n🔑 Login credentials (all users):");
  console.log(
    "  Username: admin, hod.media, hod.it, hos.media.a, tech.it, staff.media, emp.media, emp.it",
  );
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

