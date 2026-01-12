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
async function getHomeStats() {
  const now = new Date();
  const next3Days = addDays(now, 3);

  // นับจำนวนคำร้องในแต่ละสถานะ
  const borrowedCount = await prisma.borrow_return_tickets.count({
    where: { brt_status: "IN_USE", deleted_at: null },
  });

  // คำร้องที่ใกล้ถึงวันคืน (ภายใน 3 วันข้างหน้า)
  const nearReturnCount = await prisma.borrow_return_tickets.count({
    where: {
      brt_status: "IN_USE",
      brt_end_date: { lte: next3Days, gte: now },
      deleted_at: null,
    },
  });

  // คำร้องที่รอการอนุมัติ
  const waitingCount = await prisma.borrow_return_tickets.count({
    where: { brt_status: "PENDING", deleted_at: null },
  });

  // คำร้องแจ้งซ่อมที่ยังไม่เสร็จสิ้น
  const reportCount = await prisma.ticket_issues.count({
    where: { ti_status: { not: "COMPLETED" }, deleted_at: null },
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
async function getRecentTickets() {
  const tickets: TicketWithRelations[] =
    await prisma.borrow_return_tickets.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      where: { deleted_at: null },
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
    const cleanSection = sectionName
      .replace(/^.*ฝ่ายย่อย\s*/i, "")
      .trim();

    return {
      id: ticket.brt_id,
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
        image: mainDevice?.de_images || null,
        max_borrow_days: mainDevice?.de_max_borrow_days || 0,
      },
      requester: {
        fullname: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
        empcode: ticket.requester.us_emp_code,
      },
    };
  });

  return formattedTickets;
}

export const homeService = {
  getHomeStats,
  getRecentTickets,
};
