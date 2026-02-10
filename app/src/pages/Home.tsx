import { useState, useMemo, useEffect, useRef } from "react";
import CardHome from "../components/CardHome";
import RequestItemHome from "../components/RequestItemHome";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  homeService,
  type TicketHomeItem,
  type HomeStats,
  type TicketDetail,
} from "../services/HomeService";

// Types สำหรับ Sorting
type SortField =
  | "device_name"
  | "quantity"
  | "category"
  | "requester"
  | "request_date"
  | "return_date"
  | "status";

type SortDirection = "asc" | "desc";

/**
 * Description: หน้า Dashboard หลัก แสดงภาพรวมระบบ (Stats) และรายการคำร้องล่าสุด
 * รองรับการเรียงลำดับ (Sorting) และดูรายละเอียดแบบ Expand
 * Input     : -
 * Output    : JSX Element (Dashboard Page)
 * Author    : Worrawat Namwat (Wave) 66160372
 */
export const Home = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const expandId = id
    ? parseInt(id)
    : (location.state as { expandId?: number })?.expandId;
  // --- Data States (ข้อมูลจริงจาก Backend) ---
  const [stats, setStats] = useState<HomeStats>({
    borrowed: 0,
    returned: 0,
    waiting: 0,
    report: 0,
  });
  const [tickets, setTickets] = useState<TicketHomeItem[]>([]);

  // --- UI States ---
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // เก็บรายละเอียด Ticket ที่เคยโหลดแล้ว (Cache) เพื่อไม่ต้องดึงซ้ำ
  const [ticketDetails, setTicketDetails] = useState<
    Record<number, TicketDetail>
  >({});
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // --- Sorting States ---
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  /**
   * Description: ดึงข้อมูลเริ่มต้น (Stats และ Recent Tickets) เมื่อโหลดหน้าเว็บ
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // ดึงข้อมูล Stats และ Recent Tickets พร้อมกัน
        const [statsRes, ticketsRes] = await Promise.all([
          homeService.getHomeStats(),
          homeService.getRecentTickets(),
        ]);

        // ตรวจสอบโครงสร้างข้อมูล (เผื่อมี wrapper { data: ... })
        const statsData = (statsRes as any).data || statsRes;
        const ticketsData = (ticketsRes as any).data || ticketsRes;

        setStats(statsData);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
        // toast.push({ message: "ไม่สามารถโหลดข้อมูลหน้าแรกได้", tone: "danger" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  /**
   * Description: Auto-expand ticket เมื่อมี expandId จาก URL/location.state
   *              หรือ redirect ไป /history/:id ถ้าไม่พบใน 5 รายการล่าสุด
   * Input     : expandId, tickets, isLoading
   * Output    : void
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const processedExpandIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Debug log
    console.log('[Home] useEffect triggered:', {
      expandId,
      isLoading,
      ticketCount: tickets.length,
      ticketIds: tickets.map(t => t.id),
      processedExpandId: processedExpandIdRef.current
    });

    // ไม่มี expandId ให้ทำอะไร
    if (!expandId) return;

    // รอให้โหลด tickets เสร็จก่อน
    if (isLoading) {
      console.log('[Home] Still loading, waiting...');
      return;
    }

    // ถ้ายังไม่มี tickets และไม่ได้ loading แสดงว่า load เสร็จแต่ไม่มี tickets
    // ให้ redirect ไป history
    if (tickets.length === 0) {
      console.log('[Home] No tickets, redirecting to history');
      const pathParts = location.pathname.split('/').filter(Boolean);
      const rolePrefix = pathParts.length > 0 ? `/${pathParts[0]}` : '';
      navigate(`${rolePrefix}/history/${expandId}`, { replace: true });
      return;
    }

    // ป้องกันการประมวลผลซ้ำสำหรับ expandId เดียวกัน
    if (processedExpandIdRef.current === expandId) {
      console.log('[Home] Already processed this expandId');
      return;
    }

    // ตรวจสอบว่า ticket อยู่ใน 5 รายการล่าสุดหรือไม่
    console.log('[Home] Checking ticket match:', {
      expandId,
      expandIdType: typeof expandId,
      ticketIds: tickets.map(t => ({ id: t.id, type: typeof t.id, matches: t.id === expandId }))
    });
    const ticketExists = tickets.some((t) => t.id === expandId);
    console.log('[Home] ticketExists:', ticketExists);

    if (ticketExists) {
      // พบ ticket - auto-expand
      console.log('[Home] Found ticket, expanding:', expandId);
      processedExpandIdRef.current = expandId;
      setExpandedId(expandId);
    } else {
      // ไม่พบ ticket ใน Home - redirect ไป History
      console.log('[Home] Ticket not found, redirecting to history');
      processedExpandIdRef.current = expandId;
      const pathParts = location.pathname.split('/').filter(Boolean);
      const rolePrefix = pathParts.length > 0 ? `/${pathParts[0]}` : '';
      navigate(`${rolePrefix}/history/${expandId}`, { replace: true });
    }
  }, [expandId, tickets, isLoading, navigate, location.pathname]);

  /**
   * Description: จัดการการขยาย/ย่อ รายการคำร้อง (Expand/Collapse)
   * - ถ้ากดขยาย และยังไม่มีข้อมูลใน Cache ให้ดึงจาก API
   * Input     : id (รหัสคำร้องที่ต้องการขยาย/ย่อ)
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  const handleExpand = async (id: number) => {
    const newExpandedId = expandedId === id ? null : id;

    setExpandedId(newExpandedId);

    // ถ้ากดขยาย และยังไม่มีข้อมูลใน Cache ให้ดึงจาก API
    if (newExpandedId && !ticketDetails[id]) {
      setIsLoadingDetail(true);
      try {
        const detailRes = await homeService.getTicketDetail(id);
        const detailData = (detailRes as any).data || detailRes;

        setTicketDetails((prev) => ({
          ...prev,
          [id]: detailData,
        }));
      } catch (error) {
        console.error(`Failed to fetch detail for ticket ${id}:`, error);
        // toast.push({ message: "ไม่สามารถโหลดรายละเอียดได้", tone: "danger" });
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  /**
   * Description: จัดการการเปลี่ยนเงื่อนไขการเรียงลำดับ (Sort)
   * - ถ้ากด field เดิม: สลับ asc <-> desc
   * - ถ้ากด field ใหม่: เริ่มต้นที่ asc
   * Input     : field (ชื่อคอลัมน์ที่ต้องการเรียง)
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // ปุ่ม sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return "bx:sort-down";
    }
    return sortDirection === "asc" ? "bx:sort-up" : "bx:sort-down";
  };

  /**
   * Description: คำนวณรายการ Tickets ที่เรียงลำดับแล้ว (Memoized)
   * จะคำนวณใหม่เมื่อ tickets, sortField หรือ sortDirection เปลี่ยนแปลง
   * Output    : Array ของ TicketHomeItem ที่เรียงลำดับแล้ว
   * Author    : Worrawat Namwat (Wave) 66160372
   */
  const sortedTickets = useMemo(() => {
    if (!sortField) return tickets;

    return [...tickets].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      // Helper function to safely get dates
      const getStartDate = (item: TicketHomeItem) =>
        item.dates?.start || item.request_date || "";
      const getEndDate = (item: TicketHomeItem) =>
        item.dates?.end || item.dates?.return || item.return_date || "";

      switch (sortField) {
        case "device_name":
          valA = a.device_summary.name;
          valB = b.device_summary.name;
          break;
        case "quantity":
          valA = a.device_summary.total_quantity;
          valB = b.device_summary.total_quantity;
          break;
        case "category":
          valA = a.device_summary.category;
          valB = b.device_summary.category;
          break;
        case "requester":
          valA = a.requester.fullname;
          valB = b.requester.fullname;
          break;
        case "request_date":
          valA = new Date(getStartDate(a)).getTime();
          valB = new Date(getStartDate(b)).getTime();
          break;
        case "return_date":
          valA = new Date(getEndDate(a)).getTime();
          valB = new Date(getEndDate(b)).getTime();
          break;
        case "status":
          valA = a.status;
          valB = b.status;
          break;
        default:
          return 0;
      }

      if (typeof valA === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB, "th")
          : valB.localeCompare(valA, "th");
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [tickets, sortField, sortDirection]);

  return (
    <div className="w-full min-w-0 px-6 lg:px-8 overflow-x-hidden">
      <h1 className="text-2xl font-semibold my-4">หน้าแรก</h1>
      <div className="mt-6 w-full">
        <div className="flex flex-wrap gap-6 pb-4 w-full">
          <CardHome
            cardType="Borrowed"
            title="กำลังยืม"
            count={stats.borrowed}
            className="flex-1"
          />
          <CardHome
            cardType="Returned"
            title="ใกล้เวลาคืน"
            count={stats.returned}
            className="flex-1"
          />
          <CardHome
            cardType="Waiting"
            title="รออนุมัติ"
            count={stats.waiting}
            className="flex-1"
          />
          <CardHome
            cardType="Report"
            title="แจ้งปัญหา"
            count={stats.report}
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-3 mb-4 mt-5">
          <h1 className="text-2xl font-semibold leading-none">
            รายการคำร้องยืมของฉัน
          </h1>
          <span className="text-sm text-[#858585] leading-none">
            แสดง 5 รายการล่าสุด
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div
              className="w-full bg-white border border-[#D8D8D8] font-medium text-[#000000] rounded-[16px] mb-[16px] h-[61px] grid
  lg:[grid-template-columns:1.6fr_0.7fr_1fr_1.2fr_1fr_1fr_0.9fr_40px]
  xl:[grid-template-columns:2fr_0.8fr_1.2fr_1.5fr_1.2fr_1.2fr_1fr_50px] items-center px-6 whitespace-nowrap"
            >
              <div
                className="flex items-center px-2 cursor-pointer select-none"
                onClick={() => handleSort("device_name")}
              >
                อุปกรณ์
                <Icon
                  icon={getSortIcon("device_name")}
                  width="24"
                  className="ml-1"
                />
              </div>
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => handleSort("quantity")}
              >
                จำนวน
                <Icon
                  icon={getSortIcon("quantity")}
                  width="24"
                  className="ml-1"
                />
              </div>
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => handleSort("category")}
              >
                หมวดหมู่
                <Icon
                  icon={getSortIcon("category")}
                  width="24"
                  className="ml-1"
                />
              </div>
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => handleSort("requester")}
              >
                ชื่อผู้ร้องขอ
                <Icon
                  icon={getSortIcon("requester")}
                  width="24"
                  className="ml-1"
                />
              </div>
              <div
                className="flex items-center cursor-pointer select-none "
                onClick={() => handleSort("request_date")}
              >
                วันที่ร้องขอ
                <Icon
                  icon={getSortIcon("request_date")}
                  width="24"
                  className="ml-1"
                />
              </div>
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => handleSort("return_date")}
              >
                วันที่คืน
                <Icon
                  icon={getSortIcon("return_date")}
                  width="24"
                  className="ml-1"
                />
              </div>
              <div
                className="flex items-center cursor-pointer select-none "
                onClick={() => handleSort("status")}
              >
                สถานะ
                <Icon icon={getSortIcon("status")} width="24" className="ml-1" />
              </div>
            </div>

            {/* List */}
            <div className="w-full bg-white border border-[#D8D8D8] rounded-[16px] overflow-hidden relative ">
              {isLoading ? (
                <div className="text-center text-[#858585] py-10 flex flex-col items-center">
                  <Icon
                    icon="eos-icons:loading"
                    width="40"
                    className="mb-2 text-[#40A9FF]"
                  />
                  กำลังโหลดข้อมูล...
                </div>
              ) : sortedTickets.length === 0 ? (
                <div className="text-center text-[#858585] py-10 flex flex-col items-center">
                  <Icon
                    icon="tabler:database-off"
                    width="48"
                    className="mb-2 opacity-50"
                  />
                  ยังไม่มีรายการคำร้อง
                </div>
              ) : (
                sortedTickets
                  .slice(0, 5)
                  .map((ticket) => (
                    <RequestItemHome
                      key={ticket.id}
                      ticket={ticket}
                      ticketDetail={ticketDetails[ticket.id]}
                      isLoadingDetail={
                        expandedId === ticket.id && isLoadingDetail
                      }
                      onExpand={() => handleExpand(ticket.id)}
                      forceExpand={expandedId === ticket.id}
                    />
                  ))
              )}
              <div className="flex justify-end px-6 py-4  border-gray-100 bg-white relative ">
                <Link
                  to="/history"
                  className="text-[#7BACFF] text-sm font-medium hover:text-[#40A9FF] hover:underline cursor-pointer flex items-center gap-1"
                >
                  ดูเพิ่มเติม
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
