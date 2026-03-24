import { useState, useEffect, useCallback } from "react";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import { useToast } from "../components/Toast";
import Pagination from "../components/Pagination";
import { Icon } from "@iconify/react";
import RequestItemRepair from "../components/RequestItemRepair";
import {
  repairTicketsService,
  type RepairTicketStatus,
} from "../services/RequestRepairService";
import type {
  RepairTicketItem,
  GetRepairTicketsQuery,
} from "../services/RequestRepairService";
import { useUserStore } from "../stores/userStore";
import type { RepairDeviceUpdate } from "../components/DeviceManageModalRepair";
import { UserRole } from "../utils/RoleEnum";

type SortField =
  | "device_name"
  | "quantity"
  | "category"
  | "requester"
  | "request_date"
  | "status";

type SortDirection = "asc" | "desc";

type EmptyRow = {
  id: string;
  isEmpty: true;
};

type TicketRow = RepairTicketItem | EmptyRow;

const statusOptions = [
  { id: "all", label: "ทั้งหมด", value: "ALL" },
  { id: "pending", label: "รออนุมัติ", value: "PENDING" },
  { id: "in_progress", label: "กำลังซ่อม", value: "IN_PROGRESS" },
];
/**
 * Description: หน้าจัดการคำร้องแจ้งซ่อม รองรับการค้นหา กรองสถานะ แบ่งหน้า และอนุมัติรับงาน
 * Input : -
 * Output : React Component
 * Author : Worrawat Namwat (Wave) 66160372
 */
const RequestsRepair = () => {
  const { push } = useToast();
  const dataUser =
    localStorage.getItem("User") || sessionStorage.getItem("User");
  const user = dataUser ? JSON.parse(dataUser) : null;
  const isAdmin = user?.us_role === UserRole.ADMIN;
  const isTechnical = user?.us_role === UserRole.TECHNICAL;
  const fetchUserFromServer = useUserStore(
    (state) => state.fetchUserFromServer,
  );

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

  /**
   * Description: ฟังก์ชันสำหรับบันทึกผลการซ่อมและปิดงาน พร้อมตรวจสอบสิทธิ์ผู้ใช้ (Session)
   * Input : - ticketId (รหัสคำร้องแจ้งซ่อม)
   *         - updates (อาร์เรย์ของอุปกรณ์ที่ได้รับการอัปเดตสถานะการซ่อม)
   * Output : Promise<void>
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleSaveAction = async (
    ticketId: number,
    updates: RepairDeviceUpdate[],
  ) => {
    try {
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ API ต้องการ
      const deviceStatusPayload = updates.map((u) => ({
        id: u.id,
        status: u.status,
      }));

      await repairTicketsService.updateRepairResult(ticketId, {
        updates: deviceStatusPayload,
      });

      push({ message: "บันทึกผลการซ่อมสำเร็จ!", tone: "success" });

      // ดึงข้อมูลใหม่เพื่ออัปเดตสถานะหน้าจอ
      await fetchTickets();
    } catch (error) {
      console.error(error);
      push({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", tone: "danger" });
    }
  };

  // --- States ---
  const [activeTabKey, setActiveTabKey] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState({ search: "" });
  const [statusFilter, setStatusFilter] = useState<typeof statusOptions[number]>();

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

      if (activeTabKey === "mine" && user?.us_id) {
        if (user?.us_id) queryParams.assignID = user.us_id;
        queryParams.status = "IN_PROGRESS";
      }

      if (searchFilter.search) {
        queryParams.search = searchFilter.search;
      }

      if (statusFilter && statusFilter.value !== "ALL") {
  queryParams.status = statusFilter.value as RepairTicketStatus;
}

      const response = await repairTicketsService.getRepairTickets(queryParams);

      // response.data จาก Axios มักจะมีรูปแบบซ้อนกัน ขึ้นอยู่กับ Interface ของ API Service
      setTickets(response.data.data || response.data);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        errorResponse?.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูล",
      );
    } finally {
      setLoading(false);
    }
  }, [page, searchFilter.search, statusFilter?.value, activeTabKey]);

  useEffect(() => {
    setPage(1);
  }, [searchFilter.search, statusFilter?.value, activeTabKey]);

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

  // กำหนดจำนวนแถวที่ต้องการแสดงในตาราง (รวมแถวว่าง)
  const displayRow = 8;

  /**
   * Description: ฟังก์ชันสำหรับเติมแถวว่างในกรณีที่จำนวนคำร้องน้อยกว่า displayRow เพื่อให้ตารางมีความสวยงามและคงรูปแบบเดิม
   * Input : - tickets (อาร์เรย์ของคำร้องแจ้งซ่อมที่ดึงมาจาก API)
   * Output : อาร์เรย์ของ TicketRow ที่มีทั้งคำร้องจริงและแถวว่าง (ถ้าจำนวนคำร้องน้อยกว่า displayRow)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const filledTickets: TicketRow[] =
    tickets.length < displayRow
      ? [
          ...tickets,
          ...Array.from({ length: displayRow - tickets.length }, (_, i) => ({
            id: `empty-${i}`,
            isEmpty: true as const,
          })),
        ]
      : tickets;

    const sortedTickets = [...tickets].sort((a, b) => {
    let valA: string | number = "";
    let valB: string | number = "";

    switch (sortField) {
      case "device_name":
        valA = a.device_info.name;
        valB = b.device_info.name;
        break;
      case "quantity":
        valA = a.device_info.quantity;
        valB = b.device_info.quantity;
        break;
      case "category":
        valA = a.device_info.category || "";
        valB = b.device_info.category || "";
        break;
      case "requester":
        valA = a.requester.fullname;
        valB = b.requester.fullname;
        break;
      case "request_date":
        valA = new Date(a.dates.created).getTime();
        valB = new Date(b.dates.created).getTime();
        break;
      case "status":
        valA = a.status;
        valB = b.status;
        break;
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#F9FAFB]">
      <div className="flex-1">
        {isAdmin ? (
          <div className="mb-[8px] space-x-[9px]">
            <span className="text-[#858585]">การจัดการ</span>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#000000]">คำร้องซ่อม</span>
          </div>
        ) : isTechnical ? (
          <div className="mb-[8px] space-x-[9px]">
            <span className="text-[#000000]">จัดการคำร้องซ่อม</span>
          </div>
        ) : (
          <div className="mb-[8px] space-x-[9px]">
            <span className="text-[#000000]">จัดการคำร้องซ่อม</span>
          </div>
        )}

        {/* Page Title */}
        <div className="flex items-center gap-[14px] mb-[21px]">
          <h1 className="text-2xl font-semibold text-gray-900">
            จัดการคำร้องซ่อม  
          </h1>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <TabButton
            isActive={activeTabKey === "all"}
            onClick={() => setActiveTabKey("all")}
          >
            ทั้งหมด
          </TabButton>

          <TabButton
            isActive={activeTabKey === "mine"}
            onClick={() => setActiveTabKey("mine")}
          >
            ของฉัน
          </TabButton>
        </div>

        {/* Filters */}
        <div className="w-full mb-[23px] ">
          <div className="flex justify-between items-center gap-4">
            <SearchFilter onChange={setSearchFilter} />
            <div>
              {activeTabKey === "all" && (
                <Dropdown
                  items={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="สถานะ"
                />
              )}
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="w-full bg-white border border-[#D9D9D9] font-medium text-[#000000] rounded-[16px] mb-[16px] h-[61px] grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_1fr_240px_70px] items-center px-8 pl-8">
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
            <div className="w-full rounded-2xl p-8 text-center text-gray-500"></div>
          )}

          {!loading && !error && sortedTickets.length > 0 && (
            <div className="flex flex-col ">
              {sortedTickets.map((ticket) => (
                  <RequestItemRepair
                    key={ticket.id}
                    ticket={ticket as RepairTicketItem}
                    onExpand={handleExpand}
                    currentUserId={user?.us_id}
                    currentUserName={loggedInUserName}
                    isForceExpand={expandedId === ticket.id}
                    onApprove={handleApproveAction}
                    onSave={handleSaveAction}
                    activeTabKey={activeTabKey}
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
    </div>
  );
};

/**
 * Description: Component ปุ่ม Tab สำหรับสลับมุมมอง (เช่น ทั้งหมด / ของฉัน)
 * Input : { isActive: boolean, onClick: function, children: ReactNode }
 * Output : React Component (ปุ่ม Tab)
 * Author : Worrawat Namwat (Wave) 66160372
 */
function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full border px-5 text-sm font-semibold transition-colors ${
        isActive
          ? "border-sky-300 bg-[#1890FF] text-neutral-50"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

export default RequestsRepair;
