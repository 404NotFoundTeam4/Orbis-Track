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
import RejectReasonModal from "../components/RejectReasonModal";
import { Icon } from "@iconify/react";
import { useLocation, useParams } from "react-router-dom";
import {
  ticketsService,
  type TicketItem,
  type TicketDetail,
  type TicketStatus,
  type GetTicketsParams,
  type SortField,
  type SortDirection,
} from "../services/TicketsService";
import { AlertDialog } from "../components/AlertDialog";
import { useToast } from "../components/Toast";
import { socketService } from "../services/SocketService";

const Requests = () => {
  const [searchFilter, setSearchFilter] = useState({ search: "" });
  const [statusFilter, setStatusFilter] = useState<{
    id: string;
    label: string;
    value: string;
  } | null>(null);

  const dataUser =
    localStorage.getItem("User") || sessionStorage.getItem("User");
  const user = dataUser ? JSON.parse(dataUser) : null;

  // Pagination States (server-side)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 7;

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
  const [pickupLocations, setPickupLocations] = useState<
    Record<number, string>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    Record<number, boolean>
  >({});
  const [expandTriggers, setExpandTriggers] = useState<Record<number, number>>(
    {},
  );

  const { push } = useToast();
  const { id } = useParams();
  const location = useLocation();
  const expandId = id
    ? parseInt(id)
    : (location.state as { expandId?: number })?.expandId;

  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    tone: "success" | "warning" | "danger" | "reject";
  }>({
    title: "",
    description: "",
    onConfirm: async () => {},
    tone: "success",
  });

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTicketId, setRejectTicketId] = useState<number | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  let statusOptions;

  if (user.us_role === "STAFF") {
    statusOptions = [
      { id: "all", label: "ทั้งหมด", value: "" },
      { id: "PENDING", label: "รออนุมัติ", value: "PENDING" },
      { id: "APPROVED", label: "อนุมัติแล้ว", value: "APPROVED" },
      { id: "IN_USE", label: "กำลังใช้งาน", value: "IN_USE" },
      // { id: "REJECTED", label: "ปฏิเสธ", value: "REJECTED" },
      // { id: "COMPLETED", label: "คืนแล้ว", value: "COMPLETED" },
      { id: "OVERDUE", label: "เลยกำหนด", value: "OVERDUE" },
    ];
  } else {
    statusOptions = [
      { id: "all", label: "ทั้งหมด", value: "" },
      { id: "PENDING", label: "รออนุมัติ", value: "PENDING" },
    ];
  }

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
      console.log(result);
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
  const fetchTicketDetail = useCallback(
    async (id: number, isManual?: boolean) => {
      // เมื่อกางออกเอง ให้รีเซ็ต Validation Error ของตัวนั้นๆ
      if (isManual) {
        setValidationErrors((prev) => ({ ...prev, [id]: false }));
      }

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
    },
    [ticketDetails],
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page เมื่อเปลี่ยน filter
  useEffect(() => {
    setPage(1);
  }, [searchFilter, statusFilter]);

  // Socket Listeners
  useEffect(() => {
    /**
     * Description: รีเฟรชรายการ tickets เมื่อได้รับ event จาก socket
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const onRefreshRequest = () => fetchTickets();

    /**
     * Description: ลบ ticket detail ออกจาก cache และรีเฟรช tickets เมื่อ notification dismissed
     * Input     : payload { ticketId: number }
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const onNotificationDismissed = (payload: { ticketId: number }) => {
      const { ticketId } = payload;
      setTicketDetails((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      fetchTickets();
    };

    /**
     * Description: Refetch ticket detail เมื่อมีการเปลี่ยนแปลง devices ใน ticket
     * Input     : payload { ticketId: number }
     * Note      : ดึงข้อมูลใหม่จาก API แทนที่จะล้าง cache เพื่อให้ UI อัปเดตทันที
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const onTicketDevicesUpdated = async (payload: { ticketId: number }) => {
      const { ticketId } = payload;
      try {
        const detail = await ticketsService.getTicketById(ticketId);
        setTicketDetails((prev) => ({ ...prev, [ticketId]: detail }));
      } catch (error) {
        console.error(`Failed to refetch ticket detail ${ticketId}:`, error);
      }
    };

    socketService.on("REFRESH_REQUEST_PAGE", onRefreshRequest);
    socketService.on("TICKET_PROCESSED", onNotificationDismissed);
    socketService.on("TICKET_DEVICES_UPDATED", onTicketDevicesUpdated);

    return () => {
      socketService.off("REFRESH_REQUEST_PAGE", onRefreshRequest);
      socketService.off("TICKET_PROCESSED", onNotificationDismissed);
      socketService.off("TICKET_DEVICES_UPDATED", onTicketDevicesUpdated);
    };
  }, [fetchTickets]);

  /**
   * Description: อนุมัติคำร้อง
   * Input : id - ticket ID
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleApprove = async (id: number) => {
    try {
      // ตรวจสอบว่ามีข้อมูลรายละเอียดหรือไม่ ถ้าไม่มีให้โหลดก่อน
      let detail = ticketDetails[id];
      if (!detail) {
        setLoadingDetails((prev) => ({ ...prev, [id]: true }));
        detail = await ticketsService.getTicketById(id);
        setTicketDetails((prev) => ({ ...prev, [id]: detail }));
        setLoadingDetails((prev) => ({ ...prev, [id]: false }));
      }

      // ดึงขั้นตอนปัจจุบัน ถ้าไม่มีให้เริ่มที่ 1
      const currentStage = detail?.details?.current_stage || 1;
      const stageLength = detail?.timeline?.length || 0;
      const isLastStage = currentStage === stageLength;

      // เพิ่ม Validation: ถ้าเป็น Stage สุดท้าย ต้องกรอกสถานที่รับอุปกรณ์
      if (isLastStage) {
        const pLocation = pickupLocations[id] || "";
        if (!pLocation.trim()) {
          setValidationErrors((prev) => ({ ...prev, [id]: true }));
          setExpandTriggers((prev) => ({ ...prev, [id]: Date.now() })); // สั่งกางออก (ใช้ timestamp เพื่อให้ trigger ทุกครั้ง)
          push({
            tone: "warning",
            message: "กรุณาระบุสถานที่รับอุปกรณ์",
            description: "สำหรับขั้นตอนสุดท้าย จำเป็นต้องระบุสถานที่รับของ",
          });
          return;
        }
      }

      setConfirmData({
        title: "ต้องการอนุมัติคำร้องนี้?",
        description: `โปรดตรวจสอบก่อนยืนยันการอนุมัติ`,
        tone: "success",
        onConfirm: async () => {
          try {
            await ticketsService.approveTicket({
              ticketId: id,
              currentStage: currentStage,
              pickupLocation: pickupLocations[id],
            });

            push({
              tone: "success",
              message: "อนุมัติเสร็จสิ้น!",
            });

            // ล้างข้อมูล State ที่เกี่ยวกับ ticket นี้
            setPickupLocations((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            setValidationErrors((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            setExpandTriggers((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });

            // รีเฟรชรายการและรายละเอียด
            delete ticketDetails[id];
            fetchTickets();
          } catch (err) {
            console.error("Failed to approve ticket:", err);
            push({
              tone: "danger",
              message: "อนุมัติไม่สำเร็จ",
              description: "เกิดข้อผิดพลาดในการอนุมัติ กรุณาลองใหม่อีกครั้ง",
            });
          }
        },
      });
      setConfirmOpen(true);
    } catch (err) {
      console.error("Failed to prepare approval:", err);
      push({
        tone: "danger",
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลเพื่ออนุมัติได้",
      });
    }
  };

  /**
   * Description: เปิด modal สำหรับกรอกเหตุผลปฏิเสธ
   * Input : id - ticket ID
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleReject = (id: number) => {
    setRejectTicketId(id);
    setRejectModalOpen(true);
  };

  /**
   * Description: ยืนยันการปฏิเสธพร้อมเหตุผล
   * Input : reason - เหตุผลการปฏิเสธ
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleRejectConfirm = (reason: string) => {
    if (!rejectTicketId) return;

    // เปิด Confirm Dialog ซ้อนทับ RejectReasonModal
    setConfirmData({
      title: "ต้องการปฏิเสธคำร้องนี้?",
      description: "การดำเนินการนี้ไม่สามารถกู้คืนได้",
      tone: "reject",
      onConfirm: async () => {
        setRejectModalOpen(false); // ปิด modal หลัง confirm
        await executeReject(rejectTicketId, reason);
      },
    });
    setConfirmOpen(true);
  };

  /**
   * Description: ดำเนินการปฏิเสธจริง (เรียก API)
   * Input : ticketId, reason
   * Output : void
   * Author: Pakkapon Chomchoey (Tonnam) 66160080
   */
  const executeReject = async (ticketId: number, reason: string) => {
    try {
      setRejectLoading(true);

      // ดึงข้อมูล detail ถ้ายังไม่มี
      let detail = ticketDetails[ticketId];
      if (!detail) {
        detail = await ticketsService.getTicketById(ticketId);
        setTicketDetails((prev) => ({ ...prev, [ticketId]: detail }));
      }

      const currentStage = detail?.details?.current_stage || 1;

      await ticketsService.rejectTicket({
        ticketId: ticketId,
        currentStage: currentStage,
        rejectReason: reason,
      });

      push({
        tone: "danger",
        message: "คำร้องถูกปฏิเสธแล้ว",
      });

      // reset state
      setRejectTicketId(null);

      // ลบ cache และ refresh
      delete ticketDetails[ticketId];
      fetchTickets();
    } catch (err) {
      console.error("Failed to reject ticket:", err);
      push({
        tone: "danger",
        message: "ปฏิเสธไม่สำเร็จ",
        description: "เกิดข้อผิดพลาดในการปฏิเสธ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setRejectLoading(false);
    }
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
                  forceExpand={
                    ticket.id === expandId || !!expandTriggers[ticket.id]
                  }
                  expandTrigger={expandTriggers[ticket.id]}
                  pickupLocation={pickupLocations[ticket.id]}
                  onPickupLocationChange={(tid, val) => {
                    setPickupLocations((prev) => ({ ...prev, [tid]: val }));
                    if (val.trim()) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        [tid]: false,
                      }));
                    }
                  }}
                  isInvalid={validationErrors[ticket.id]}
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmData.title}
        description={confirmData.description}
        onConfirm={confirmData.onConfirm}
        tone={confirmData.tone}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectTicketId(null);
        }}
        onConfirm={handleRejectConfirm}
        isLoading={rejectLoading}
      />
    </div>
  );
};

export default Requests;
