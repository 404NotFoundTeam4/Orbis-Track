/**
 * Description: Service สำหรับจัดการ Borrow-Return Tickets
 * - รองรับ Pagination, Filter by status, Search, และ Sorting
 * - ใช้ Repository สำหรับ Query ข้อมูล
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { GetBorrowTicketQuery } from "./borrow-return.schema.js";
import { IdParamDto } from "../../departments/departments.schema.js";
import { BorrowReturnRepository } from "./borrow-return.repository.js";

export class BorrowReturnService {
  constructor(private readonly repository: BorrowReturnRepository) {}

  /**
   * Description: ดึงรายการ Borrow-Return Tickets พร้อมรายละเอียด
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicket(
    query: GetBorrowTicketQuery,
    role: string | undefined,
    dept_id: number | null | undefined,
    sec_id: number | null | undefined,
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortField,
      sortDirection,
    } = query;

    const { total, items } = await this.repository.findPaginated({
      role,
      dept_id,
      sec_id,
      page,
      limit,
      status,
      search,
      sortField,
      sortDirection,
    });

    const formattedData = items.map((item: any) => {
      const mainDevice = item.ticket_devices[0]?.child.device;
      const deviceCount = item.brt_quantity;
      const dept = mainDevice?.section?.department?.dept_name ?? "";

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
          section:
            mainDevice?.section?.sec_name.replace(dept, "").trim() ?? "-",
          department: dept.replace(/แผนก/g, "").trim() ?? "-",
          total_quantity: deviceCount,
        },
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
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  async getBorrowReturnTicketById(params: IdParamDto) {
    const { id } = params;
    const ticket = await this.repository.getById(id);

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
      },

      devices: ticket.ticket_devices.map((td: any) => ({
        child_id: td.child.dec_id,
        asset_code: td.child.dec_asset_code,
        serial: td.child.dec_serial_number || "-",
        current_status: td.child.dec_status,
        has_serial_number: td.child.dec_has_serial_number,
      })),

      accessories: ticket.ticket_devices[0]?.child.device?.accessory
        ? [
            {
              acc_id: ticket.ticket_devices[0].child.device.accessory.acc_id,
              acc_name:
                ticket.ticket_devices[0].child.device.accessory.acc_name,
              acc_quantity:
                ticket.ticket_devices[0].child.device.accessory.acc_quantity,
            },
          ]
        : [],

      timeline: ticket.stages.map((stage: any) => ({
        role_name: stage.brts_name,
        step: stage.brts_step_approve,
        required_role: stage.brts_role,
        dept_id: stage.brts_dept_id,
        dept_name: stage.brts_dept_name,
        sec_id: stage.brts_sec_id,
        sec_name: stage.brts_sec_name,
        status: stage.brts_status,
        approved_by: stage.approver
          ? `${stage.approver.us_firstname} ${stage.approver.us_lastname}`
          : null,
        updated_at: stage.updated_at,
      })),
    };
  }
}
