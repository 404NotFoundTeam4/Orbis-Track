// src/pages/History.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
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

/**
 * Description: หน้า History (รวม 3 แท็บ) โดยแท็บหลักที่ใช้งานคือ “ประวัติยืม-คืน”
 * Input : - (React Page)
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */
export default function History() {
  const didInitializeSearchRef = useRef(false);
  const lastSearchTextRef = useRef<string>("");

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

  useEffect(() => {
    setCurrentPage(1);
    setExpandedTicketIds(new Set());
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

  useEffect(() => {
    if (activeTabKey !== "borrow") return;

    let cancelled = false;

    const loadHistoryBorrowList = async () => {
      try {
        setIsLoadingList(true);
        const response = await historyBorrowService.getHistoryBorrowTickets(queryParams);
        if (cancelled) return;

        setTicketItems(response.items);
        setTotalPages(response.pagination.totalPages || 1);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setTicketItems([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setIsLoadingList(false);
      }
    };

    loadHistoryBorrowList();

    return () => {
      cancelled = true;
    };
  }, [activeTabKey, queryParams]);

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

  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      <div className="text-sm text-neutral-500">ดูประวัติ</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
        ประวัติการยืม-คืน
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <TabButton active={activeTabKey === "borrow"} onClick={() => setActiveTabKey("borrow")}>
          ประวัติยืม-คืน
        </TabButton>

        <TabButton active={activeTabKey === "repair"} onClick={() => setActiveTabKey("repair")}>
          ประวัติการแจ้งซ่อม
        </TabButton>

        <TabButton active={activeTabKey === "approve"} onClick={() => setActiveTabKey("approve")}>
          ประวัติการอนุมัติ
        </TabButton>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchFilter onChange={handleSearchChange} />
        </div>

        <div className="md:ml-auto">
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
        </div>
      </div>

      <div className="mt-4">
        {activeTabKey !== "borrow" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
            หน้านี้ยังไม่ถูกพัฒนา (เว้นไว้ก่อน)
          </div>
        )}

        {activeTabKey === "borrow" && (
          <div className="w-full overflow-x-auto">
            <div
              className="grid grid-cols-[2.2fr_1fr_1.2fr_1.6fr_1.3fr_1.1fr_44px]
                        bg-white border border-[#D9D9D9] font-semibold text-gray-700
                        rounded-[16px] mb-[10px] h-[61px] items-center gap-3 px-[30px]"
            >
              <div className="py-2 text-left flex items-center">
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

              <div className="py-2 text-left flex items-center -ml-4">
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

              <div className="py-2 text-left flex items-center -ml-4">
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

              <div className="py-2 text-left flex items-center">
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

              <div className="py-2 text-left flex items-center ml-2">
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

              <div className="py-2 text-left flex items-center -ml-5">
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
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${
                      currentPage === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"
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
                      className={`h-8 min-w-8 px-2 rounded border text-sm ${
                        currentPage === totalPages
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
