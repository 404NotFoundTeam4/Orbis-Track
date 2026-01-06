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

  // Accessories will be created after devices (since they now reference devices)

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
      afs_sec_id: sections.media[0].sec_id, // HOS ต้องมี sec_id
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

  // ---- ACCESSORIES (now with acc_de_id) ----
  console.log("📦 Creating accessories...");
  // Camera accessories
  await prisma.accessories.upsert({
    where: { acc_id: 1 },
    update: { acc_name: "เลนส์", acc_quantity: 5, acc_de_id: deviceCamera.de_id },
    create: { acc_id: 1, acc_name: "เลนส์", acc_quantity: 5, acc_de_id: deviceCamera.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 2 },
    update: { acc_name: "แบตเตอรี่สำรอง", acc_quantity: 10, acc_de_id: deviceCamera.de_id },
    create: { acc_id: 2, acc_name: "แบตเตอรี่สำรอง", acc_quantity: 10, acc_de_id: deviceCamera.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 3 },
    update: { acc_name: "ขาตั้งกล้อง", acc_quantity: 3, acc_de_id: deviceCamera.de_id },
    create: { acc_id: 3, acc_name: "ขาตั้งกล้อง", acc_quantity: 3, acc_de_id: deviceCamera.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 4 },
    update: { acc_name: "กระเป๋ากล้อง", acc_quantity: 5, acc_de_id: deviceCamera.de_id },
    create: { acc_id: 4, acc_name: "กระเป๋ากล้อง", acc_quantity: 5, acc_de_id: deviceCamera.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 5 },
    update: { acc_name: "เมาส์ไร้สาย", acc_quantity: 5, acc_de_id: deviceLaptop.de_id },
    create: { acc_id: 5, acc_name: "เมาส์ไร้สาย", acc_quantity: 5, acc_de_id: deviceLaptop.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 6 },
    update: { acc_name: "Adapter", acc_quantity: 5, acc_de_id: deviceLaptop.de_id },
    create: { acc_id: 6, acc_name: "Adapter", acc_quantity: 5, acc_de_id: deviceLaptop.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 7 },
    update: { acc_name: "สาย HDMI", acc_quantity: 2, acc_de_id: deviceProjector.de_id },
    create: { acc_id: 7, acc_name: "สาย HDMI", acc_quantity: 2, acc_de_id: deviceProjector.de_id },
  });
  await prisma.accessories.upsert({
    where: { acc_id: 8 },
    update: { acc_name: "รีโมท", acc_quantity: 1, acc_de_id: deviceProjector.de_id },
    create: { acc_id: 8, acc_name: "รีโมท", acc_quantity: 1, acc_de_id: deviceProjector.de_id },
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
      cti_ct_id: cart.ct_id,
      cti_de_id: deviceCamera.de_id,
      cti_quantity: 1,
      cti_us_name: "ชาติชาย มานะสิน",
      cti_start_date: daysFromNow(1),
      cti_end_date: daysFromNow(3),
    },
  });

  // ---- BORROW TICKETS (BRT) ----
  console.log("🎫 Creating tickets & stages...");

  // ฟังก์ชันช่วยสร้าง Ticket และ Stages เพื่อความรวดเร็ว
  let ticketIdCounter = 1;
  let stageIdCounter = 1;

  async function createTicketWithStages(params: {
    status: any;
    purpose: string;
    userId: number;
    flowId: number;
    deviceId: number;
    startDate: Date;
    endDate: Date;
    currentStage: number;
    stages: {
      name: string;
      role: any;
      deptId: number | null;
      secId?: number | null; // เพิ่ม secId สำหรับ HOS/STAFF
      status: any;
      usId?: number | null;
    }[];
  }) {
    const brtId = ticketIdCounter++;
    const ticket = await prisma.borrow_return_tickets.upsert({
      where: { brt_id: brtId },
      update: {},
      create: {
        brt_id: brtId,
        brt_status: params.status,
        brt_usage_location: "Office / On-site",
        brt_borrow_purpose: params.purpose,
        brt_start_date: params.startDate,
        brt_end_date: params.endDate,
        brt_quantity: 1,
        brt_user_id: params.userId,
        brt_af_id: params.flowId,
        brt_current_stage: params.currentStage,
        created_at: daysAgo(5),
      },
    });

    await prisma.ticket_devices.upsert({
      where: {
        td_brt_id_td_dec_id: { td_brt_id: brtId, td_dec_id: params.deviceId },
      },
      update: {},
      create: { td_brt_id: brtId, td_dec_id: params.deviceId },
    });

    for (const [index, s] of params.stages.entries()) {
      const stepNum = index + 1;
      const brtsId = stageIdCounter++;
      await prisma.borrow_return_ticket_stages.upsert({
        where: { brts_id: brtsId },
        update: {},
        create: {
          brts_id: brtsId,
          brts_brt_id: brtId,
          brts_step_approve: stepNum,
          brts_name: s.name,
          brts_role: s.role,
          brts_dept_id: s.deptId,
          brts_sec_id: s.secId || null, // เพิ่ม sec_id สำหรับ HOS/STAFF
          brts_dept_name: "Mock Dept",
          brts_sec_name: s.secId ? "Section A" : null, // ถ้ามี secId ให้ใส่ชื่อ
          brts_status: s.status,
          brts_us_id: s.usId || null,
          created_at: daysAgo(5 - index),
        },
      });
    }

    return ticket;
  }

  // 1. IN_USE - กล้อง (โดย Employee Media)
  await createTicketWithStages({
    status: "IN_USE",
    purpose: "ถ่ายวีดีโอโปรโมทคณะ",
    userId: empMedia.us_id,
    flowId: flowMedia.af_id,
    deviceId: childCam2.dec_id,
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    currentStage: 2,
    stages: [
      { name: "HOS Approval", role: "HOS", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "APPROVED", usId: hosMedia.us_id },
      { name: "HOD Approval", role: "HOD", deptId: media.dept_id, status: "APPROVED", usId: hodMedia.us_id },
    ],
  });

  // 2. PENDING - โน้ตบุ๊ค (โดย Employee IT) รอ HOD IT
  await createTicketWithStages({
    status: "PENDING",
    purpose: "พัฒนาโปรเจกต์ใหม่",
    userId: empIT.us_id,
    flowId: flowIT.af_id,
    deviceId: childLaptop2.dec_id,
    startDate: daysFromNow(1),
    endDate: daysFromNow(7),
    currentStage: 1,
    stages: [
      { name: "HOD IT Check", role: "HOD", deptId: it.dept_id, status: "PENDING" },
    ],
  });

  // 3. APPROVED - โปรเจคเตอร์ (โดย Employee Media) รอ STAFF จ่ายของ
  await createTicketWithStages({
    status: "APPROVED",
    purpose: "ประชุมสรุปงานรายเดือน",
    userId: empMedia.us_id,
    flowId: flowMediaFull.af_id,
    deviceId: childProjector1.dec_id,
    startDate: daysFromNow(1),
    endDate: daysFromNow(2),
    currentStage: 3,
    stages: [
      { name: "HOS Approval", role: "HOS", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "APPROVED", usId: hosMedia.us_id },
      { name: "HOD Approval", role: "HOD", deptId: media.dept_id, status: "APPROVED", usId: hodMedia.us_id },
      { name: "STAFF Distribution", role: "STAFF", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "PENDING" },
    ],
  });

  // 4. REJECTED - กล้อง (โดย Employee Media)
  await createTicketWithStages({
    status: "REJECTED",
    purpose: "ยืมไปถ่ายรูปงานวันเกิดเพื่อน",
    userId: empMedia.us_id,
    flowId: flowMedia.af_id,
    deviceId: childCam3.dec_id,
    startDate: daysFromNow(2),
    endDate: daysFromNow(3),
    currentStage: 1,
    stages: [
      { name: "HOS Approval", role: "HOS", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "REJECTED", usId: hosMedia.us_id },
      { name: "HOD Approval", role: "HOD", deptId: media.dept_id, status: "PENDING" },
    ],
  });

  // 5. COMPLETED - กล้อง (โดย Employee Media)
  await createTicketWithStages({
    status: "COMPLETED",
    purpose: "ถ่ายงาน Event คณะ",
    userId: empMedia.us_id,
    flowId: flowMedia.af_id,
    deviceId: childCam4.dec_id,
    startDate: daysAgo(10),
    endDate: daysAgo(7),
    currentStage: 2,
    stages: [
      { name: "HOS Approval", role: "HOS", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "APPROVED", usId: hosMedia.us_id },
      { name: "HOD Approval", role: "HOD", deptId: media.dept_id, status: "APPROVED", usId: hodMedia.us_id },
    ],
  });

  // 6. OVERDUE - โน้ตบุ๊ค (โดย Employee Media)
  await createTicketWithStages({
    status: "IN_USE",
    purpose: "ยืมไปทำกราฟิก",
    userId: empMedia.us_id,
    flowId: flowMediaFull.af_id,
    deviceId: childLaptop1.dec_id, // ตัวที่ส่งซ่อม แต่จำลองว่ายืมอยู่
    startDate: daysAgo(14),
    endDate: daysAgo(1), // เลยกำหนดคืนแล้ว
    currentStage: 3,
    stages: [
      { name: "HOS Approval", role: "HOS", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "APPROVED", usId: hosMedia.us_id },
      { name: "HOD Approval", role: "HOD", deptId: media.dept_id, status: "APPROVED", usId: hodMedia.us_id },
      { name: "STAFF Distribution", role: "STAFF", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "APPROVED", usId: staffMedia.us_id },
    ],
  });

  // 7. Bulk generation for pagination testing (30 more tickets)
  console.log("📑 Generating bulk tickets for pagination testing...");
  for (let i = 0; i < 30; i++) {
    await createTicketWithStages({
      status: i % 2 === 0 ? "PENDING" : "IN_USE",
      purpose: `Bulk Request #${i + 1}`,
      userId: empMedia.us_id,
      flowId: flowMedia.af_id,
      deviceId: childCam1.dec_id,
      startDate: daysFromNow(10 + i),
      endDate: daysFromNow(15 + i),
      currentStage: 1,
      stages: [
        { name: "HOS Approval", role: "HOS", deptId: media.dept_id, secId: sections.media[0].sec_id, status: "PENDING" },
        { name: "HOD Approval", role: "HOD", deptId: media.dept_id, status: "PENDING" },
      ],
    });
  }

  // ---- TICKET ISSUES (แจ้งซ่อม) ----
  console.log("🛠 Creating issues...");
  const issue = await prisma.ticket_issues.upsert({
    where: { ti_id: 1 },
    update: {},
    create: {
      ti_id: 1,
      ti_de_id: deviceLaptop.de_id,
      ti_title: "จอฟ้า เปิดไม่ติด",
      ti_description: "เปิดเครื่องแล้วขึ้น Blue Screen code 0x0000",
      ti_reported_by: empIT.us_id,
      ti_assigned_to: techIT.us_id,
      ti_status: "IN_PROGRESS",
      ti_result: "IN_PROGRESS",
      created_at: daysAgo(3),
    },
  });

  // ---- NOTIFICATIONS ----
  console.log("🔔 Creating notifications...");
  const noti = await prisma.notifications.create({
    data: {
      n_title: "มีคำร้องขออนุมัติใหม่",
      n_message: "คุณมีรายการยืม Laptop รออนุมัติ",
      n_base_event: "TICKET_CREATED",
      n_brt_id: 2, // Ticket Pending
    },
  });

  await prisma.notification_recipients.create({
    data: {
      nr_n_id: noti.n_id,
      nr_us_id: hodIT.us_id,
      nr_status: "UNREAD",
      nr_event: "APPROVAL_REQUESTED",
    },
  });

  // ---- LOGS & CHAT ----
  console.log("💬 Creating chat & logs...");
  const room = await prisma.chat_rooms.upsert({
    where: { cr_id: 1 },
    update: {},
    create: {
      cr_id: 1,
      cr_us_id: admin.us_id,
      cr_title: "สอบถามเกี่ยวกับระบบ",
      last_msg_at: daysAgo(1),
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

  // ---- DEVICE AVAILABILITIES ----
  console.log("📅 Creating device availabilities...");
  // สำหรับ ticket IN_USE (brt_id: 1)
  await prisma.device_availabilities.upsert({
    where: { da_id: 1 },
    update: {},
    create: {
      da_id: 1,
      da_dec_id: childCam2.dec_id,
      da_brt_id: 1,
      da_start: daysAgo(2),
      da_end: daysFromNow(5),
      da_status: "ACTIVE",
    },
  });
  // สำหรับ ticket COMPLETED (brt_id: 5)
  await prisma.device_availabilities.upsert({
    where: { da_id: 2 },
    update: {},
    create: {
      da_id: 2,
      da_dec_id: childCam4.dec_id,
      da_brt_id: 5,
      da_start: daysAgo(10),
      da_end: daysAgo(7),
      da_status: "COMPLETED",
    },
  });
  // สำหรับ ticket OVERDUE (brt_id: 6)
  await prisma.device_availabilities.upsert({
    where: { da_id: 3 },
    update: {},
    create: {
      da_id: 3,
      da_dec_id: childLaptop1.dec_id,
      da_brt_id: 6,
      da_start: daysAgo(14),
      da_end: daysAgo(1),
      da_status: "ACTIVE",
    },
  });

  // ---- LOG BORROW RETURNS ----
  console.log("📋 Creating borrow return logs...");
  await prisma.log_borrow_returns.createMany({
    data: [
      { lbr_action: "CREATED", lbr_old_status: null, lbr_new_status: "PENDING", lbr_brt_id: 1, lbr_actor_id: empMedia.us_id, lbr_note: "Employee created ticket" },
      { lbr_action: "APPROVED", lbr_old_status: "PENDING", lbr_new_status: "IN_USE", lbr_brt_id: 1, lbr_actor_id: hodMedia.us_id, lbr_note: "HOD approved" },
      { lbr_action: "CREATED", lbr_old_status: null, lbr_new_status: "PENDING", lbr_brt_id: 2, lbr_actor_id: empIT.us_id, lbr_note: "Employee created ticket" },
      { lbr_action: "REJECTED", lbr_old_status: "PENDING", lbr_new_status: "REJECTED", lbr_brt_id: 4, lbr_actor_id: hosMedia.us_id, lbr_note: "ไม่ใช่เหตุผลส่วนตัว" },
      { lbr_action: "RETURNED", lbr_old_status: "IN_USE", lbr_new_status: "COMPLETED", lbr_brt_id: 5, lbr_actor_id: staffMedia.us_id, lbr_note: "Returned successfully" },
    ],
    skipDuplicates: true,
  });

  // ---- LOG DEVICE CHILDS ----
  console.log("📋 Creating device child logs...");
  await prisma.log_device_childs.createMany({
    data: [
      { ldc_action: "BORROWED", ldc_old_status: "READY", ldc_new_status: "BORROWED", ldc_dec_id: childCam2.dec_id, ldc_brt_id: 1, ldc_actor_id: staffMedia.us_id, ldc_note: "Borrowed for video shoot" },
      { ldc_action: "BORROWED", ldc_old_status: "READY", ldc_new_status: "BORROWED", ldc_dec_id: childCam4.dec_id, ldc_brt_id: 5, ldc_actor_id: staffMedia.us_id, ldc_note: "Borrowed for event" },
      { ldc_action: "RETURNED", ldc_old_status: "BORROWED", ldc_new_status: "READY", ldc_dec_id: childCam4.dec_id, ldc_brt_id: 5, ldc_actor_id: staffMedia.us_id, ldc_note: "Returned in good condition" },
      { ldc_action: "MARK_DAMAGED", ldc_old_status: "READY", ldc_new_status: "REPAIRING", ldc_dec_id: childLaptop1.dec_id, ldc_ti_id: issue.ti_id, ldc_actor_id: techIT.us_id, ldc_note: "Blue screen issue" },
    ],
    skipDuplicates: true,
  });

  // ---- LOG ISSUES ----
  console.log("📋 Creating issue logs...");
  await prisma.log_issues.createMany({
    data: [
      { li_action: "REPORTED", li_old_status: null, li_new_status: "PENDING", li_ti_id: issue.ti_id, li_actor_id: empIT.us_id, li_note: "Reported blue screen" },
      { li_action: "ASSIGNED", li_old_status: "PENDING", li_new_status: "IN_PROGRESS", li_ti_id: issue.ti_id, li_actor_id: admin.us_id, li_note: "Assigned to tech" },
    ],
    skipDuplicates: true,
  });

  // ---- CART DEVICE CHILDS ----
  console.log("🛒 Creating cart device childs...");
  const cartItem = await prisma.cart_items.findFirst({ where: { cti_ct_id: cart.ct_id } });
  if (cartItem) {
    await prisma.cart_device_childs.upsert({
      where: { cdc_id: 1 },
      update: {},
      create: {
        cdc_id: 1,
        cdc_cti_id: cartItem.cti_id,
        cdc_dec_id: childCam1.dec_id,
        reserved_at: new Date(),
      },
    });
  }

  // ---- ADDITIONAL USERS (ครบทุก dept) ----
  console.log("👥 Creating additional users for other departments...");
  // HOD Marketing
  await prisma.users.upsert({
    where: { us_username: "hod.marketing" },
    update: {},
    create: {
      us_emp_code: "HOD-0003", us_firstname: "ปรีชา", us_lastname: "รุ่งเรือง",
      us_username: "hod.marketing", us_password: defaultPassword,
      us_email: "hod.marketing@company.com", us_phone: "0891234509",
      us_role: "HOD", us_dept_id: marketing.dept_id, us_sec_id: sections.marketing[0].sec_id,
    },
  });
  // HOS Marketing
  await prisma.users.upsert({
    where: { us_username: "hos.marketing.a" },
    update: {},
    create: {
      us_emp_code: "HOS-0002", us_firstname: "มณี", us_lastname: "แสงทอง",
      us_username: "hos.marketing.a", us_password: defaultPassword,
      us_email: "hos.marketing.a@company.com", us_phone: "0891234510",
      us_role: "HOS", us_dept_id: marketing.dept_id, us_sec_id: sections.marketing[0].sec_id,
    },
  });
  // STAFF IT
  await prisma.users.upsert({
    where: { us_username: "staff.it" },
    update: {},
    create: {
      us_emp_code: "STF-0002", us_firstname: "สุรชัย", us_lastname: "ยิ้มแย้ม",
      us_username: "staff.it", us_password: defaultPassword,
      us_email: "staff.it@company.com", us_phone: "0891234511",
      us_role: "STAFF", us_dept_id: it.dept_id, us_sec_id: sections.it[0].sec_id,
    },
  });
  // HOD Finance
  await prisma.users.upsert({
    where: { us_username: "hod.finance" },
    update: {},
    create: {
      us_emp_code: "HOD-0004", us_firstname: "ศิริพร", us_lastname: "บุญมา",
      us_username: "hod.finance", us_password: defaultPassword,
      us_email: "hod.finance@company.com", us_phone: "0891234512",
      us_role: "HOD", us_dept_id: finance.dept_id, us_sec_id: sections.finance[0].sec_id,
    },
  });
  // Employee Marketing
  await prisma.users.upsert({
    where: { us_username: "emp.marketing" },
    update: {},
    create: {
      us_emp_code: "EMP-0003", us_firstname: "วรรณา", us_lastname: "พึ่งบุญ",
      us_username: "emp.marketing", us_password: defaultPassword,
      us_email: "emp.marketing@company.com", us_phone: "0891234513",
      us_role: "EMPLOYEE", us_dept_id: marketing.dept_id, us_sec_id: sections.marketing[0].sec_id,
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

