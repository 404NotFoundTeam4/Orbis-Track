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

  // ---- APPROVAL FLOWS ----
  console.log("🔄 Creating approval flows...");
  const flowMedia = await prisma.approval_flows.upsert({
    where: { af_id: 1 },
    update: { af_name: "Media Flow: HOS → HOD" },
    create: { af_name: "Media Flow: HOS → HOD", af_us_id: admin.us_id },
  });

  const flowIT = await prisma.approval_flows.upsert({
    where: { af_id: 2 },
    update: { af_name: "IT Flow: HOD Only" },
    create: { af_name: "IT Flow: HOD Only", af_us_id: admin.us_id },
  });

  // Steps
  await prisma.approval_flow_steps.upsert({
    where: { afs_id: 1 },
    update: {},
    create: {
      afs_id: 1,
      afs_step_approve: 1,
      afs_af_id: flowMedia.af_id,
      afs_role: "HOS",
      afs_dept_id: media.dept_id,
    },
  });
  await prisma.approval_flow_steps.upsert({
    where: { afs_id: 2 },
    update: {},
    create: {
      afs_id: 2,
      afs_step_approve: 2,
      afs_af_id: flowMedia.af_id,
      afs_role: "HOD",
      afs_dept_id: media.dept_id,
    },
  });
  await prisma.approval_flow_steps.upsert({
    where: { afs_id: 3 },
    update: {},
    create: {
      afs_id: 3,
      afs_step_approve: 1,
      afs_af_id: flowIT.af_id,
      afs_role: "HOD",
      afs_dept_id: it.dept_id,
    },
  });

  // Flow 3: Media Full Flow (HOS → HOD → STAFF) - สำหรับทดสอบ approval ที่จบที่ STAFF
  const flowMediaFull = await prisma.approval_flows.upsert({
    where: { af_id: 3 },
    update: { af_name: "Media Full Flow: HOS → HOD → STAFF" },
    create: { af_name: "Media Full Flow: HOS → HOD → STAFF", af_us_id: admin.us_id },
  });

  // Steps สำหรับ Flow 3
  await prisma.approval_flow_steps.upsert({
    where: { afs_id: 4 },
    update: {},
    create: {
      afs_id: 4,
      afs_step_approve: 1,
      afs_af_id: flowMediaFull.af_id,
      afs_role: "HOS",
      afs_dept_id: media.dept_id,
      afs_sec_id: sections.media[0].sec_id,
    },
  });
  await prisma.approval_flow_steps.upsert({
    where: { afs_id: 5 },
    update: {},
    create: {
      afs_id: 5,
      afs_step_approve: 2,
      afs_af_id: flowMediaFull.af_id,
      afs_role: "HOD",
      afs_dept_id: media.dept_id,
    },
  });
  await prisma.approval_flow_steps.upsert({
    where: { afs_id: 6 },
    update: {},
    create: {
      afs_id: 6,
      afs_step_approve: 3,
      afs_af_id: flowMediaFull.af_id,
      afs_role: "STAFF",
      afs_dept_id: media.dept_id,
      afs_sec_id: sections.media[0].sec_id,
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
      de_location: "ห้องไอที ชั้น 2",
      de_max_borrow_days: 14,
      de_af_id: flowIT.af_id,
      de_ca_id: catLaptop.ca_id,
      de_us_id: admin.us_id,
      de_sec_id: sections.it[0].sec_id,
      de_acc_id: accCharger.acc_id,
    },
  });

  // ---- DEVICE: PROJECTOR ----
  const deviceProjector = await prisma.devices.upsert({
    where: { de_serial_number: "PROJ-EPSON-001" },
    update: {},
    create: {
      de_serial_number: "PROJ-EPSON-001",
      de_name: "โปรเจคเตอร์ Epson EB-X51",
      de_location: "ห้องประชุมชั้น 4",
      de_max_borrow_days: 3,
      de_af_id: flowMedia.af_id,
      de_ca_id: catProjector.ca_id,
      de_us_id: admin.us_id,
      de_sec_id: sections.media[1].sec_id,
    },
  });

  // ---- DEVICE CHILDS ----
  console.log("🔢 Creating device childs...");
  // Sony Camera (3 units)
  const childCam1 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-CAM-SONY-001" },
    update: {},
    create: {
      dec_serial_number: "SN-SONY-A7III-001",
      dec_asset_code: "ASSET-CAM-SONY-001",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceCamera.de_id,
    },
  });
  const childCam2 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-CAM-SONY-002" },
    update: {},
    create: {
      dec_serial_number: "SN-SONY-A7III-002",
      dec_asset_code: "ASSET-CAM-SONY-002",
      dec_has_serial_number: true,
      dec_status: "BORROWED", // ตัวนี้จะถูกยืมในตัวอย่าง
      dec_de_id: deviceCamera.de_id,
    },
  });
  const childCam3 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-CAM-SONY-003" },
    update: {},
    create: {
      dec_serial_number: "SN-SONY-A7III-003",
      dec_asset_code: "ASSET-CAM-SONY-003",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceCamera.de_id,
    },
  });

  // เพิ่มกล้องอีก 3 ตัวเพื่อทดสอบ ellipsis
  const childCam4 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-CAM-SONY-004" },
    update: {},
    create: {
      dec_serial_number: "SN-SONY-A7III-004",
      dec_asset_code: "ASSET-CAM-SONY-004",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceCamera.de_id,
    },
  });
  const childCam5 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-CAM-SONY-005" },
    update: {},
    create: {
      dec_serial_number: "SN-SONY-A7III-005",
      dec_asset_code: "ASSET-CAM-SONY-005",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceCamera.de_id,
    },
  });
  const childCam6 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-CAM-SONY-006" },
    update: {},
    create: {
      dec_serial_number: "SN-SONY-A7III-006",
      dec_asset_code: "ASSET-CAM-SONY-006",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceCamera.de_id,
    },
  });

  // Dell Laptop (2 units)
  const childLaptop1 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-LAP-DELL-001" },
    update: {},
    create: {
      dec_serial_number: "SN-DELL-XPS15-001",
      dec_asset_code: "ASSET-LAP-DELL-001",
      dec_has_serial_number: true,
      dec_status: "REPAIRING", // ตัวนี้จะเสีย
      dec_de_id: deviceLaptop.de_id,
    },
  });
  const childLaptop2 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-LAP-DELL-002" },
    update: {},
    create: {
      dec_serial_number: "SN-DELL-XPS15-002",
      dec_asset_code: "ASSET-LAP-DELL-002",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceLaptop.de_id,
    },
  });

  // Projector (1 unit)
  const childProjector1 = await prisma.device_childs.upsert({
    where: { dec_asset_code: "ASSET-PROJ-EPSON-001" },
    update: {},
    create: {
      dec_serial_number: "SN-EPSON-EBX51-001",
      dec_asset_code: "ASSET-PROJ-EPSON-001",
      dec_has_serial_number: true,
      dec_status: "READY",
      dec_de_id: deviceProjector.de_id,
    },
  });

  // ==========================================
  // 2. TRANSACTIONAL DATA (ข้อมูลจำลองการใช้งาน)
  // ==========================================

  // ---- CARTS ----
  console.log("🛒 Creating carts...");
  const cart = await prisma.carts.upsert({
    where: { ct_id: 1 },
    update: {},
    create: {
      ct_id: 1,
      ct_quantity: 1,
      ct_us_id: empMedia.us_id,
    },
  });

  await prisma.cart_items.upsert({
    where: { cti_id: 1 },
    update: {},
    create: {
      cti_id: 1,
      cti_ct_id: cart.ct_id,
      cti_dec_id: childCam1.dec_id, // เอาตัวที่ READY ใส่ตะกร้า
      cti_quantity: 1,
      cti_us_name: "ชาติชาย มานะสิน",
      cti_start_date: daysFromNow(1), // เริ่มยืมพรุ่งนี้
      cti_end_date: daysFromNow(3), // คืนอีก 2 วัน
    },
  });

  // ---- BORROW TICKETS (BRT) ----
  console.log("🎫 Creating tickets & stages...");

  // Ticket 1: IN_USE (กำลังยืมอยู่ - กล้องตัวที่ 2)
  const ticketInUse = await prisma.borrow_return_tickets.upsert({
    where: { brt_id: 1 },
    update: {},
    create: {
      brt_id: 1,
      brt_status: "IN_USE",
      brt_usage_location: "ถ่ายงานนอกสถานที่ บางแสน",
      brt_borrow_purpose: "ถ่ายวีดีโอโปรโมทคณะ",
      brt_start_date: daysAgo(2), // เริ่มยืมเมื่อ 2 วันก่อน
      brt_end_date: daysFromNow(3), // คืนอีก 3 วัน
      brt_quantity: 1,
      brt_user_id: empMedia.us_id,
      brt_af_id: flowMedia.af_id,
      brt_current_stage: 2, // ผ่านหมดแล้ว (Media Flow มี 2 steps)
      created_at: daysAgo(5), // สร้างคำร้องเมื่อ 5 วันก่อน
    },
  });

  // ผูกอุปกรณ์กับ Ticket
  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketInUse.brt_id,
        td_dec_id: childCam2.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketInUse.brt_id,
      td_dec_id: childCam2.dec_id,
    },
  });

  // สร้าง Availability Timeline
  await prisma.device_availabilities.upsert({
    where: { da_id: 1 },
    update: {},
    create: {
      da_id: 1,
      da_dec_id: childCam2.dec_id,
      da_brt_id: ticketInUse.brt_id,
      da_start: ticketInUse.brt_start_date,
      da_end: ticketInUse.brt_end_date,
      da_status: "ACTIVE",
    },
  });

  // สร้าง Stages (ประวัติการอนุมัติ) สำหรับ Ticket 1 (ผ่านหมดแล้ว)
  // Step 1: HOS Approved
  await prisma.borrow_return_ticket_stages.upsert({
    where: { brts_id: 1 },
    update: {},
    create: {
      brts_id: 1,
      brts_brt_id: ticketInUse.brt_id,
      brts_step_approve: 1,
      brts_name: "HOS Approval",
      brts_role: "HOS",
      brts_dept_id: media.dept_id,
      brts_dept_name: media.dept_name, // Snapshot
      brts_sec_name: "N/A", // Mock
      brts_status: "APPROVED",
      brts_us_id: hosMedia.us_id,
      created_at: daysAgo(4), // HOS อนุมัติเมื่อ 4 วันก่อน
    },
  });

  // Step 2: HOD Approved
  await prisma.borrow_return_ticket_stages.upsert({
    where: { brts_id: 2 },
    update: {},
    create: {
      brts_id: 2,
      brts_brt_id: ticketInUse.brt_id,
      brts_step_approve: 2,
      brts_name: "HOD Approval",
      brts_role: "HOD",
      brts_dept_id: media.dept_id,
      brts_dept_name: media.dept_name,
      brts_sec_name: "N/A",
      brts_status: "APPROVED",
      brts_us_id: hodMedia.us_id,
      created_at: daysAgo(3), // HOD อนุมัติเมื่อ 3 วันก่อน (หลัง HOS 1 วัน)
    },
  });

  // Ticket 2: PENDING (รออนุมัติ - User IT ขอยืม Laptop)
  // หมายเหตุ: Laptop ตัวนี้ (childLaptop1) จริงๆสถานะเสีย แต่ User อาจจะจองล่วงหน้าได้
  const ticketPending = await prisma.borrow_return_tickets.upsert({
    where: { brt_id: 2 },
    update: {},
    create: {
      brt_id: 2,
      brt_status: "PENDING",
      brt_usage_location: "Work from Home",
      brt_borrow_purpose: "พัฒนาโปรเจกต์ใหม่",
      brt_start_date: daysFromNow(5), // เริ่มยืมอีก 5 วัน
      brt_end_date: daysFromNow(10), // คืนอีก 10 วัน
      brt_quantity: 1,
      brt_user_id: empIT.us_id,
      brt_af_id: flowIT.af_id,
      brt_current_stage: 1, // รอขั้นแรก
      created_at: daysAgo(1), // สร้างคำร้องเมื่อวาน
    },
  });

  // ผูกอุปกรณ์ (จองล่วงหน้า) - ใช้ Laptop ตัวที่ READY
  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketPending.brt_id,
        td_dec_id: childLaptop2.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketPending.brt_id,
      td_dec_id: childLaptop2.dec_id,
    },
  });

  // Stages ของ Ticket 2 (รอ HOD IT อนุมัติ)
  await prisma.borrow_return_ticket_stages.upsert({
    where: { brts_id: 3 },
    update: {},
    create: {
      brts_id: 3,
      brts_brt_id: ticketPending.brt_id,
      brts_step_approve: 1,
      brts_name: "HOD IT Check",
      brts_role: "HOD",
      brts_dept_id: it.dept_id,
      brts_dept_name: it.dept_name,
      brts_sec_name: "N/A",
      brts_status: "PENDING", // รออยู่
    },
  });

  // ==========================================
  // 🧪 Ticket 3: APPROVED - รอ STAFF จ่ายอุปกรณ์
  // ==========================================
  // Flow: HOS ✅ → HOD ✅ → STAFF (PENDING)
  console.log("🧪 Creating ticket waiting for STAFF...");

  const ticketWaitingStaff = await prisma.borrow_return_tickets.upsert({
    where: { brt_id: 3 },
    update: {},
    create: {
      brt_id: 3,
      brt_status: "APPROVED", // ผ่านการอนุมัติแล้ว รอ STAFF จ่ายอุปกรณ์
      brt_usage_location: "ห้องประชุมใหญ่ ชั้น 5",
      brt_borrow_purpose: "นำเสนอผลงานต่อผู้บริหาร",
      brt_start_date: daysFromNow(1), // เริ่มยืมพรุ่งนี้
      brt_end_date: daysFromNow(2), // คืนมะรืน
      brt_quantity: 1,
      brt_user_id: empMedia.us_id,
      brt_af_id: flowMediaFull.af_id,
      brt_current_stage: 3, // รอ STAFF (step 3)
      created_at: daysAgo(2), // สร้างคำร้องเมื่อ 2 วันก่อน
    },
  });

  // ผูกอุปกรณ์ - ใช้ Projector
  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childProjector1.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childProjector1.dec_id,
    },
  });

  // เพิ่ม device อื่นๆ ให้ ticketWaitingStaff เพื่อทดสอบ ellipsis (มากกว่า 6 ตัว)
  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childCam1.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childCam1.dec_id,
    },
  });

  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childCam3.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childCam3.dec_id,
    },
  });

  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childLaptop1.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childLaptop1.dec_id,
    },
  });

  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childLaptop2.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childLaptop2.dec_id,
    },
  });

  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childCam4.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childCam4.dec_id,
    },
  });

  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childCam5.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childCam5.dec_id,
    },
  });

  await prisma.ticket_devices.upsert({
    where: {
      td_brt_id_td_dec_id: {
        td_brt_id: ticketWaitingStaff.brt_id,
        td_dec_id: childCam6.dec_id,
      },
    },
    update: {},
    create: {
      td_brt_id: ticketWaitingStaff.brt_id,
      td_dec_id: childCam6.dec_id,
    },
  });

  // Stage 1: HOS Approved ✅
  await prisma.borrow_return_ticket_stages.upsert({
    where: { brts_id: 4 },
    update: {},
    create: {
      brts_id: 4,
      brts_brt_id: ticketWaitingStaff.brt_id,
      brts_step_approve: 1,
      brts_name: "HOS อนุมัติ",
      brts_role: "HOS",
      brts_dept_id: media.dept_id,
      brts_dept_name: media.dept_name,
      brts_sec_id: sections.media[0].sec_id,
      brts_sec_name: sections.media[0].sec_name,
      brts_status: "APPROVED",
      brts_us_id: hosMedia.us_id,
      created_at: daysAgo(2), // อนุมัติเมื่อ 2 วันก่อน
    },
  });

  // Stage 2: HOD Approved ✅
  await prisma.borrow_return_ticket_stages.upsert({
    where: { brts_id: 5 },
    update: {},
    create: {
      brts_id: 5,
      brts_brt_id: ticketWaitingStaff.brt_id,
      brts_step_approve: 2,
      brts_name: "HOD อนุมัติ",
      brts_role: "HOD",
      brts_dept_id: media.dept_id,
      brts_dept_name: media.dept_name,
      brts_sec_name: "N/A",
      brts_status: "APPROVED",
      brts_us_id: hodMedia.us_id,
      created_at: daysAgo(1), // อนุมัติเมื่อวาน
    },
  });

  // Stage 3: STAFF Pending ⏳
  await prisma.borrow_return_ticket_stages.upsert({
    where: { brts_id: 6 },
    update: {},
    create: {
      brts_id: 6,
      brts_brt_id: ticketWaitingStaff.brt_id,
      brts_step_approve: 3,
      brts_name: "STAFF จ่ายอุปกรณ์",
      brts_role: "STAFF",
      brts_dept_id: media.dept_id,
      brts_dept_name: media.dept_name,
      brts_sec_id: sections.media[0].sec_id,
      brts_sec_name: sections.media[0].sec_name,
      brts_status: "PENDING", // 🔴 รอ STAFF ดำเนินการ
      created_at: daysAgo(1),
    },
  });

  // Notification สำหรับ STAFF
  await prisma.notifications.create({
    data: {
      n_title: "มีคำร้องรอจ่ายอุปกรณ์",
      n_message: "คำร้องยืมโปรเจคเตอร์ผ่านการอนุมัติแล้ว รอจ่ายอุปกรณ์",
      n_base_event: "TICKET_APPROVED",
      n_brt_id: ticketWaitingStaff.brt_id,
      n_brts_id: 6,
    },
  });

  // ---- TICKET ISSUES (แจ้งซ่อม) ----
  console.log("🛠 Creating issues...");
  // แจ้งซ่อม Laptop Dell (ที่สถานะ REPAIRING)
  const issue = await prisma.ticket_issues.upsert({
    where: { ti_id: 1 },
    update: {},
    create: {
      ti_id: 1,
      ti_de_id: deviceLaptop.de_id,
      ti_title: "จอฟ้า เปิดไม่ติด",
      ti_description: "เปิดเครื่องแล้วขึ้น Blue Screen code 0x0000",
      ti_reported_by: empIT.us_id,
      ti_assigned_to: techIT.us_id, // assign ให้ช่างแล้ว
      ti_status: "IN_PROGRESS",
      ti_result: "IN_PROGRESS",
      created_at: daysAgo(3), // แจ้งเมื่อ 3 วันก่อน
    },
  });

  await prisma.issue_attachments.upsert({
    where: { iatt_id: 1 },
    update: {},
    create: {
      iatt_id: 1,
      iatt_ti_id: issue.ti_id,
      iatt_path_url: "/uploads/issues/bluescreen.jpg",
      uploaded_by: empIT.us_id,
    },
  });

  // ---- NOTIFICATIONS ----
  console.log("🔔 Creating notifications...");
  const noti = await prisma.notifications.create({
    data: {
      n_title: "มีคำร้องขออนุมัติใหม่",
      n_message: "คุณมีรายการยืม Laptop รออนุมัติ",
      n_base_event: "TICKET_CREATED",
      n_brt_id: ticketPending.brt_id,
      n_brts_id: 3, // ลิงก์ไป stage ที่รอ
    },
  });

  await prisma.notification_recipients.create({
    data: {
      nr_n_id: noti.n_id,
      nr_us_id: hodIT.us_id, // ส่งให้ HOD IT
      nr_status: "UNREAD",
      nr_event: "APPROVAL_REQUESTED",
    },
  });

  // ---- CHAT ----
  console.log("💬 Creating chat...");
  // สร้างห้อง Chat ให้ Admin คุยกับตัวเอง (Test)
  const room = await prisma.chat_rooms.upsert({
    where: { cr_id: 1 },
    update: {},
    create: {
      cr_id: 1,
      cr_us_id: admin.us_id,
      cr_title: "สอบถามเกี่ยวกับระบบ",
      last_msg_at: daysAgo(1), // ข้อความล่าสุดเมื่อวาน
    },
  });

  await prisma.chat_messages.create({
    data: {
      cm_role: "user",
      cm_content: "ระบบทดสอบ Chat ใช้งานได้ไหม?",
      cm_cr_id: room.cr_id,
      cm_status: "ok",
    },
  });

  await prisma.chat_messages.create({
    data: {
      cm_role: "assistant",
      cm_content: "ใช้งานได้ครับ! ระบบพร้อมทำงาน",
      cm_cr_id: room.cr_id,
      cm_status: "ok",
    },
  });

  // ---- LOGS ----
  console.log("📜 Creating logs...");
  await prisma.log_borrow_returns.create({
    data: {
      lbr_action: "CREATED",
      lbr_new_status: "PENDING",
      lbr_actor_id: empIT.us_id,
      lbr_brt_id: ticketPending.brt_id,
      lbr_note: "สร้างรายการยืม",
    },
  });

  // ---- LOG ISSUES ----
  console.log("📝 Creating issue logs...");
  await prisma.log_issues.create({
    data: {
      li_action: "REPORTED",
      li_new_status: "PENDING",
      li_actor_id: empIT.us_id,
      li_ti_id: issue.ti_id,
      li_note: "แจ้งปัญหาจอฟ้า",
    },
  });

  await prisma.log_issues.create({
    data: {
      li_action: "ASSIGNED",
      li_old_status: "PENDING",
      li_new_status: "IN_PROGRESS",
      li_actor_id: admin.us_id,
      li_ti_id: issue.ti_id,
      li_note: `มอบหมายให้ช่าง ${techIT.us_firstname}`,
    },
  });

  // ---- LOG DEVICE CHILDS ----
  console.log("📊 Creating device child logs...");
  // Log: กล้องถูกยืมออกไป
  await prisma.log_device_childs.create({
    data: {
      ldc_action: "BORROWED",
      ldc_old_status: "READY",
      ldc_new_status: "BORROWED",
      ldc_actor_id: empMedia.us_id,
      ldc_brt_id: ticketInUse.brt_id,
      ldc_dec_id: childCam2.dec_id,
      ldc_note: "ยืมออกไปถ่ายงาน",
    },
  });

  // Log: Laptop เปลี่ยนสถานะเป็น REPAIRING
  await prisma.log_device_childs.create({
    data: {
      ldc_action: "CHANGED",
      ldc_old_status: "READY",
      ldc_new_status: "REPAIRING",
      ldc_actor_id: techIT.us_id,
      ldc_ti_id: issue.ti_id,
      ldc_dec_id: childLaptop1.dec_id,
      ldc_note: "ส่งซ่อมเนื่องจากจอฟ้า",
    },
  });

  // ---- CHAT ATTACHMENTS ----
  console.log("📎 Creating chat attachments...");
  // ต้อง create chat message ใหม่ที่มี attachment
  const msgWithAttachment = await prisma.chat_messages.create({
    data: {
      cm_role: "user",
      cm_content: "นี่คือรูปอุปกรณ์ที่ต้องการยืมครับ",
      cm_cr_id: room.cr_id,
      cm_status: "ok",
    },
  });

  await prisma.chat_attachments.create({
    data: {
      catt_cm_id: msgWithAttachment.cm_id,
      catt_file_path: "/uploads/chat/equipment-photo.jpg",
    },
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