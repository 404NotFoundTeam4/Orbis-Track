/**
 * Description: สคริปต์ seed ข้อมูลตั้งต้นให้ DB ด้วย Prisma
 * Input : ใช้ DATABASE_URL จาก .env / environment
 * Output : ข้อมูลพื้นฐานถูกอัปเซิร์ต (upsert) แบบรันซ้ำได้ไม่พัง
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

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
        key: keyof typeof sections
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

    // ---- APPROVAL POSITIONS ----
    console.log("👔 Creating approval positions...");
    const posAdmin = await prisma.approval_positions.upsert({
        where: { ap_name: "ผู้ดูแลระบบ" },
        update: {},
        create: { ap_name: "ผู้ดูแลระบบ" },
    });
    const posHOD = await prisma.approval_positions.upsert({
        where: { ap_name: "หัวหน้าแผนก" },
        update: {},
        create: { ap_name: "หัวหน้าแผนก" },
    });
    const posHOS = await prisma.approval_positions.upsert({
        where: { ap_name: "หัวหน้าฝ่าย" },
        update: {},
        create: { ap_name: "หัวหน้าฝ่าย" },
    });
    const posTech = await prisma.approval_positions.upsert({
        where: { ap_name: "ช่างเทคนิค" },
        update: {},
        create: { ap_name: "ช่างเทคนิค" },
    });
    const posStaff = await prisma.approval_positions.upsert({
        where: { ap_name: "เจ้าหน้าที่" },
        update: {},
        create: { ap_name: "เจ้าหน้าที่" },
    });

    // ---- USERS ----
    console.log("👥 Creating users...");
    const defaultPassword = await argon2.hash("password123");

    // Admin
    const admin = await prisma.users.upsert({
        where: { us_username: "admin" },
        update: {},
        create: {
            us_emp_code: "EMP-0001",
            us_firstname: "Admin",
            us_lastname: "System",
            us_username: "admin",
            us_password: defaultPassword,
            us_email: "admin@company.com",
            us_phone: "0812345678",
            us_role: "ADMIN",
            us_pa_id: posAdmin.ap_id,
            us_dept_id: it.dept_id,
            us_sec_id: sections.it[0].sec_id,
            us_is_active: true,
        },
    });

    // HOD ของแต่ละแผนก
    await prisma.users.upsert({
        where: { us_username: "hod.media" },
        update: {},
        create: {
            us_emp_code: "EMP-0002",
            us_firstname: "สมชาย",
            us_lastname: "มีดี",
            us_username: "hod.media",
            us_password: defaultPassword,
            us_email: "hod.media@company.com",
            us_phone: "0823456789",
            us_role: "HOD",
            us_pa_id: posHOD.ap_id,
            us_dept_id: media.dept_id,
            us_sec_id: sections.media[0].sec_id,
            us_is_active: true,
        },
    });

    await prisma.users.upsert({
        where: { us_username: "hod.it" },
        update: {},
        create: {
            us_emp_code: "EMP-0003",
            us_firstname: "วิชัย",
            us_lastname: "เทคโนโลยี",
            us_username: "hod.it",
            us_password: defaultPassword,
            us_email: "hod.it@company.com",
            us_phone: "0834567890",
            us_role: "HOD",
            us_pa_id: posHOD.ap_id,
            us_dept_id: it.dept_id,
            us_sec_id: sections.it[0].sec_id,
            us_is_active: true,
        },
    });

    // HOS (หัวหน้าฝ่าย)
    await prisma.users.upsert({
        where: { us_username: "hos.media.a" },
        update: {},
        create: {
            us_emp_code: "EMP-0004",
            us_firstname: "สมหญิง",
            us_lastname: "สร้างสรรค์",
            us_username: "hos.media.a",
            us_password: defaultPassword,
            us_email: "hos.media.a@company.com",
            us_phone: "0845678901",
            us_role: "HOS",
            us_pa_id: posHOS.ap_id,
            us_dept_id: media.dept_id,
            us_sec_id: sections.media[0].sec_id,
            us_is_active: true,
        },
    });

    // Technical (ช่างเทคนิค)
    await prisma.users.upsert({
        where: { us_username: "tech.it" },
        update: {},
        create: {
            us_emp_code: "EMP-0005",
            us_firstname: "เทคนิค",
            us_lastname: "ซ่อมดี",
            us_username: "tech.it",
            us_password: defaultPassword,
            us_email: "tech.it@company.com",
            us_phone: "0856789012",
            us_role: "TECHNICAL",
            us_pa_id: posTech.ap_id,
            us_dept_id: it.dept_id,
            us_sec_id: sections.it[0].sec_id,
            us_is_active: true,
        },
    });

    // Staff
    await prisma.users.upsert({
        where: { us_username: "staff.media" },
        update: {},
        create: {
            us_emp_code: "EMP-0006",
            us_firstname: "จัดการ",
            us_lastname: "อุปกรณ์",
            us_username: "staff.media",
            us_password: defaultPassword,
            us_email: "staff.media@company.com",
            us_phone: "0867890123",
            us_role: "STAFF",
            us_pa_id: posStaff.ap_id,
            us_dept_id: media.dept_id,
            us_sec_id: sections.media[0].sec_id,
            us_is_active: true,
        },
    });

    // Employee (ผู้ใช้ทั่วไป)
    await prisma.users.upsert({
        where: { us_username: "emp.media" },
        update: {},
        create: {
            us_emp_code: "EMP-0007",
            us_firstname: "พนักงาน",
            us_lastname: "ทดสอบ",
            us_username: "emp.media",
            us_password: defaultPassword,
            us_email: "emp.media@company.com",
            us_phone: "0878901234",
            us_role: "EMPLOYEE",
            us_dept_id: media.dept_id,
            us_sec_id: sections.media[0].sec_id,
            us_is_active: true,
        },
    });

    await prisma.users.upsert({
        where: { us_username: "emp.it" },
        update: {},
        create: {
            us_emp_code: "EMP-0008",
            us_firstname: "ไอที",
            us_lastname: "พนักงาน",
            us_username: "emp.it",
            us_password: defaultPassword,
            us_email: "emp.it@company.com",
            us_phone: "0889012345",
            us_role: "EMPLOYEE",
            us_dept_id: it.dept_id,
            us_sec_id: sections.it[0].sec_id,
            us_is_active: true,
        },
    });

    // ---- CATEGORIES ----
    console.log("📦 Creating categories...");
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
    await prisma.categories.upsert({
        where: { ca_id: 4 },
        update: { ca_name: "ไมโครโฟน" },
        create: { ca_name: "ไมโครโฟน" },
    });

    // ---- ACCESSORIES ----
    console.log("🔌 Creating accessories...");
    const accBattery = await prisma.accessories.upsert({
        where: { acc_id: 1 },
        update: { acc_name: "แบตเตอรี่", acc_quantity: 10 },
        create: { acc_name: "แบตเตอรี่", acc_quantity: 10 },
    });
    const accCharger = await prisma.accessories.upsert({
        where: { acc_id: 2 },
        update: { acc_name: "อแด็ปเตอร์", acc_quantity: 15 },
        create: { acc_name: "อแด็ปเตอร์", acc_quantity: 15 },
    });
    await prisma.accessories.upsert({
        where: { acc_id: 3 },
        update: { acc_name: "ขาตั้งกล้อง", acc_quantity: 8 },
        create: { acc_name: "ขาตั้งกล้อง", acc_quantity: 8 },
    });

    // ---- APPROVAL FLOWS ----
    console.log("🔄 Creating approval flows...");
    const flowMedia = await prisma.approval_flows.upsert({
        where: { af_id: 1 },
        update: {
            af_name: "Media Flow: HOS → HOD",
            af_us_id: admin.us_id,
        },
        create: {
            af_name: "Media Flow: HOS → HOD",
            af_is_active: true,
            af_us_id: admin.us_id,
        },
    });

    const flowIT = await prisma.approval_flows.upsert({
        where: { af_id: 2 },
        update: {
            af_name: "IT Flow: HOD Only",
            af_us_id: admin.us_id,
        },
        create: {
            af_name: "IT Flow: HOD Only",
            af_is_active: true,
            af_us_id: admin.us_id,
        },
    });

    // ---- APPROVAL FLOW STEPS ----
    console.log("📋 Creating approval flow steps...");
    // Media Flow: ขั้นที่ 1 - HOS, ขั้นที่ 2 - HOD
    await prisma.approval_flow_steps.upsert({
        where: { afs_id: 1 },
        update: {
            afs_step_approve: 1,
            afs_pa_id: posHOS.ap_id,
            afs_af_id: flowMedia.af_id,
        },
        create: {
            afs_step_approve: 1,
            afs_pa_id: posHOS.ap_id,
            afs_af_id: flowMedia.af_id,
        },
    });
    await prisma.approval_flow_steps.upsert({
        where: { afs_id: 2 },
        update: {
            afs_step_approve: 2,
            afs_pa_id: posHOD.ap_id,
            afs_af_id: flowMedia.af_id,
        },
        create: {
            afs_step_approve: 2,
            afs_pa_id: posHOD.ap_id,
            afs_af_id: flowMedia.af_id,
        },
    });

    // IT Flow: ขั้นที่ 1 - HOD
    await prisma.approval_flow_steps.upsert({
        where: { afs_id: 3 },
        update: {
            afs_step_approve: 1,
            afs_pa_id: posHOD.ap_id,
            afs_af_id: flowIT.af_id,
        },
        create: {
            afs_step_approve: 1,
            afs_pa_id: posHOD.ap_id,
            afs_af_id: flowIT.af_id,
        },
    });

    // ---- DEVICES ----
    console.log("📷 Creating devices...");
    const deviceCamera = await prisma.devices.upsert({
        where: { de_serial_number: "CAM-SONY-001" },
        update: {},
        create: {
            de_serial_number: "CAM-SONY-001",
            de_name: "กล้อง Sony A7III",
            de_description: "กล้อง Full Frame สำหรับงานสื่อ",
            de_location: "ห้องอุปกรณ์ชั้น 3",
            de_max_borrow_days: 7,
            de_af_id: flowMedia.af_id,
            de_ca_id: catCamera.ca_id,
            de_us_id: admin.us_id,
            de_sec_id: sections.media[0].sec_id,
            de_acc_id: accBattery.acc_id,
        },
    });

    const deviceLaptop = await prisma.devices.upsert({
        where: { de_serial_number: "LAP-DELL-001" },
        update: {},
        create: {
            de_serial_number: "LAP-DELL-001",
            de_name: "โน้ตบุ๊ค Dell XPS 15",
            de_description: "โน้ตบุ๊คสำหรับงานออกแบบ",
            de_location: "ห้องไอที ชั้น 2",
            de_max_borrow_days: 14,
            de_af_id: flowIT.af_id,
            de_ca_id: catLaptop.ca_id,
            de_us_id: admin.us_id,
            de_sec_id: sections.it[0].sec_id,
            de_acc_id: accCharger.acc_id,
        },
    });

    const deviceProjector = await prisma.devices.upsert({
        where: { de_serial_number: "PROJ-EPSON-001" },
        update: {},
        create: {
            de_serial_number: "PROJ-EPSON-001",
            de_name: "โปรเจคเตอร์ Epson EB-2250U",
            de_description: "โปรเจคเตอร์ความสว่าง 5000 lumens",
            de_location: "ห้องประชุมใหญ่",
            de_max_borrow_days: 3,
            de_af_id: flowMedia.af_id,
            de_ca_id: catProjector.ca_id,
            de_us_id: admin.us_id,
            de_sec_id: sections.media[0].sec_id,
        },
    });

    // ---- DEVICE CHILDS ----
    console.log("🔢 Creating device childs...");
    // กล้อง Sony - มี 3 ตัว
    for (let i = 1; i <= 3; i++) {
        await prisma.device_childs.upsert({
            where: { dec_asset_code: `ASSET-CAM-SONY-00${i}` },
            update: {},
            create: {
                dec_serial_number: `SN-SONY-A7III-00${i}`,
                dec_asset_code: `ASSET-CAM-SONY-00${i}`,
                dec_has_serial_number: true,
                dec_status: "READY",
                dec_de_id: deviceCamera.de_id,
            },
        });
    }

    // Laptop Dell - มี 5 ตัว
    for (let i = 1; i <= 5; i++) {
        await prisma.device_childs.upsert({
            where: { dec_asset_code: `ASSET-LAP-DELL-00${i}` },
            update: {},
            create: {
                dec_serial_number: `SN-DELL-XPS15-00${i}`,
                dec_asset_code: `ASSET-LAP-DELL-00${i}`,
                dec_has_serial_number: true,
                dec_status: i <= 4 ? "READY" : "BORROWED",
                dec_de_id: deviceLaptop.de_id,
            },
        });
    }

    // โปรเจคเตอร์ - มี 2 ตัว
    for (let i = 1; i <= 2; i++) {
        await prisma.device_childs.upsert({
            where: { dec_asset_code: `ASSET-PROJ-EPSON-00${i}` },
            update: {},
            create: {
                dec_serial_number: `SN-EPSON-EB2250U-00${i}`,
                dec_asset_code: `ASSET-PROJ-EPSON-00${i}`,
                dec_has_serial_number: true,
                dec_status: "READY",
                dec_de_id: deviceProjector.de_id,
            },
        });
    }

    console.log("✅ Seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log("- Departments: 4");
    console.log("- Sections: 16 (4 per department)");
    console.log("- Approval Positions: 5");
    console.log("- Users: 8");
    console.log("- Categories: 4");
    console.log("- Accessories: 3");
    console.log("- Approval Flows: 2");
    console.log("- Approval Flow Steps: 3");
    console.log("- Devices: 3");
    console.log("- Device Childs: 10");
    console.log("\n🔑 Login credentials (all users):");
    console.log("  Username: admin, hod.media, hod.it, hos.media.a, tech.it, staff.media, emp.media, emp.it");
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