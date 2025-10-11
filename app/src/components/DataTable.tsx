import { Icon } from "@iconify/react";
import React from "react";

type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  key: keyof T | string;     // ฟิลด์ใน object
  label: string;             // ชื่อหัวตาราง
  sortable?: boolean;        // เปิด/ปิด sort
  render?: (row: T) => React.ReactNode; // custom render
  width?: string;            // ความกว้างของคอลัมน์ (optional)
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];  // โครงสร้างหัวตาราง
  data: T[];                  // ข้อมูลที่จะแสดง
  sortField?: keyof T | string;
  sortDirection?: SortDirection;
  onSort?: (field: keyof T | string) => void;
  page?: number;
  totalPages?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  sortField,
  sortDirection = "asc",
  onSort,
  page,
  totalPages,
  setPage,
  emptyMessage = "ไม่พบข้อมูล",
}: DataTableProps<T>) {
  return (
    <div className="border border-[#D9D9D9] rounded-[16px] w-full overflow-x-auto">
      {/* Head */}
      <div className="grid bg-gray-50 font-semibold text-gray-700 rounded-t-[16px] h-[60px] items-center"
           style={{ gridTemplateColumns: columns.map(c => c.width || "1fr").join(" ") }}>
        {columns.map((col) => (
          <div
            key={col.key.toString()}
            className={`py-2 px-4 flex items-center ${col.sortable ? "cursor-pointer" : ""}`}
            onClick={() => col.sortable && onSort?.(col.key)}
          >
            {col.label}
            {col.sortable && (
              <Icon
                icon={
                  sortField === col.key
                    ? sortDirection === "asc"
                      ? "bx:sort-down"
                      : "bx:sort-up"
                    : "bx:sort-down"
                }
                width="18"
                height="18"
                className="ml-1 text-gray-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      {data.length > 0 ? (
        data.map((row, i) => (
          <div
            key={i}
            className="grid border-b hover:bg-gray-50 items-center"
            style={{ gridTemplateColumns: columns.map(c => c.width || "1fr").join(" ") }}
          >
            {columns.map((col) => (
              <div key={col.key.toString()} className="py-2 px-4">
                {col.render ? col.render(row) : (row as any)[col.key]}
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="py-6 text-center text-gray-500">{emptyMessage}</div>
      )}

      {/* Pagination */}
      {page && totalPages && setPage && (
        <div className="mt-3 mb-3 pt-3 flex items-center justify-end gap-2 pr-5">
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {"<"}
          </button>
          <span>หน้า {page} / {totalPages}</span>
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}
