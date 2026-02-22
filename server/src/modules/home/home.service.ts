import { prisma } from "../../infrastructure/database/client.js";
import { Prisma } from "@prisma/client";

/**
 * Description: ฟังก์ชันช่วยคำนวณวันล่วงหน้า (ใช้หาช่วงเวลาคืนของที่จะถึงกำหนด)
 * Input     : date (วันที่ตั้งต้น), days (จำนวนวันที่ต้องการบวกเพิ่ม)
 * Output    : Date object ใหม่
 * Author    : Worrawat Namwat (Wave) 66160372
 */
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Type สำหรับดึงข้อมูลคำร้องพร้อมความสัมพันธ์ที่จำเป็น
type TicketWithRelations = Prisma.borrow_return_ticketsGetPayload<{
  include: {
    requester: true;
    ticket_devices: {
      include: {
        child: {
          include: {
            device: {
              include: {
                category: true;
                section: { include: { department: true } };
                _count: {
                  select: { accessories: true };
                };
              };
            };
          };
        };
      };
    };
  };
}>;

// Type สำหรับดึงข้อมูล Stage พร้อมความสัมพันธ์ที่จำเป็น
type TicketStageWithRelations = Prisma.borrow_return_ticket_stagesGetPayload<{
  include: {
    approver: true;
    department: true;
    section: true;
  };
}>;

// Type สำหรับดึงรายละเอียดคำร้องพร้อมความสัมพันธ์ที่จำเป็น
type HomeTicketDetailWithRelations = Prisma.borrow_return_ticketsGetPayload<{
  include: {
    requester: {
      include: { department: true };
    };
    stages: {
      include: {
        approver: true;
        department: true;
        section: true;
      };
    };
    ticket_devices: {
      include: {
        child: {
          include: {
            device: {
              include: {
                accessories: true;
              };
            };
          };
        };
      };
    };
  };
}>;

/**
 * Description: คำนวณสถิติ Dashboard 4 ช่อง (ยืมอยู่, ใกล้คืน, รออนุมัติ, แจ้งซ่อม)
 * Input     : -
 * Output    : Object { borrowed, returned, waiting, report }
 * Author    : Worrawat Namwat (Wave) 66160372
 */
async function getHomeStats(userId: number) {
  const now = new Date();
  const next3Days = addDays(now, 3);

  const myFilter = {
    brt_user_id: userId,
    deleted_at: null,
  };

  // นับจำนวนคำร้องในแต่ละสถานะ
  const borrowedCount = await prisma.borrow_return_tickets.count({
    where: { ...myFilter, brt_status: "IN_USE", deleted_at: null },
  });

  // คำร้องที่ใกล้ถึงวันคืน (ภายใน 3 วันข้างหน้า)
  const nearReturnCount = await prisma.borrow_return_tickets.count({
    where: {
      ...myFilter,
      brt_status: "IN_USE",
      brt_end_date: { lte: next3Days, gte: now },
      deleted_at: null,
    },
  });

  // คำร้องที่รอการอนุมัติ
  const waitingCount = await prisma.borrow_return_tickets.count({
    where: { ...myFilter, brt_status: "PENDING", deleted_at: null },
  });

  // คำร้องแจ้งซ่อมที่ยังไม่เสร็จสิ้น
  const reportCount = await prisma.ticket_issues.count({
    where: {
      ti_status: { not: "COMPLETED" },
      deleted_at: null,
      ticket: {
        brt_user_id: userId, // เช็คว่าเป็น Ticket ของเรา
      },
    },
  });

  return {
    borrowed: borrowedCount,
    returned: nearReturnCount,
    waiting: waitingCount,
    report: reportCount,
  };
}

/**
 * Description: ดึงข้อมูลคำร้องล่าสุด 5 รายการ พร้อมรายละเอียดที่จำเป็น
 * Input     : -
 * Output    : Array ของคำร้องพร้อมรายละเอียด
 * Author    : Worrawat Namwat (Wave) 66160372
 */
async function getRecentTickets(userId: number) {
  const tickets: TicketWithRelations[] =
    await prisma.borrow_return_tickets.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      where: {
        deleted_at: null
        , brt_user_id: userId,
      },
      include: {
        requester: true,
        ticket_devices: {
          include: {
            child: {
              include: {
                device: {
                  include: {
                    category: true,
                    section: { include: { department: true } },
                    _count: {
                      select: { accessories: true }
                    }
                  },
                },
              },
            },
          },
        },
      },
    });

  // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
  const formattedTickets = tickets.map((ticket) => {
    const deviceChild = ticket.ticket_devices[0]?.child;
    const mainDevice = deviceChild?.device;
    const deptName = mainDevice?.section?.department?.dept_name || "-";
    const sectionName = mainDevice?.section?.sec_name || "-";

    // ตัดคำ "แผนก " ออก
    const cleanDept = deptName.replace(/^แผนก\s*/, "");

    // ตัด "แผนก มีเดีย ฝ่ายย่อย " ให้เหลือแค่ตัวอักษรท้าย
    const cleanSection = sectionName.replace(/^.*ฝ่ายย่อย\s*/i, "").trim();

    return {
      id: ticket.brt_id,
      request_date: ticket.created_at?.toISOString() || null,
      status: ticket.brt_status,
      dates: {
        start: ticket.brt_start_date.toISOString(),
        end: ticket.brt_end_date.toISOString(),
        pickup: ticket.brt_pickup_datetime
          ? ticket.brt_pickup_datetime.toISOString()
          : null,
        return: ticket.brt_return_datetime
          ? ticket.brt_return_datetime.toISOString()
          : null,
      },
      device_summary: {
        name: mainDevice?.de_name || "Unknown Device",
        // ใช้ serial ของลูก (child) ถ้ามี หรือของแม่ (main)
        serial_number:
          deviceChild?.dec_serial_number || mainDevice?.de_serial_number || "-",
        total_quantity: ticket.brt_quantity,
        category: mainDevice?.category?.ca_name || "-",
        department: cleanDept || "-",
        section: cleanSection || "-",
        description: mainDevice?.de_description || null,
        accessories: mainDevice?._count?.accessories ?? 0,
        image: mainDevice?.de_images || null,
        max_borrow_days: mainDevice?.de_max_borrow_days || 0,
      },
      requester: {
        fullname: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
        empcode: ticket.requester.us_emp_code,
        borrow_user: ticket.brt_user,
        borrow_phone: ticket.brt_phone
      },
    };
  });

  return formattedTickets;
}

// ดึงรายละเอียดคำร้องโดย ID
async function getTicketDetailById(id: number) {
  const ticket = await prisma.borrow_return_tickets.findUnique({
    where: { brt_id: id },
    include: {
      requester: { include: { department: true } },
      stages: {
        include: {
          approver: true,
          department: true,
          section: true,
        },
        orderBy: { brts_step_approve: "asc" },
      },
      ticket_devices: {
        include: {
          child: {
            include: {
              device: {
                include: {
                  accessories: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ticket) throw new Error("Ticket not found");
  // Logic หาคนอนุมัติ (Approvers)
  const timeline = await Promise.all(
    ticket.stages.map(async (stage) => {
      let approvers: string[] = [];

      // ถ้ายังไม่อนุมัติ (PENDING) -> หาชื่อคนที่มีสิทธิ์
      if (stage.brts_status === "PENDING") {
        const potentialApprovers = await prisma.users.findMany({
          where: {
            us_role: stage.brts_role,
            us_is_active: true,
            ...(stage.brts_dept_id ? { us_dept_id: stage.brts_dept_id } : {}),
            ...(stage.brts_sec_id ? { us_sec_id: stage.brts_sec_id } : {}),
          },
          select: { us_firstname: true, us_lastname: true },
          take: 5,
        });
        approvers = potentialApprovers.map(
          (u) => `${u.us_firstname} ${u.us_lastname}`
        );
      }

      return {
        step: stage.brts_step_approve,
        status: stage.brts_status,
        role_name: stage.brts_role,
        dept_name: stage.brts_dept_name || stage.department?.dept_name || null,
        approved_by: stage.approver
          ? `${stage.approver.us_firstname} ${stage.approver.us_lastname}`
          : null,
        updated_at: stage.updated_at ? stage.updated_at.toISOString() : null,
        approvers: approvers, // ส่งรายชื่อกลับไปหน้าบ้าน
      };
    })
  );

  // หาอุปกรณ์ชิ้นแรกเพื่อดึงข้อมูลอุปกรณ์เสริม (ถ้ามี)
  const firstDevice = ticket.ticket_devices[0]?.child?.device;

  return {
    id: ticket.brt_id,
    status: ticket.brt_status,
    timeline: timeline,
    details: {
      id: ticket.brt_id,
      current_stage: ticket.brt_current_stage || 0,

      // Key สำคัญ: ต้องใช้ชื่อ 'purpose' ให้ตรงกับหน้าบ้าน
      purpose: ticket.brt_borrow_purpose,
      location_use: ticket.brt_usage_location,
      reject_reason: ticket.brt_reject_reason,
      reject_date: ticket.updated_at ? ticket.updated_at.toISOString() : null,

      dates: {
        start: ticket.brt_start_date.toISOString(),
        end: ticket.brt_end_date.toISOString(),
        pickup: ticket.brt_pickup_datetime?.toISOString() || null,
        return: ticket.brt_return_datetime?.toISOString() || null,
      },
      locations: {
        pickup: ticket.brt_pickup_location,
        return: ticket.brt_return_location,
      },
    },
    devices: ticket.ticket_devices.map((td) => ({
      child_id: td.child.dec_id,
      asset_code: td.child.dec_asset_code,
      serial_number: td.child.dec_serial_number,
      status: td.child.dec_status,
      name: td.child.device.de_name,
      image: td.child.device.de_images,
      current_status: td.child.dec_status,
      has_serial_number: Boolean(
        td.child.dec_serial_number && td.child.dec_serial_number !== "-"
      ),
    })),
    accessories:
      firstDevice?.accessories && firstDevice.accessories.length > 0
        ? [
          {
            acc_id: firstDevice.accessories[0].acc_id,
            acc_name: firstDevice.accessories[0].acc_name,
            acc_quantity: firstDevice.accessories[0].acc_quantity,
          },
        ]
        : [],
    requester: {
      id: ticket.requester.us_id,
      fullname: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
      empcode: ticket.requester.us_emp_code,
      image: ticket.requester.us_images,
      department: ticket.requester.department?.dept_name || "-",
      us_phone: ticket.requester.us_phone,
      borrow_user: ticket.brt_user,
      borrow_phone: ticket.brt_phone
    },
  };
}

export const homeService = {
  getHomeStats,
  getRecentTickets,
  getTicketDetailById,
};