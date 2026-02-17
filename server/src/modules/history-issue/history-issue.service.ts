/**
 * Service: History Issue
 * หน้าที่:
 * - query ticket_issues พร้อม relation ที่จำเป็น
 * - map เป็น DTO ให้ตรงกับ schema (historyIssueItemSchema / historyIssueDetailResponseSchema)
 */
import { prisma } from "../../infrastructure/database/client.js";
import { Prisma } from "@prisma/client";
import type {
  GetHistoryIssueQuery,
  HistoryIssueDetail,
  HistoryIssueItem,
} from "./history-issue.schema.js";

/**
 * include สำหรับ Prisma
 * - ใช้ Prisma.validator เพื่อให้ TS เห็น relation ชัดเจน
 * - issue_devices ใส่ where เพื่อไม่เอา record ที่ soft delete
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
   * อุปกรณ์ลูกใน Ticket
   * - ดึงเฉพาะที่ไม่ถูกลบ
   * - include device_child เพื่อเอา asset_code / serial_number / status
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
 * Type ของ ticket_issues ที่ include relation แล้ว
 */
type TicketIssueWithRelations = Prisma.ticket_issuesGetPayload<{
  include: typeof ticketIssueInclude;
}>;

export class HistoryIssueService {
  /**
   * ดึงรายการ History Issue สำหรับหน้า List
   * Output: HistoryIssueItem[] (ตรง schema historyIssueItemSchema)
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
     * map: Prisma model -> DTO ตาม schema
     */
    return ticketIssueList.map((ticketIssue) => ({
      issueId: ticketIssue.ti_id,

      parentDevice: {
        id: ticketIssue.device.de_id,
        serialNumber: ticketIssue.device.de_serial_number,
        name: ticketIssue.device.de_name,
        categoryName: ticketIssue.device.category.ca_name,
        departmentName:
          ticketIssue.device.section?.department?.dept_name ?? null,
        sectionName: ticketIssue.device.section?.sec_name ?? null,
        locationName: ticketIssue.device.de_location,
      },

      issueTitle: ticketIssue.ti_title,
      issueDescription: ticketIssue.ti_description,
      issueStatus: ticketIssue.ti_status,
      issueResult: ticketIssue.ti_result,

      reportedAt: ticketIssue.created_at,

      reporterUser: {
        id: ticketIssue.reporter.us_id,
        empCode: ticketIssue.reporter.us_emp_code,
        fullName: `${ticketIssue.reporter.us_firstname} ${ticketIssue.reporter.us_lastname}`,
      },

      assigneeUser: ticketIssue.assignee
        ? {
            id: ticketIssue.assignee.us_id,
            fullName: `${ticketIssue.assignee.us_firstname} ${ticketIssue.assignee.us_lastname}`,
          }
        : null,

      /**
       * สถานที่รับอุปกรณ์
       * - ใช้ pickup location ของ borrow_return_tickets (ถ้า ticket issue ผูกกับ brt)
       * - ถ้าไม่ได้ผูก จะเป็น null
       */
      receiveLocationName: ticketIssue.ticket?.brt_pickup_location ?? null,

      /**
       * จำนวนอุปกรณ์ลูกใน Ticket
       * - นับจาก issue_devices ที่ filter soft delete แล้ว
       */
      deviceChildCount: ticketIssue.issue_devices.length,
    }));
  }

  /**
   * ดึงรายละเอียด History Issue สำหรับหน้า Detail
   * Output: HistoryIssueDetail (ตรง schema historyIssueDetailResponseSchema)
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
        departmentName:
          ticketIssue.device.section?.department?.dept_name ?? null,
        sectionName: ticketIssue.device.section?.sec_name ?? null,
        locationName: ticketIssue.device.de_location,
      },

      issueTitle: ticketIssue.ti_title,
      issueDescription: ticketIssue.ti_description,
      issueStatus: ticketIssue.ti_status,
      issueResult: ticketIssue.ti_result,

      reportedAt: ticketIssue.created_at,

      reporterUser: {
        id: ticketIssue.reporter.us_id,
        empCode: ticketIssue.reporter.us_emp_code,
        fullName: `${ticketIssue.reporter.us_firstname} ${ticketIssue.reporter.us_lastname}`,
      },

      assigneeUser: ticketIssue.assignee
        ? {
            id: ticketIssue.assignee.us_id,
            fullName: `${ticketIssue.assignee.us_firstname} ${ticketIssue.assignee.us_lastname}`,
          }
        : null,

      receiveLocationName: ticketIssue.ticket?.brt_pickup_location ?? null,

      deviceChildCount: ticketIssue.issue_devices.length,

      damagedReason: ticketIssue.ti_damaged_reason,
      resolvedNote: ticketIssue.ti_resolved_note,

      /**
       * รายการอุปกรณ์ลูกใน Ticket
       * - asset code: dec_asset_code
       * - serial number: dec_serial_number (nullable)
       * - status: dec_status
       */
      deviceChildList: ticketIssue.issue_devices.map((issueDevice) => ({
        deviceChildId: issueDevice.device_child.dec_id,
        deviceChildAssetCode: issueDevice.device_child.dec_asset_code,
        deviceChildSerialNumber: issueDevice.device_child.dec_serial_number,
        deviceChildStatus: issueDevice.device_child.dec_status,
      })),
    };
  }
}

export const historyIssueService = new HistoryIssueService();
