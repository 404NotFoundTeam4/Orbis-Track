/**
 * Service: History Issue
 * หน้าที่:
 * - query ticket_issues พร้อม relation ที่จำเป็น
 * - map เป็น DTO ให้ตรงกับ schema (historyIssueItemSchema / historyIssueDetailResponseSchema)
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
import { prisma } from "../../infrastructure/database/client.js";
import { Prisma } from "@prisma/client";
import type {
  GetHistoryIssueQuery,
  HistoryIssueDetail,
  HistoryIssueItem,
} from "./history-issue.schema.js";

/**
 * Description: include สำหรับ Prisma เพื่อดึง relation ที่จำเป็นของ ticket_issues
 * Input : -
 * Output : Prisma include object (ใช้ใน findMany/findFirst)
 * Author: Chanwit Muangma (Boom) 66160224
 */
const ticketIssueInclude = Prisma.validator<Prisma.ticket_issuesInclude>()({
  device: {
    include: {
      category: true,
      section: {
        include: {
          department: true,
        },
      },
    },
  },
  reporter: true,
  assignee: true,
  ticket: true,

  /**
   * Description: รูปแนบของการแจ้งซ่อม (แยกจากรูปอุปกรณ์แม่)
   * - ดึงเฉพาะที่ไม่ถูกลบ (soft delete)
   * - เรียงตามเวลาอัปโหลด
   * Author: Chanwit Muangma (Boom) 66160224
   */
  attachments: {
    where: { deleted_at: null },
    orderBy: { uploaded_at: "asc" },
  },

  /**
   * Description: อุปกรณ์ลูกใน Ticket
   * - ดึงเฉพาะที่ไม่ถูกลบ
   * - include device_child เพื่อเอา asset_code / serial_number / status
   * Author: Chanwit Muangma (Boom) 66160224
   */
  issue_devices: {
    where: {
      deleted_at: null,
      device_child: {
        deleted_at: null,
      },
    },
    include: {
      device_child: true,
    },
  },
});

/**
 * Description: Type ของ ticket_issues ที่ include relation แล้ว
 * Input : -
 * Output : Prisma payload type
 * Author: Chanwit Muangma (Boom) 66160224
 */
type TicketIssueWithRelations = Prisma.ticket_issuesGetPayload<{
  include: typeof ticketIssueInclude;
}>;

export class HistoryIssueService {
  /**
   * Description: ดึงรายการ History Issue สำหรับหน้า List
   * Input : query (status, assignedToMe), currentUserId (ใช้กรอง assignedToMe)
   * Output : HistoryIssueItem[] (ตรง schema historyIssueItemSchema)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  async getList(
    query: GetHistoryIssueQuery,
    currentUserId: number
  ): Promise<HistoryIssueItem[]> {
    const ticketIssueList: TicketIssueWithRelations[] =
      await prisma.ticket_issues.findMany({
        where: {
          deleted_at: null,
          ...(query.status ? { ti_status: query.status } : {}),
          ...(query.assignedToMe ? { ti_assigned_to: currentUserId } : {}),
        },
        include: ticketIssueInclude,
        orderBy: {
          created_at: "desc",
        },
      });

    /**
     * Description: map Prisma model -> DTO ตาม schema
     * Input : ticketIssueList (Prisma results)
     * Output : HistoryIssueItem[]
     * Author: Chanwit Muangma (Boom) 66160224
     */
    return ticketIssueList.map((ticketIssue) => ({
      issueId: ticketIssue.ti_id,

      parentDevice: {
        id: ticketIssue.device.de_id,
        serialNumber: ticketIssue.device.de_serial_number,
        name: ticketIssue.device.de_name,
        categoryName: ticketIssue.device.category.ca_name,
        departmentName: ticketIssue.device.section?.department?.dept_name ?? null,
        sectionName: ticketIssue.device.section?.sec_name ?? null,
        locationName: ticketIssue.device.de_location,
      },

      issueTitle: ticketIssue.ti_title,
      issueDescription: ticketIssue.ti_description,
      issueStatus: ticketIssue.ti_status,
      issueResult: ticketIssue.ti_result,

      // หมายเหตุ: Prisma DateTime จะถูก serialize เป็น ISO string ตอน response JSON
      reportedAt: ticketIssue.created_at,

      reporterUser: {
        id: ticketIssue.reporter.us_id,
        empCode: ticketIssue.reporter.us_emp_code,
        fullName: `${ticketIssue.reporter.us_firstname} ${ticketIssue.reporter.us_lastname}`,
      },

      /**
       * Description: ผู้รับผิดชอบ (เพิ่ม empCode ตาม requirement)
       * Input : ticketIssue.assignee (nullable)
       * Output : assigneeUser | null
       * Author: Chanwit Muangma (Boom) 66160224
       */
      assigneeUser: ticketIssue.assignee
        ? {
            id: ticketIssue.assignee.us_id,
            empCode: ticketIssue.assignee.us_emp_code,
            fullName: `${ticketIssue.assignee.us_firstname} ${ticketIssue.assignee.us_lastname}`,
          }
        : null,

      /**
       * Description: สถานที่รับอุปกรณ์
       * - ใช้ pickup location ของ borrow_return_tickets (ถ้า ticket issue ผูกกับ brt)
       * Input : ticketIssue.ticket (nullable)
       * Output : string | null
       * Author: Chanwit Muangma (Boom) 66160224
       */
      receiveLocationName: ticketIssue.ticket?.brt_pickup_location ?? null,

      /**
       * Description: จำนวนอุปกรณ์ลูกใน Ticket
       * - นับจาก issue_devices ที่ filter soft delete แล้ว
       * Input : ticketIssue.issue_devices
       * Output : number
       * Author: Chanwit Muangma (Boom) 66160224
       */
      deviceChildCount: ticketIssue.issue_devices.length,
    }));
  }

  /**
   * Description: ดึงรายละเอียด History Issue สำหรับหน้า Detail
   * Input : issueId (รหัสใบแจ้งซ่อม)
   * Output : HistoryIssueDetail | null (ตรง schema historyIssueDetailResponseSchema)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  async getDetail(issueId: number): Promise<HistoryIssueDetail | null> {
    const ticketIssue: TicketIssueWithRelations | null =
      await prisma.ticket_issues.findFirst({
        where: {
          ti_id: issueId,
          deleted_at: null,
        },
        include: ticketIssueInclude,
      });

    if (!ticketIssue) return null;

    return {
      issueId: ticketIssue.ti_id,

      parentDevice: {
        id: ticketIssue.device.de_id,
        serialNumber: ticketIssue.device.de_serial_number,
        name: ticketIssue.device.de_name,
        categoryName: ticketIssue.device.category.ca_name,
        departmentName: ticketIssue.device.section?.department?.dept_name ?? null,
        sectionName: ticketIssue.device.section?.sec_name ?? null,
        locationName: ticketIssue.device.de_location,
      },

      issueTitle: ticketIssue.ti_title,
      issueDescription: ticketIssue.ti_description,
      issueStatus: ticketIssue.ti_status,
      issueResult: ticketIssue.ti_result,

      // หมายเหตุ: Prisma DateTime จะถูก serialize เป็น ISO string ตอน response JSON
      reportedAt: ticketIssue.created_at,

      reporterUser: {
        id: ticketIssue.reporter.us_id,
        empCode: ticketIssue.reporter.us_emp_code,
        fullName: `${ticketIssue.reporter.us_firstname} ${ticketIssue.reporter.us_lastname}`,
      },

      /**
       * Description: ผู้รับผิดชอบ (เพิ่ม empCode ตาม requirement)
       * Input : ticketIssue.assignee (nullable)
       * Output : assigneeUser | null
       * Author: Chanwit Muangma (Boom) 66160224
       */
      assigneeUser: ticketIssue.assignee
        ? {
            id: ticketIssue.assignee.us_id,
            empCode: ticketIssue.assignee.us_emp_code,
            fullName: `${ticketIssue.assignee.us_firstname} ${ticketIssue.assignee.us_lastname}`,
          }
        : null,

      receiveLocationName: ticketIssue.ticket?.brt_pickup_location ?? null,

      deviceChildCount: ticketIssue.issue_devices.length,

      damagedReason: ticketIssue.ti_damaged_reason,
      resolvedNote: ticketIssue.ti_resolved_note,

      /**
       * Description: รายการอุปกรณ์ลูกใน Ticket
       * - asset code: dec_asset_code
       * - serial number: dec_serial_number (nullable)
       * - status: dec_status
       * Input : ticketIssue.issue_devices
       * Output : deviceChildList[]
       * Author: Chanwit Muangma (Boom) 66160224
       */
      deviceChildList: ticketIssue.issue_devices.map((issueDevice) => ({
        deviceChildId: issueDevice.device_child.dec_id,
        deviceChildAssetCode: issueDevice.device_child.dec_asset_code,
        deviceChildSerialNumber: issueDevice.device_child.dec_serial_number,
        deviceChildStatus: issueDevice.device_child.dec_status,
      })),

      /**
       * Description: รูปแนบของใบแจ้งซ่อม (ใช้ทำปุ่ม “ดูรูป” ในหน้า detail)
       * Input : ticketIssue.attachments
       * Output : attachments[]
       * Author: Chanwit Muangma (Boom) 66160224
       */
      attachments: ticketIssue.attachments.map((att) => ({
        attachmentId: att.iatt_id,
        pathUrl: att.iatt_path_url,
        uploadedAt: att.uploaded_at,
      })),
    };
  }
}

export const historyIssueService = new HistoryIssueService();
