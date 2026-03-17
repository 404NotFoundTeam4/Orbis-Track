import { $Enums, US_ROLE, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";
import { ValidationError } from "../../errors/errors.js";
import xlsx from "xlsx";
import fs from "fs";
import {
  CreateDeviceChildPayload,
  CreateApprovalFlowsPayload,
  CreateDevicePayload,
  DeleteDeviceChildPayload,
  IdParamDto,
  UploadFileDeviceChildPayload,
  UpdateDevicePayload,
  UpdateDeviceChildPayload,
} from "./inventory.schema.js";

interface UploadDeviceChildRow {
  "Asset Code"?: string;
  "Serial Number"?: string;
  "Status"?: string;
}

/**
 * Description: ดึงข้อมูลอุปกรณ์แม่พร้อมอุปกรณ์ลูก
 * Input     : params (id) - รหัสอุปกรณ์แม่
 * Output    : ข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function getDeviceWithChilds(params: IdParamDto) {
  const { id } = params;

  const device = await prisma.devices.findFirst({
    where: {
      de_id: id,
      deleted_at: null,
      approval_flow: {
        af_is_active: true,
      },
    },
    select: {
      // อุปกรณ์แม่
      de_id: true,
      de_serial_number: true,
      de_name: true,
      de_description: true,
      de_location: true,
      de_max_borrow_days: true,
      de_images: true,
      de_af_id: true,
      de_ca_id: true,
      de_us_id: true,
      de_sec_id: true,
      // อุปกรณ์ลูก
      device_childs: {
        where: {
          deleted_at: null,
        },
        orderBy: { dec_id: "asc" },
        select: {
          dec_id: true,
          dec_serial_number: true,
          dec_asset_code: true,
          dec_status: true,
          dec_has_serial_number: true,
          dec_de_id: true,
        },
      },

      // หมวดหมู่
      category: {
        select: {
          ca_id: true,
          ca_name: true,
        },
      },

      // ฝ่ายย่อย
      section: {
        select: {
          sec_id: true,
          sec_name: true,
          department: {
            select: {
              dept_id: true,
              dept_name: true,
            },
          },
        },
      },

      // อุปกรณ์เสริม
      accessories: {
        where: {
          deleted_at: null,
        },
        select: {
          acc_id: true,
          acc_name: true,
          acc_quantity: true,
        },
      },

      // ลำดับการอนุมัติ
      approval_flow: {
        select: {
          af_id: true,
          af_name: true,
          steps: {
            where: {
              deleted_at: null,
            },
            select: {
              afs_id: true,
              afs_step_approve: true,
              afs_role: true,
              afs_dept_id: true,
              afs_sec_id: true,
            },
            orderBy: {
              afs_step_approve: "asc",
            },
          },
        },
      },
    },
  });
  console.log(device)
  return {
    ...device,
    total_quantity: device?.device_childs.length,
  };
}

/**
 * Description: เพิ่มอุปกรณ์ลูก
 * Input     : payload { dec_de_id, quantity } - รหัสของอุปกรณ์แม่และจำนวนอุปกรณ์ลูกที่ต้องการเพิ่ม
 * Output    : ข้อมูลอุปกรณ์ลูกที่เพิ่มใหม่
 * Logic     :
 *   - ดึง dec_de_id และ quantity จาก payload
 *   - ค้นหาอุปกรณ์แม่จาก dec_de_id และเอาข้อมูลชื่อกับ serial number
 *   - ถ้าค้นหาอุปกรณ์แม่ไม่เจอ ให้โยน error
 *   - ค้นหา Serial Number ของอุปกรณ์ลูกตัวล่าสุด
 *   - หา Serial Number ถัดไป
 *   - สร้าง Prefix Serial Number จากชื่ออุปกรณ์แม่
 *   - สร้าง Prefix Asset Code จาก Serial Number ของอุปกรณ์แม่
 *   - Loop เพิ่มอุปกรณ์ตามจำนวน quantity
 *   - คืนค่ารายการอุปกรณ์ลูกที่เพิ่มทั้งหมด
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function createDeviceChild(payload: CreateDeviceChildPayload) {
  const dec_de_id = payload[0].dec_de_id;

  // หาอุปกรณ์แม่
  const parent = await prisma.devices.findFirst({
    where: {
      de_id: dec_de_id,
      deleted_at: null,
    },
    select: {
      de_name: true,
      de_serial_number: true,
    },
  });

  if (!parent) throw new Error("Parent device not found");

  // กำหนด dec_has_serial_number จากค่า serial
  const dataWithFlag = payload.map(item => ({
    ...item,
    dec_has_serial_number: Boolean(item.dec_serial_number?.trim()),
  }));

  const newDeviceChilds = await prisma.device_childs.createMany({
    data: dataWithFlag
  });

  return newDeviceChilds;
}

/**
 * Description: เพิ่มอุปกรณ์ลูกโดยการอัปโหลดไฟล์ (CSV / Excel)
 * Input     : payload { de_id, filePath } - รหัสอุปกรณ์แม่และตำแหน่งไฟล์
 * Output    : message (string) - ข้อความแสดงผลลัพธ์ของการอัปโหลด
 * Logic     :
 *   - อ่านไฟล์ CSV / Excel ด้วย xlsx
 *   - แปลงข้อมูลเป็น JSON
 *   - ตรวจสอบไฟล์มีข้อมูลและ header ถูกต้อง
 *   - ตรวจสอบว่าอุปกรณ์แม่ว่ามีอยู่ในระบบ
 *   - ตรวจสอบว่า Asset Code ในไฟล์
 *   - ตรวจสอบความถูกต้องของข้อมูลแต่ละแถว
 *   - เพิ่มรายการอุปกรณ์ลูกลงฐานข้อมูล
 *   - ลบไฟล์ออกจาก Server หลังจากอัปโหลดเสร็จ
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function uploadFileDeviceChild(payload: UploadFileDeviceChildPayload) {
  const { de_id, filePath } = payload;

  try {
    const fileBuffer = fs.readFileSync(filePath); // อ่านไฟล์จาก path ที่ถูกอัปโหลดมา
    const workbook = xlsx.read(fileBuffer, { type: "buffer" }); // โหลดไฟล์ด้วย xlsx

    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // ใช้เฉพาะ sheet แรก
    const data = xlsx.utils.sheet_to_json<UploadDeviceChildRow>(sheet); // แปลงข้อมูล sheet ให้เป็น JSON array

    if (data.length === 0) throw new Error("ไม่มีข้อมูลในไฟล์นี้!"); // ตรวจสอบว่าไฟล์มีข้อมูลหรือไม่

    const requiredColumns = ["Asset Code", "Serial Number", "Status"]; // คอลัมน์ที่ต้องมีในไฟล์
    const headers = Object.keys(data[0] as UploadDeviceChildRow); // ดึง header จากแถวแรก

    // ตรวจสอบว่ามีคอลัมน์ที่ขาดหรือไม่
    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) throw new Error("รูปแบบข้อมูลไม่ถูกต้อง!");

    // ค้นหาข้อมูลอุปกรณ์แม่
    const parent = await prisma.devices.findFirst({
      where: {
        de_id,
        deleted_at: null,
      },
      select: {
        de_serial_number: true,
      },
    });

    if (!parent) throw new Error("ไม่พบอุปกรณ์แม่!");

    // เตรียม Asset Code ทั้งหมดจากไฟล์
    const assetCodes = data.map(row =>
      row["Asset Code"]?.trim()?.toUpperCase()
    ).filter(Boolean) as string[];

    // ค้นหาว่ามี Asset Code ที่ผูกกับอุปกรณ์แม่ตัวอื่นหรือไม่
    const existing = await prisma.device_childs.findMany({
      where: {
        dec_asset_code: {
          in: assetCodes
        },
        NOT: {
          dec_de_id: de_id
        },
      },
      select: {
        dec_asset_code: true
      },
    });

    if (existing.length > 0) {
      throw new Error("ไฟล์นี้ไม่ใช่ของอุปกรณ์ตัวนี้!");
    }

    // วนลูปเพื่อ map ข้อมูลในไฟล์
    const childs = data.map((row, index) => {
      const assetCode = row["Asset Code"]?.trim()?.toUpperCase();
      const serialNumber = row["Serial Number"]?.trim(); // ดึง Serial Number จากไฟล์
      const status = row["Status"]?.trim()?.toUpperCase() as $Enums.DEVICE_CHILD_STATUS;

      // ตรวจสอบ asset code ว่าง
      if (!assetCode) {
        throw new Error(`Asset Code ว่างที่แถว ${index + 2}`);
      }

      // ถ้า status ไม่ตรงกับ ENUM
      if (!status || !Object.values($Enums.DEVICE_CHILD_STATUS).includes(status)) {
        throw new Error(`สถานะไม่ถูกต้องที่แถว ${index + 2}`);
      }

      // คืนค่าข้อมูลที่พร้อม insert ลงฐานข้อมูล
      return {
        dec_serial_number: serialNumber || null,
        dec_asset_code: assetCode,
        dec_has_serial_number: Boolean(serialNumber),
        dec_status: status,
        dec_de_id: de_id,
      };
    });

    // บันทึกลงฐานข้อมูล
    await prisma.device_childs.createMany({
      data: childs,
      skipDuplicates: true, // ข้ามข้อมูลที่ซ้ำ
    });

    return { message: "อัปโหลดไฟล์สำเร็จ!" }
  } finally {
    if (fs.existsSync(filePath)) {
      // ลบไฟล์ออกจาก server
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Description: ลบอุปกรณ์ลูก
 * Input     : payload { dec_id } - รหัสอุปกรณ์ลูก (รองรับการลบแบบหลายรายการ)
 * Output    : { message: string } - ผลการลบอุปกรณ์ลูก
 * Logic     :
 *   - ดึง dec_id จาก payload
 *   - อัปเดต field deleted_at ของตาราง device_childs เป็นวันปัจจุบัน (soft delete)
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function deleteDeviceChild(payload: DeleteDeviceChildPayload) {
  const { dec_id } = payload;
  await prisma.device_childs.updateMany({
    where: {
      dec_id: {
        in: dec_id,
      },
    },
    data: {
      deleted_at: new Date(),
    },
  });

  return { message: "Delete device child successfully" };
}

/**
 * Description: สร้างอุปกรณ์หลัก พร้อมอุปกรณ์เสริมและอุปกรณ์ลูก
 * Input     :
 *   - payload: CreateDevicePayload
 *       - ข้อมูลอุปกรณ์หลัก
 *       - accessories (optional)
 *       - serialNumbers (optional)
 *       - totalQuantity จำนวนอุปกรณ์ลูก
 *   - images (optional): string - รูปภาพอุปกรณ์ (override payload)
 * Output    :
 *   - device: ข้อมูลอุปกรณ์หลักที่สร้างแล้ว
 *   - accessories: รายการอุปกรณ์เสริม
 * Logic     :
 *   - แยกข้อมูล accessories, serialNumbers, totalQuantity ออกจาก payload
 *   - เลือกรูปภาพจาก images → payload → null
 *   - ใช้ Prisma Transaction
 *     - สร้าง devices
 *     - ถ้ามี accessories → createMany ลง accessories
 *     - ถ้า totalQuantity > 0
 *         - สร้าง device_childs ตามจำนวน
 *         - สร้าง asset code และ serial number อัตโนมัติ
 * Author    : Panyapon Phollert (Ton) 66160086
 */

async function createDevice(payload: CreateDevicePayload, images?: string) {
  const {
    accessories,
    serialNumbers,
    totalQuantity,
    de_images: payloadImages,
    ...deviceData
  } = payload;
  const finalImages = images ?? payloadImages ?? null;

  return await prisma.$transaction(async (tx) => {
    const device = await tx.devices.create({
      data: {
        de_serial_number: deviceData.de_serial_number,
        de_name: deviceData.de_name,
        de_description: deviceData.de_description ?? null,
        de_location: deviceData.de_location,
        de_max_borrow_days: deviceData.de_max_borrow_days,
        de_af_id: deviceData.de_af_id,
        de_ca_id: deviceData.de_ca_id,
        de_us_id: deviceData.de_us_id,
        de_sec_id: deviceData.de_sec_id ?? 1, // Default to 1 if not provided
        de_images: finalImages,
        created_at: new Date(),
      },
    });

    if (accessories?.length) {
      await tx.accessories.createMany({
        data: accessories.map((a) => ({
          acc_name: a.acc_name,
          acc_quantity: a.acc_quantity,
          acc_de_id: device.de_id,
          created_at: new Date(),
        })),
      });
    }
    if (totalQuantity > 0) {
      const assetParts = device.de_serial_number.split("-")[0];
      const ASSET_PREFIX = assetParts;

      const data = Array.from({ length: totalQuantity }, (_, index) => {
        const serialNumber = String(index + 1).padStart(3, "0");
        const dec = serialNumbers?.[index];

        return {
          dec_serial_number: dec?.value || null,
          dec_asset_code: `ASSET-${ASSET_PREFIX}-${serialNumber}`,
          dec_has_serial_number: Boolean(dec?.value),
          dec_status: $Enums.DEVICE_CHILD_STATUS.READY,
          dec_de_id: device.de_id,
          created_at: new Date(),
        };
      });

      await tx.device_childs.createMany({ data });
    }

    return {
      ...device,
      accessories,
    };
  });
}

/**
 * Description: ดึงข้อมูลอุปกรณ์ทั้งหมด พร้อม approval flow และขั้นตอนอนุมัติ
 * Input     : -
 * Output    :
 *   - departments: แผนก (เติม prefix หัวหน้า)
 *   - sections: ฝ่ายย่อย (เติม prefix หัวหน้า)
 *   - categories: หมวดหมู่อุปกรณ์
 *   - approval_flows: flow การอนุมัติ
 *   - approval_flow_step: flow พร้อม steps และผู้อนุมัติ
 * Logic     :
 *   - ดึง users, departments, sections, categories,
 *     approval_flows และ approval_flow_steps พร้อมกัน
 *   - แปลง approval_flow_steps
 *     - STAFF → ผูกกับ section + dept
 *     - HOD → ผูกกับ department
 *     - HOS → ผูกกับ section
 *   - map ผู้ใช้ตาม role (แสดงสูงสุด 3 คน)
 *   - group steps ตาม af_id
 *   - รวม approval_flows กับ steps
 * Author : Panyapon Phollert (Ton) 66160086
 */

async function getAllDevices() {
  const [
    users,
    departments,
    sections,
    categories,
    approval_flows,
    approval_flow_steps,
  ] = await Promise.all([
    prisma.users.findMany({
       where: {
        deleted_at: null,
      },
      select: {
        us_id: true,
        us_firstname: true,
        us_lastname: true,
        us_role: true,
        us_dept_id: true,
        us_sec_id: true,
      },
    }),
    prisma.departments.findMany({
      select: {
        dept_id: true,
        dept_name: true,
      },
    }),
    prisma.sections.findMany({
      select: {
        sec_id: true,
        sec_name: true,
        sec_dept_id: true,
      },
    }),
    prisma.categories.findMany({
      where: {
        deleted_at: null
      },
      select: {
        ca_id: true,
        ca_name: true,
      },
    }),
    prisma.approval_flows.findMany({
      select: {
        af_id: true,
        af_name: true,
        af_us_id: true,
        af_is_active: true,
      },
    }),
    prisma.approval_flow_steps.findMany({
      select: {
        afs_id: true,
        afs_step_approve: true,
        afs_dept_id: true,
        afs_sec_id: true,
        afs_role: true,
        afs_af_id: true,
      },
    }),
  ]);

  const flow_steps = approval_flow_steps.map((afs) => {
    let name_role: string | null = null;
    let users_selected: any[] = [];

    /** ================= STAFF ================= */
    if (afs.afs_role === "STAFF") {
      const section = sections.find(
        (sec) =>
          sec.sec_id === afs.afs_sec_id && sec.sec_dept_id === afs.afs_dept_id
      );

      if (section) {
        const deptMatch = section.sec_name.match(/^แผนก(.+?)\s+ฝ่ายย่อย/);
        const deptName = deptMatch?.[1]?.trim();

        const letterMatch = section.sec_name.match(/ฝ่ายย่อย\s+([A-Z])$/);
        const letter = letterMatch?.[1];

        name_role = `เจ้าหน้าที่คลัง ${deptName} ฝ่ายย่อย ${letter}`;
      }

      users_selected = users
        .filter(
          (u) =>
            u.us_role === "HOS" &&
            u.us_sec_id === afs.afs_sec_id &&
            u.us_dept_id === afs.afs_dept_id
        )
        .slice(0, 3);
    } else if (afs.afs_role === "HOD") {
      /** ================= HOD ================= */
      const dept = departments.find((d) => d.dept_id === afs.afs_dept_id);

      const name = dept?.dept_name ?? null;
      name_role = `หัวหน้า${name}`;
      users_selected = users
        .filter((u) => u.us_role === "HOD" && u.us_dept_id === afs.afs_dept_id)
        .slice(0, 3);
    } else if (afs.afs_role === "HOS") {
      /** ================= HOS ================= */
      const section = sections.find(
        (sec) =>
          sec.sec_id === afs.afs_sec_id && sec.sec_dept_id === afs.afs_dept_id
      );
      const name = section?.sec_name ?? null;
      name_role = `หัวหน้า${name}`;

      users_selected = users
        .filter(
          (u) =>
            u.us_role === "HOS" &&
            u.us_sec_id === afs.afs_sec_id &&
            u.us_dept_id === afs.afs_dept_id
        )
        .slice(0, 3);
    }

    return {
      ...afs,
      afs_name: name_role,
      users: users_selected.map((u) => ({
        us_id: u.us_id,
        fullname: `${u.us_firstname} ${u.us_lastname}`,
      })),
    };
  });

  const flowMap = new Map<number, any[]>();

  for (const step of flow_steps) {
    if (!flowMap.has(step.afs_af_id)) {
      flowMap.set(step.afs_af_id, []);
    }
    flowMap.get(step.afs_af_id)!.push(step);
  }
  const approvalFlowsWithSteps = approval_flows.map((flow) => {
    const { af_name, af_is_active, ...rest } = flow;

    return {
      ...rest,
      steps: flowMap.get(flow.af_id) ?? [],
    };
  });

  const departmentsWithHead = departments.map((dept) => ({
    ...dept,
    dept_name: `หัวหน้า${dept.dept_name}`,
  }));

  const sectionsWithHead = sections.map((sec) => ({
    ...sec,
    sec_name: `หัวหน้า${sec.sec_name}`,
  }));

  return {
    departments: departmentsWithHead,
    sections: sectionsWithHead,
    categories,
    approval_flows: approval_flows,
    approval_flow_step: approvalFlowsWithSteps,
  };
}

/**
 * Description: สร้าง Approval Flow และขั้นตอนการอนุมัติ
 * Input     :
 *   - payload: CreateApprovalFlowsPayload
 *       - af_name: ชื่อ flow
 *       - af_us_id: ผู้สร้าง flow
 *       - approvalflowsstep: รายการขั้นตอนการอนุมัติ
 * Output    :
 *   - approvalflow: ข้อมูล flow ที่สร้าง
 *   - steps: จำนวนขั้นตอนที่สร้าง
 * Logic     :
 *   - ใช้ Prisma Transaction
 *     - สร้าง approval_flows
 *     - สร้าง approval_flow_steps แบบ createMany
 *     - ผูก afs_af_id กับ flow ที่สร้างใหม่
 * Author    : Panyapon Phollert (Ton) 66160086
 */

async function createApprovesFlows(payload: CreateApprovalFlowsPayload) {
  const { af_name, af_us_id, approvalflowsstep } = payload;
  return await prisma.$transaction(async (tx) => {
    const approvalFlow = await tx.approval_flows.create({
      data: {
        af_name,
        af_is_active: true,
        af_us_id,
        created_at: new Date(),
      },
    });

    const steps = await tx.approval_flow_steps.createMany({
      data: approvalflowsstep.map((step) => ({
        afs_step_approve: step.afs_step_approve,
        afs_dept_id: step.afs_dept_id ?? null,
        afs_sec_id: step.afs_sec_id ?? null,
        afs_role: step.afs_role as US_ROLE,
        afs_af_id: approvalFlow.af_id,
        created_at: new Date(),
      })),
    });

    return {
      approvalflow: approvalFlow,
      steps,
    };
  });
}

/**
 * Description: ดึงข้อมูลสำหรับตั้งค่า Approval (STAFF / HOD / HOS)
 * Input     : -
 * Output    :
 *   - departments: หัวหน้าแผนก (HOD)
 *   - sections: หัวหน้าฝ่ายย่อย (HOS)
 *   - staff: เจ้าหน้าที่คลัง แยกตามฝ่ายย่อย
 * Logic     :
 *   - ดึง departments, sections, users
 *   - STAFF
 *     - รวม section ที่ซ้ำกันด้วย Set
 *     - map ผู้ใช้ role HOS
 *   - HOD
 *     - map ตาม department
 *   - HOS
 *     - map ตาม section
 *   - แสดงผู้ใช้สูงสุด 3 คนต่อกลุ่ม
 * Author   : Panyapon Phollert (Ton) 66160086
 */

async function getAllApproves() {
  const [departments, sections, users] = await Promise.all([
    prisma.departments.findMany({
      select: {
        dept_id: true,
        dept_name: true,
      },
    }),
    prisma.sections.findMany({
      select: {
        sec_id: true,
        sec_name: true,
        sec_dept_id: true,
      },
    }),
    prisma.users.findMany({
      select: {
        us_id: true,
        us_firstname: true,
        us_lastname: true,
        us_dept_id: true,
        us_sec_id: true,
        us_role: true,
      },
    }),
  ]);

  const getUserName = (u: any) => `${u.us_firstname} ${u.us_lastname}`;

  /* ===============================
       1) STAFF (เฉพาะ role STAFF)
    =============================== */
  const seen = new Set<string>();

  const staffOptions = sections.reduce<
    {
      st_sec_id: number;
      st_dept_id: number;
      st_name: string;
      users: {
        us_id: number;
        us_name: string;
      }[];
    }[]
  >((acc: { st_sec_id: any; st_dept_id: any; st_name: string; users: any; }[], sec: { sec_name: string; sec_id: any; sec_dept_id: any; }) => {
    const deptMatch = sec.sec_name.match(/^แผนก(.+?)\s+ฝ่ายย่อย/);
    const deptName = deptMatch?.[1]?.trim();

    const letterMatch = sec.sec_name.match(/ฝ่ายย่อย\s+([A-Z])$/);
    const letter = letterMatch?.[1];

    if (!deptName || !letter || seen.has(`${deptName}-${letter}`)) {
      return acc;
    }

    seen.add(`${deptName}-${letter}`);

    const staffUsers = users
      .filter(
        (u) =>
          u.us_role === "HOS" &&
          u.us_sec_id === sec.sec_id &&
          u.us_dept_id === sec.sec_dept_id
      )
      .slice(0, 3);

    acc.push({
      st_sec_id: sec.sec_id,
      st_dept_id: sec.sec_dept_id,
      st_name: `เจ้าหน้าที่คลังแผนก ${deptName} ฝ่ายย่อย ${letter}`,
      users: staffUsers.map((u) => ({
        us_id: u.us_id,
        us_name: getUserName(u),
      })),
    });

    return acc;
  }, []);

  /* ===============================
       2) DEPARTMENTS (HOD)
    =============================== */
  const departmentsWithHead = departments.map((dept) => {
    const deptUsers = users
      .filter((u) => u.us_role === "HOD" && u.us_dept_id === dept.dept_id)
      .slice(0, 3);

    return {
      dept_id: dept.dept_id,
      dept_name: `หัวหน้า${dept.dept_name}`,
      users: deptUsers.map((u) => ({
        us_id: u.us_id,
        us_name: getUserName(u),
      })),
    };
  });

  /* ===============================
       3) SECTIONS (HOS)
    =============================== */
  const sectionsWithHead = sections.map((sec) => {
    const secUsers = users
      .filter((u) => u.us_role === "HOS" && u.us_sec_id === sec.sec_id)
      .slice(0, 3);

    return {
      sec_id: sec.sec_id,
      sec_dept_id: sec.sec_dept_id,
      sec_name: `หัวหน้า${sec.sec_name}`,
      users: secUsers.map((u) => ({
        us_id: u.us_id,
        us_name: getUserName(u),
      })),
    };
  });

  /* ===============================
       4) RETURN
    =============================== */
  return {
    departments: departmentsWithHead,
    sections: sectionsWithHead,
    staff: staffOptions,
  };
}

/**
 * Description: ดึงข้อมูลอุปกรณ์รายการเดียวตาม ID พร้อมข้อมูลความสัมพันธ์ (Category, Section, Children)
 * Input: params (IdParamDto) - Object ที่มี id ของอุปกรณ์
 * Output: ข้อมูลอุปกรณ์ที่จัดรูปแบบชื่อแผนก/ฝ่าย และจำนวนคงเหลือแล้ว
 * Author: Worrawat Namwat (Wave) 66160372
 */
async function getDeviceById(params: IdParamDto) {
  const { id } = params;
  const device = await prisma.devices.findUnique({
    where: { de_id: id },
    include: {
      category: true,
      section: { include: { department: true } },
      device_childs: {
        select: {
          dec_id: true,
          dec_serial_number: true,
          dec_status: true,
        },
      },
    },
  });

  if (!device) throw new Error("Device not found");

  const deptName = device.section?.department?.dept_name || "";
  let subSecName = device.section?.sec_name || "-";
  if (deptName && subSecName.startsWith(deptName)) {
    subSecName = subSecName.replace(deptName, "").trim();
  }

  return {
    ...device,
    category_name: device.category?.ca_name || "-",
    sub_section_name: subSecName,
    department_name: deptName,

    dept_id: device.section?.department?.dept_id || null,
    ca_id: device.de_ca_id,
    sec_id: device.de_sec_id,
    af_id: device.de_af_id,

    quantity: device.device_childs.length,
    device_childs: device.device_childs,
  };
}

/**
 * Description: ดึงข้อมูลอุปกรณ์ทั้งหมดพร้อมสถานะรวมของอุปกรณ์
 * Input: -
 * Output: รายการอุปกรณ์ทั้งหมด พร้อมสถานะ
 * Author: Worrawat Namwat (Wave) 66160372
 */
async function getAllWithDevices() {
  const devices = await prisma.devices.findMany({
    where: { deleted_at: null },
    include: {
      category: true,
      section: { include: { department: true } },
      device_childs: {
        where: {
          deleted_at: null
        },
        select: {
          dec_id: true,
          dec_serial_number: true,
          dec_status: true,
        },
      },
      approval_flow: true,
    },
    orderBy: { created_at: "desc" },
  });

  const formattedDevices = devices.map((item) => {
    // Logic: คำนวณสถานะรวมของ Device แม่ โดยดูจากลูกๆ (Device Childs)
    const hasBorrowedItem = item.device_childs.some(
      (child) => child.dec_status === "BORROWED"
    );
    const availableQuantity = item.device_childs.filter(
      (c) => c.dec_status === "READY"
    ).length;
    const totalQuantity = item.device_childs.length;

    let statusType = "READY";
    if (hasBorrowedItem) {
      statusType = "BORROWED"; // ถ้ามีลูกตัวใดตัวหนึ่งถูกยืม -> สถานะรวมเป็น "ยืม"
    } else if (totalQuantity > 0 && availableQuantity === 0) {
      statusType = "OUT_OF_STOCK"; // ถ้ามีของแต่ไม่พร้อมใช้งาน "ของหมด"
    } else if (totalQuantity === 0) {
      statusType = "OUT_OF_STOCK"; // ถ้าไม่มีของเลย -> "ของหมด"
    }

    // Logic ตัดคำเหมือนเดิม
    const deptName = item.section?.department?.dept_name || "";
    let subSecName = item.section?.sec_name || "-";
    if (deptName && subSecName.startsWith(deptName)) {
      subSecName = subSecName.replace(deptName, "").trim();
    }

    return {
      ...item,
      category_name: item.category?.ca_name || "-",
      sub_section_name: subSecName, // ชื่อฝ่ายย่อยที่ตัดแล้ว
      department_name: deptName,

      dept_id: item.section?.department?.dept_id || null,
      ca_id: item.de_ca_id,
      sec_id: item.de_sec_id,
      af_id: item.de_af_id,

      quantity: totalQuantity,
      available: availableQuantity,
      status_type: statusType,
      device_childs: item.device_childs,
    };
  });
  return formattedDevices;
}

/**
 * Description: ลบอุปกรณ์แบบ Soft Delete
 * Input: de_id (number) - รหัสอุปกรณ์
 * Output: Object ที่ระบุ ID และเวลาที่ถูกลบ
 * Author: Worrawat Namwat (Wave) 66160372
 */
export async function softDeleteDevice(de_id: number) {
  const device = await prisma.devices.findUnique({ where: { de_id } });
  if (!device) throw new Error("Device not found");

  const updated = await prisma.devices.update({
    where: { de_id },
    data: { deleted_at: new Date() },
    select: { de_id: true, deleted_at: true },
  });

  return { de_id: updated.de_id, deletedAt: updated.deleted_at };
}

/** * Description: แก้ไขข้อมูลอุปกรณ์
 * Input: id (number) - รหัสอุปกรณ์
 *        data (UpdateDevicePayload) - ข้อมูลอุปกรณ์ที่ต้องการแก้ไข
 * Output: ข้อมูลอุปกรณ์ที่ถูกแก้ไขแล้ว
 * Author: Worrawat Namwat (Wave) 66160372
 */
export async function updateDevice(
  id: number,
  data: UpdateDevicePayload,
  images?: string
) {
  const {
    accessories,
    serialNumbers,
    totalQuantity,
    de_images: payloadImages,
    ...deviceData
  } = data;
  const finalImages = images ?? payloadImages ?? null;
  const existing = await prisma.devices.findUnique({
    where: { de_id: id },
  });

  if (!existing) {
    throw new Error("Device not found");
  }

  const updated = await prisma.devices.update({
    where: { de_id: id },
    data: {
      de_serial_number: deviceData.de_serial_number,
      de_name: deviceData.de_name,
      de_description: deviceData.de_description,
      de_location: deviceData.de_location,
      de_max_borrow_days: deviceData.de_max_borrow_days,
      ...(deviceData.de_af_id !== undefined && { de_af_id: deviceData.de_af_id }),
      ...(deviceData.de_ca_id !== undefined && { de_ca_id: deviceData.de_ca_id }),
      ...(deviceData.de_us_id !== undefined && { de_us_id: deviceData.de_us_id }),
      ...(deviceData.de_sec_id !== undefined && { de_sec_id: deviceData.de_sec_id }),
      de_images: finalImages,
      updated_at: new Date(),
    } as Prisma.devicesUncheckedUpdateInput,
  });
  if (Array.isArray(accessories)) {
    const incomingAccIds = accessories
      .filter(a => a.acc_id)
      .map(a => a.acc_id);

    // 1. soft delete
    await prisma.accessories.updateMany({
      where: {
        acc_de_id: id,
        deleted_at: null,
        acc_id: {
          notIn: incomingAccIds.length ? incomingAccIds : [0],
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });

    // 2. update
    for (const acc of accessories) {
      if (!acc.acc_id) continue;

      await prisma.accessories.update({
        where: { acc_id: acc.acc_id },
        data: {
          acc_name: acc.acc_name,
          acc_quantity: Number(acc.acc_quantity),
          updated_at: new Date(),
          deleted_at: null,
        },
      });
    }

    // 3. create
    const newAccs = accessories.filter(a => !a.acc_id);
    if (newAccs.length) {
      await prisma.accessories.createMany({
        data: newAccs.map(acc => ({
          acc_de_id: id,
          acc_name: acc.acc_name,
          acc_quantity: Number(acc.acc_quantity),
          created_at: new Date(),
        })),
      });
    }
  }



  return updated;
}

// ดึงข้อมูลลำดับการอนุมัติ
async function getApprovalFlows() {
  return await prisma.approval_flows.findMany({
    where: { deleted_at: null, af_is_active: true },
    include: { steps: { orderBy: { afs_step_approve: "asc" } } },
    orderBy: { af_id: "asc" },
  });
}

// ดึงข้อมูลพื้นฐานสำหรับหน้าสร้างอุปกรณ์
async function getDefaultsdata() {
  return await getAllDevices();
}

/**
 * Description: ดึง asset code ล่าสุด ของอุปกรณ์ลูก
 * Input: params (number) - รหัสอุปกรณ์แม่
 * Output: asset code ล่าสุด
 * Author: Thakdanai Makmi (Ryu) 66160355
 */
async function getLastAssetCode(params: IdParamDto) {
  const { id } = params;

  // ดึง asset code ล่าสุด
  const childs = await prisma.device_childs.findFirst({
    where: {
      dec_de_id: id
    },
    orderBy: {
      dec_asset_code: "desc"
    },
    select: {
      dec_asset_code: true
    }
  });

  return childs ? { decAssetCode: childs.dec_asset_code } : null;
}

/**
* Description: ดึงข้อมูล status ทั้งหมดของอุปกรณ์ลูก
* Input     : -
* Output    : status ทั้งหมดของอุปกรณ์ลูกจาก Enum
* Author    : Thakdanai Makmi (Ryu) 66160355
*/
async function getDeviceChildStatus() {
  return Object.values($Enums.DEVICE_CHILD_STATUS)
}

/**
* Description: อัปเดตข้อมูลอุปกรณ์ลูก
* Input     : payload - id พร้อมค่าที่ต้องการแก้ไข
* Output    : รายการอุปกรณ์ลูกที่ถูกอัปเดตแล้ว (id, serial number, status)
* Author    : Thakdanai Makmi (Ryu) 66160355
*/
async function updateDeviceChild(payload: UpdateDeviceChildPayload) {
  const ids = payload.map(item => item.id); // ดึง id ทั้งหมด
  // ตรวจสอบว่ามี device child นั้นจริง
  const existing = await prisma.device_childs.findMany({
    where: {
      dec_id: { in: ids }
    },
    select: {
      dec_id: true
    }
  });
  // ไม่พบบางรายการ
  if (existing.length !== ids.length) {
    throw new Error("Some device child not found");
  }
  // อัปเดต โดยป้องกันการ rollback หากเกิด error
  await prisma.$transaction(async (tx) => {
    // วนลูปข้อมจาก payload
    for (const item of payload) {
      await tx.device_childs.update({
        where: {
          dec_id: item.id
        },
        data: {
          // อัปเดต serialNumber เฉพาะเมื่อมีการส่งมา
          ...(item.serialNumber !== undefined && {
            dec_serial_number: item.serialNumber
          }),
          // อัปเดต status เฉพาะเมื่อมีการส่งมา
          ...(item.status !== undefined && {
            dec_status: item.status
          })
        }
      });
    }
  });
  // ดึงข้อมูลล่าสุดหลัง update
  const updatedRecords = await prisma.device_childs.findMany({
    where: { dec_id: { in: ids } },
    select: {
      dec_id: true,
      dec_serial_number: true,
      dec_status: true
    }
  });
  // แปลงชื่อ field
  const result = updatedRecords.map(device => ({
    id: device.dec_id,
    serialNumber: device.dec_serial_number,
    status: device.dec_status
  }));

  return result;
}

export const inventoryService = {
  getDeviceWithChilds,
  createDeviceChild,
  uploadFileDeviceChild,
  getAllWithDevices,
  deleteDeviceChild,
  getDeviceById,
  getAllDevices,
  softDeleteDevice,
  updateDevice,
  getApprovalFlows,
  createApprovesFlows,
  getAllApproves,
  createDevice,
  getDefaultsdata,
  getLastAssetCode,
  getDeviceChildStatus,
  updateDeviceChild
};
