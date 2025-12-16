/**
 * Description: หน้าจัดการคำร้องยืม-คืนอุปกรณ์
 * - รองรับ Server-side Pagination, Search และ Sorting
 * - Filter ตามสถานะ (PENDING, APPROVED, IN_USE, etc.)
 * - แสดงรายละเอียด Ticket เมื่อกด expand
 * Input : -
 * Output : React Component
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useState, useEffect, useCallback } from "react";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import RequestItem from "../components/RequestItem";
import Pagination from "../components/Pagination";
import { Icon } from "@iconify/react";
import {
  ticketsService,
  type TicketItem,
  type TicketDetail,
  type TicketStatus,
  type GetTicketsParams,
  type SortField,
  type SortDirection,
} from "../services/TicketsService";

const Requests = () => {
  const [searchFilter, setSearchFilter] = useState({ search: "" });
  const [statusFilter, setStatusFilter] = useState<{
    id: string;
    label: string;
    value: string;
  } | null>(null);

  // Pagination States (server-side)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 2;

  // Sorting States (server-side)
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // API States
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail loading states
  const [ticketDetails, setTicketDetails] = useState<
    Record<number, TicketDetail>
  >({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>(
    {},
  );

  const statusOptions = [
    { id: "all", label: "ทั้งหมด", value: "" },
    { id: "PENDING", label: "รออนุมัติ", value: "PENDING" },
    { id: "APPROVED", label: "อนุมัติแล้ว", value: "APPROVED" },
    { id: "IN_USE", label: "กำลังใช้งาน", value: "IN_USE" },
    { id: "REJECTED", label: "ปฏิเสธ", value: "REJECTED" },
    { id: "COMPLETED", label: "คืนแล้ว", value: "COMPLETED" },
  ];

  /**
   * Description: จัดการการคลิก sort บน header
   * Input : field - SortField ที่ต้องการ sort
   * Output : void (อัปเดต state)
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc"); // เริ่มที่ desc เพื่อให้ icon เปลี่ยนจาก default
    }
  };

  /**
   * Description: ดึง icon สำหรับแสดงทิศทาง sort
   * Input : field - SortField
   * Output : string (icon name)
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up";
    }
    return "bx:sort-down"; // default icon
  };

  /**
   * Description: ดึงรายการ tickets จาก API พร้อม server-side pagination
   * Input : statusFilter, searchFilter, page, pageSize, sortField, sortDirection
   * Output : void (อัปเดต tickets state)
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetTicketsParams = {
        page,
        limit: pageSize,
      };

      if (statusFilter?.value) {
        params.status = statusFilter.value as TicketStatus;
      }

      if (searchFilter.search) {
        params.search = searchFilter.search;
      }

      if (sortField) {
        params.sortField = sortField;
        params.sortDirection = sortDirection;
      }

      const result = await ticketsService.getTickets(params);
      setTickets(result.data);
      // ใช้ maxPage จาก backend โดยตรง
      setTotalPages(result.maxPage || 1);
      // console.log("DEBUG Pagination:", { totalNum: result.totalNum, maxPage: result.maxPage, data: result.data.length });
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [
    statusFilter?.value,
    searchFilter.search,
    page,
    pageSize,
    sortField,
    sortDirection,
  ]);

  /**
   * Description: ดึงรายละเอียด ticket เมื่อ expand
   * Input : id - ticket ID
   * Output : void (อัปเดต ticketDetails state)
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const fetchTicketDetail = async (id: number) => {
    if (ticketDetails[id]) return; // Already loaded

    setLoadingDetails((prev) => ({ ...prev, [id]: true }));
    try {
      const detail = await ticketsService.getTicketById(id);
      setTicketDetails((prev) => ({ ...prev, [id]: detail }));
      console.log(detail);
    } catch (err) {
      console.error(`Failed to fetch ticket detail ${id}:`, err);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page เมื่อเปลี่ยน filter
  useEffect(() => {
    setPage(1);
  }, [searchFilter, statusFilter]);

  /**
   * Description: อนุมัติคำร้อง
   * Input : id - ticket ID
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleApprove = (id: number) => {
    console.log("Approved:", id);
    // TODO: Implement approve API call when available
  };

  /**
   * Description: ปฏิเสธคำร้อง
   * Input : id - ticket ID
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleReject = (id: number) => {
    console.log("Rejected:", id);
    // TODO: Implement reject API call when available
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex-1">
        {/* Breadcrumb */}
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">คำร้อง</span>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-[14px] mb-[21px]">
          <h1 className="text-2xl font-semibold">จัดการคำร้อง</h1>
        </div>

        {/* Filters */}
        <div className="w-full mb-[23px]">
          <div className="flex justify-between items-center">
            <SearchFilter onChange={setSearchFilter} />
            <div>
              <Dropdown
                items={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="สถานะ"
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="w-full bg-white border border-[#D9D9D9] font-medium text-[#000000] rounded-[16px] mb-[16px] h-[61px] grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_0.7fr_1fr_70px] items-center px-4 pl-6">
          <div className="flex items-center">
            อุปกรณ์
            <button type="button" onClick={() => handleSort("device_name")}>
              <Icon
                icon={getSortIcon("device_name")}
                width="24"
                height="24"
                className="ml-1"
              />
            </button>
          </div>
          <div className="flex items-center">
            จำนวน
            <button type="button" onClick={() => handleSort("quantity")}>
              <Icon
                icon={getSortIcon("quantity")}
                width="24"
                height="24"
                className="ml-1"
              />
            </button>
          </div>
          <div className="flex items-center">
            หมวดหมู่
            <button type="button" onClick={() => handleSort("category")}>
              <Icon
                icon={getSortIcon("category")}
                width="24"
                height="24"
                className="ml-1"
              />
            </button>
          </div>
          <div className="flex items-center">
            ชื่อผู้ร้องขอ
            <button type="button" onClick={() => handleSort("requester")}>
              <Icon
                icon={getSortIcon("requester")}
                width="24"
                height="24"
                className="ml-1"
              />
            </button>
          </div>
          <div className="flex items-center">
            วันที่ร้องขอ
            <button type="button" onClick={() => handleSort("request_date")}>
              <Icon
                icon={getSortIcon("request_date")}
                width="24"
                height="24"
                className="ml-1"
              />
            </button>
          </div>
          <div className="flex items-center">
            สถานะ
            <button type="button" onClick={() => handleSort("status")}>
              <Icon
                icon={getSortIcon("status")}
                width="24"
                height="24"
                className="ml-1"
              />
            </button>
          </div>
          <div className="flex items-center">จัดการ</div>
          <div></div>
        </div>

        <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-2xl">
          {/* Loading State */}
          {loading && (
            <div className="w-full rounded-2xl p-8 text-center text-gray-500">
              กำลังโหลดข้อมูล...
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-500">
              {error}
              <button
                onClick={fetchTickets}
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && tickets.length === 0 && (
            <div className="w-full rounded-2xl p-8 text-center text-gray-500">
              ไม่พบข้อมูลคำร้อง
            </div>
          )}

          {/* Request List */}
          {!loading && !error && tickets.length > 0 && (
            <div className="w-full mt-3 min-h-[679px] flex flex-col">
              {tickets.map((ticket) => (
                <RequestItem
                  key={ticket.id}
                  ticket={ticket}
                  ticketDetail={ticketDetails[ticket.id]}
                  isLoadingDetail={loadingDetails[ticket.id]}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onExpand={fetchTicketDetail}
                />
              ))}

              {/* Pagination */}
              {!loading && !error && tickets.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
