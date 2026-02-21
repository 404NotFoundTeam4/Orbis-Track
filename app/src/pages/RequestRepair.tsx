import { useState, useEffect, useCallback } from "react";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import Pagination from "../components/Pagination";
import { Icon } from "@iconify/react";
import { AlertDialog } from "../components/AlertDialog";
import { useNavigate } from "react-router-dom";
import RequestItemRepair from "../components/RequestItemRepair";
import {
  repairTicketsService,
  RepairTicketStatus,
} from "../services/RepairService";
import type { 
  RepairTicketItem, 
  GetRepairTicketsQuery 
} from "../services/RepairService";
import { useUserStore } from "../stores/userStore";

type SortField =
  | "device_name"
  | "quantity"
  | "category"
  | "requester"
  | "request_date"
  | "status";

type SortDirection = "asc" | "desc";

const statusOptions = [
  { id: "all", label: "ทั้งหมด", value: "ALL" },
  { id: "pending", label: "รอดำเนินการ", value: RepairTicketStatus.PENDING },
  {
    id: "in_progress",
    label: "กำลังดำเนินการ",
    value: RepairTicketStatus.IN_PROGRESS,
  },
  { id: "completed", label: "เสร็จสิ้น", value: RepairTicketStatus.COMPLETED },
];

/**
 * Description: หน้าจัดการคำร้องแจ้งซ่อม รองรับการค้นหา กรองสถานะ แบ่งหน้า และอนุมัติรับงาน
 * Input : -
 * Output : React Component
 * Author : Worrawat Namwat (Wave) 66160372
 */
const RequestsRepair = () => {
  const navigate = useNavigate();

  const dataUser = localStorage.getItem("User") || sessionStorage.getItem("User");
  const user = dataUser ? JSON.parse(dataUser) : null;
  const fetchUserFromServer = useUserStore((state) => state.fetchUserFromServer);

  useEffect(() => {
  if (!user) {
    fetchUserFromServer();
  }
}, [user, fetchUserFromServer]);

  const loggedInUserName = user?.us_firstname
    ? `${user.us_firstname} ${user?.us_lastname || ""}`.trim()
    : "ผู้รับเรื่อง";

  /**
   * Description: ฟังก์ชันสำหรับอนุมัติรับงานแจ้งซ่อม พร้อมตรวจสอบสิทธิ์ผู้ใช้ (Session)
   * Input : ticketId (รหัสคำร้องแจ้งซ่อม)
   * Output : Promise<void>
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleApproveAction = async (ticketId: number): Promise<void> => {
  try {
    if (!user?.us_id) {
      throw new Error("User not found");
    }

    await repairTicketsService.approveTicket(ticketId, user.us_id);

    await fetchTickets();
  } catch (error) {
    console.error(error);
  }
};
  // --- States ---
  const [activeTabKey, setActiveTabKey] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState({ search: "" });
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);

  // Data State
  const [tickets, setTickets] = useState<RepairTicketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accordion State สำหรับเปิดดูทีละ 1 รายการ
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("request_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    tone: "success" | "warning" | "danger";
  }>({
    title: "",
    description: "",
    onConfirm: async () => {},
    tone: "success",
  });

  /**
   * Description: ฟังก์ชันสำหรับดึงข้อมูลคำร้องแจ้งซ่อมจาก API ตามเงื่อนไข (Pagination, Filter)
   * Input : - (ใช้ข้อมูลจาก State ภายใน Component)
   * Output : Promise<void>
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: GetRepairTicketsQuery = {
        page: page,
        limit: 10,
      };

      if (searchFilter.search) {
        queryParams.search = searchFilter.search;
      }

      if (statusFilter.value !== "ALL") {
        queryParams.status = statusFilter.value;
      }

      const response = await repairTicketsService.getRepairTickets(queryParams);

      // response.data จาก Axios มักจะมีรูปแบบซ้อนกัน ขึ้นอยู่กับ Interface ของ API Service
      setTickets(response.data.data || response.data); 
      setTotalPages(response.data.pagination?.total_pages || 1);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse?.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [page, searchFilter.search, statusFilter.value, activeTabKey]);

  useEffect(() => {
    setPage(1);
  }, [searchFilter.search, statusFilter.value, activeTabKey]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  /**
   * Description: ฟังก์ชันสำหรับจัดการการเรียงลำดับคอลัมน์ (Sorting)
   * Input : field (ชื่อฟิลด์ที่ต้องการจัดเรียง)
   * Output : -
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  /**
   * Description: ฟังก์ชันดึงไอคอนสำหรับการเรียงลำดับ (Sort Icon)
   * Input : field (ชื่อฟิลด์ปัจจุบันของคอลัมน์)
   * Output : string (ชื่อไอคอน)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up";
    }
    return "bx:sort-down";
  };

  /**
   * Description: ฟังก์ชันจัดการการขยายดูรายละเอียด Ticket (Accordion)
   * Input : ticketId (รหัสคำร้อง), isExpanded (สถานะการกาง)
   * Output : -
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleExpand = (ticketId: number, isExpanded: boolean) => {
    setExpandedId(isExpanded ? ticketId : null);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#F9FAFB]">
      <div className="flex-1">
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#000000]">คำร้อง</span>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-[14px] mb-[21px]">
          <h1 className="text-2xl font-semibold text-gray-900">
            จัดการคำร้องแจ้งซ่อม
          </h1>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <TabButton
            active={activeTabKey === "all"}
            onClick={() => setActiveTabKey("all")}
          >
            ทั้งหมด
          </TabButton>

          <TabButton
            active={activeTabKey === "mine"}
            onClick={() => setActiveTabKey("mine")}
          >
            ของฉัน
          </TabButton>
        </div>

        {/* Filters */}
        <div className="w-full mb-[23px]">
          <div className="flex justify-between items-center gap-4">
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

        <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-2xl p-4">
          {loading && (
            <div className="w-full rounded-2xl p-8 text-center text-gray-500 flex flex-col items-center gap-2">
              <Icon
                icon="eos-icons:loading"
                className="text-3xl text-blue-500"
              />
              <span>กำลังโหลดข้อมูล...</span>
            </div>
          )}

          {error && !loading && (
            <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-500">
              {error}
              <button
                onClick={fetchTickets}
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {!loading && !error && tickets.length === 0 && (
            <div className="w-full rounded-2xl p-8 text-center text-gray-500">
              ไม่พบข้อมูลคำร้องแจ้งซ่อม
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div className="flex flex-col ">
              {tickets.map((ticket) => (
                <RequestItemRepair
                  key={ticket.id}
                  ticket={ticket}
                  onExpand={handleExpand}
                  currentUserId={user?.us_id}
                  currentUserName={loggedInUserName}
                  forceExpand={expandedId === ticket.id}
                  onApprove={handleApproveAction}
                />
              ))}
            </div>
          )}

          {!loading && !error && tickets.length > 0 && (
            <div className="mt-4 pt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

/**
 * Description: Component ปุ่ม Tab สำหรับสลับมุมมอง (เช่น ทั้งหมด / ของฉัน)
 * Input : { active: boolean, onClick: function, children: ReactNode }
 * Output : React Component (ปุ่ม Tab)
 * Author : Worrawat Namwat (Wave) 66160372
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full border px-5 text-sm font-semibold transition-colors ${
        active
          ? "border-sky-300 bg-[#1890FF] text-neutral-50"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

export default RequestsRepair;