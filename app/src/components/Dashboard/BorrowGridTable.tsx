import { useMemo, useState } from "react";
import type { OverdueTicket } from "../../services/dashboard";
import BorrowDetailModal from "./BorrowDetailModal";
import Pagination from "../Pagination";

interface Props {
  data: OverdueTicket[];
}

type SortKey = keyof OverdueTicket;
import { Icon } from "@iconify/react";

interface HeaderProps {
  label: string;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}

function HeaderCell({
  label,
  sortKey,
  onSort,
  align = "left",
  className = "",
}: HeaderProps) {
  return (
    <div
      onClick={() => onSort(sortKey)}
      className={`
        text-[18px]
        flex items-center gap-1.5
        whitespace-nowrap
        cursor-pointer
        ${align === "right" ? "justify-end" : ""}
        ${className}
      `}
    >
      <span>{label}</span>
      <Icon
        icon="mdi:sort"
        width="18"
        height="18"
        className="text-[#8C8C8C] shrink-0"
      />
    </div>
  );
}
export default function BorrowGridTable({ data }: Props) {
  const [selected, setSelected] = useState<OverdueTicket | null>(null);
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>("delayedDays");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const pageSize = 5;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // 🔥 default sort (string/number ปกติ)
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  const totalPages = Math.ceil(data.length / pageSize);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setPage(1); // 🔥 สำคัญ
  };

  return (
    <div className="flex flex-col gap-[11px] ">
      <div>
        ตารางการคืนอุปกรณ์ล่าช้า
      </div>
      <div className="">
        <div
          className="
  grid
grid-cols-[80px_minmax(250px,2fr)_150px_1fr_1fr_1.2fr_1fr_150px]
 bg-white
  px-6
  py-3.75
  rounded-2xl
  border
  border-[#D8D8D8]
  text-[16px]
  font-semibold
  text-[#1F1F1F]
  "
        >
          <HeaderCell label="ลำดับ" sortKey="ticketId" onSort={handleSort} />
          <HeaderCell label="ชื่อผู้ใช้" sortKey="userName" onSort={handleSort} />
          <HeaderCell label="ตำแหน่ง" sortKey="userRole" onSort={handleSort} />
          <HeaderCell label="แผนก" sortKey="department" onSort={handleSort} />
          <HeaderCell
            label="ฝ่ายย่อย"
            sortKey="section"
            onSort={handleSort}
          />
          <HeaderCell label="เบอร์ติดต่อ" sortKey="phone" onSort={handleSort} />
          <HeaderCell label="อุปกรณ์" sortKey="equipments" onSort={handleSort} />
          <HeaderCell
            label="จำนวนวันที่ล่าช้า"
            sortKey="delayedDays"
            align="right"
            onSort={handleSort}
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {paginated.map((item) => (
          <div
            key={item.ticketId}
            onClick={() => setSelected(item as any)} // keep existing detail modal working loosely, or omit entirely as needed
            className="
  grid
grid-cols-[80px_minmax(250px,2fr)_150px_1fr_1fr_1.2fr_1fr_150px]
  px-6
  py-4
  hover:bg-gray-50
  cursor-pointer
  items-center
  "
          >
            <div className="text-left font-medium">
              <div>{item.ticketId}</div>
            </div>
            <div className="text-left font-medium flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.userImage ? (
                  <img src={item.userImage} alt={item.userName} className="w-full h-full object-cover" />
                ) : (
                  <Icon icon="octicon:person-24" className="text-gray-400 text-2xl" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="text-[14px] font-bold text-gray-900">{item.userName}</div>
                <div className="text-[12px] text-gray-500">
                  <span className="text-[#8AB4F8]">{item.userEmail}</span> : {item.userEmpCode || "-"}
                </div>
              </div>
            </div>
            <div className="text-left font-medium">
              <div>{item.userRole}</div>
            </div>
            <div className="text-left font-medium">
              <div>{item.department || "-"}</div>
            </div>
            <div className="text-left font-medium">
              <div>{item.section || "-"}</div>
            </div>
            <div className="text-left font-medium">
              <div>{item.phone}</div>
            </div>
            <div className="text-left font-medium" title={item.equipments.join(", ")}>
              <div className="truncate">{item.equipments.join(", ")}</div>
            </div>
            <div className="text-center font-medium text-red-500">{item.delayedDays}</div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex justify-end items-center gap-3 p-4 ">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {selected && (
        <BorrowDetailModal data={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
