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
import {
  currentUserService,
  type CurrentUserProfile,
} from "../services/CurrentUserService";

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

import HistoryIssueTicketCard from "../components/HistoryIssueTicketCard";
import {
  historyIssueService,
  type GetHistoryIssueListParams,
  type HistoryIssueDetail,
  type HistoryIssueItem,
  type HistoryIssueStatus,
} from "../services/HistoryIssueService.ts";

import { metaService, type DropdownOption } from "../services/MetaService";

/**
 * Description: คีย์ของแท็บในหน้า History
 * Input : - (ใช้เป็น union type)
 * Output : ใช้ควบคุมการ render เนื้อหาแต่ละแท็บ
 * Author: Chanwit Muangma (Boom) 66160224
 */
type TabKey = "borrow" | "repair" | "approve";

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Input : classNameParts (Array<string | false | undefined | null>)
 * Output : string (className)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function classNames(...classNameParts: Array<string | false | undefined | null>) {
  return classNameParts.filter(Boolean).join(" ");
}

/**
 * Description: Type ของ option สำหรับ filter สถานะแจ้งซ่อม (DropDown)
 * ใช้ DropdownOption จาก MetaService แทนการ hardcode
 * Author: Chanwit Muangma (Boom) 66160224
 */
type RepairStatusOption = DropdownOption;

/**
 * Description: ฟิลด์ที่ใช้ sort ในแท็บ "ประวัติการแจ้งซ่อม" (ทำ sort ฝั่งหน้าให้ชัวร์)
 * Input : - (type definition)
 * Output : TypeScript type
 * Author: Chanwit Muangma (Boom) 66160224
 */
type RepairSortField = "deviceName" | "issueTitle" | "reportedAt" | "assignee" | "status";

/**
 * Description: Type ของ option สำหรับ filter สถานะ (DropDown) ในแท็บ borrow
 * ใช้ DropdownOption จาก MetaService แทนการ hardcode
 * Author: Chanwit Muangma (Boom) 66160224
 */
type StatusOption = DropdownOption;

/**
 * Description: รายชื่อ role ที่มีสิทธิ์เห็นแท็บ "ประวัติการอนุมัติ"
 * Input : -
 * Output : readonly string[]
 * Author: Chanwit Muangma (Boom) 66160224
 */
const allowedRolesForApprovalHistory = ["ADMIN", "STAFF", "HOD", "HOS"] as const;

/**
 * Description: หน้า History (รวม 3 แท็บ) โดยแท็บหลักที่ใช้งานคือ “ประวัติยืม-คืน”
 * Input : - (React Page)
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */
export default function History() {
  /**
   * Description: ref กัน SearchFilter (borrow) ยิงค่าเริ่มต้นซ้ำ
   * Input : - (useRef)
   * Output : didInitializeSearchRef.current (boolean)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const didInitializeSearchRef = useRef(false);

  /**
   * Description: ref เก็บ search text ล่าสุด (borrow) เพื่อกัน setState ซ้ำ
   * Input : - (useRef)
   * Output : lastSearchTextRef.current (string)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const lastSearchTextRef = useRef<string>("");

  /**
   * Description: อ่าน expandId จาก URL params หรือ location state (รองรับเข้า page แล้ว expand ticket อัตโนมัติ)
   * Input : params.id (string | undefined), location.state.expandId (number | undefined)
   * Output : expandId (number | undefined)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const { id } = useParams();
  const location = useLocation();
  const expandId = id ? parseInt(id) : (location.state as { expandId?: number })?.expandId;

  /**
   * Description: handler รับค่าจาก SearchFilter (borrow) แล้วอัปเดต search + reset pagination + เคลียร์การ expand
   * Input : { search: string } (ค่าจาก SearchFilter)
   * Output : void
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

  /**
   * Description: state คุมแท็บที่ active
   * Input : - (useState)
   * Output : activeTabKey, setActiveTabKey
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [activeTabKey, setActiveTabKey] = useState<TabKey>("borrow");

  // --------------------
  // Borrow states
  // --------------------

  /**
   * Description: state คุม search text (borrow)
   * Input : - (useState)
   * Output : searchText, setSearchText
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [searchText, setSearchText] = useState("");

  /**
   * Description: state คุม filter status (borrow)
   * Input : - (useState)
   * Output : selectedStatus, setSelectedStatus
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [selectedStatus, setSelectedStatus] = useState<HistoryBorrowStatus | "">("");

  /**
   * Description: ตัวเลือกสถานะสำหรับแท็บ borrow — ดึงจาก API แทนการ hardcode
   * Input : - (useState + useEffect)
   * Output : statusOptions (StatusOption[]), repairStatusOptions (RepairStatusOption[])
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [repairStatusOptions, setRepairStatusOptions] = useState<RepairStatusOption[]>([]);

  useEffect(() => {
    metaService.getDropdownOptions().then((options) => {
      setStatusOptions([...options.borrowStatuses]);
      setRepairStatusOptions([...options.repairStatuses]);
    });
  }, []);

  /**
   * Description: state คุม dropdown option ของ status (borrow)
   * Input : - (useState)
   * Output : selectedStatusOption, setSelectedStatusOption
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [selectedStatusOption, setSelectedStatusOption] = useState<StatusOption | null>(null);

  /**
   * Description: state คุม sort field/direction (borrow)
   * Input : - (useState)
   * Output : sortField, sortDirection
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [sortField, setSortField] = useState<HistoryBorrowSortField>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  /**
   * Description: state คุม pagination (borrow)
   * Input : - (useState)
   * Output : currentPage, pageSizeLimit
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [currentPage, setCurrentPage] = useState(1);
  const pageSizeLimit = 5;

  /**
   * Description: state คุม loading/list/pagination total (borrow)
   * Input : - (useState)
   * Output : isLoadingList, ticketItems, totalPages
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [ticketItems, setTicketItems] = useState<HistoryBorrowTicketItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Description: state เก็บ set ของ ticketId ที่ถูก expand (borrow)
   * Input : - (useState)
   * Output : expandedTicketIds, setExpandedTicketIds
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [expandedTicketIds, setExpandedTicketIds] = useState<Set<number>>(new Set());

  /**
   * Description: state cache detail ของ ticket (borrow) เพื่อไม่ต้องยิงซ้ำ
   * Input : - (useState)
   * Output : ticketDetailByIdMap, setTicketDetailByIdMap
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [ticketDetailByIdMap, setTicketDetailByIdMap] = useState<
    Record<number, HistoryBorrowTicketDetail | undefined>
  >({});

  /**
   * Description: state เก็บ ticketId ที่กำลังโหลด detail (borrow)
   * Input : - (useState)
   * Output : loadingDetailTicketId, setLoadingDetailTicketId
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [loadingDetailTicketId, setLoadingDetailTicketId] = useState<number | null>(null);

  // ----------------------------
  // History-Issue (Repair Tab)
  // ----------------------------

  /**
   * Description: ref กัน SearchFilter ยิงค่าเริ่มต้นซ้ำ (repair)
   * Input : - (useRef)
   * Output : didInitializeRepairSearchRef.current (boolean)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const didInitializeRepairSearchRef = useRef(false);

  /**
   * Description: ref เก็บ search text ล่าสุดเพื่อกัน setState ซ้ำ (repair)
   * Input : - (useRef)
   * Output : lastRepairSearchTextRef.current (string)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const lastRepairSearchTextRef = useRef<string>("");

  /**
   * Description: state สำหรับ search/filter/sort/pagination ของแท็บ repair
   * Input : - (useState)
   * Output : repairSearchText, selectedRepairStatus, repairSortField, repairSortDirection, repairCurrentPage
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [repairSearchText, setRepairSearchText] = useState<string>("");
  const [selectedRepairStatus, setSelectedRepairStatus] = useState<HistoryIssueStatus | "">("");
  const [selectedRepairStatusOption, setSelectedRepairStatusOption] =
    useState<RepairStatusOption>(repairStatusOptions[0]);

  const [repairSortField, setRepairSortField] = useState<RepairSortField>("reportedAt");
  const [repairSortDirection, setRepairSortDirection] = useState<SortDirection>("desc");

  const [repairCurrentPage, setRepairCurrentPage] = useState<number>(1);
  const repairPageSizeLimit = 5;

  /**
   * Description: state คุม loading ของ list (repair)
   * Input : - (useState)
   * Output : isLoadingRepairList, setIsLoadingRepairList
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isLoadingRepairList, setIsLoadingRepairList] = useState<boolean>(false);

  /**
   * Description: เก็บรายการดิบจาก backend (repair) — ยังไม่ search/sort/paginate
   * Input : - (useState)
   * Output : repairIssueRawItems, setRepairIssueRawItems
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [repairIssueRawItems, setRepairIssueRawItems] = useState<HistoryIssueItem[]>([]);

  /**
   * Description: state คุม total pages (repair)
   * Input : - (useState)
   * Output : repairTotalPages, setRepairTotalPages
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [repairTotalPages, setRepairTotalPages] = useState<number>(1);

  /**
   * Description: state เก็บ set ของ issueId ที่ถูก expand (repair)
   * Input : - (useState)
   * Output : expandedIssueIds, setExpandedIssueIds
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [expandedIssueIds, setExpandedIssueIds] = useState<Set<number>>(new Set());

  /**
   * Description: state cache detail ของ issue (repair)
   * Input : - (useState)
   * Output : issueDetailByIdMap, setIssueDetailByIdMap
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [issueDetailByIdMap, setIssueDetailByIdMap] = useState<Record<number, HistoryIssueDetail | undefined>>(
    {}
  );

  /**
   * Description: state เก็บ issueId ที่กำลังโหลด detail (repair)
   * Input : - (useState)
   * Output : loadingDetailIssueId, setLoadingDetailIssueId
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [loadingDetailIssueId, setLoadingDetailIssueId] = useState<number | null>(null);

  const [selectedBorrowHistoryViewMode, setSelectedBorrowHistoryViewMode] = useState<HistoryBorrowViewMode>("all");

  /**
   * Description: handler รับค่าจาก SearchFilter (repair) แล้วอัปเดต search + reset pagination + เคลียร์การ expand
   * Input : { search: string } (ค่าจาก SearchFilter)
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const handleRepairSearchChange = ({ search }: { search: string }) => {
    if (!didInitializeRepairSearchRef.current) {
      didInitializeRepairSearchRef.current = true;
      lastRepairSearchTextRef.current = search ?? "";
      return;
    }

    const normalizedSearchText = (search ?? "").trim();
    if (normalizedSearchText === lastRepairSearchTextRef.current) return;

    lastRepairSearchTextRef.current = normalizedSearchText;
    setRepairSearchText(normalizedSearchText);
    setRepairCurrentPage(1);
    setExpandedIssueIds(new Set());
  };

  /**
   * Description: คลิกหัวตารางเพื่อ sort (repair) — เปลี่ยนคอลัมน์ใหม่เริ่ม asc / คลิกซ้ำสลับ asc/desc
   * Input : field (RepairSortField)
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const onClickRepairSort = (field: RepairSortField) => {
    if (repairSortField !== field) {
      setRepairSortField(field);
      setRepairSortDirection("asc");
      setRepairCurrentPage(1);
      return;
    }

    setRepairSortDirection((previousDirection) => (previousDirection === "asc" ? "desc" : "asc"));
    setRepairCurrentPage(1);
  };

  /**
   * Description: icon sort สำหรับ repair (หัวตาราง)
   * Input : field (RepairSortField)
   * Output : string (iconify icon name)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const getRepairSortIcon = (field: RepairSortField) => {
    return getSortIcon(String(repairSortField), String(field), repairSortDirection);
  };

  /**
   * Description: Toggle เปิด/ปิดการ์ด issue (repair) และโหลด detail เฉพาะเมื่อยังไม่มีใน cache
   * Input : issueId (number)
   * Output : Promise<void>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const toggleIssueOpen = async (issueId: number) => {
    const isCurrentlyOpen = expandedIssueIds.has(issueId);
    const nextWillOpen = !isCurrentlyOpen;

    setExpandedIssueIds((previousExpandedIssueIds) => {
      const nextExpandedIssueIds = new Set(previousExpandedIssueIds);
      if (nextExpandedIssueIds.has(issueId)) nextExpandedIssueIds.delete(issueId);
      else nextExpandedIssueIds.add(issueId);
      return nextExpandedIssueIds;
    });

    if (!nextWillOpen) return;
    if (issueDetailByIdMap[issueId]) return;
    if (loadingDetailIssueId === issueId) return;

    try {
      setLoadingDetailIssueId(issueId);
      const detail = await historyIssueService.getHistoryIssueDetail(issueId);
      setIssueDetailByIdMap((previousMap) => ({ ...previousMap, [issueId]: detail }));
    } catch (error) {
      console.error(error);
      setIssueDetailByIdMap((previousMap) => ({ ...previousMap, [issueId]: undefined }));
    } finally {
      setLoadingDetailIssueId(null);
    }
  };

  // ----------------------------
  // Reset when switching tabs
  // ----------------------------

  /**
   * Description: reset state เมื่อสลับแท็บ
   * - borrow: reset page และการ expand การ์ด
   * - approve: reset page + filter/search
   * - repair: reset page + filter/search + expand
   * Input : activeTabKey (TabKey)
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    // borrow
    setCurrentPage(1);
    setExpandedTicketIds(new Set());

    // approve
    setApprovalCurrentPage(1);
    setApprovalSearchText("");
    setSelectedApprovalDecision("");
    setSelectedApprovalDecisionOption(approvalDecisionOptions[0]);

    // repair
    setRepairCurrentPage(1);
    setRepairSearchText("");
    setSelectedRepairStatus("");
    setSelectedRepairStatusOption(repairStatusOptions[0]);
    setExpandedIssueIds(new Set());
  }, [activeTabKey]);

  // ----------------------------
  // Borrow: Query params + load list
  // ----------------------------

  /**
   * Description: สร้าง query params สำหรับเรียก history borrow list จาก backend
   * Input : currentPage, pageSizeLimit, searchText, selectedStatus, sortField, sortDirection
   * Output : GetHistoryBorrowListParams
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const queryParams: GetHistoryBorrowListParams = useMemo(() => {
    const trimmedSearchText = searchText.trim();

    return {
      page: currentPage,
      limit: pageSizeLimit,
      search: trimmedSearchText ? trimmedSearchText : undefined,
      viewMode: selectedBorrowHistoryViewMode,
      status: selectedStatus || undefined,
      sortField,
      sortDirection,
    };
  }, [currentPage, pageSizeLimit, searchText, selectedStatus, sortField, sortDirection , selectedBorrowHistoryViewMode]);

  /**
   * Description: ref เก็บ mock expandId ที่ถูก inject เข้าลิสต์ (กันโดน overwrite จาก response)
   * Input : - (useRef)
   * Output : mockExpandIdRef.current (number | null)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const mockExpandIdRef = useRef<number | null>(null);

  /**
   * Description: โหลด list "ประวัติยืม-คืน" เมื่ออยู่แท็บ borrow
   * Input : activeTabKey, queryParams
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (activeTabKey !== "borrow") return;

    let isCancelled = false;

    /**
     * Description: เรียก backend เพื่อดึงรายการ borrow และ sync เข้า state
     * Input : - (อ่าน queryParams ใน scope)
     * Output : Promise<void>
     * Author: Chanwit Muangma (Boom) 66160224
     */
    const loadHistoryBorrowList = async () => {
      try {
        setIsLoadingList(true);
        const response = await historyBorrowService.getHistoryBorrowTickets(queryParams);
        if (isCancelled) return;

        if (mockExpandIdRef.current) {
          const mockId = mockExpandIdRef.current;
          const existsInResponse = response.items.some(
            (t: HistoryBorrowTicketItem) => t.ticketId === mockId
          );

          if (!existsInResponse) {
            setTicketItems((prev) => {
              const mockItem = prev.find((t) => t.ticketId === mockId);
              if (mockItem) return [mockItem, ...response.items];
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
   * Description: Auto-expand ticket เมื่อเข้าหน้าโดยมี expandId (จาก notification/link)
   * - ถ้า ticket อยู่ใน list: expand + โหลด detail ถ้ายังไม่มี
   * - ถ้าไม่อยู่ใน list: fetch detail แล้วสร้าง mock item แทรกเข้าลิสต์ + expand
   * Input : expandId, ticketItems, ticketDetailByIdMap, isLoadingList
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const lastExpandedIdRef = useRef<number | null>(null);
  useEffect(() => {
    console.log("[History] useEffect triggered:", {
      expandId,
      isLoadingList,
      ticketCount: ticketItems.length,
      ticketIds: ticketItems.map((t) => t.ticketId),
      lastExpandedId: lastExpandedIdRef.current,
    });

    if (!expandId) return;

    if (lastExpandedIdRef.current === expandId) {
      console.log("[History] Already processed this expandId");
      return;
    }

    if (isLoadingList) {
      console.log("[History] Still loading, waiting...");
      return;
    }

    const ticketExists = ticketItems.some((t) => t.ticketId === expandId);
    console.log("[History] ticketExists:", ticketExists);

    if (ticketExists) {
      console.log("[History] Found ticket, expanding:", expandId);
      lastExpandedIdRef.current = expandId;

      setExpandedTicketIds((prev) => {
        const next = new Set(prev);
        next.add(expandId);
        return next;
      });

      if (!ticketDetailByIdMap[expandId]) {
        setLoadingDetailTicketId(expandId);
        historyBorrowService
          .getHistoryBorrowTicketDetail(expandId)
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
      console.log("[History] Ticket not in list, fetching directly:", expandId);
      lastExpandedIdRef.current = expandId;

      setLoadingDetailTicketId(expandId);
      historyBorrowService
        .getHistoryBorrowTicketDetail(expandId)
        .then((detail) => {
          console.log("[History] Fetched detail, creating mock item");

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

          mockExpandIdRef.current = expandId;

          setTicketItems((prev) => {
            if (prev.some((t) => t.ticketId === expandId)) return prev;
            return [mockTicketItem, ...prev];
          });

          console.log("[History] Mock item added, setting expanded");
          setTicketDetailByIdMap((prev) => ({ ...prev, [expandId]: detail }));

          setExpandedTicketIds((prev) => {
            const next = new Set(prev);
            next.add(expandId);
            console.log("[History] expandedTicketIds now:", Array.from(next));
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
   * Description: จัดการคลิก sort ที่หัวตาราง borrow โดยสลับทิศทางเมื่อคลิกซ้ำคอลัมน์เดิม
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

    setSortDirection((previousDirection) =>
      previousDirection === "asc" ? "desc" : "asc"
    );
    setCurrentPage(1);
  };

  /**
   * Description: สลับเปิด/ปิดการขยายการ์ด (borrow) และโหลด detail เฉพาะเมื่อยังไม่มีใน cache
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
   * Description: เลือกไอคอน sort ตามคอลัมน์ที่กำลัง sort และทิศทางการ sort (ใช้ร่วม borrow/repair/approve)
   * Input : currentSortField (string), targetField (string), direction ("asc" | "desc")
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

  // ----------------------------
  // Current user profile (role)
  // ----------------------------

  /**
   * Description: เก็บข้อมูลผู้ใช้ปัจจุบันขั้นต่ำที่จำเป็นสำหรับการเช็คสิทธิ์การแสดงผลแท็บ "ประวัติการอนุมัติ"
   * Input : - (useState)
   * Output : currentUserProfile, setCurrentUserProfile
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);

  /**
   * Description: สถานะการโหลดข้อมูลผู้ใช้ปัจจุบัน (กัน UI กระพริบ/กันเช็ค role ก่อนโหลดเสร็จ)
   * Input : - (useState)
   * Output : isLoadingCurrentUserProfile, setIsLoadingCurrentUserProfile
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isLoadingCurrentUserProfile, setIsLoadingCurrentUserProfile] = useState<boolean>(true);

  /**
   * Description: ดึงข้อมูลผู้ใช้ปัจจุบันเมื่อเข้าหน้า History
   * Input : - 
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    /**
     * Description: เรียก currentUserService เพื่อดึงโปรไฟล์ผู้ใช้ (normalized role)
     * Input : -
     * Output : Promise<void>
     * Author: Chanwit Muangma (Boom) 66160224
     */
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
   * Input : currentUserProfile.userRole
   * Output : boolean (canViewApprovalHistoryTab)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const canViewApprovalHistoryTab = useMemo(() => {
    const normalizedUserRole = String(currentUserProfile?.userRole ?? "").trim().toUpperCase();
    return allowedRolesForApprovalHistory.includes(normalizedUserRole as any);
  }, [currentUserProfile]);

  /**
   * Description: กันกรณีผู้ใช้ไม่มีสิทธิ์ แต่ activeTabKey ถูกตั้งเป็น "approve" (ให้เด้งกลับ borrow)
   * Input : isLoadingCurrentUserProfile, canViewApprovalHistoryTab, activeTabKey
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (!isLoadingCurrentUserProfile && !canViewApprovalHistoryTab && activeTabKey === "approve") {
      setActiveTabKey("borrow");
    }
  }, [isLoadingCurrentUserProfile, canViewApprovalHistoryTab, activeTabKey]);

  // ----------------------------
  // History-Approval (Approve Tab)
  // ----------------------------

  /**
   * Description: ฟอร์แมตวันเวลาให้เป็นรูปแบบภาษาไทย (ใกล้เคียง mock) สำหรับแท็บ approve
   * Input : isoString (string)
   * Output : string
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
   * Input : - (type definition)
   * Output : TypeScript type
   * Author: Chanwit Muangma (Boom) 66160224
   */
  type ApprovalDecisionOption = {
    id: "ALL" | ApprovalDecision;
    label: string;
    value: "" | ApprovalDecision;
  };

  /**
   * Description: รายการตัวเลือกผลการอนุมัติ (DropDown) ในแท็บ approve
   * Input : -
   * Output : ApprovalDecisionOption[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const approvalDecisionOptions: readonly ApprovalDecisionOption[] = [
    { id: "ALL", label: "ทั้งหมด", value: "" },
    { id: "APPROVED", label: "อนุมัติคำขอ", value: "APPROVED" },
    { id: "REJECTED", label: "ปฏิเสธคำขอ", value: "REJECTED" },
  ] as const;

  /**
   * Description: state สำหรับ list "ประวัติการอนุมัติ"
   * Input : - (useState)
   * Output : approvalSearchText, selectedApprovalDecision, selectedApprovalDecisionOption, pagination states
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
   * - เพิ่ม sort categoryName (ทำฝั่งหน้า) เพราะ backend ยังไม่รองรับ
   * Input : - (useState)
   * Output : approvalSortField, approvalSortDirection
   * Author: Chanwit Muangma (Boom) 66160224
   */
  type ApprovalSortFieldUI = HistoryApprovalSortField | "categoryName";
  const [approvalSortField, setApprovalSortField] = useState<ApprovalSortFieldUI>("actionDateTime");
  const [approvalSortDirection, setApprovalSortDirection] = useState<SortDirection>("desc");

  /**
   * Description: คลิกหัวตาราง approve เพื่อ sort (คลิกคอลัมน์ใหม่เริ่ม asc / คลิกซ้ำสลับ asc/desc)
   * Input : field (ApprovalSortFieldUI)
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const onClickApprovalSort = (field: ApprovalSortFieldUI) => {
    if (approvalSortField !== field) {
      setApprovalSortField(field);
      setApprovalSortDirection("asc");
      setApprovalCurrentPage(1);
      return;
    }

    setApprovalSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
    setApprovalCurrentPage(1);
  };

  /**
   * Description: icon สำหรับแสดงสถานะ sort ในหัวตาราง approve
   * Input : field (ApprovalSortFieldUI)
   * Output : string (iconify icon name)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const getApprovalSortIcon = (field: ApprovalSortFieldUI) => {
    return getSortIcon(String(approvalSortField), String(field), approvalSortDirection);
  };

  /**
   * Description: state สำหรับ Modal รายละเอียด "ประวัติการอนุมัติ"
   * Input : - (useState)
   * Output : isApprovalDetailModalOpen, selectedApprovalTicketId, isLoadingApprovalDetail, approvalDetail
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isApprovalDetailModalOpen, setIsApprovalDetailModalOpen] = useState<boolean>(false);
  const [selectedApprovalTicketId, setSelectedApprovalTicketId] = useState<number | null>(null);
  const [isLoadingApprovalDetail, setIsLoadingApprovalDetail] = useState<boolean>(false);
  const [approvalDetail, setApprovalDetail] = useState<HistoryApprovalDetail | null>(null);

  /**
   * Description: handler ค้นหาในแท็บ approve — เปลี่ยน search แล้ว reset หน้าเป็น 1
   * Input : { search: string } (ค่าจาก SearchFilter)
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const handleApprovalSearchChange = ({ search }: { search: string }) => {
    const normalizedSearchText = (search ?? "").trim();
    setApprovalSearchText(normalizedSearchText);
    setApprovalCurrentPage(1);
  };

  /**
   * Description: query params สำหรับเรียก list "ประวัติการอนุมัติ"
   * - ถ้าเลือก sort "categoryName" จะไม่ส่งไป backend (แล้วค่อย sort ฝั่งหน้า)
   * Input : approvalCurrentPage, approvalPageSizeLimit, approvalSearchText, selectedApprovalDecision, approvalSortField, approvalSortDirection
   * Output : GetHistoryApprovalListParams
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const approvalQueryParams: GetHistoryApprovalListParams = useMemo(() => {
    const trimmedSearchText = approvalSearchText.trim();
    const backendSortableField = approvalSortField === "categoryName" ? undefined : approvalSortField;

    return {
      page: approvalCurrentPage,
      limit: approvalPageSizeLimit,
      search: trimmedSearchText ? trimmedSearchText : undefined,
      action: selectedApprovalDecision || undefined,
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
   * Input : activeTabKey, canViewApprovalHistoryTab, approvalQueryParams
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (activeTabKey !== "approve") return;
    if (!canViewApprovalHistoryTab) return;

    let isCancelled = false;

    /**
     * Description: เรียก backend เพื่อดึงรายการ approval history แล้ว set ลง state
     * Input : - (อ่าน approvalQueryParams ใน scope)
     * Output : Promise<void>
     * Author: Chanwit Muangma (Boom) 66160224
     */
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
   * Description: รายการสำหรับ render ตาราง approve (รองรับ sort categoryName ฝั่งหน้า)
   * Input : approvalItems, approvalSortField, approvalSortDirection
   * Output : HistoryApprovalItem[]
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
   * Input : ticketId (number)
   * Output : Promise<void>
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const openApprovalDetailModal = async (ticketId: number): Promise<void> => {
    setIsApprovalDetailModalOpen(true);
    setSelectedApprovalTicketId(ticketId);
    setApprovalDetail(null);

    try {
      setIsLoadingApprovalDetail(true);
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
   * Description: โหลด detail เมื่อ Modal เปิดและมี selectedApprovalTicketId (กัน race condition ด้วย flag cancelled)
   * Input : isApprovalDetailModalOpen, selectedApprovalTicketId
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (!isApprovalDetailModalOpen) return;
    if (!selectedApprovalTicketId) return;

    let isCancelled = false;

    /**
     * Description: เรียก backend เพื่อโหลด approval detail แล้ว set ลง state
     * Input : - (อ่าน selectedApprovalTicketId ใน scope)
     * Output : Promise<void>
     * Author: Chanwit Muangma (Boom) 66160224
     */
    const loadApprovalDetail = async () => {
      try {
        setIsLoadingApprovalDetail(true);

        const detailResponse = await approvalHistoryService.getHistoryApprovalDetail(selectedApprovalTicketId);
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
   * Description: ปิด Modal รายละเอียด approve และ reset state ที่เกี่ยวข้องเพื่อกันข้อมูลค้าง
   * Input : -
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const closeApprovalDetailModal = (): void => {
    setIsApprovalDetailModalOpen(false);
    setSelectedApprovalTicketId(null);
    setApprovalDetail(null);
  };

  // ----------------------------
  // Repair: Load list + in-memory filter/sort/paginate
  // ----------------------------

  /**
   * Description: โหลด list "ประวัติการแจ้งซ่อม" เมื่ออยู่แท็บ repair
   * - backend รองรับ filter status
   * - search/sort/pagination ทำฝั่งหน้า
   * Input : activeTabKey, selectedRepairStatus
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (activeTabKey !== "repair") return;

    let isCancelled = false;

    /**
     * Description: เรียก backend เพื่อดึงรายการ history issue (filter status จาก backend)
     * Input : - (อ่าน selectedRepairStatus ใน scope)
     * Output : Promise<void>
     * Author: Chanwit Muangma (Boom) 66160224
     */
    const loadHistoryIssueList = async () => {
      try {
        setIsLoadingRepairList(true);

        const queryParams: GetHistoryIssueListParams = {
          status: selectedRepairStatus || undefined,
        };

        const issueItems = await historyIssueService.getHistoryIssueList(queryParams);
        if (isCancelled) return;

        setRepairIssueRawItems(Array.isArray(issueItems) ? issueItems : []);
      } catch (error) {
        if (isCancelled) return;
        console.error(error);
        setRepairIssueRawItems([]);
      } finally {
        if (!isCancelled) setIsLoadingRepairList(false);
      }
    };

    loadHistoryIssueList();

    return () => {
      isCancelled = true;
    };
  }, [activeTabKey, selectedRepairStatus]);

  /**
   * Description: รายการสำหรับ render (repair) หลังผ่าน search + sort
   * Input : repairIssueRawItems, repairSearchText, repairSortField, repairSortDirection
   * Output : HistoryIssueItem[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const repairFilteredSortedItems = useMemo(() => {
    const normalizedSearchText = repairSearchText.trim().toLowerCase();

    const filteredItems = repairIssueRawItems.filter((issueItem) => {
      if (!normalizedSearchText) return true;

      const searchableParts = [
        issueItem.parentDevice.name,
        issueItem.parentDevice.serialNumber,
        issueItem.parentDevice.categoryName,
        issueItem.issueTitle,
        issueItem.issueDescription,
        issueItem.reporterUser.fullName,
        issueItem.reporterUser.empCode ?? "",
        issueItem.assigneeUser?.fullName ?? "",
        issueItem.receiveLocationName ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableParts.includes(normalizedSearchText);
    });

    const sortedItems = [...filteredItems];

    sortedItems.sort((leftItem, rightItem) => {
      const directionFactor = repairSortDirection === "asc" ? 1 : -1;

      const getValue = (item: HistoryIssueItem): string => {
        if (repairSortField === "deviceName") return item.parentDevice.name ?? "";
        if (repairSortField === "issueTitle") return item.issueTitle ?? "";
        if (repairSortField === "assignee") return item.assigneeUser?.fullName ?? "";
        if (repairSortField === "status") return String(item.issueStatus ?? "");
        if (repairSortField === "reportedAt") return item.reportedAt ?? "";
        return "";
      };

      const leftValue = getValue(leftItem);
      const rightValue = getValue(rightItem);

      if (repairSortField === "reportedAt") {
        const leftTime = new Date(leftValue).getTime();
        const rightTime = new Date(rightValue).getTime();
        return (leftTime - rightTime) * directionFactor;
      }

      return leftValue.localeCompare(rightValue) * directionFactor;
    });

    return sortedItems;
  }, [repairIssueRawItems, repairSearchText, repairSortField, repairSortDirection]);

  /**
   * Description: คำนวณ total pages ของ repair จากรายการที่ filter แล้ว + กัน currentPage เกิน
   * Input : repairFilteredSortedItems.length, repairPageSizeLimit
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    const computedTotalPages = Math.max(1, Math.ceil(repairFilteredSortedItems.length / repairPageSizeLimit));
    setRepairTotalPages(computedTotalPages);
    setRepairCurrentPage((previousPage) => Math.min(previousPage, computedTotalPages));
  }, [repairFilteredSortedItems.length, repairPageSizeLimit]);

  /**
   * Description: slice รายการ repair ตามหน้าปัจจุบัน
   * Input : repairFilteredSortedItems, repairCurrentPage, repairPageSizeLimit
   * Output : HistoryIssueItem[]
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const repairItemsForRender = useMemo(() => {
    const startIndex = (repairCurrentPage - 1) * repairPageSizeLimit;
    const endIndex = startIndex + repairPageSizeLimit;
    return repairFilteredSortedItems.slice(startIndex, endIndex);
  }, [repairFilteredSortedItems, repairCurrentPage, repairPageSizeLimit]);

  // ----------------------------
  // Local helper: classNames (approve rows)
  // ----------------------------

  /**
   * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก (ใช้ใน approve rows)
   * Input : classNameParts (Array<string | false | undefined | null>)
   * Output : string (className)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  function mergeClassNames(...classNameParts: Array<string | false | undefined | null>) {
    return classNameParts.filter(Boolean).join(" ");
  }

   /**
   * Description: เปลี่ยนโหมด segment "ทั้งหมด/ของฉัน" และ reset state ที่เกี่ยวข้อง
   * - เคลียร์ mockExpandIdRef เพื่อกัน inject ticket จาก expandId เก่าปนข้ามโหมด
   * - reset หน้า + เคลียร์การ expand เพื่อให้ UI ตรงกับผลลัพธ์ใหม่
   * Input : nextViewMode ("all" | "mine")
   * Output : void
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const onChangeBorrowHistoryViewMode = (nextViewMode: HistoryBorrowViewMode): void => {
    setSelectedBorrowHistoryViewMode(nextViewMode);

    setCurrentPage(1);
    setExpandedTicketIds(new Set());

    mockExpandIdRef.current = null;
    lastExpandedIdRef.current = null;
  };


  /**
   * Description: โหมดการมองเห็นข้อมูลของหน้า List ประวัติการยืม-คืน
   * Rule :
   * - "all"  = ทั้งหมดตามสิทธิ์ของ role
   * - "mine" = ของฉัน (บังคับ brt_user_id = current user)
   * Input : string union
   * Output : type สำหรับ state และส่งเป็น query ไป backend
   * Author: Chanwit Muangma (Boom) 66160224
   */
  type HistoryBorrowViewMode = "all" | "mine";

  /**
   * Description: state โหมดการมองเห็นของหน้า "ประวัติยืม-คืน" (Segment control)
   * Input : user click segment (ทั้งหมด/ของฉัน)
   * Output : selectedBorrowHistoryViewMode ("all" | "mine")
   * Author: Chanwit Muangma (Boom) 66160224
   */

  /**
   * Description: ดึง role + scope (dept/sec) จาก currentUserProfile ให้รองรับหลายโครงสร้างข้อมูล
   * Input : currentUserProfile (any)
   * Output : resolvedUserRole, resolvedDepartmentId, resolvedSectionId
   * Author: Chanwit Muangma (Boom) 66160224
   */
  function resolveUserRoleAndScopeFromProfile(currentUserProfile: any) {
    const rawUserRole =
      currentUserProfile?.us_role ??
      currentUserProfile?.userRole ??
      currentUserProfile?.usRole ??
      currentUserProfile?.role ??
      currentUserProfile?.user_role ??
      null;

    const resolvedUserRole =
      typeof rawUserRole === "string" ? rawUserRole.toUpperCase() : null;

    const rawDepartmentId =
      currentUserProfile?.us_dept_id ??
      currentUserProfile?.departmentId ??
      currentUserProfile?.department?.dept_id ??
      currentUserProfile?.department?.deptId ??
      currentUserProfile?.dept_id ??
      null;

    const rawSectionId =
      currentUserProfile?.us_sec_id ??
      currentUserProfile?.sectionId ??
      currentUserProfile?.section?.sec_id ??
      currentUserProfile?.section?.secId ??
      currentUserProfile?.sec_id ??
      null;

    const resolvedDepartmentId =
      rawDepartmentId === null || rawDepartmentId === undefined
        ? null
        : Number(rawDepartmentId);

    const resolvedSectionId =
      rawSectionId === null || rawSectionId === undefined
        ? null
        : Number(rawSectionId);

    return {
      resolvedUserRole,
      resolvedDepartmentId: Number.isFinite(resolvedDepartmentId)
        ? resolvedDepartmentId
        : null,
      resolvedSectionId: Number.isFinite(resolvedSectionId) ? resolvedSectionId : null,
    };
  }

  /**
   * Description: ตัดสินใจว่า role ปัจจุบันควรเห็น segment "ของฉัน/ทั้งหมด" หรือไม่
   * Rule :
   * - ADMIN : แสดงเสมอ
   * - HOD   : แสดงเมื่อมี departmentId
   * - HOS   : แสดงเมื่อมี departmentId และ sectionId
   * - STAFF : แสดงเมื่อมี departmentId และ sectionId
   * - อื่นๆ : ไม่แสดง
   * Input : currentUserProfile, isLoadingCurrentUserProfile
   * Output : boolean (true=แสดง segment)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const canViewBorrowHistoryViewModeSegment = useMemo(() => {
    if (isLoadingCurrentUserProfile) return false;
    if (!currentUserProfile) return false;

    const { resolvedUserRole} =
      resolveUserRoleAndScopeFromProfile(currentUserProfile);

    if (!resolvedUserRole) return false;

    if (resolvedUserRole === "ADMIN" || resolvedUserRole === "HOD" || resolvedUserRole === "HOS" || resolvedUserRole === "STAFF") return true;
    

    return false;
  }, [currentUserProfile, isLoadingCurrentUserProfile]);

  // ----------------------------
  // Render
  // ----------------------------

  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      <div className="text-sm text-neutral-500">ดูประวัติ</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">ประวัติการยืม-คืน</div>

      <div className="mt-5 flex flex-wrap gap-3">
        <TabButton active={activeTabKey === "borrow"} onClick={() => setActiveTabKey("borrow")}>
          ประวัติยืม-คืน
        </TabButton>

        <TabButton active={activeTabKey === "repair"} onClick={() => setActiveTabKey("repair")}>
          ประวัติการแจ้งซ่อม
        </TabButton>

        {/* 
          Description: แสดงแท็บ "ประวัติการอนุมัติ" เฉพาะ role ที่ได้รับอนุญาต
          Input : isLoadingCurrentUserProfile, canViewApprovalHistoryTab
          Output : ReactNode (TabButton หรือ null)
          Author: Chanwit Muangma (Boom) 66160224
        */}
        {!isLoadingCurrentUserProfile && canViewApprovalHistoryTab && (
          <TabButton active={activeTabKey === "approve"} onClick={() => setActiveTabKey("approve")}>
            ประวัติการอนุมัติ
          </TabButton>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        {/* 
          Description: Search + Dropdown เปลี่ยนตามแท็บ
          Input : activeTabKey
          Output : ReactNode
          Author: Chanwit Muangma (Boom) 66160224
        */}
        <div className="relative flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* 
              Description: Segment control สลับโหมด "ทั้งหมด/ของฉัน" เฉพาะแท็บ borrow และ role ที่อนุญาต
              Input : activeTabKey, isLoadingCurrentUserProfile, canViewBorrowHistoryViewModeSegment
              Output : ReactNode (Segment หรือ null)
              Author: Chanwit Muangma (Boom) 66160224
            */}
            {activeTabKey === "borrow" &&
              !isLoadingCurrentUserProfile &&
              canViewBorrowHistoryViewModeSegment && (
                <div className="inline-flex rounded-full bg-[#D9D9D9] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeBorrowHistoryViewMode("all");
                      setCurrentPage(1);
                      setExpandedTicketIds(new Set());
                    }}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      selectedBorrowHistoryViewMode === "all"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    ทั้งหมด
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChangeBorrowHistoryViewMode("mine");
                      setCurrentPage(1);
                      setExpandedTicketIds(new Set());
                    }}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      selectedBorrowHistoryViewMode === "mine"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    ของฉัน
                  </button>
                </div>
              )}

            {/* 
              Description: Search เปลี่ยนตามแท็บ (ให้อยู่ถัดจาก segment และกินพื้นที่ที่เหลือ)
              Input : activeTabKey
              Output : ReactNode
              Author: Chanwit Muangma (Boom) 66160224
            */}
            <div className="flex-1">
              {activeTabKey === "borrow" && <SearchFilter onChange={handleSearchChange} />}
              {activeTabKey === "approve" && <SearchFilter onChange={handleApprovalSearchChange} />}
              {activeTabKey === "repair" && <SearchFilter onChange={handleRepairSearchChange} />}
            </div>
          </div>
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
              items={repairStatusOptions as any}
              value={selectedRepairStatusOption as any}
              onChange={(item: RepairStatusOption) => {
                setSelectedRepairStatusOption(item);

                const nextStatusValue = item.value || "";
                setSelectedRepairStatus(nextStatusValue as HistoryIssueStatus | "");

                setRepairCurrentPage(1);
                setExpandedIssueIds(new Set());
              }}
              placeholder="สถานะ"
              searchable={false}
              dropdownHeight={220}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        {activeTabKey === "repair" && (
          <div className="w-full overflow-x-auto">
            {/* Header ตาราง */}
            <div
              className="grid [grid-template-columns:1.2fr_1.2fr_0.8fr_0.9fr_0.6fr_70px]
                        bg-white border border-[#D9D9D9] font-semibold text-gray-700
                        rounded-[16px] mb-[10px] h-[61px] items-center p-4 pl-6"
            >
              <div className="text-left flex items-center h-full">
                อุปกรณ์
                <button type="button" onClick={() => onClickRepairSort("deviceName")}>
                  <Icon icon={getRepairSortIcon("deviceName")} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                หัวข้อปัญหา
                <button type="button" onClick={() => onClickRepairSort("issueTitle")}>
                  <Icon icon={getRepairSortIcon("issueTitle")} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                วันที่แจ้ง
                <button type="button" onClick={() => onClickRepairSort("reportedAt")}>
                  <Icon icon={getRepairSortIcon("reportedAt")} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                ผู้รับผิดชอบ
                <button type="button" onClick={() => onClickRepairSort("assignee")}>
                  <Icon icon={getRepairSortIcon("assignee")} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                สถานะ
                <button type="button" onClick={() => onClickRepairSort("status")}>
                  <Icon icon={getRepairSortIcon("status")} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="h-full" />
            </div>

            <div className="bg-white border border-[#D9D9D9] rounded-[16px]">
              <div className="space-y-3">
                {isLoadingRepairList && (
                  <div className="flex items-center gap-2 px-2 py-6 text-sm text-neutral-600">
                    <Icon icon="mdi:loading" className="animate-spin text-lg" />
                    กำลังโหลดข้อมูล...
                  </div>
                )}

                {!isLoadingRepairList && repairItemsForRender.length === 0 && (
                  <div className="px-[30px] py-8 text-sm text-neutral-600">ไม่พบข้อมูล</div>
                )}

                {!isLoadingRepairList &&
                  repairItemsForRender.map((issueItem) => (
                    <HistoryIssueTicketCard
                      key={issueItem.issueId}
                      item={issueItem}
                      isOpen={expandedIssueIds.has(issueItem.issueId)}
                      detail={issueDetailByIdMap[issueItem.issueId]}
                      isLoadingDetail={loadingDetailIssueId === issueItem.issueId}
                      onToggle={() => toggleIssueOpen(issueItem.issueId)}
                    />
                  ))}
              </div>

              {/* Pagination repair */}
              <div className="mt-auto mb-[24px] pt-3 mr-[24px] flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRepairCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={repairCurrentPage === 1}
                    className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                  >
                    {"<"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepairCurrentPage(1)}
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${repairCurrentPage === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"
                      }`}
                  >
                    1
                  </button>

                  {repairCurrentPage > 2 && <span className="px-1 text-gray-400">…</span>}

                  {repairCurrentPage > 1 && repairCurrentPage < repairTotalPages && (
                    <button
                      type="button"
                      className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]"
                    >
                      {repairCurrentPage}
                    </button>
                  )}

                  {repairCurrentPage < repairTotalPages - 1 && <span className="px-1 text-gray-400">…</span>}

                  {repairTotalPages > 1 && (
                    <button
                      type="button"
                      onClick={() => setRepairCurrentPage(repairTotalPages)}
                      className={`h-8 min-w-8 px-2 rounded border text-sm ${repairCurrentPage === repairTotalPages
                        ? "border-[#000000] text-[#000000]"
                        : "border-[#D9D9D9]"
                        }`}
                    >
                      {repairTotalPages}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRepairCurrentPage((page) => Math.min(repairTotalPages, page + 1))}
                    disabled={repairCurrentPage === repairTotalPages}
                    className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTabKey === "approve" &&
          (isLoadingCurrentUserProfile ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
              กำลังตรวจสอบสิทธิ์...
            </div>
          ) : canViewApprovalHistoryTab ? (
            <div className="w-full overflow-x-auto">
              {/* Header ตาราง */}
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
                  <Icon icon={getApprovalSortIcon("actionDateTime")} width="24" height="24" className="ml-1 text-neutral-700" />
                </button>

                <button
                  type="button"
                  onClick={() => onClickApprovalSort("requester")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  ผู้ส่งคำขอ
                  <Icon icon={getApprovalSortIcon("requester")} width="24" height="24" className="text-[18px] text-neutral-700" />
                </button>

                <button
                  type="button"
                  onClick={() => onClickApprovalSort("deviceName")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  อุปกรณ์
                  <Icon icon={getApprovalSortIcon("deviceName")} width="24" height="24" className="text-[18px] text-neutral-700" />
                </button>

                <button
                  type="button"
                  onClick={() => onClickApprovalSort("categoryName")}
                  className="py-2 text-left flex items-center gap-2"
                >
                  หมวดหมู่
                  <Icon icon={getApprovalSortIcon("categoryName")} width="24" height="24" className="text-[18px] text-neutral-700" />
                </button>

                <div className="py-2" />
              </div>

              <div className="bg-white border border-[#D9D9D9] rounded-[16px]">
                {isLoadingApprovalList && (
                  <div className="flex items-center gap-2 px-[30px] py-6 text-sm text-neutral-600">
                    <Icon icon="mdi:loading" className="animate-spin text-lg" />
                    กำลังโหลดข้อมูล...
                  </div>
                )}

                {!isLoadingApprovalList && approvalItemsForRender.length === 0 && (
                  <div className="px-[30px] py-8 text-sm text-neutral-600">ไม่พบข้อมูล</div>
                )}

                {!isLoadingApprovalList &&
                  approvalItemsForRender.map((approvalItem) => {
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
                        {/* วันที่-เวลา */}
                        <div className="flex items-start gap-3">
                          <div
                            className={mergeClassNames(
                              "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full",
                              decisionIconContainerClassName
                            )}
                          >
                            <Icon icon={decisionIcon} className="text-xl" />
                          </div>

                          <div className="min-w-0">
                            <div className={mergeClassNames("font-semibold", isRejected ? "text-red-600" : "text-green-600")}>
                              {decisionLabel}
                            </div>
                            <div className="text-xs text-neutral-500">{formatThaiDateTime(approvalItem.actionDateTime)} น.</div>
                          </div>
                        </div>

                        {/* ผู้ส่งคำขอ */}
                        <div className="min-w-0">
                          <div className="truncate font-medium text-neutral-900">{approvalItem.requester.fullName}</div>
                          <div className="text-xs text-neutral-500">{approvalItem.requester.employeeCode ?? "-"}</div>
                        </div>

                        {/* อุปกรณ์ */}
                        <div className="min-w-0">
                          <div className="truncate font-medium text-neutral-900">{deviceName}</div>
                          <div className="text-xs text-neutral-500">รหัส : {deviceSerialNumber}</div>
                        </div>

                        {/* หมวดหมู่ */}
                        <div className="min-w-0">
                          <div className="truncate font-medium text-neutral-900">{approvalItem.device?.categoryName ?? "-"}</div>
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

                {/* Pagination approve */}
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
                        approvalCurrentPage === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"
                      )}
                    >
                      1
                    </button>

                    {approvalCurrentPage > 2 && <span className="px-1 text-gray-400">…</span>}

                    {approvalCurrentPage > 1 && approvalCurrentPage < approvalTotalPages && (
                      <button type="button" className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]">
                        {approvalCurrentPage}
                      </button>
                    )}

                    {approvalCurrentPage < approvalTotalPages - 1 && <span className="px-1 text-gray-400">…</span>}

                    {approvalTotalPages > 1 && (
                      <button
                        type="button"
                        onClick={() => setApprovalCurrentPage(approvalTotalPages)}
                        className={mergeClassNames(
                          "h-8 min-w-8 px-2 rounded border text-sm",
                          approvalCurrentPage === approvalTotalPages ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"
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

              {/* Modal รายละเอียด */}
              <ApprovalHistoryDetailModal
                isOpen={isApprovalDetailModalOpen}
                isLoading={isLoadingApprovalDetail}
                detail={approvalDetail}
                onClose={closeApprovalDetailModal}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
          ))}

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
                  <Icon icon={getSortIcon(sortField, "deviceName", sortDirection)} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                จำนวน
                <button type="button" onClick={() => onClickSort("deviceChildCount")}>
                  <Icon icon={getSortIcon(sortField, "deviceChildCount", sortDirection)} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                หมวดหมู่
                <button type="button" onClick={() => onClickSort("category")}>
                  <Icon icon={getSortIcon(sortField, "category", sortDirection)} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                ชื่อผู้ร้องขอ
                <button type="button" onClick={() => onClickSort("requester")}>
                  <Icon icon={getSortIcon(sortField, "requester", sortDirection)} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                วันที่ร้องขอ
                <button type="button" onClick={() => onClickSort("requestDate")}>
                  <Icon icon={getSortIcon(sortField, "requestDate", sortDirection)} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="text-left flex items-center h-full">
                สถานะ
                <button type="button" onClick={() => onClickSort("status")}>
                  <Icon icon={getSortIcon(sortField, "status", sortDirection)} width="24" height="24" className="ml-1" />
                </button>
              </div>

              <div className="h-full" />
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
                  <div className="px-[30px] py-8 text-sm text-neutral-600">ไม่พบข้อมูล</div>
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

              {/* Pagination borrow */}
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
                    <button type="button" className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]">
                      {currentPage}
                    </button>
                  )}

                  {currentPage < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}

                  {totalPages > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`h-8 min-w-8 px-2 rounded border text-sm ${currentPage === totalPages ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"
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
 * Input : active (boolean), onClick (() => void), children (ReactNode)
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
        active ? "border-sky-300 bg-[#1890FF] text-neutral-50" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      )}
    >
      {children}
    </button>
  );
}
