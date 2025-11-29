import "../styles/css/User.css";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import { Icon } from "@iconify/react";
import { useToast } from "../components/Toast";
// import api from "../api/axios.js"; 
// import DeviceModal from "../components/DeviceModal"; 

// --- Type Definitions ---
type Equipment = {
  id: number;
  name: string;
  image: string | null;
  department: string;
  category: string;
  sub_section: string;
  quantity: number;
  unit: string;
  last_edited: string | Date;
  status_text: string;
  status_type: "active" | "inactive";
  created_at: string | Date;
};

type DropdownOption = {
  id: number | string;
  label: string;
  value: string;
};

export const Inventory = () => {
  // --- States ---
  const [items, setItems] = useState<Equipment[]>([]);
  const toast = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Checkbox State ---
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete">("add");

  // --- Filter Options Data (Mock) ---
  const [deptOptions] = useState<DropdownOption[]>([
    { id: 1, label: "แผนก A", value: "A" },
    { id: 2, label: "คลังสินค้า", value: "คลังสินค้า" },
  ]);
  const [subSecOptions] = useState<DropdownOption[]>([
    { id: 1, label: "ฝ่าย A", value: "A" },
  ]);
  const [catOptions] = useState<DropdownOption[]>([
    { id: 1, label: "IT", value: "IT" },
    { id: 2, label: "เครื่องเขียน", value: "Stationery" },
  ]);

  // --- Active Filters ---
  const [deptFilter, setDeptFilter] = useState<DropdownOption | null>(null);
  const [subSecFilter, setSubSecFilter] = useState<DropdownOption | null>(null);
  const [catFilter, setCatFilter] = useState<DropdownOption | null>(null);
  const [searchFilter, setSearchFilters] = useState({ search: "" });

  // --- Sorting State ---
  const [sortField, setSortField] = useState<keyof Equipment | "status_text">("last_edited");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // --- Handlers: Modal ---
  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setModalType("add");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Equipment) => {
    setSelectedItem(item);
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Equipment) => {
    setSelectedItem(item);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleModalSubmit = () => {
    handleCloseModal();
    setRefreshTrigger((prev) => prev + 1);
  };

  // --- Data Fetching ---
  useEffect(() => {
    // Mock Data ให้ตรงกับภาพตัวอย่าง
    setItems([
        {
          id: 1,
          name: "เครื่องพิมพ์เลเซอร์",
          image: null,
          department: "เครื่องพิมพ์/สแกน",
          category: "IT",
          sub_section: "A",
          quantity: 20,
          unit: "ชิ้น",
          last_edited: new Date("2025-08-20"),
          status_text: "มีการยืมอยู่",
          status_type: "active",
          created_at: new Date()
        },
        {
          id: 2,
          name: "Projector",
          image: null,
          department: "คลังสินค้า",
          category: "IT",
          sub_section: "A",
          quantity: 20,
          unit: "ชิ้น",
          last_edited: new Date("2025-08-20"),
          status_text: "ไม่มีการยืม",
          status_type: "inactive",
          created_at: new Date()
        },
    ]);
  }, [refreshTrigger]);

  // --- Helper Functions ---
  const FormatThaiDate = (iso: string | Date) => {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.toLocaleString("th-TH", { month: "short" });
    const year = d.getFullYear() + 543;
    return `${day} / ${month} / ${year}`;
  };

  const HandleSort = (field: keyof Equipment | "status_text") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // --- Filter & Sort Logic ---
  const filtered = useMemo(() => {
    const search = searchFilter.search.trim().toLowerCase();
    
    let result = items.filter((item) => {
      const bySearch =
        !search ||
        [item.name, item.department, item.category, item.sub_section]
          .join(" ")
          .toLowerCase()
          .includes(search);
      
      const byDept = !deptFilter?.value || item.department.includes(deptFilter.value);
      const bySub = !subSecFilter?.value || item.sub_section === subSecFilter.value;
      const byCat = !catFilter?.value || item.category === catFilter.value;

      return bySearch && byDept && bySub && byCat;
    });

    result = [...result].sort((a, b) => {
        let valA: any = a[sortField as keyof Equipment];
        let valB: any = b[sortField as keyof Equipment];

        if (sortField === "status_text") {
            valA = a.status_text;
            valB = b.status_text;
        }
        if (sortField === "last_edited" || sortField === "created_at") {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }

        if (typeof valA === "string" && typeof valB === "string") {
            return sortDirection === "asc"
            ? valA.localeCompare(valB, "th")
            : valB.localeCompare(valA, "th");
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
    });
    return result;
  }, [items, searchFilter, deptFilter, subSecFilter, catFilter, sortField, sortDirection]);

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  
  useEffect(() => {
    setPage(1);
    setSelectedItems([]); // Clear selection when filter changes
  }, [searchFilter, deptFilter, subSecFilter, catFilter, sortDirection]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // --- Checkbox Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all visible items
      const allIds = filtered.map((item) => item.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = filtered.length > 0 && selectedItems.length === filtered.length;

  return (
    <div className="w-full min-h-screen flex flex-col p-4">
      <div className="flex-1">
        {/* Breadcrumbs */}
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">คลังอุปกรณ์</span>
        </div>

        {/* Header Title */}
        <div className="flex items-center gap-[14px] mb-[21px]">
          <h1 className="text-2xl font-semibold">จัดการคลังอุปกรณ์</h1>
          <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
            อุปกรณ์ทั้งหมด {items.length}
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="w-full mb-[23px]">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
            <SearchFilter onChange={setSearchFilters} />
            <div className="flex space-x-[4px]">
              <Dropdown
                items={deptOptions}
                value={deptFilter}
                onChange={setDeptFilter}
                placeholder="แผนก"
                className="w-[120px]"
              />
              <Dropdown
                items={subSecOptions}
                value={subSecFilter}
                onChange={setSubSecFilter}
                placeholder="ฝ่ายย่อย"
                className="w-[120px]"
              />
              <Dropdown
                items={catOptions}
                value={catFilter}
                onChange={setCatFilter}
                placeholder="หมวดหมู่"
                className="w-[120px]"
              />
              <Button
                size="md"
                icon={<Icon icon="ic:baseline-plus" width="20px" height="20px" />}
                onClick={handleOpenAddModal}
                className="w-[150px] h-[46px] text-[16px] font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                เพิ่มอุปกรณ์
              </Button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-auto">
          {/* Table Header */}
          <div
            className="grid grid-cols-[50px_250px_180px_140px_140px_140px_160px_140px_100px] 
            bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] items-center gap-3"
          >
            {/* Checkbox Column */}
            <div className="py-2 px-4 flex items-center justify-center">
               <input 
                 type="checkbox" 
                 className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                 checked={isAllSelected}
                 onChange={handleSelectAll}
               />
            </div>

            <div className="py-2 px-4 text-left flex items-center">
              ชื่ออุปกรณ์
              <button type="button" onClick={() => HandleSort("name")}>
                <Icon
                  icon={
                    sortField === "name"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              แผนก
              <button type="button" onClick={() => HandleSort("department")}>
                <Icon
                  icon={
                    sortField === "department"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              หมวดหมู่
              <button type="button" onClick={() => HandleSort("category")}>
                <Icon
                  icon={
                    sortField === "category"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              ฝ่ายย่อย
              <button type="button" onClick={() => HandleSort("sub_section")}>
                <Icon
                  icon={
                    sortField === "sub_section"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            {/* จำนวนคงเหลือ: ใส่ whitespace-nowrap เพื่อให้อยู่บรรทัดเดียว */}
            <div className="py-2 px-4 text-left flex items-center whitespace-nowrap">
              จำนวนคงเหลือ (ชิ้น)
              <button type="button" onClick={() => HandleSort("quantity")}>
                <Icon
                  icon={
                    sortField === "quantity"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">
              แก้ไขล่าสุด
              <button type="button" onClick={() => HandleSort("last_edited")}>
                <Icon
                  icon={
                    sortField === "last_edited"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center whitespace-nowrap">
              การใช้งาน
              <button type="button" onClick={() => HandleSort("status_text")}>
                <Icon
                  icon={
                    sortField === "status_text"
                      ? sortDirection === "asc"
                        ? "bx:sort-down"
                        : "bx:sort-up"
                      : "bx:sort-down"
                  }
                  width="24"
                  height="24"
                  className="ml-1"
                />
              </button>
            </div>
            <div className="py-2 px-4 text-left flex items-center">จัดการ</div>
          </div>

          {/* Table Body */}
          <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-[16px]">
            {pageRows.map((item) => (
              <div
                key={item.id}
                // ใช้ grid-template-columns ให้ตรงกับ header เป๊ะๆ
                className="grid [grid-template-columns:50px_250px_180px_140px_140px_140px_160px_140px_100px] 
                items-center hover:bg-gray-50 text-[16px] gap-3"
              >
                {/* Checkbox Column */}
                <div className="py-2 px-4 flex items-center justify-center">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                     checked={selectedItems.includes(item.id)}
                     onChange={() => handleSelectItem(item.id)}
                   />
                </div>

                {/* Name & Image */}
                <div className="py-2 px-4 flex items-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500">
                         <Icon icon="ph:image" width="24" />
                    </div>
                  )}
                  <span className="ml-3 truncate font-medium text-gray-900">
                    {item.name}
                  </span>
                </div>

                <div className="py-2 px-4">{item.department}</div>
                <div className="py-2 px-4">{item.category}</div>
                <div className="py-2 px-4">{item.sub_section}</div>
                <div className="py-2 px-4">{item.quantity} {item.unit}</div>
                <div className="py-2 px-4">{FormatThaiDate(item.last_edited)}</div>

                {/* Status Badge */}
                <div className="py-2 px-4">
                  <span
                    className={`flex items-center justify-center w-[120px] h-[35px] border rounded-full text-base ${
                      item.status_type === "active"
                        ? "border-[#73D13D] text-[#73D13D]"
                        : "border-gray-400 text-gray-500"
                    }`}
                  >
                    {item.status_text}
                  </span>
                </div>

                {/* Actions */}
                <div className="py-2 px-4 flex items-center gap-3">
                    <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-[#1890FF] hover:text-[#1890FF] cursor-pointer"
                        title="แก้ไข"
                    >
                        <Icon icon="prime:pen-to-square" width="22" height="22" />
                    </button>
                    <button
                        onClick={() => handleOpenDeleteModal(item)}
                        className="text-[#FF4D4F] hover:text-[#FF4D4F] cursor-pointer"
                        title="ลบ"
                    >
                        <Icon icon="solar:trash-bin-trash-outline" width="22" height="22" />
                    </button>
                </div>
              </div>
            ))}

            {/* Pagination Footer */}
            <div className="mt-3 mb-[24px] pt-3 mr-[24px] flex items-center justify-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-[gray-50]"
                >
                  {"<"}
                </button>

                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className={`h-8 min-w-8 px-2 rounded border text-sm ${page === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"}`}
                >
                  1
                </button>

                {page > 2 && <span className="px-1 text-gray-400">…</span>}
                {page > 1 && page < totalPages && (
                  <button
                    type="button"
                    className="h-8 min-w-8 px-2 rounded border text-sm border-[#000000] text-[#000000]"
                  >
                    {page}
                  </button>
                )}
                {page < totalPages - 1 && (
                  <span className="px-1 text-gray-400">…</span>
                )}

                {totalPages > 1 && (
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${page === totalPages ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"}`}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
                >
                  {">"}
                </button>

                <form
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const v = Number(fd.get("goto"));
                      if (!Number.isNaN(v))
                        setPage(Math.min(totalPages, Math.max(1, v)));
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

        
        {selectedItems.length > 0 && (
           <div className="fixed bottom-10 left-10 bg-white border border-red-200 p-4 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in-up">
              <button 
                onClick={() => {
                    toast.push({ message: `ลบ ${selectedItems.length} รายการเรียบร้อย`, tone: "confirm" });
                    setSelectedItems([]);
                }}
                className="bg-[#FF4D4F] hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                  <Icon icon="solar:trash-bin-trash-bold" width="20" />
                  ลบอุปกรณ์
              </button>
              <span className="text-[#FF4D4F] font-medium">เลือกอุปกรณ์ ({selectedItems.length})</span>
           </div>
        )}

      </div>
    </div>
  );
};