import { useMemo, useState } from "react";
import type { BorrowItem } from "./Types";
import BorrowDetailModal from "./BorrowDetailModal";
import Pagination from "../Pagination";

interface Props {
  data: BorrowItem[];
}

type SortKey = keyof BorrowItem;
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
  const [selected, setSelected] = useState<BorrowItem | null>(null);
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const pageSize = 5;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // 🔥 ถ้า sort ตามปี → ต้องดู quarter ด้วย
      if (sortKey === "year") {
        if (a.year !== b.year) {
          return sortOrder === "asc" ? a.year - b.year : b.year - a.year;
        }

        // ปีเท่ากัน → sort quarter
        return sortOrder === "asc"
          ? a.quarter - b.quarter
          : b.quarter - a.quarter;
      }

      // 🔥 ถ้า sort ตาม quarter อย่างเดียว
      if (sortKey === "quarter") {
        return sortOrder === "asc"
          ? a.quarter - b.quarter
          : b.quarter - a.quarter;
      }

      // 🔥 default sort (string/number ปกติ)
      const aVal = a[sortKey];
      const bVal = b[sortKey];

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
    <div className="flex flex-col gap-[11px]">
      <div className="">
        <div
          className="
  grid
grid-cols-[150px_minmax(250px,2fr)_minmax(200px,1.5fr)_1fr_1fr_1.2fr_1fr_180px]
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
          <HeaderCell label="ลำดับ" sortKey="id" onSort={handleSort} />
          <HeaderCell label="ชื่อผู้ใช้" sortKey="name" onSort={handleSort} />
          <HeaderCell label="ตำแหน่ง" sortKey="position" onSort={handleSort} />
          <HeaderCell label="แผนก" sortKey="department" onSort={handleSort} />
          <HeaderCell
            label="ฝ่ายย่อย"
            sortKey="subDepartment"
            onSort={handleSort}
          />
          <HeaderCell label="เบอร์ติดต่อ" sortKey="phone" onSort={handleSort} />
          <HeaderCell label="อุปกรณ์" sortKey="equipment" onSort={handleSort} />
          <HeaderCell
            label="จำนวนวันที่ล่าช้า"
            sortKey="lateDays"
            align="right"
            onSort={handleSort}
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {paginated.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className="
  grid
grid-cols-[150px_minmax(250px,2fr)_minmax(200px,1.5fr)_1fr_1fr_1.2fr_1fr_180px]
  px-6
  py-4
  hover:bg-gray-50
  cursor-pointer
  "
          >
            <div className="text-left  font-medium">
              <div>{item.id}</div>
            </div>
            <div className="text-left  font-medium">
              <div>{item.name}</div>
            </div>
            <div className="text-left  font-medium">
              <div>{item.position}</div>
            </div>
            <div className="text-left  font-medium">
              <div>{item.department}</div>
            </div>
            <div className="text-left  font-medium">
              <div>{item.subDepartment}</div>
            </div>
            <div className="text-left  font-medium">
              <div>{item.phone}</div>
            </div>
            <div className="text-left  font-medium">
              <div>{item.equipment}</div>
            </div>
            <div className="text-center  font-medium">{item.lateDays}</div>
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
