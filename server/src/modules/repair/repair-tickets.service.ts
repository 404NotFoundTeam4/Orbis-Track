import { prisma } from "../../infrastructure/database/client.js";
import { Prisma, ticket_issues, TI_STATUS } from "@prisma/client";
import { GetRepairTicketsQuery, RepairTicketItem } from "./repair-tickets.schema.js";

export const repairTicketsService = {
  async getRepairTickets(query: GetRepairTicketsQuery) {
    const { page, limit, search, status, start_date, end_date } = query;
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.ticket_issuesWhereInput = {
      deleted_at: null,
      ...(status && { ti_status: status }),
      ...(start_date && end_date && {
        created_at: {
          gte: new Date(start_date),
          lte: new Date(new Date(end_date).setHours(23, 59, 59)),
        }
      }),
      ...(search && {
        OR: [
          { ti_title: { contains: search, mode: 'insensitive' } },
          { device: { de_name: { contains: search, mode: 'insensitive' } } },
          { reporter: { us_firstname: { contains: search, mode: 'insensitive' } } },
          { reporter: { us_emp_code: { contains: search, mode: 'insensitive' } } },
        ]
      })
    };

    const [totalItems, tickets] = await Promise.all([
      prisma.ticket_issues.count({ where: whereCondition }),
      prisma.ticket_issues.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          device: {
            include: { category: true } 
          },
          reporter: {
            include: { 
              department: true, 
              section: true    
            }
          },
          issue_devices: {
            include: { device_child: true }
          },
          assignee: true,
        }
      })
    ]);

    type TicketType = typeof tickets[number];
    type IssueDeviceType = NonNullable<TicketType["issue_devices"]>[number];

    const formattedData: RepairTicketItem[] = tickets.map((t: TicketType) => {
      const childDevice = t.issue_devices?.[0]?.device_child;
      const assetCode = childDevice?.dec_asset_code 
                     || childDevice?.dec_serial_number 
                     || t.device?.de_serial_number 
                     || null;
                     
      // หาจำนวนอุปกรณ์ (ถ้ามีการผูก issue_devices ไว้หลายชิ้นก็ใช้ค่านั้น ถ้าไม่มีก็ตีเป็น 1)
      const quantity = t.issue_devices && t.issue_devices.length > 0 ? t.issue_devices.length : 1;

      const rawDept = t.reporter?.department?.dept_name || "";
      const rawSection = t.reporter?.section?.sec_name || "";

      // ตัดคำ "แผนก " ออกจาก rawDept
      const cleanDept = rawDept.replace(/^แผนก\s*/, "");

      // "แผนก มีเดีย ฝ่ายย่อย " ให้เหลือแค่ตัวอักษรท้ายจาก rawSection
      const cleanSection = rawSection.replace(/^.*ฝ่ายย่อย\s*/i, "").trim();

      const reportedDevices = t.issue_devices?.map((id: IssueDeviceType) => ({
        asset_code: id.device_child?.dec_asset_code || id.device_child?.dec_serial_number || "-",
        serial_number: id.device_child?.dec_serial_number || null
      })) || [];
      
      return {
        id: t.ti_id,
        ticket_no: `TI-${t.ti_id.toString().padStart(5, '0')}`,
        status: t.ti_status,
        dates: {
          created: t.created_at.toISOString(),
          updated: t.updated_at ? t.updated_at.toISOString() : null,
        },
        device_info: {
          name: t.device?.de_name || "ไม่ระบุอุปกรณ์",
          asset_code: assetCode !== "-" ? assetCode : null,
          category: t.device?.category?.ca_name || "ไม่ระบุหมวดหมู่",
          quantity: quantity,
          location: t.device?.de_location || "-", 
          image: t.device?.de_images || null,
          reported_devices: reportedDevices,
        },
        problem: {
          title: t.ti_title || "ไม่ระบุหัวข้อ",
          description: t.ti_description || "-",
        },
        requester: {
          user_id: t.reporter?.us_id || 0,
          emp_code: t.reporter?.us_emp_code || "-",
          fullname: t.reporter ? `${t.reporter.us_firstname} ${t.reporter.us_lastname}` : "ไม่ระบุชื่อ",
          department: cleanDept || "-",
          section: cleanSection || "-",
        },
        approver: t.assignee ? {
          fullname: `${t.assignee.us_firstname} ${t.assignee.us_lastname}`,
        } : null,
      };
    });

    return {
      status: "success",
      data: formattedData,
      pagination: {
        page,
        limit,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      }
    };
  },
  
  async approveTicket(ticketId: number, approverId: number): Promise<ticket_issues> {

    console.log("approveTicket called:", { ticketId, approverId });

    // ตรวจสอบ ticket มีจริงไหม
    const existingTicket = await prisma.ticket_issues.findUnique({
      where: { ti_id: ticketId }
    });

    if (!existingTicket) {
      throw new Error("ไม่พบ ticket นี้");
    }

    // ตรวจสอบ user มีจริงไหม
    const existingUser = await prisma.users.findUnique({
      where: { us_id: approverId }
    });

    if (!existingUser) {
      throw new Error("ไม่พบ user นี้");
    }

    // update
    const updatedTicket = await prisma.ticket_issues.update({
      where: { ti_id: ticketId },
      data: {
        ti_status: TI_STATUS.IN_PROGRESS,
        ti_assigned_to: approverId
      }
    });

    console.log("update success");

    return updatedTicket;
  }
};