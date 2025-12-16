/**
 * Description: Service สำหรับจัดการ Borrow-Return Tickets
 * - รองรับ Pagination, Filter by status, Search, และ Sorting
 * - Query ข้อมูลจาก Prisma พร้อม role-based filtering
 * Input : GetBorrowTicketQuery, IdParamDto
 * Output : PaginatedResult หรือ TicketDetail
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { GetBorrowTicketQuery } from "./borrow-return.schema.js";
import { Prisma, US_ROLE } from "@prisma/client";
import { prisma } from "../../../infrastructure/database/client.js";
import { IdParamDto } from "../../departments/departments.schema.js";

/**
 * Description: ดึงรายการ Borrow-Return Tickets ตาม query params
 * Input : GetBorrowTicketQuery, role, dept_id, sec_id
 * Output : { data, total, page, limit, paginated }
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
async function getBorrowReturnTicket(
  query: GetBorrowTicketQuery,
  role: string | undefined,
  dept_id: number | null | undefined,
  sec_id: number | null | undefined,
) {
  const { page = 1, limit = 10, status, search, sortField, sortDirection } = query;
  const skip = ((page || 1) - 1) * (limit || 10);

  // สร้าง orderBy ตาม sortField (default: created_at desc)
  let orderBy: Prisma.borrow_return_ticketsOrderByWithRelationInput = { created_at: "desc" };
  if (sortField) {
    const direction = sortDirection || "asc";
    switch (sortField) {
      case "device_name":
        orderBy = { ticket_devices: { _count: direction } }; // จัดเรียงตามจำนวน devices (workaround)
        break;
      case "quantity":
        orderBy = { brt_quantity: direction };
        break;
      case "requester":
        orderBy = { requester: { us_firstname: direction } };
        break;
      case "request_date":
        orderBy = { brt_start_date: direction };
        break;
      case "status":
        orderBy = { brt_status: direction };
        break;
      default:
        orderBy = { created_at: "desc" };
    }
  }

  const where: Prisma.borrow_return_ticketsWhereInput = {
    deleted_at: null,
    brt_status: {
      notIn: ["COMPLETED", "REJECTED"],
    },
  };

  // Filter by status - ถ้ามี status จาก query ให้ใช้ตามนั้น ถ้าไม่มีใช้ default
  if (status) {
    where.brt_status = status;
  } else {
    // Default: แสดงเฉพาะ PENDING, IN_USE, APPROVED
    where.brt_status = {
      in: ["PENDING", "IN_USE", "APPROVED"],
    };
  }

  // Search filter
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
      // ค้นหาจากรหัสอุปกรณ์ (serial number) เช่น PROJ-EPSON-001
      {
        ticket_devices: {
          some: {
            child: {
              device: {
                de_serial_number: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      },
      // ค้นหาจากหมวดหมู่
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

  // Filter: เห็นเฉพาะ request ที่ stage ของตัวเอง = PENDING (ถึง turn แล้ว)
  where.stages = {
    some: {
      brts_status: "PENDING", // เฉพาะ stage ที่รอตัวเองอนุมัติ (ถึง turn แล้ว)
      brts_role: role as US_ROLE,
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

  const [total, items] = await Promise.all([
    prisma.borrow_return_tickets.count({ where }),
    prisma.borrow_return_tickets.findMany({
      where,
      skip,
      take: limit || 10,
      orderBy,
      include: {
        requester: {
          select: {
            us_id: true,
            us_firstname: true,
            us_lastname: true,
            us_emp_code: true,
            us_images: true,
            department: { select: { dept_name: true, dept_id: true } },
            section: { select: { sec_name: true, sec_id: true } },
          },
        },
        ticket_devices: {
          include: {
            child: {
              select: {
                // dec_serial_number: true,
                // dec_asset_code: true,
                // dec_has_serial_number: true,
                // dec_status: true,
                device: {
                  select: {
                    de_serial_number: true,
                    de_name: true,
                    de_description: true,
                    de_location: true,
                    de_max_borrow_days: true,
                    de_images: true,
                    category: { select: { ca_name: true } },
                    section: {
                      select: {
                        sec_name: true,
                        department: {
                          select: { dept_name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // stages: {
        //   orderBy: { brts_step_approve: "asc" },
        // },
      },
    }),
  ]);

  const formattedData = items.map((item) => {
    const mainDevice = item.ticket_devices[0]?.child.device;
    // const deviceChild = item.ticket_devices[0]?.child;
    const deviceCount = item.brt_quantity;
    const dept = mainDevice?.section?.department?.dept_name ?? "";

    // const currentStage = item.stages[0];

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
        description: mainDevice ? mainDevice.de_description : "-",
        location: mainDevice ? mainDevice.de_location : "-",
        max_borrow_days: mainDevice ? mainDevice.de_max_borrow_days : "-",
        image: mainDevice ? mainDevice.de_images : null,
        category: mainDevice ? mainDevice.category.ca_name : "-",
        section: mainDevice?.section?.sec_name.replace(dept, "").trim() ?? "-",
        department: dept.replace(/แผนก/g, "").trim() ?? "-",
        total_quantity: deviceCount,
      },

      // device_child: {
      //   serial_number: deviceChild
      //     ? (deviceChild.dec_serial_number ?? "-")
      //     : "-",
      //   asset_code: deviceChild ? deviceChild.dec_asset_code : "-",
      //   has_serial_number: deviceChild
      //     ? deviceChild.dec_has_serial_number
      //     : "-",
      //   status: deviceChild ? deviceChild.dec_status : "-",
      // },

      // current_stage: currentStage
      //   ? {
      //     name: currentStage.brts_name,
      //     step: currentStage.brts_step_approve,
      //     status: currentStage.brts_status,
      //   }
      //   : null,
    };
  });

  return {
    data: formattedData,
    total,
    page: page || 1,
    limit: limit || 10,
    paginated: true as const,
  };
}

/**
 * Description: ดึงรายละเอียด Borrow-Return Ticket ตาม ID
 * Input : IdParamDto { id }
 * Output : TicketDetail พร้อมข้อมูล requester, devices, accessories, timeline
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
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
          // department: { select: { dept_name: true, dept_id: true } },
          // section: { select: { sec_name: true, sec_id: true } },
        },
      },

      ticket_devices: {
        include: {
          child: {
            select: {
              dec_id: true,
              dec_serial_number: true,
              dec_asset_code: true,
              dec_has_serial_number: true, //
              dec_status: true,
              device: {
                select: {
                  accessories: {
                    select: {
                      acc_id: true,
                      acc_name: true,
                      acc_quantity: true,
                    }
                  }
                }
              }
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
      reject_date: ticket.updated_at,
    },

    requester: {
      ...ticket.requester,
      fullname: `${ticket.requester.us_firstname} ${ticket.requester.us_lastname}`,
      // dept_id, dept, sec_id, section ถูก comment ออกจาก query
    },

    devices: ticket.ticket_devices.map((td) => ({
      child_id: td.child.dec_id,
      asset_code: td.child.dec_asset_code,
      serial: td.child.dec_serial_number || "-",
      current_status: td.child.dec_status,
      has_serial_number: td.child.dec_has_serial_number,
    })),

    // Accessories at top-level (shared across all device children from same parent device)
    accessories: ticket.ticket_devices[0]?.child.device?.accessories?.map((acc) => ({
      acc_id: acc.acc_id,
      acc_name: acc.acc_name,
      acc_quantity: acc.acc_quantity,
    })) || [],

    timeline: ticket.stages.map((stage) => ({
      role_name: stage.brts_name, // e.g., "Manager Approval"
      step: stage.brts_step_approve,
      required_role: stage.brts_role,
      dept_id: stage.brts_dept_id,
      dept_name: stage.brts_dept_name,
      sec_id: stage.brts_sec_id,
      sec_name: stage.brts_sec_name,
      status: stage.brts_status, // PENDING, APPROVED, REJECTED
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
