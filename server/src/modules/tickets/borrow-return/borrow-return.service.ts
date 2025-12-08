import { GetBorrowTicketQuery } from "./borrow-return.schema.js";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/client.js";
import { IdParamDto } from "../../departments/departments.schema.js";

async function getBorrowReturnTicket(
  query: GetBorrowTicketQuery,
  userId: number | undefined,
  role: string | undefined,
  dept_id: number | null | undefined,
  sec_id: number | null | undefined,
) {
  const { page = 1, limit = 10, status, search, type = "ALL" } = query;
  const skip = ((page || 1) - 1) * (limit || 10);
  const where: Prisma.borrow_return_ticketsWhereInput = {
    deleted_at: null,
    brt_status: {
      notIn: ["COMPLETED", "REJECTED"],
    },
  };

  if (status) {
    where.brt_status = status;
  }

  if (search) {
    const searchNum = Number(search);
    where.OR = [
      {
        requester: { us_firstname: { contains: search, mode: "insensitive" } },
      },
      { requester: { us_lastname: { contains: search, mode: "insensitive" } } },
      { requester: { us_emp_code: { contains: search, mode: "insensitive" } } },
      // ค้นหาจากชื่ออุปกรณ์
      {
        ticket_devices: {
          some: {
            child: {
              device: {
                de_name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      },
      {
        ticket_devices: {
          some: {
            child: {
              device: {
                category: {
                  ca_name: { contains: search, mode: "insensitive" },
                },
              },
            },
          },
        },
      },
    ];

    // ถ้า search เป็นตัวเลข ให้ค้นหา ID ได้ด้วย
    if (!isNaN(searchNum)) {
      where.OR.push({ brt_id: searchNum });
    }
  }

  switch (type) {
    case "MY_ACTIVE":
      where.brt_user_id = userId;
      where.brt_status = "IN_USE";
      break;

    case "MY_REQUEST":
      // รายการที่ฉันเป็นคนขอ
      where.brt_user_id = userId;
      break;

    case "MY_APPROVAL":
      // รายการที่ "รอฉันอนุมัติ"
      where.brt_status = {
        in: ["PENDING", "IN_USE", "APPROVED"],
      };
      where.stages = {
        some: {
          brts_status: {
            in: ["PENDING", "APPROVED"],
          },
          brts_role: role,

          AND: [
            {
              OR: [{ brts_dept_id: null }, { brts_dept_id: dept_id }],
            },
            {
              OR: [{ brts_sec_id: null }, { brts_sec_id: sec_id }],
            },
          ],
        },
      };
      break;

    // case "HISTORY":
    //   where.brt_status = { in: ["COMPLETED", "REJECTED"] };
    //   break;

    case "MY_HISTORY":
      where.brt_user_id = userId;
      where.brt_status = { in: ["COMPLETED", "REJECTED"] };
      break;

    case "MY_APPROVAL_HISTORY":
      where.stages = {
        some: {
          brts_us_id: userId,
          brts_status: { in: ["APPROVED", "REJECTED"] },
        },
      };
      break;

    case "ALL":
    default:
      if (role === "EMPLOYEE" || role === "STAFF") {
        // where.brt_user_id = user.userId;
      }
      break;
  }

  const [total, items] = await Promise.all([
    prisma.borrow_return_tickets.count({ where }),
    prisma.borrow_return_tickets.findMany({
      where,
      skip,
      take: limit || 10,
      orderBy: { created_at: "desc" },
      include: {
        requester: {
          select: {
            us_id: true,
            us_firstname: true,
            us_lastname: true,
            us_emp_code: true,
            us_images: true,
            department: { select: { dept_name: true } },
          },
        },
        ticket_devices: {
          include: {
            child: {
              select: {
                dec_serial_number: true,
                dec_asset_code: true,
                dec_has_serial_number: true,
                dec_status: true,
                device: {
                  select: {
                    de_name: true,
                    de_serial_number: true,
                    de_location: true,
                    de_images: true,
                    category: { select: { ca_name: true } },
                    section: { select: { sec_name: true } },
                  },
                },
              },
            },
          },
        },
        stages: {
          orderBy: { brts_step_approve: "asc" },
        },
      },
    }),
  ]);

  const formattedData = items.map((item) => {
    const mainDevice = item.ticket_devices[0]?.child.device;
    const deviceChild = item.ticket_devices[0]?.child;
    const deviceCount = item.brt_quantity;

    const currentStage = item.stages[0];

    return {
      id: item.brt_id,
      status: item.brt_status,
      created_at: item.created_at,
      request_date: item.brt_start_date,

      requester: {
        id: item.requester.us_id,
        fullname: `${item.requester.us_firstname} ${item.requester.us_lastname}`,
        empcode: item.requester.us_emp_code,
        image: item.requester.us_images,
        department: item.requester.department?.dept_name || "-",
      },

      device_summary: {
        name: mainDevice ? mainDevice.de_name : "Unknown Device",
        serial_number: mainDevice ? mainDevice.de_serial_number : "-",
        location: mainDevice ? mainDevice.de_location : "-",
        image: mainDevice ? mainDevice.de_images : "-",
        category: mainDevice ? mainDevice.category.ca_name : "-",
        section: mainDevice ? mainDevice.section : "-",
        total_quantity: deviceCount,
        more_count: deviceCount > 1 ? deviceCount - 1 : 0,
      },

      device_child: {
        serial_number: deviceChild ? deviceChild.dec_serial_number : "-",
        asset_code: deviceChild ? deviceChild.dec_asset_code : "-",
        has_serial_number: deviceChild
          ? deviceChild.dec_has_serial_number
          : "-",
        status: deviceChild ? deviceChild.dec_status : "-",
      },

      current_stage: currentStage
        ? {
            name: currentStage.brts_name,
            step: currentStage.brts_step_approve,
            status: currentStage.brts_status,
          }
        : null,
    };
  });

  return {
    data: formattedData,
    total,
    page,
    limit,
    paginated: true,
  };
}

async function getBorrowReturnTicketById(params: IdParamDto) {
  const { id } = params;
  const ticket = await prisma.borrow_return_tickets.findUnique({
    where: { brt_id: id },
    include: {
      requester: {
        select: {
          us_id: true,
          us_firstname: true,
          us_lastname: true,
          us_emp_code: true,
          us_images: true,
          us_email: true,
          us_phone: true,
          department: { select: { dept_name: true } },
          section: { select: { sec_name: true } },
        },
      },

      ticket_devices: {
        include: {
          child: {
            select: {
              dec_id: true,
              dec_serial_number: true,
              dec_asset_code: true,
              dec_status: true,
              device: {
                select: {
                  de_id: true,
                  de_name: true,
                  de_images: true,
                  de_location: true,
                  category: { select: { ca_name: true } },
                },
              },
            },
          },
        },
      },

      stages: {
        orderBy: { brts_step_approve: "asc" },
        include: {
          approver: {
            // คนที่กดอนุมัติ (ถ้ามี)
            select: { us_firstname: true, us_lastname: true, us_role: true },
          },
        },
      },

      // logs_borrow: {
      //   orderBy: { created_at: "desc" },
      //   include: {
      //     actor: {
      //       select: { us_firstname: true, us_lastname: true },
      //     },
      //   },
      // },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return {
    id: ticket.brt_id,
    status: ticket.brt_status,
    details: {
      purpose: ticket.brt_borrow_purpose,
      location_use: ticket.brt_usage_location,
      quantity: ticket.brt_quantity,
      current_stage: ticket.brt_current_stage,
      dates: {
        start: ticket.brt_start_date,
        end: ticket.brt_end_date,
        pickup: ticket.brt_pickup_datetime,
        return: ticket.brt_return_datetime,
      },
      locations: {
        pickup: ticket.brt_pickup_location,
        return: ticket.brt_return_location,
      },
      reject_reason: ticket.brt_reject_reason,
    },

    requester: {
      ...ticket.requester,
      fullname: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
      dept_id: ticket.requester.department?.dept_id,
      dept: ticket.requester.department?.dept_name,
      sec_id: ticket.requester.section?.sec_id,
      section: ticket.requester.section?.sec_name,
    },

    devices: ticket.ticket_devices.map((td) => ({
      child_id: td.child.dec_id,
      name: td.child.device.de_name,
      asset_code: td.child.dec_asset_code,
      serial: td.child.dec_serial_number || "-",
      image: td.child.device.de_images,
      category: td.child.device.category.ca_name,
      current_status: td.child.dec_status,
    })),

    timeline: ticket.stages.map((stage) => ({
      step: stage.brts_step_approve,
      role_name: stage.brts_name, // e.g., "Manager Approval"
      required_role: stage.brts_role,
      status: stage.brts_status, // PENDING, APPROVED, REJECTED
      dept_id: stage.brts_dept_id,
      dept_name: stage.brts_dept_name,
      sec_id: stage.brts_sec_id,
      sec_name: stage.brts_sec_name,
      approved_by: stage.approver
        ? `${stage.approver.us_firstname} ${stage.approver.us_lastname}`
        : null,
      updated_at: stage.updated_at,
    })),

    // History Log ละเอียด
    // logs: ticket.logs_borrow.map((log) => ({
    //   action: log.lbr_action,
    //   actor: log.actor
    //     ? `${log.actor.us_firstname} ${log.actor.us_lastname}`
    //     : "System",
    //   note: log.lbr_note,
    //   timestamp: log.created_at,
    //   status_change:
    //     log.lbr_old_status && log.lbr_new_status
    //       ? `${log.lbr_old_status} -> ${log.lbr_new_status}`
    //       : null,
    // })),
  };
}

export const borrowReturnService = {
  getBorrowReturnTicket,
  getBorrowReturnTicketById,
};
