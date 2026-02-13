import { prisma } from "../../infrastructure/database/client.js";
import {
  AddToCartPayload,
  CreateBorrowTicketPayload,
  IdParamDto,
} from "./borrows.schema.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { SocketEmitter } from "../../infrastructure/websocket/socket.emitter.js";
import { US_ROLE } from "@prisma/client";

/**
 * Description: ดึงข้อมูลทอุปกรณ์
 * Input : -
 * Output : รายการอุปกรณ์ (ข้อมูลอุปกรณ์ หมวดหมู่ แผนก ฝ่ายย่อย จำนวนอุปกรณ์ทั้งหมด จำนวนอุปกรณ์ที่พร้อมใช้งาน)
 * Author: Sutaphat Thahin (Yeen) 66160378
 */
async function getInventory() {
  const devices = await prisma.devices.findMany({
    where: {
      deleted_at: null,
    },
    select: {
      de_id: true,
      de_serial_number: true,
      de_name: true,
      de_description: true,
      de_location: true,
      de_max_borrow_days: true,
      de_images: true,
      category: {
        select: {
          ca_name: true,
        },
      },
      section: {
        select: {
          sec_name: true,
        },
      },
      // นับจำนวน device ทั้งหมด
      _count: {
        select: {
          device_childs: true,
        },
      },
      // นับจำนวน device ที่สถานะ READY
      device_childs: {
        where: {
          dec_status: "READY",
        },
        select: {
          dec_status: true,
        },
      },
    },
  });

  // ฟังก์ชันแยกแชื่อแผนก แและ ฝ่ายย่อย
  function extractDepartmentAndSection(sectionName: string) {
    const match = sectionName.match(/แผนก\s*(.*?)\s*ฝ่ายย่อย\s*(.*)/); // แยก แผนก และ ฝ่ายย่อย ออกจากข้อความเดียวกัน

    return {
      department: match?.[1]?.trim(), // ข้อความหลังคำว่า แผนก
      sub_section: match?.[2]?.trim(), // ข้อความหลังคำว่า ฝ่ายย่อย
    };
  }

  // Destructure เอาเฉพาะ fields ที่ต้องการ
  const result = devices.map(
    ({ section, category, device_childs, _count, ...device }) => {
      // แยกแชื่อแผนก แและ ฝ่ายย่อย
      const { department, sub_section } = section?.sec_name
        ? extractDepartmentAndSection(section.sec_name)
        : { department: null, sub_section: null };

      return {
        ...device,
        category: category.ca_name,
        department,
        sub_section,
        total: _count.device_childs,
        available: device_childs.length,
      };
    },
  );

  return result;
}

/**
 * Description : ดึงข้อมูลรายการอุปกรณ์ที่ใช้สำหรับการยืม
 * Input : params - รหัสอุปกรณ์แม่
 * Output : ข้อมูลอุปกรณ์แม่, หมวดหมู่, อุปกรณ์เสริม, แผนก, ฝ่ายย่อย, จำนวนอุปกรณ์ทั้งหมดและที่พร้อมใช้งาน
 * Author: Thakdanai Makmi (Ryu) 66160355
 */
async function getDeviceForBorrow(params: IdParamDto) {
  const { id } = params;

  // ข้อมูลอุปกรณ์
  const device = await prisma.devices.findFirst({
    where: {
      de_id: id,
      deleted_at: null,
    },
    select: {
      // อุปกรณ์แม่
      de_serial_number: true,
      de_name: true,
      de_description: true,
      de_location: true,
      de_max_borrow_days: true,
      de_images: true,

      // หมวดหมู่อุปกรณ์
      category: {
        select: {
          ca_name: true,
        },
      },

      // อุปกรณ์เสริม
      accessories: {
        select: {
          acc_name: true,
          acc_quantity: true,
        },
      },

      // แผนกและฝ่ายย่อย
      section: {
        select: {
          sec_name: true,
        },
      },
    },
  });

  if (!device) {
    throw new Error("Device not found");
  }

  // จำนวนอุปกรณ์ทั้งหมด
  const total = await prisma.device_childs.count({
    where: {
      deleted_at: null,
      dec_de_id: id,
    },
  });

  // จำนวนอุปกรณ์ที่พร้อมให้ยืม (ทั้งหมด)
  const ready = await prisma.device_childs.count({
    where: {
      deleted_at: null,
      dec_de_id: id,
      dec_status: "READY",
    },
  });

  /**
   * Description: ฟังก์ชันสำหรับแยกชื่อแผนกและฝ่ายย่อยออกจากข้อความเดียวกัน
   * Input : sectionName - ข้อความชื่อแผนกและฝ่ายย่อยรวมกัน
   * Output : { department - แผนก, section - ฝ่ายย่อย }
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  function extractDepartmentAndSection(sectionName: string) {
    const match = sectionName.match(/แผนก\s*(.*?)\s*ฝ่ายย่อย\s*(.*)/); // แยก แผนก และ ฝ่ายย่อย ออกจากข้อความเดียวกัน

    return {
      department: match?.[1]?.trim(), // ข้อความหลังคำว่า แผนก
      section: match?.[2]?.trim(), // ข้อความหลังคำว่า ฝ่ายย่อย
    };
  }

  // แยก department และ section หลังจากใช้งานฟังก์ชัน extractDepartmentAndSection
  const { department, section } = extractDepartmentAndSection(
    device.section?.sec_name ?? "",
  );

  return {
    ...device,
    department,
    section,
    total,
    ready,
  };
}

/**
 * Description : ดึงข้อมูลรายการอุปกรณ์ที่ถูกยืม
 * Input : params - รหัสอุปกรณ์แม่
 * Output : รายการอุปกรณ์และเวลาที่ถูกยืม
 * Author: Thakdanai Makmi (Ryu) 66160355
 */
async function getAvailable(params: IdParamDto) {
  const { id } = params;

  // ดึงข้อมูลอุปกรณ์ลูกที่กำลังถูกยืมอยู่
  const deviceChilds = await prisma.device_childs.findMany({
    where: {
      dec_de_id: id,
      deleted_at: null,
    },
    select: {
      dec_id: true,
      dec_serial_number: true,
      dec_asset_code: true,
      dec_status: true,

      availabilities: {
        where: {
          da_status: "ACTIVE",
        },
        select: {
          da_start: true,
          da_end: true,
        },
      },
    },
  });

  // เปลี่ยนจากคำว่า availabilities ให้เป็น activeBorrow เพื่อให้สื่อความหมาย
  const devices = deviceChilds.map((device) => ({
    dec_id: device.dec_id,
    dec_serial_number: device.dec_serial_number,
    dec_asset_code: device.dec_asset_code,
    dec_status: device.dec_status,
    activeBorrow: device.availabilities.map((borrowed) => ({
      da_start: borrowed.da_start,
      da_end: borrowed.da_end,
    })),
  }));

  return devices;
}

/**
 * Description : สร้าง ticket คำร้องยืมอุปกรณ์
 * Input : payload - ข้อมูลในการยืมอุปกรณ์
 * Output : รหัสคำร้องการยืมอุปกรณ์ สถานะ วันที่เริ่มยืม วันสิ้นสุด และอุปกรณ์ลูก
 * Author: Thakdanai Makmi (Ryu) 66160355
 */
async function createBorrowTicket(
  payload: CreateBorrowTicketPayload & { userId: number },
) {
  const { userId, deviceChilds, borrowStart, borrowEnd, reason, placeOfUse } =
    payload;

  const result = await prisma.$transaction(async (tx) => {
    // ค้นหารหัส Preset ของอุปกรณ์แม่
    const device = await tx.devices.findFirst({
      where: {
        device_childs: {
          some: {
            dec_id: deviceChilds[0],
          },
        },
      },
    });

    // สร้าง borrow return ticket
    const ticket = await tx.borrow_return_tickets.create({
      data: {
        brt_user_id: userId,
        brt_borrow_purpose: reason,
        brt_usage_location: placeOfUse,
        brt_start_date: borrowStart,
        brt_end_date: borrowEnd,
        brt_quantity: deviceChilds.length,
        brt_current_stage: 1,
        brt_af_id: device?.de_af_id,
        brt_status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // ดึงข้อมูลลำดับการอนุมัติ
    const stages = await tx.approval_flow_steps.findMany({
      where: {
        afs_af_id: device?.de_af_id,
        deleted_at: null,
      },
      orderBy: {
        afs_step_approve: "asc",
      },
    });

    // ดึงข้อมูลแผนกทั้งหมด
    const departments = await tx.departments.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        dept_id: true,
        dept_name: true,
      },
    });

    // ดึงข้อมูลฝ่ายย่อยทั้งหมด
    const sections = await tx.sections.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        sec_id: true,
        sec_name: true,
        sec_dept_id: true,
      },
    });

    /**
     * Description: ฟังก์ชันสำหรับดึงชื่อแผนกจากรหัสแผนก
     * Input : deptId - รหัสแผนก
     * Output : ชื่อแผนก
     * Author : Thakdanai Makmi (Ryu) 66160355
     **/
    const getDeptName = (deptId?: number | null) =>
      departments.find((d) => d.dept_id === deptId)?.dept_name ?? null;

    /**
     * Description: ฟังก์ชันสำหรับดึงชื่อฝ่ายย่อยจากรหัสฝ่ายย่อย
     * Input : secId - รหัสฝ่ายย่อย
     * Output : ชื่อฝ่ายย่อย
     * Author : Thakdanai Makmi (Ryu) 66160355
     **/
    const getSecName = (secId?: number | null) =>
      sections.find((s) => s.sec_id === secId)?.sec_name ?? null;

    // step ล่าสุดจาก approval flow
    const lastStep = stages.length + 1;

    // หา section และ department ของอุปกรณ์
    const section = sections.find((sec) => sec.sec_id === device?.de_sec_id);
    const department = departments.find(
      (dept) => dept.dept_id === section?.sec_dept_id,
    );

    // สร้าง borrow return ticket stages
    await tx.borrow_return_ticket_stages.createMany({
      data: stages.map((flow) => ({
        brts_status: "PENDING",
        brts_name: `${flow.afs_role} Approval`,
        brts_step_approve: flow.afs_step_approve,
        brts_role: flow.afs_role,
        brts_dept_id: flow.afs_dept_id,
        brts_sec_id: flow.afs_sec_id,
        brts_dept_name: getDeptName(flow.afs_dept_id),
        brts_sec_name: getSecName(flow.afs_sec_id),
        brts_brt_id: ticket.brt_id,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });

    const approveStages = await tx.borrow_return_ticket_stages.findMany({
      where: {
        brts_brt_id: ticket.brt_id,
      },
    });

    const firstApproveStage = approveStages[0];

    const nextApprovers = await tx.users.findMany({
      where: {
        us_role: firstApproveStage.brts_role as US_ROLE,
        us_is_active: true,
        ...(firstApproveStage.brts_role === "HOD"
          ? { us_dept_id: firstApproveStage.brts_dept_id }
          : {
            us_dept_id: firstApproveStage.brts_dept_id,
            us_sec_id: firstApproveStage.brts_sec_id,
          }),
      },
      select: { us_id: true },
    });

    // เพิ่ม stage STAFF ในลำดับสุดท้าย
    await tx.borrow_return_ticket_stages.create({
      data: {
        brts_status: "PENDING",
        brts_name: "STAFF Distribution",
        brts_step_approve: lastStep,
        brts_role: "STAFF",

        brts_dept_id: department?.dept_id ?? null,
        brts_sec_id: section?.sec_id ?? null,
        brts_dept_name: department?.dept_name ?? null,
        brts_sec_name: section?.sec_name ?? null,

        brts_brt_id: ticket.brt_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // สร้าง ticket device
    await tx.ticket_devices.createMany({
      data: deviceChilds.map((decId) => ({
        td_brt_id: ticket.brt_id,
        td_dec_id: decId,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });

    // เปลี่ยนสถานะอุปกรณ์ (แต่ละตัวที่ถูกยืม)
    await tx.device_availabilities.createMany({
      data: deviceChilds.map((decId) => ({
        da_dec_id: decId,
        da_brt_id: ticket.brt_id,
        da_start: borrowStart,
        da_end: borrowEnd,
        da_status: "ACTIVE",
      })),
    });

    // ดึงข้อมูลชื่อและนามสกุลของผู้ใช้จาก userId
    const user = await tx.users.findUnique({
      where: {
        us_id: userId,
      },
      select: {
        us_firstname: true,
        us_lastname: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // สร้าง log borrow return
    await tx.log_borrow_returns.create({
      data: {
        lbr_action: "CREATED",
        lbr_new_status: "CREATED",
        lbr_note: `${user.us_firstname} ${user.us_lastname} ส่งคำร้องการยืมอุปกรณ์`,
        lbr_brt_id: ticket.brt_id,
        lbr_actor_id: userId,
      },
    });

    return {
      brt_id: ticket.brt_id,
      brt_status: ticket.brt_status,
      brt_start_date: ticket.brt_start_date,
      brt_end_date: ticket.brt_end_date,
      brt_quantity: ticket.brt_quantity,
      nextApprovers,
    };
  });

  await notificationsService.createNotification({
    recipient_ids: result.nextApprovers.map((approver) => approver.us_id),
    title: "แจ้งเตือนคำขอยืมใหม่",
    message: `มีคำขอยืมกำลังรออนุมัติ`,
    base_event: "TICKET_STAGE_PASSED",
    event: "APPROVAL_REQUESTED",
    brt_id: result.brt_id,
    target_route: `/request-borrow-ticket/${result.brt_id}`,
  });

  // Emit socket event to refresh request page for approvers (realtime update)
  result.nextApprovers.forEach((approver) => {
    SocketEmitter.toUser(approver.us_id, "REFRESH_REQUEST_PAGE", {
      ticketId: result.brt_id,
    });
  });

  return result;
}

/**
 * Description : เพิ่มอุปกรณ์ลงรถเข็น
 * Input : payload - ข้อมูลในการยืมอุปกรณ์
 * Output : รหัสรถเข็น และรหัสรายการอุปกรณ์ในรถเข็น
 * Author: Thakdanai Makmi (Ryu) 66160355
 */
async function addToCart(payload: AddToCartPayload & { userId: number }) {
  const {
    userId,
    deviceId,
    borrower,
    phone,
    reason,
    placeOfUse,
    quantity,
    borrowStart,
    borrowEnd,
    deviceChilds,
  } = payload;

  // ให้การเขียนข้อมูลหลายตาราง "สำเร็จพร้อมกัน" ถ้าขั้นตอนไหนพัง จะ rollback ทั้งหมด
  return prisma.$transaction(async (tx) => {
    // ค้นหารถเข็นล่าสุดของผู้ใช้
    let cart = await tx.carts.findFirst({
      where: {
        ct_us_id: userId,
        deleted_at: null,
      },
      orderBy: {
        ct_id: "desc",
      },
    });

    // ถ้ายังไม่มีรถเข็น ให้สร้างใหม่
    if (!cart) {
      cart = await tx.carts.create({
        data: {
          ct_us_id: userId,
          created_at: new Date(),
        },
      });
    }

    // หา cartItem เดิมทั้งหมดของ (cart เดียวกัน + device เดียวกัน) ไม่สน deleted_at
    const dupItems = await tx.cart_items.findMany({
      where: {
        cti_ct_id: cart.ct_id,
        cti_de_id: deviceId,
      },
      select: { cti_id: true },
    });

    if (dupItems.length > 0) {
      const dupIds = dupItems.map((item) => item.cti_id);

      // ลบลูกก่อน (กัน FK พัง)
      await tx.cart_device_childs.deleteMany({
        where: { cdc_cti_id: { in: dupIds } },
      });

      // hard delete ตัวแม่
      await tx.cart_items.deleteMany({
        where: { cti_id: { in: dupIds } },
      });
    }

    // สร้าง cartItem ใหม่
    const cartItem = await tx.cart_items.create({
      data: {
        cti_us_name: borrower,
        cti_phone: phone,
        cti_note: reason,
        cti_usage_location: placeOfUse,
        cti_quantity: quantity,
        cti_start_date: borrowStart,
        cti_end_date: borrowEnd,
        cti_ct_id: cart.ct_id,
        cti_de_id: deviceId,
        created_at: new Date(),
        updated_at: new Date(), // ใส่ไว้กันกรณี updated_at เป็น not null
        deleted_at: null,
      },
    });

    // ถ้ามีอุปกรณ์ลูก
    if (Array.isArray(deviceChilds) && deviceChilds.length > 0) {
      await tx.cart_device_childs.createMany({
        data: deviceChilds.map((decId: number) => ({
          cdc_cti_id: cartItem.cti_id,
          cdc_dec_id: decId,
          created_at: new Date(),
        })),
      });
    }

    return {
      cartId: cart.ct_id,
      cartItemId: cartItem.cti_id,
    };
  });
}

/**
 * Description : ดึงข้อมูล Device Availabilities ทั้งหมดในระบบ
 * Input : -
 * Output : รายการ device_availabilities ทั้งหมด
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getDeviceAvailabilities() {
  const availabilities = await prisma.device_availabilities.findMany({
    select: {
      da_id: true,
      da_dec_id: true,
      da_brt_id: true,
      da_start: true,
      da_end: true,
      da_status: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { da_start: "asc" },
  });

  return availabilities;
}

/**
 * Description : ตรวจสอบและเตรียมรถเข็น (Cart) ของผู้ใช้
 * - ค้นหารถเข็นที่ยังใช้งานอยู่ (deleted_at = null) ของผู้ใช้
 * - หากพบรถเข็นเดิม จะใช้งานรถเข็นนั้นต่อ
 * - หากไม่พบรถเข็น จะสร้างรถเข็นใหม่ให้ผู้ใช้
 *
 * Input  : userId - รหัสผู้ใช้ที่ต้องการตรวจสอบรถเข็น
 * Output : { message: string } - สถานะการทำงานของฟังก์ชัน
 * Author : Nontapat Sinthum (Guitar) 66160104
 */
async function checkCart(userId: number) {
  const id = userId;

  return prisma.$transaction(async (tx) => {
    //หา cart ของ user
    const existingCart = await tx.carts.findFirst({
      where: { ct_us_id: id, deleted_at: null },
      orderBy: { ct_id: "asc" },
      select: { ct_id: true, ct_us_id: true },
    });

    //ถ้าไม่มี cart -> สร้าง cart ใหม่
    const cart =
      existingCart ??
      (await tx.carts.create({
        data: {
          ct_us_id: id,
          created_at: new Date(),
        },
        select: { ct_id: true, ct_us_id: true },
      }));

    return { massage: "success" };
  });
}
export const borrowService = {
  getInventory,
  getDeviceForBorrow,
  getAvailable,
  createBorrowTicket,
  addToCart,
  getDeviceAvailabilities,
  checkCart,
};
