/**
 * Page: Repair Management
 * Features:
 *  - UI สำหรับการจัดการรายการแจ้งซ่อม
 *  - ค้นหาผ่านฟิลเตอร์, การจัดเรียงข้อมูล, การแบ่งหน้า
 *
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchFilter from "../components/SearchFilter";
import DropDown from "../components/DropDown";
import { useToast } from "../components/Toast";
import RepairManagementTable from "../components/RepairManagementTable";
import {
  type RepairItem,
  type RepairQuery,
} from "../services/RepairService";
import { ticketsService } from "../services/TicketsService";
import { historyIssueService } from "../services/HistoryIssueService";

type SortField = NonNullable<RepairQuery["sortField"]>;
type SortDirection = NonNullable<RepairQuery["sortDirection"]>;

type OptionItem = {
  id: string | number;
  label: string;
  value: string | number;
};

type RepairRequestNavigationState = {
  selectedRepairItem?: {
    issueId?: number;
    deviceId?: number;
    deviceName: string;
    category: string;
    requesterName: string;
    requesterEmpCode: string | null;
  };
};

const PAGE_SIZE = 10;

/**
 * Repair Component
 * Description: คอมโพเนนต์สำหรับการจัดการรายการแจ้งซ่อม รวมถึงการค้นหาผ่านฟิลเตอร์, การจัดเรียง, และการแบ่งหน้า
 * Input      : ไม่มี (ใช้ข้อมูลจาก API และ state)
 * Output     : UI สำหรับการแสดงรายการแจ้งซ่อม พร้อมตัวเลือกการค้นหา, การจัดเรียง, และแบ่งหน้า
 * Author     : Rachata Jitjeankhan (Tang) 66160369
 */
export default function Repair() {
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const repairRequestPath = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      return `/${parts[0]}/repair/request`;
    }
    return "/repair/request";
  }, [location.pathname]);

  const [allItems, setAllItems] = useState<RepairItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedCategory, setSelectedCategory] = useState<OptionItem | null>(null);

  // Derive categories from repair items (same technique as ListDevices)
  const categoryOptions = useMemo(() => {
    return [
      { id: "", label: "ทั้งหมด", value: "" },
      ...Array.from(new Set(allItems.map((item) => item.category)))
        .filter(Boolean)
        .map((category, index) => ({
          id: index,
          label: category!,
          value: category!,
        })),
    ];
  }, [allItems]);

  // Filter items by category on client side
  const filteredItems = useMemo(() => {
    if (!selectedCategory?.value) return allItems;
    return allItems.filter((item) => item.category === selectedCategory.value);
  }, [allItems, selectedCategory?.value]);

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  }, [filteredItems.length]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  /**
   * fetchRepairs
   * Description: ดึงข้อมูลรายการแจ้งซ่อมจาก API
   * Input      : ไม่มี
   * Output     : อัปเดตสถานะ allItems ด้วยข้อมูลรายการแจ้งซ่อมที่ดึงมา
   * Author     : Rachata Jitjeankhan (Tang) 66160369
   */
  const fetchRepairs = useCallback(async () => {
    setLoading(true);
    try {
      const params: RepairQuery = {
        page: 1,
        limit: 1000, // Fetch all items for client-side filtering
        search: search || undefined,
        sortField: sortField || undefined,
        sortDirection,
      };

      const userRaw = sessionStorage.getItem("User") || localStorage.getItem("User");
      const parsedUser = userRaw ? JSON.parse(userRaw) : null;
      const currentUserId: number | null =
        parsedUser?.us_id ?? parsedUser?.state?.user?.us_id ?? null;

      const [borrowedTickets, pendingIssues, inProgressIssues] = await Promise.all([
        ticketsService.getTickets({
          page: params.page,
          limit: 100,
          status: "IN_USE",
          search: params.search,
          sortField: params.sortField,
          sortDirection: params.sortDirection,
        }),
        historyIssueService.getHistoryIssueList({ status: "PENDING" }),
        historyIssueService.getHistoryIssueList({ status: "IN_PROGRESS" }),
      ]);

      const openIssueItems = [...pendingIssues, ...inProgressIssues].filter((issue) =>
        currentUserId ? issue.reporterUser.id === currentUserId : true,
      );

      const openCountByDevice = new Map<number, number>();
      for (const issue of openIssueItems) {
        const deviceId = issue.parentDevice.id;
        const amount = Math.max(issue.deviceChildCount ?? 1, 1);
        openCountByDevice.set(deviceId, (openCountByDevice.get(deviceId) ?? 0) + amount);
      }

      const borrowedItems: RepairItem[] = borrowedTickets.data.map((ticket) => {
        const deviceId = ticket.device_summary.deviceId;
        const borrowedCount = Math.max(ticket.device_summary.total_quantity ?? 1, 1);
        const openedCount = openCountByDevice.get(deviceId) ?? 0;

        return {
          id: ticket.id,
          device_id: deviceId,
          title: `BORROW-${ticket.id}`,
          description: null,
          device_name: ticket.device_summary.name,
          quantity: borrowedCount,
          category: ticket.device_summary.category ?? "-",
          requester_name: ticket.requester.fullname,
          requester_emp_code: ticket.requester.empcode ?? null,
          request_date: ticket.request_date ?? ticket.created_at ?? new Date().toISOString(),
          status: "IN_PROGRESS",
          can_repair: openedCount < borrowedCount,
        };
      });

      const borrowedDeviceIds = new Set(borrowedItems.map((item) => item.device_id).filter(Boolean));

      const otherOpenIssues = openIssueItems.filter(
        (issue) => !borrowedDeviceIds.has(issue.parentDevice.id),
      );

      const latestOtherByDevice = new Map<number, (typeof otherOpenIssues)[number]>();
      for (const issue of otherOpenIssues) {
        const existing = latestOtherByDevice.get(issue.parentDevice.id);
        if (!existing || new Date(issue.reportedAt).getTime() > new Date(existing.reportedAt).getTime()) {
          latestOtherByDevice.set(issue.parentDevice.id, issue);
        }
      }

      const otherItems: RepairItem[] = Array.from(latestOtherByDevice.values()).map((issue) => ({
        id: issue.issueId,
        device_id: issue.parentDevice.id,
        title: issue.issueTitle,
        description: issue.issueDescription,
        device_name: issue.parentDevice.name,
        quantity: Math.max(issue.deviceChildCount ?? 1, 1),
        category: issue.parentDevice.categoryName ?? "-",
        requester_name: issue.reporterUser.fullName,
        requester_emp_code: issue.reporterUser.empCode ?? null,
        request_date: issue.reportedAt,
        status: issue.issueStatus,
        can_repair: false,
      }));

      setAllItems([...borrowedItems, ...otherItems]);
    } catch {
      push({ tone: "danger", message: "ไม่สามารถโหลดรายการแจ้งซ่อมได้" });
    } finally {
      setLoading(false);
    }
  }, [search, sortDirection, sortField, push]);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

    /**
   * handleSort
   * Description: จัดการการคลิกเพื่อเปลี่ยนการจัดเรียงข้อมูล
   * Input      : field (ฟิลด์ที่ต้องการใช้ในการจัดเรียง)
   * Output     : อัปเดตค่าของ sortField และ sortDirection
   * Author     : Rachata Jitjeankhan (Tang) 66160369
   */
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("desc");
  };

  /**
   * getSortIcon
   * Description: คืนค่ารูปไอคอนการจัดเรียง
   * Input      : field (ฟิลด์ที่ต้องการตรวจสอบ)
   * Output     : รูปไอคอนสำหรับการจัดเรียง
   * Author     : Rachata Jitjeankhan (Tang) 66160369
   */
  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up";
    }
    return "bx:sort-down"; // default icon
  };

  /**
   * handleOpenAction
   * Description: จัดการเมื่อคลิกเปิดรายการแจ้งซ่อม
   * Input      : item (รายการแจ้งซ่อมที่เลือก)
   * Output     : การเปิดรายการแจ้งซ่อมเพื่อดูรายละเอียด (ยังไม่ได้กำหนดการทำงาน)
   * Author     : Rachata Jitjeankhan (Tang) 66160369
   */
  const handleOpenAction = (item: RepairItem) => {
    if (!item.can_repair) {
      return;
    }

    if (!item.device_id) {
      push({ tone: "danger", message: "ไม่พบข้อมูลอุปกรณ์ที่กำลังยืมอยู่" });
      return;
    }

    navigate(`${repairRequestPath}?mode=other&deviceId=${item.device_id}`, {
      state: {
        selectedRepairItem: {
          issueId: 0,
          deviceId: item.device_id,
          deviceName: item.device_name,
          category: item.category,
          requesterName: item.requester_name,
          requesterEmpCode: item.requester_emp_code,
        },
      } as RepairRequestNavigationState,
    });
  };

  const handleOpenOtherDeviceForm = () => {
    navigate(`${repairRequestPath}?mode=other`);
  };

  return (
    <div className="p-5">
      <div className="mb-5 flex flex-col">
        <span className="mb-[8px]">แจ้งซ่อม</span>
        <div className="flex items-center gap-[14px]">
          <h1 className="text-2xl font-semibold">แจ้งซ่อม</h1>
          <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
            รายการทั้งหมด {allItems.length}
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <SearchFilter onChange={({ search: value }) => setSearch(value)} />

        <div className="flex flex-wrap items-center gap-2">
          <DropDown
            items={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="หมวดหมู่"
            searchable
            className="w-[210px]"
          />
          <button
            type="button"
            className="h-[46px] rounded-full bg-[#F44336] px-6 text-base font-medium text-white"
            onClick={handleOpenOtherDeviceForm}
          >
            แจ้งซ่อมอุปกรณ์อื่น
          </button>
        </div>
      </div>

      <RepairManagementTable
        items={paginatedItems}
        loading={loading}
        onSort={handleSort}
        getSortIcon={getSortIcon}
        onOpenAction={handleOpenAction}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

    </div>
  );
}
