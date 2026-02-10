// src/pages/History.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams, useLocation } from "react-router-dom";
import HistoryBorrowTicket from "../components/HistoryBorrowTicketCard";
import {
  historyBorrowService,
  type GetHistoryBorrowListParams,
  type HistoryBorrowStatus,
  type HistoryBorrowTicketDetail,
  type HistoryBorrowTicketItem,
  type HistoryBorrowSortField,
} from "../services/HistoryBorrowService.ts";
import DropDown from "../components/DropDown";
import SearchFilter from "../components/SearchFilter";
import { currentUserService, type CurrentUserProfile } from "../services/CurrentUserService";
import {
  approvalHistoryService,
  type HistoryApprovalDetail,
  type HistoryApprovalItem,
  type ApprovalDecision,
  type GetHistoryApprovalListParams,
  type HistoryApprovalSortField,
  type SortDirection,
} from "../services/HistoryApprovalService.ts";

import ApprovalHistoryDetailModal from "../components/HistoryApprovalDetailModal";


/**
 * Description: คีย์ของแท็บในหน้า History
 * Input : - (ใช้เป็น union type)
 * Output : ใช้ควบคุมการ render เนื้อหาแต่ละแท็บ
 * Author: Chanwit Muangma (Boom) 66160224
 */
type TabKey = "borrow" | "repair" | "approve";

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Input : xs (Array<string | false | undefined | null>)
 * Output : string (className)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function classNames(...classNameParts: Array<string | false | undefined | null>) {
  return classNameParts.filter(Boolean).join(" ");
}

/**
 * Description: Type ของ option สำหรับ filter สถานะ (DropDown)
 * Author: Chanwit Muangma (Boom) 66160224
 */
type StatusOption = {
  id: "ALL" | HistoryBorrowStatus;
  label: string;
  value: "" | HistoryBorrowStatus;
};
const allowedRolesForApprovalHistory = ["ADMIN", "STAFF", "HOD", "HOS"] as const;

/**
 * Description: หน้า History (รวม 3 แท็บ) โดยแท็บหลักที่ใช้งานคือ “ประวัติยืม-คืน”
 * Input : - (React Page)
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */
export default function History() {
  const didInitializeSearchRef = useRef(false);
  const lastSearchTextRef = useRef<string>("");

  // Get expandId from URL params or location state
  const { id } = useParams();
  const location = useLocation();
  const expandId = id
    ? parseInt(id)
    : (location.state as { expandId?: number })?.expandId;

  /**
   * Description: handler รับค่าจาก SearchFilter แล้วอัปเดต search + reset pagination
   * Input : nextSearch (string)
   * Output : void (อัปเดต state ภายใน)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const handleSearchChange = ({ search: nextSearch }: { search: string }) => {
    if (!didInitializeSearchRef.current) {
      didInitializeSearchRef.current = true;
      lastSearchTextRef.current = nextSearch ?? "";
      return;
    }

    const normalizedSearchText = (nextSearch ?? "").trim();
    if (normalizedSearchText === lastSearchTextRef.current) return;

    lastSearchTextRef.current = normalizedSearchText;
    setSearchText(normalizedSearchText);
    setCurrentPage(1);
    setExpandedTicketIds(new Set());
  };

  const statusOptions: readonly StatusOption[] = [
    { id: "ALL", label: "ทั้งหมด", value: "" },
    { id: "PENDING", label: "รออนุมัติ", value: "PENDING" },
    { id: "APPROVED", label: "อนุมัติแล้ว", value: "APPROVED" },
    { id: "IN_USE", label: "กำลังใช้งาน", value: "IN_USE" },
    { id: "COMPLETED", label: "คืนแล้ว", value: "COMPLETED" },
    { id: "OVERDUE", label: "เลยกำหนด", value: "OVERDUE" },
    { id: "REJECTED", label: "ปฏิเสธ", value: "REJECTED" },
  ] as const;

  const [activeTabKey, setActiveTabKey] = useState<TabKey>("borrow");

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<HistoryBorrowStatus | "">("");

  const [selectedStatusOption, setSelectedStatusOption] = useState<StatusOption>(
    statusOptions[0]
  );

  const [sortField, setSortField] = useState<HistoryBorrowSortField>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSizeLimit = 5;

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [ticketItems, setTicketItems] = useState<HistoryBorrowTicketItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [expandedTicketIds, setExpandedTicketIds] = useState<Set<number>>(new Set());

  const [ticketDetailByIdMap, setTicketDetailByIdMap] = useState<
    Record<number, HistoryBorrowTicketDetail | undefined>
  >({});

  const [loadingDetailTicketId, setLoadingDetailTicketId] = useState<number | null>(null);



  /**
   * Description: reset state เมื่อสลับแท็บ
   * - borrow: reset page และการ expand การ์ด
   * - approve: reset page ของ approval ด้วย
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    setCurrentPage(1);
    setExpandedTicketIds(new Set());

    setApprovalCurrentPage(1);
    setApprovalSearchText("");
    setSelectedApprovalDecision("");
    setSelectedApprovalDecisionOption(approvalDecisionOptions[0]);
  }, [activeTabKey]);


  const queryParams: GetHistoryBorrowListParams = useMemo(() => {
    const trimmedSearchText = searchText.trim();

    return {
      page: currentPage,
      limit: pageSizeLimit,
      search: trimmedSearchText ? trimmedSearchText : undefined,
      status: selectedStatus || undefined,
      sortField,
      sortDirection,
    };
  }, [currentPage, pageSizeLimit, searchText, selectedStatus, sortField, sortDirection]);

  // Track if we have a mock item for expandId that shouldn't be overwritten
  const mockExpandIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeTabKey !== "borrow") return;

    let isCancelled = false;

    const loadHistoryBorrowList = async () => {
      try {
        setIsLoadingList(true);
        const response = await historyBorrowService.getHistoryBorrowTickets(queryParams);
        if (isCancelled) return;

        // ถ้ามี mock item สำหรับ expandId ให้รวมเข้าไปด้วย
        if (mockExpandIdRef.current) {
          const mockId = mockExpandIdRef.current;
          // ตรวจสอบว่า mock item อยู่ใน response หรือไม่
          const existsInResponse = response.items.some((t: HistoryBorrowTicketItem) => t.ticketId === mockId);
          if (!existsInResponse) {
            // หา mock item จาก ticketItems ปัจจุบัน
            setTicketItems(prev => {
              const mockItem = prev.find(t => t.ticketId === mockId);
              if (mockItem) {
                return [mockItem, ...response.items];
              }
              return response.items;
            });
          } else {
            setTicketItems(response.items);
          }
        } else {
          setTicketItems(response.items);
        }
        setTotalPages(response.pagination.totalPages || 1);
      } catch (error) {
        if (isCancelled) return;
        console.error(error);
        setTicketItems([]);
        setTotalPages(1);
      } finally {
        if (!isCancelled) setIsLoadingList(false);
      }
    };

    loadHistoryBorrowList();

    return () => {
      isCancelled = true;
    };
  }, [activeTabKey, queryParams]);

  /**
   * Description: Auto-expand ticket when navigating with expandId from notification/link
   *              If ticket not in current list, fetch it directly and add to list
   * Input : expandId (number | undefined)
   * Output : void (auto-triggers toggleOpen)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const lastExpandedIdRef = useRef<number | null>(null);
  useEffect(() => {
    // Debug log
    console.log('[History] useEffect triggered:', {
      expandId,
      isLoadingList,
      ticketCount: ticketItems.length,
      ticketIds: ticketItems.map(t => t.ticketId),
      lastExpandedId: lastExpandedIdRef.current
    });

    // ต้องมี expandId
    if (!expandId) return;

    // ถ้ายัง processing expandId เดิมอยู่ ข้าม
    if (lastExpandedIdRef.current === expandId) {
      console.log('[History] Already processed this expandId');
      return;
    }

    // รอให้โหลด list เสร็จก่อน
    if (isLoadingList) {
      console.log('[History] Still loading, waiting...');
      return;
    }

    const ticketExists = ticketItems.some((t) => t.ticketId === expandId);
    console.log('[History] ticketExists:', ticketExists);

    if (ticketExists) {
      // Ticket อยู่ใน list - expand มัน
      console.log('[History] Found ticket, expanding:', expandId);
      lastExpandedIdRef.current = expandId;
      setExpandedTicketIds((prev) => {
        const next = new Set(prev);
        next.add(expandId);
        return next;
      });
      // Load detail if not already loaded
      if (!ticketDetailByIdMap[expandId]) {
        setLoadingDetailTicketId(expandId);
        historyBorrowService.getHistoryBorrowTicketDetail(expandId)
          .then((detail) => {
            setTicketDetailByIdMap((prev) => ({ ...prev, [expandId]: detail }));
          })
          .catch((error) => {
            console.error(error);
            setTicketDetailByIdMap((prev) => ({ ...prev, [expandId]: undefined }));
          })
          .finally(() => {
            setLoadingDetailTicketId(null);
          });
      }
    } else {
      // Ticket ไม่อยู่ใน list ปัจจุบัน - fetch โดยตรงและเพิ่มเข้า list
      console.log('[History] Ticket not in list, fetching directly:', expandId);
      lastExpandedIdRef.current = expandId;
      setLoadingDetailTicketId(expandId);
      historyBorrowService.getHistoryBorrowTicketDetail(expandId)
        .then((detail) => {
          console.log('[History] Fetched detail, creating mock item');
          // สร้าง mock ticket item จาก detail
          const mockTicketItem: HistoryBorrowTicketItem = {
            ticketId: detail.ticketId,
            status: detail.status,
            requestDateTime: detail.requestDateTime,
            deviceChildCount: detail.deviceChildCount,
            requester: {
              userId: detail.requester.userId,
              fullName: detail.requester.fullName,
              employeeCode: detail.requester.employeeCode,
              department_name: detail.requester.department_name,
              section_name: detail.requester.section_name,
            },
            deviceSummary: {
              deviceId: detail.device.deviceId,
              deviceName: detail.device.deviceName,
              deviceSerialNumber: detail.device.deviceSerialNumber,
              categoryName: detail.device.categoryName,
            },
          };
          // เพิ่ม mock item ไว้ต้น list และ track ไว้ไม่ให้โดน overwrite
          mockExpandIdRef.current = expandId;
          setTicketItems((prev) => {
            if (prev.some((t) => t.ticketId === expandId)) return prev;
            return [mockTicketItem, ...prev];
          });
          console.log('[History] Mock item added, setting expanded');
          setTicketDetailByIdMap((prev) => ({ ...prev, [expandId]: detail }));
          setExpandedTicketIds((prev) => {
            const next = new Set(prev);
            next.add(expandId);
            console.log('[History] expandedTicketIds now:', Array.from(next));
            return next;
          });
        })
        .catch((error) => {
          console.error("[History] Failed to fetch ticket for expandId:", error);
        })
        .finally(() => {
          setLoadingDetailTicketId(null);
        });
    }
  }, [expandId, ticketItems, ticketDetailByIdMap, isLoadingList]);

  /**
   * Description: จัดการคลิก sort ที่หัวตาราง โดยสลับทิศทางเมื่อคลิกซ้ำคอลัมน์เดิม
   * Input : field (HistoryBorrowSortField)
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const onClickSort = (field: HistoryBorrowSortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
      setCurrentPage(1);
      return;
    }

    setSortDirection((previousDirection) => (previousDirection === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  /**
   * Description: สลับเปิด/ปิดการขยายการ์ด (เปิดได้หลายใบพร้อมกัน) และโหลด detail เฉพาะเมื่อยังไม่มีใน cache
   * Input : ticketId (number)
   * Output : Promise<void>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const toggleOpen = async (ticketId: number) => {
    const isCurrentlyOpen = expandedTicketIds.has(ticketId);
    const nextWillOpen = !isCurrentlyOpen;

    setExpandedTicketIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });

    if (!nextWillOpen) return;
    if (ticketDetailByIdMap[ticketId]) return;
    if (loadingDetailTicketId === ticketId) return;

    try {
      setLoadingDetailTicketId(ticketId);
      const detail = await historyBorrowService.getHistoryBorrowTicketDetail(ticketId);
      setTicketDetailByIdMap((prev) => ({ ...prev, [ticketId]: detail }));
    } catch (error) {
      console.error(error);
      setTicketDetailByIdMap((prev) => ({ ...prev, [ticketId]: undefined }));
    } finally {
      setLoadingDetailTicketId(null);
    }
  };

  /**
   * Description: เลือกไอคอน sort ตามคอลัมน์ที่กำลัง sort และทิศทางการ sort
   * Input : currentSortField, targetField, direction
   * Output : string (iconify icon name)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const getSortIcon = (
    currentSortField: string,
    targetField: string,
    direction: "asc" | "desc"
  ) => {
    if (currentSortField !== targetField) return "bx:sort-down";
    if (direction === "asc") return "bx:sort-up";
    return "bx:sort-down";
  };


  /**
   * Description: เก็บข้อมูลผู้ใช้ปัจจุบันขั้นต่ำที่จำเป็นสำหรับการเช็คสิทธิ์การแสดงผลแท็บ "ประวัติการอนุมัติ"
   * - ดึงผ่าน currentUserService.getCurrentUserProfile() (ซึ่ง normalize แล้ว เช่น userRole)
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [currentUserProfile, setCurrentUserProfile] =
    useState<CurrentUserProfile | null>(null);

  /**
   * Description: สถานะการโหลดข้อมูลผู้ใช้ปัจจุบัน
   * - ใช้กัน UI กระพริบ และกันเงื่อนไขเช็คสิทธิ์ผิดก่อนโหลดเสร็จ
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isLoadingCurrentUserProfile, setIsLoadingCurrentUserProfile] =
    useState<boolean>(true);

  /**
   * Description: ดึงข้อมูลผู้ใช้ปัจจุบันเมื่อเข้าหน้า History
   * - เรียกผ่าน currentUserService เพื่อให้ได้ข้อมูลที่ normalize แล้ว (เช่น userRole)
   * - ใช้สำหรับตรวจสิทธิ์การแสดงผลแท็บ "ประวัติการอนุมัติ"
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        setIsLoadingCurrentUserProfile(true);

        const profile = await currentUserService.getCurrentUserProfile();
        setCurrentUserProfile(profile);

        console.log("[History] currentUserProfile =", profile);

      } catch (error) {
        console.log("[History] fetch current user profile failed", error);
        setCurrentUserProfile(null);
      } finally {
        setIsLoadingCurrentUserProfile(false);
      }
    };

    fetchCurrentUserProfile();
  }, []);

  /**
   * Description: เงื่อนไขการมองเห็นแท็บ "ประวัติการอนุมัติ"
   * - อนุญาตเฉพาะ Role: ADMIN, STAFF, HOD, HOS
   * - ใช้ field userRole (มาจาก currentUserService ที่ map จาก us_role)
   * - ทำ normalize role ด้วย trim + toUpperCase เพื่อกันค่ามีช่องว่าง/ตัวพิมพ์เล็ก
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const canViewApprovalHistoryTab = useMemo(() => {
    const normalizedUserRole = String(currentUserProfile?.userRole ?? "")
      .trim()
      .toUpperCase();

    return allowedRolesForApprovalHistory.includes(normalizedUserRole as any);
  }, [currentUserProfile]);

  /**
   * Description: กันกรณีผู้ใช้ไม่มีสิทธิ์ แต่ activeTabKey ถูกตั้งเป็น "approve"
   * - เช่น restore state / มีโค้ดอื่นตั้งค่า / ผู้ใช้เข้าหน้านี้จากสถานะเดิม
   * - ถ้าไม่มีสิทธิ์ ให้เด้งกลับไปแท็บ "borrow"
   * - รอให้โหลดข้อมูลผู้ใช้เสร็จก่อน (isLoadingCurrentUserProfile) เพื่อไม่ให้เด้งผิดตอนยังไม่รู้ role
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (
      !isLoadingCurrentUserProfile &&
      !canViewApprovalHistoryTab &&
      activeTabKey === "approve"
    ) {
      setActiveTabKey("borrow");
    }
  }, [isLoadingCurrentUserProfile, canViewApprovalHistoryTab, activeTabKey]);

  
  // History-Approval
  /**
   * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
   * Input : classNameParts (Array<string | false | undefined | null>)
   * Output : string (className)
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  function mergeClassNames(...classNameParts: Array<string | false | undefined | null>) {
    return classNameParts.filter(Boolean).join(" ");
  }

  /**
   * Description: ฟอร์แมตวันเวลาให้เป็นรูปแบบภาษาไทย (ใกล้เคียง mock)
   * Input : isoString (string)
   * Output : string
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  function formatThaiDateTime(isoString: string): string {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Description: option สำหรับ filter ผลการอนุมัติในแท็บ "ประวัติการอนุมัติ"
   * Author: Chanwit Muangma (Boom) 66160224
   */
  type ApprovalDecisionOption = {
    id: "ALL" | ApprovalDecision;
    label: string;
    value: "" | ApprovalDecision;
  };

  const approvalDecisionOptions: readonly ApprovalDecisionOption[] = [
    { id: "ALL", label: "ทั้งหมด", value: "" },
    { id: "APPROVED", label: "อนุมัติคำขอ", value: "APPROVED" },
    { id: "REJECTED", label: "ปฏิเสธคำขอ", value: "REJECTED" },
  ] as const;

  /**
   * Description: state สำหรับ list "ประวัติการอนุมัติ"
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [approvalSearchText, setApprovalSearchText] = useState<string>("");
  const [selectedApprovalDecision, setSelectedApprovalDecision] = useState<ApprovalDecision | "">("");
  const [selectedApprovalDecisionOption, setSelectedApprovalDecisionOption] =
    useState<ApprovalDecisionOption>(approvalDecisionOptions[0]);

  const [isLoadingApprovalList, setIsLoadingApprovalList] = useState<boolean>(false);
  const [approvalItems, setApprovalItems] = useState<HistoryApprovalItem[]>([]);
  const [approvalCurrentPage, setApprovalCurrentPage] = useState<number>(1);
  const [approvalTotalPages, setApprovalTotalPages] = useState<number>(1);
  const approvalPageSizeLimit = 5;



    /**
   * Description: state สำหรับ sort ของแท็บ "ประวัติการอนุมัติ"
   * - sortField: ฟิลด์ที่ใช้ sort
   * - sortDirection: ทิศทางการ sort
   * - หมายเหตุ: categoryName จะ sort ฝั่งหน้า (in-memory) เพราะ backend ยังไม่รับ sortField นี้
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  type ApprovalSortFieldUI = HistoryApprovalSortField | "categoryName";

  const [approvalSortField, setApprovalSortField] =
    useState<ApprovalSortFieldUI>("actionDateTime");
  const [approvalSortDirection, setApprovalSortDirection] =
    useState<SortDirection>("desc");

  /**
   * Description: คลิกหัวตารางเพื่อ sort (ตรรกะเหมือนประวัติยืม-คืน)
   * - คลิกคอลัมน์ใหม่: เปลี่ยน field และตั้ง direction เริ่มต้นเป็น "asc" (เพื่อให้ icon เปลี่ยนทันที)
   * - คลิกคอลัมน์เดิม: สลับ asc/desc
   * - reset หน้าเป็น 1 เพื่อไม่ให้ pagination เพี้ยน
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const onClickApprovalSort = (field: ApprovalSortFieldUI) => {
    if (approvalSortField !== field) {
      setApprovalSortField(field);
      setApprovalSortDirection("asc"); // เหมือน borrow: เปลี่ยน field แล้วเริ่ม asc
      setApprovalCurrentPage(1);
      return;
    }

    setApprovalSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
    setApprovalCurrentPage(1);
  };

  /**
   * Description: icon สำหรับแสดงสถานะ sort ในหัวตาราง
   * - ใช้ helper เดียวกับ borrow (getSortIcon)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const getApprovalSortIcon = (field: ApprovalSortFieldUI) => {
    return getSortIcon(String(approvalSortField), String(field), approvalSortDirection);
  };


  /**
   * Description: state สำหรับ Modal รายละเอียด "ประวัติการอนุมัติ"
   * - selectedApprovalTicketId: เก็บ ticketId ของรายการที่ผู้ใช้กด "รายละเอียด"
   * - ใช้ร่วมกับ useEffect เพื่อ trigger โหลด detail เมื่อ id เปลี่ยน
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isApprovalDetailModalOpen, setIsApprovalDetailModalOpen] = useState<boolean>(false);
  const [selectedApprovalTicketId, setSelectedApprovalTicketId] = useState<number | null>(null);
  const [isLoadingApprovalDetail, setIsLoadingApprovalDetail] = useState<boolean>(false);
  const [approvalDetail, setApprovalDetail] = useState<HistoryApprovalDetail | null>(null);

  /**
   * Description: handler ค้นหาในแท็บ "ประวัติการอนุมัติ"
   * - เปลี่ยน search แล้ว reset หน้าเป็น 1
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const handleApprovalSearchChange = ({ search }: { search: string }) => {
    const normalizedSearchText = (search ?? "").trim();
    setApprovalSearchText(normalizedSearchText);
    setApprovalCurrentPage(1);
  };

    /**
     * Description: query params สำหรับเรียก list "ประวัติการอนุมัติ"
     * - ส่งเป็น action ให้ตรงกับ backend (APPROVED/REJECTED)
     * - ส่ง sortField/sortDirection ให้ backend เฉพาะฟิลด์ที่ backend รองรับ
     * - ถ้าเลือก sort "categoryName" จะไม่ส่งไป backend (แล้วค่อย sort ฝั่งหน้า)
     *
     * Author: Chanwit Muangma (Boom) 66160224
     */
    const approvalQueryParams: GetHistoryApprovalListParams = useMemo(() => {
      const trimmedSearchText = approvalSearchText.trim();

      /**
       * Description: backend ยังไม่รองรับ sort categoryName
       * Author: Chanwit Muangma (Boom) 66160224
       */
      const backendSortableField =
        approvalSortField === "categoryName" ? undefined : approvalSortField;

      return {
        page: approvalCurrentPage,
        limit: approvalPageSizeLimit,
        search: trimmedSearchText ? trimmedSearchText : undefined,

        // สำคัญ: ใช้ชื่อ action ให้ตรงกับ backend
        action: selectedApprovalDecision || undefined,

        /**
         * Description: ส่ง sort ให้ backend เฉพาะ field ที่รองรับ
         * Author: Chanwit Muangma (Boom) 66160224
         */
        sortField: backendSortableField,
        sortDirection: backendSortableField ? approvalSortDirection : undefined,
      };
    }, [
      approvalCurrentPage,
      approvalPageSizeLimit,
      approvalSearchText,
      selectedApprovalDecision,
      approvalSortField,
      approvalSortDirection,
    ]);

  /**
   * Description: โหลด list "ประวัติการอนุมัติ" เมื่ออยู่แท็บ approve และมีสิทธิ์
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (activeTabKey !== "approve") return;
    if (!canViewApprovalHistoryTab) return;

    let isCancelled = false;

    const loadApprovalHistoryList = async () => {
      try {
        setIsLoadingApprovalList(true);

        console.log("[History][Approve] approvalQueryParams =", approvalQueryParams);

        const response = await approvalHistoryService.getHistoryApprovalList(approvalQueryParams);
        if (isCancelled) return;

        console.log("[History][Approve] list response =", response);

        setApprovalItems(Array.isArray(response.items) ? response.items : []);
        setApprovalTotalPages(response.pagination?.totalPages ? Number(response.pagination.totalPages) : 1);
      } catch (error) {
        if (isCancelled) return;
        console.error("[History][Approve] load list failed", error);
        setApprovalItems([]);
        setApprovalTotalPages(1);
      } finally {
        if (!isCancelled) setIsLoadingApprovalList(false);
      }
    };

    loadApprovalHistoryList();

    return () => {
      isCancelled = true;
    };
  }, [activeTabKey, canViewApprovalHistoryTab, approvalQueryParams]);

    /**
     * Description: รายการสำหรับ render ตาราง (รองรับ sort categoryName ฝั่งหน้า)
     * - ถ้าไม่ได้ sort categoryName จะใช้ approvalItems เดิม
     *
     * Author: Chanwit Muangma (Boom) 66160224
     */
    const approvalItemsForRender = useMemo(() => {
      if (approvalSortField !== "categoryName") return approvalItems;

      const copiedItems = [...approvalItems];

      copiedItems.sort((leftItem, rightItem) => {
        const leftValue = leftItem.device?.categoryName ?? "";
        const rightValue = rightItem.device?.categoryName ?? "";

        return approvalSortDirection === "asc"
          ? leftValue.localeCompare(rightValue)
          : rightValue.localeCompare(leftValue);
      });

      return copiedItems;
    }, [approvalItems, approvalSortField, approvalSortDirection]);


  

  /**
   * Description: เปิด Modal และโหลด detail "ประวัติการอนุมัติ" ตาม ticketId
   * - backend detail ใช้ path /history-approval/{ticketId}
   * - เปิด modal ก่อน แล้วค่อยโหลดข้อมูลเพื่อให้ UX คล่อง
   *
   * Input : ticketId (number)
   * Output : Promise<void>
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const openApprovalDetailModal = async (ticketId: number): Promise<void> => {
    setIsApprovalDetailModalOpen(true);

    // เก็บ ticketId ที่เลือก (ใช้เพื่อ debug/ต่อยอดได้ แม้ตอนนี้ไม่ได้ใช้ render)
    setSelectedApprovalTicketId(ticketId);
    setApprovalDetail(null);

    try {
      setIsLoadingApprovalDetail(true);

      // เรียก service ด้วย ticketId
      const detailResponse = await approvalHistoryService.getHistoryApprovalDetail(ticketId);
      setApprovalDetail(detailResponse);
    } catch (error) {
      console.error("[History][Approve] load detail failed", error);
      setApprovalDetail(null);
    } finally {
      setIsLoadingApprovalDetail(false);
    }
  };

  /**
   * Description: โหลด detail เมื่อ Modal เปิดและมี selectedApprovalTicketId
   * - แยก logic โหลดข้อมูลออกจาก handler เพื่อให้อ่านง่าย และใช้ state ได้จริง
   * - กัน race condition ด้วย flag cancelled
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (!isApprovalDetailModalOpen) return;
    if (!selectedApprovalTicketId) return;

    let isCancelled = false;

    const loadApprovalDetail = async () => {
      try {
        setIsLoadingApprovalDetail(true);

        const detailResponse =
          await approvalHistoryService.getHistoryApprovalDetail(selectedApprovalTicketId);

        if (isCancelled) return;
        setApprovalDetail(detailResponse);
      } catch (error) {
        if (isCancelled) return;
        console.error(error);
        setApprovalDetail(null);
      } finally {
        if (!isCancelled) setIsLoadingApprovalDetail(false);
      }
    };

    loadApprovalDetail();

    return () => {
      isCancelled = true;
    };
  }, [isApprovalDetailModalOpen, selectedApprovalTicketId]);

  /**
   * Description: ปิด Modal รายละเอียด
   * - reset state ที่เกี่ยวข้องเพื่อกันข้อมูลค้าง
   *
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const closeApprovalDetailModal = (): void => {
    setIsApprovalDetailModalOpen(false);
    setSelectedApprovalTicketId(null);
    setApprovalDetail(null);
  };


  

  

  




  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      <div className="text-sm text-neutral-500">ดูประวัติ</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
        ประวัติการยืม-คืน
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
      <TabButton
        active={activeTabKey === "borrow"}
        onClick={() => setActiveTabKey("borrow")}
      >
        ประวัติยืม-คืน
      </TabButton>

      <TabButton
        active={activeTabKey === "repair"}
        onClick={() => setActiveTabKey("repair")}
      >
        ประวัติการแจ้งซ่อม
      </TabButton>

      {/* 
        Description: แสดงแท็บ "ประวัติการอนุมัติ" เฉพาะ role ที่ได้รับอนุญาต
        - กันการ render ระหว่างโหลด role ด้วย isLoadingCurrentUserProfile
        Author: Chanwit Muangma (Boom) 66160224
      */}
      {!isLoadingCurrentUserProfile && canViewApprovalHistoryTab && (
        <TabButton
          active={activeTabKey === "approve"}
          onClick={() => setActiveTabKey("approve")}
        >
          ประวัติการอนุมัติ
        </TabButton>
      )}
    </div>
      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        {/* 
          Description: Search + Dropdown เปลี่ยนตามแท็บ
          - borrow ใช้ handleSearchChange + statusOptions
          - approve ใช้ handleApprovalSearchChange + approvalDecisionOptions
          Author: Chanwit Muangma (Boom) 66160224
        */}
        <div className="relative flex-1">
          {activeTabKey === "borrow" && <SearchFilter onChange={handleSearchChange} />}
          {activeTabKey === "approve" && <SearchFilter onChange={handleApprovalSearchChange} />}
          {activeTabKey === "repair" && <SearchFilter onChange={() => {}} />}
        </div>

        <div className="md:ml-auto">
          {activeTabKey === "borrow" && (
            <DropDown
              items={statusOptions as any}
              value={selectedStatusOption as any}
              onChange={(item: StatusOption) => {
                setSelectedStatusOption(item);

                const nextStatusValue = item.value || "";
                setSelectedStatus(nextStatusValue as HistoryBorrowStatus | "");

                setCurrentPage(1);
                setExpandedTicketIds(new Set());
              }}
              placeholder="สถานะ"
              searchable={false}
              dropdownHeight={240}
            />
          )}

          {activeTabKey === "approve" && (
            <DropDown
              items={approvalDecisionOptions as any}
              value={selectedApprovalDecisionOption as any}
              onChange={(item: ApprovalDecisionOption) => {
                /**
                 * Description: เปลี่ยน filter ผลการอนุมัติ แล้ว reset หน้าเป็น 1
                 * Author: Chanwit Muangma (Boom) 66160224
                 */
                setSelectedApprovalDecisionOption(item);

                const nextDecisionValue = item.value || "";
                setSelectedApprovalDecision(nextDecisionValue as ApprovalDecision | "");

                setApprovalCurrentPage(1);
              }}
              placeholder="ทั้งหมด"
              searchable={false}
              dropdownHeight={200}
            />
          )}

          {activeTabKey === "repair" && (
            <DropDown
              items={[{ id: "ALL", label: "ทั้งหมด", value: "" }] as any}
              value={{ id: "ALL", label: "ทั้งหมด", value: "" } as any}
              onChange={() => {}}
              placeholder="ทั้งหมด"
              searchable={false}
              dropdownHeight={120}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        {activeTabKey === "repair" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
            หน้านี้ยังไม่ถูกพัฒนา (เว้นไว้ก่อน)
          </div>
        )}

        {activeTabKey === "approve" && (
          isLoadingCurrentUserProfile ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
              กำลังตรวจสอบสิทธิ์...
            </div>
          ) : canViewApprovalHistoryTab ? (
             
            // Header ตาราง
            <div className="w-full overflow-x-auto">
              <div
                className="grid grid-cols-[2.2fr_1.3fr_1.6fr_1.3fr_80px]
                          bg-white border border-[#D9D9D9] font-semibold text-gray-700
                          rounded-[16px] mb-[10px] h-[61px] items-center gap-3 px-[30px]"
              >
                <button
                  type="button"
                  onClick={() => onClickApprovalSort("actionDateTime")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  วันที่-เวลา
                  <Icon
                    icon={getApprovalSortIcon("actionDateTime")}
                    width="24"
                    height="24"
                    className="ml-1 text-neutral-700"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onClickApprovalSort("requester")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  ผู้ส่งคำขอ
                  <Icon icon={getApprovalSortIcon("requester")} 
                  width="24"
                  height="24"
                  className="text-[18px] text-neutral-700" />
                </button>

                <button
                  type="button"
                  onClick={() => onClickApprovalSort("deviceName")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  อุปกรณ์
                  <Icon icon={getApprovalSortIcon("deviceName")} 
                  width="24"
                  height="24"
                  className="text-[18px] text-neutral-700" />
                </button>

                <button
                  type="button"
                  onClick={() => onClickApprovalSort("categoryName")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  หมวดหมู่
                  <Icon icon={getApprovalSortIcon("categoryName")} 
                  width="24"
                  height="24"
                  className="text-[18px] text-neutral-700" />
                </button>
                <div className="py-2" />
              </div>

              <div className="bg-white border border-[#D9D9D9] rounded-[16px]">
                {/* ===== loading/empty state ===== */}
                {isLoadingApprovalList && (
                  <div className="flex items-center gap-2 px-[30px] py-6 text-sm text-neutral-600">
                    <Icon icon="mdi:loading" className="animate-spin text-lg" />
                    กำลังโหลดข้อมูล...
                  </div>
                )}

                {!isLoadingApprovalList && approvalItemsForRender.length === 0 && (
                  <div className="px-[30px] py-8 text-sm text-neutral-600">ไม่พบข้อมูล</div>
                )}

                {/* ===== rows ===== */}
                {!isLoadingApprovalList && approvalItemsForRender.map((approvalItem) => {
                  const isRejected = approvalItem.decision === "REJECTED";
                  const decisionLabel = isRejected ? "ปฏิเสธคำขอ" : "อนุมัติคำขอ";
                  const decisionIcon = isRejected ? "mdi:close" : "mdi:check";
                  const decisionIconContainerClassName = isRejected
                    ? "bg-white text-red-600 border border-red-600"
                    : "bg-white text-green-600 border border-green-600";


                  const deviceName = approvalItem.device?.deviceName ?? "-";
                  const deviceSerialNumber = approvalItem.device?.deviceSerialNumber ?? "-";
                  const rowKey = `${approvalItem.ticketId}-${approvalItem.actionDateTime}`;

                  return (
                    <div
                      key={rowKey}
                      className="grid grid-cols-[2.2fr_1.3fr_1.6fr_1.3fr_80px]
                                items-center gap-3 px-[30px] py-5"
                    >
                      {/* วันที่-เวลา (แสดงผลการอนุมัติ + เวลา ตามภาพ) */}
                      <div className="flex items-start gap-3">
                        <div className={mergeClassNames(
                          "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full",
                          decisionIconContainerClassName
                        )}>
                          <Icon icon={decisionIcon} className="text-xl" />
                        </div>

                        <div className="min-w-0">
                          <div className={mergeClassNames(
                            "font-semibold",
                            isRejected ? "text-red-600" : "text-green-600"
                          )}>
                            {decisionLabel}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {formatThaiDateTime(approvalItem.actionDateTime)} น.
                          </div>
                        </div>
                      </div>

                      {/* ผู้ส่งคำขอ */}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-neutral-900">
                          {approvalItem.requester.fullName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {approvalItem.requester.employeeCode ?? "-"}
                        </div>
                      </div>
                      
                      {/* อุปกรณ์ */}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-neutral-900">
                          {deviceName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          รหัส : {deviceSerialNumber}
                        </div>
                      </div>

                      {/* ผู้ดำเนินการ */}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-neutral-900">
                          {approvalItem.device?.categoryName ?? "-"}
                        </div>

                    
                      </div>

                      {/* รายละเอียด */}
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => openApprovalDetailModal(approvalItem.ticketId)}
                          className="text-sm font-semibold text-sky-500 hover:underline"
                        >
                          รายละเอียด
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* ===== pagination (โครงเดียวกับ borrow แต่ใช้ state ของ approve) ===== */}
                <div className="mt-auto mb-[24px] pt-3 mr-[24px] flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setApprovalCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={approvalCurrentPage === 1}
                      className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                    >
                      {"<"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setApprovalCurrentPage(1)}
                      className={mergeClassNames(
                        "h-8 min-w-8 px-2 rounded border text-sm",
                        approvalCurrentPage === 1
                          ? "border-[#000000] text-[#000000]"
                          : "border-[#D9D9D9]"
                      )}
                    >
                      1
                    </button>

                    {approvalCurrentPage > 2 && <span className="px-1 text-gray-400">…</span>}

                    {approvalCurrentPage > 1 && approvalCurrentPage < approvalTotalPages && (
                      <button
                        type="button"
                        className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]"
                      >
                        {approvalCurrentPage}
                      </button>
                    )}

                    {approvalCurrentPage < approvalTotalPages - 1 && (
                      <span className="px-1 text-gray-400">…</span>
                    )}

                    {approvalTotalPages > 1 && (
                      <button
                        type="button"
                        onClick={() => setApprovalCurrentPage(approvalTotalPages)}
                        className={mergeClassNames(
                          "h-8 min-w-8 px-2 rounded border text-sm",
                          approvalCurrentPage === approvalTotalPages
                            ? "border-[#000000] text-[#000000]"
                            : "border-[#D9D9D9]"
                        )}
                      >
                        {approvalTotalPages}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setApprovalCurrentPage((page) => Math.min(approvalTotalPages, page + 1))}
                      disabled={approvalCurrentPage === approvalTotalPages}
                      className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                    >
                      {">"}
                    </button>
                  </div>
                </div>
              </div>
              {/* ===== Modal รายละเอียด  ===== */}
              <ApprovalHistoryDetailModal
                isOpen={isApprovalDetailModalOpen}
                isLoading={isLoadingApprovalDetail}
                detail={approvalDetail}
                onClose={closeApprovalDetailModal}
              />
            </div>       

          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </div>
          )
        )}

        {activeTabKey === "borrow" && (
          <div className="w-full overflow-x-auto">
            <div
              className="grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_0.7fr_70px]
                        bg-white border border-[#D9D9D9] font-semibold text-gray-700
                        rounded-[16px] mb-[10px] h-[61px] items-center p-4 pl-6"
            >
              <div className="text-left flex items-center h-full">
                อุปกรณ์
                <button type="button" onClick={() => onClickSort("deviceName")}>
                  <Icon
                    icon={getSortIcon(sortField, "deviceName", sortDirection)}
                    width="24"
                    height="24"
                    className="ml-1"
                  />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                จำนวน
                <button type="button" onClick={() => onClickSort("deviceChildCount")}>
                  <Icon
                    icon={getSortIcon(sortField, "deviceChildCount", sortDirection)}
                    width="24"
                    height="24"
                    className="ml-1"
                  />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                หมวดหมู่
                <button type="button" onClick={() => onClickSort("category")}>
                  <Icon
                    icon={getSortIcon(sortField, "category", sortDirection)}
                    width="24"
                    height="24"
                    className="ml-1"
                  />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                ชื่อผู้ร้องขอ
                <button type="button" onClick={() => onClickSort("requester")}>
                  <Icon
                    icon={getSortIcon(sortField, "requester", sortDirection)}
                    width="24"
                    height="24"
                    className="ml-1"
                  />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                วันที่ร้องขอ
                <button type="button" onClick={() => onClickSort("requestDate")}>
                  <Icon
                    icon={getSortIcon(sortField, "requestDate", sortDirection)}
                    width="24"
                    height="24"
                    className="ml-1"
                  />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                สถานะ
                <button type="button" onClick={() => onClickSort("status")}>
                  <Icon
                    icon={getSortIcon(sortField, "status", sortDirection)}
                    width="24"
                    height="24"
                    className="ml-1"
                  />
                </button>
              </div>
              <div className="h-full">

              </div>

              <div className="py-2" />
            </div>

            <div className="bg-white border border-[#D9D9D9] rounded-[16px]">
              <div className="space-y-3">
                {isLoadingList && (
                  <div className="flex items-center gap-2 px-2 py-6 text-sm text-neutral-600">
                    <Icon icon="mdi:loading" className="animate-spin text-lg" />
                    กำลังโหลดข้อมูล...
                  </div>
                )}

                {!isLoadingList && ticketItems.length === 0 && (
                  <div className="px-2 py-8 text-sm text-neutral-600"></div>
                )}

                {!isLoadingList &&
                  ticketItems.map((ticketItem) => (
                    <HistoryBorrowTicket
                      key={ticketItem.ticketId}
                      item={ticketItem}
                      isOpen={expandedTicketIds.has(ticketItem.ticketId)}
                      detail={ticketDetailByIdMap[ticketItem.ticketId]}
                      isLoadingDetail={loadingDetailTicketId === ticketItem.ticketId}
                      onToggle={() => toggleOpen(ticketItem.ticketId)}
                    />
                  ))}
              </div>

              <div className="mt-auto mb-[24px] pt-3 mr-[24px] flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                  >
                    {"<"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${currentPage === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"
                      }`}
                  >
                    1
                  </button>

                  {currentPage > 2 && <span className="px-1 text-gray-400">…</span>}

                  {currentPage > 1 && currentPage < totalPages && (
                    <button
                      type="button"
                      className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]"
                    >
                      {currentPage}
                    </button>
                  )}

                  {currentPage < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}

                  {totalPages > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`h-8 min-w-8 px-2 rounded border text-sm ${currentPage === totalPages
                        ? "border-[#000000] text-[#000000]"
                        : "border-[#D9D9D9]"
                        }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                  >
                    {">"}
                  </button>

                  <form
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const goToPageValue = Number(formData.get("goto"));
                        if (!Number.isNaN(goToPageValue)) {
                          setCurrentPage(Math.min(totalPages, Math.max(1, goToPageValue)));
                        }
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <span>ไปที่หน้า</span>
                    <input
                      name="goto"
                      type="number"
                      min={1}
                      max={totalPages}
                      className="h-8 w-14 rounded border border-[#D9D9D9] px-2 text-sm"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/**
 * Description: ปุ่มแท็บสำหรับสลับหน้า โดยเปลี่ยนสีตามสถานะ active
 * Input : active, onClick, children
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: any;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "h-10 rounded-full border px-5 text-sm font-semibold",
        active
          ? "border-sky-300 bg-[#1890FF] text-neutral-50"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      )}
    >
      {children}
    </button>
  );
}
