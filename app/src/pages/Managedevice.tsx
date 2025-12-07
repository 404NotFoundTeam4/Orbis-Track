import "../styles/css/User.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/Button";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import { Icon } from "@iconify/react";
import { useToast } from "../components/Toast";
import { AlertDialog } from "../components/AlertDialog";
import api from "../api/axios.js";

const API_BASE_URL = "http://localhost:4041/api/v1";

type Equipment = {
  id: number;
  serial_number: string;
  name: string;
  description: string;
  location: string; 
  image: string | null;
  department: string;
  category: string;
  sub_section: string;
  quantity: number;
  
  max_borrow_days: number;
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

// --- Helper: Extract Unique Dropdown Options ---
const extractOptions = (data: Equipment[], key: keyof Equipment): DropdownOption[] => {
  const uniqueValues = Array.from(new Set(data.map(item => String(item[key] || "")).filter(val => val !== "")));
  return [
    { id: "all", label: "ทั้งหมด", value: "" },
    ...uniqueValues.map((val, index) => ({
      id: index,
      label: val,
      value: val
    }))
  ];
};

export const Inventory = () => {
  const location = useLocation();
  const isStaff = location.pathname.includes("/staff");

  // --- States ---
  const [items, setItems] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Checkbox & Delete States ---
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null); // สำหรับเก็บ ID เวลาลบแถวเดียว

  // --- Alert & Modal States ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Filter Options ---
  const [deptOptions, setDeptOptions] = useState<DropdownOption[]>([]);
  const [subSecOptions, setSubSecOptions] = useState<DropdownOption[]>([]);
  const [catOptions, setCatOptions] = useState<DropdownOption[]>([]);

  // --- Active Filters ---
  const [deptFilter, setDeptFilter] = useState<DropdownOption | null>(null);
  const [subSecFilter, setSubSecFilter] = useState<DropdownOption | null>(null);
  const [catFilter, setCatFilter] = useState<DropdownOption | null>(null);
  const [searchFilter, setSearchFilters] = useState({ search: "" });

  // --- Sorting & Pagination ---
  const [sortField, setSortField] = useState<keyof Equipment | "status_text">("last_edited");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // --- Handlers: Modal Placeholders ---
  const handleOpenAddModal = () => {
    console.log("Open Add Modal");
  };

  const handleOpenEditModal = (item: Equipment) => {
    console.log("Open Edit Modal", item);
  };

  // --- Handler: Delete (Multiple) ---
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.push({ message: "กรุณาเลือกรายการที่ต้องการลบ", tone: "danger" });
      return;
    }
    setDeleteId(null); // เคลียร์ deleteId เพื่อบอกว่าเป็นโหมดลบหลายตัว
    setIsAlertOpen(true);
  };

  // --- Handler: Delete (Single Row) ---
  const handleDeleteRow = (id: number) => {
    setDeleteId(id); // ระบุ ID ที่จะลบ
    setIsAlertOpen(true);
  };

  // --- Handler: Confirm Delete ---
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    // ถ้า deleteId มีค่า แปลว่าลบแถวเดียว, ถ้าไม่มี ให้ใช้ selectedItems
    const idsToDelete = deleteId ? [deleteId] : selectedItems;

    try {
      await Promise.all(
        idsToDelete.map((id) => 
          api.delete(`${API_BASE_URL}/inventory/${id}`)
        )
      );
      
      const message = deleteId 
        ? "ลบอุปกรณ์เรียบร้อยแล้ว" 
        : `ลบอุปกรณ์ ${idsToDelete.length} รายการเรียบร้อยแล้ว`;

      toast.push({ message: message, tone: "success" });
      
      setSelectedItems([]);
      setDeleteId(null);
      setIsAlertOpen(false);
      setRefreshTrigger((prev) => !prev); // รีโหลดข้อมูลใหม่
    } catch (error) {
      console.error("Delete error:", error);
      toast.push({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", tone: "danger" });
    } finally {
      setIsDeleting(false);
    }
  };

  
  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`${API_BASE_URL}/inventory`); 
        const rawData = response.data.data || response.data || [];
        
        console.log("Fetched Data:", rawData);

        const formattedData: Equipment[] = rawData.map((item: any) => ({
             id: item.de_id,
             serial_number: item.de_serial_number || "-",
             name: item.de_name || "ไม่มีชื่อ",
             description: item.de_description || "",
             location: item.de_location || "-",
             image: item.de_images ? `${API_BASE_URL}/${item.de_images.replace(/\\/g, '/')}` : null,
             
             department: item.department_name || "-", 
             category: item.category_name || "-",
             sub_section: item.sub_section_name || "-",
             quantity: item.quantity !== undefined ? item.quantity : 0, 

             max_borrow_days: item.de_max_borrow_days || 7,
             last_edited: item.updated_at || item.created_at,
             created_at: item.created_at,
             status_text: "พร้อมใช้งาน", 
             status_type: "active"
        }));

        setItems(formattedData);
        
        setDeptOptions(extractOptions(formattedData, "department"));
        setCatOptions(extractOptions(formattedData, "category"));
        setSubSecOptions(extractOptions(formattedData, "sub_section"));

      } catch (error) {
        console.error("❌ Fetch error:", error);
        toast.push({ message: "เชื่อมต่อ Backend ไม่สำเร็จ", tone: "danger" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, [refreshTrigger, isStaff]);

  // --- Helper Functions ---
  const FormatThaiDate = (iso: string | Date) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: 'numeric' });
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
    const search = searchFilter.search?.trim().toLowerCase() || "";
    
    let result = items.filter((item) => {
      const bySearch =
        !search ||
        [item.name, item.department, item.category, item.serial_number]
          .join(" ")
          .toLowerCase()
          .includes(search);
      
      const byDept = !deptFilter?.value || item.department === deptFilter.value;
      const bySub = !subSecFilter?.value || item.sub_section === subSecFilter.value;
      const byCat = !catFilter?.value || item.category === catFilter.value;

      return bySearch && byDept && bySub && byCat;
    });

    result = [...result].sort((a, b) => {
        let valA: any = a[sortField as keyof Equipment];
        let valB: any = b[sortField as keyof Equipment];
        
        if (sortField === "last_edited" || sortField === "created_at") {
             valA = new Date(valA).getTime();
             valB = new Date(valB).getTime();
             return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        if (typeof valA === "string" && typeof valB === "string") {
            return sortDirection === "asc"
            ? valA.localeCompare(valB, "th")
            : valB.localeCompare(valA, "th");
        }
        if (typeof valA === "number" && typeof valB === "number") {
             return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        return sortDirection === "asc" ? valA - valB : valB - valA;
    });
    return result;
  }, [items, searchFilter, deptFilter, subSecFilter, catFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  
  useEffect(() => {
    setPage(1);
    setSelectedItems([]);
  }, [searchFilter, deptFilter, subSecFilter, catFilter]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
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
              <Dropdown items={deptOptions} value={deptFilter} onChange={setDeptFilter} placeholder="แผนก" className="w-[120px]" />
              <Dropdown items={subSecOptions} value={subSecFilter} onChange={setSubSecFilter} placeholder="ฝ่ายย่อย" className="w-[120px]" />
              <Dropdown items={catOptions} value={catFilter} onChange={setCatFilter} placeholder="หมวดหมู่" className="w-[120px]" />
              
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
        <div className="w-auto relative">
          
          {isLoading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-[16px]">
                  <div className="flex flex-col items-center">
                    <Icon icon="eos-icons:loading" width="40" height="40" className="text-blue-500 animate-spin" />
                    <span className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</span>
                  </div>
              </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-[50px_220px_130px_130px_130px_100px_140px_120px_100px] 
            bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] items-center gap-3 pr-2">
            
            <div className="py-2 px-4 flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={isLoading}
                  />
            </div>

            <div className="py-2 px-4 text-left flex items-center cursor-pointer" onClick={() => HandleSort("name")}>
              ชื่ออุปกรณ์
              <Icon icon={sortField === "name" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>
            
            <div className="py-2 px-4 text-left flex items-center cursor-pointer" onClick={() => HandleSort("department")}>
              แผนก
              <Icon icon={sortField === "department" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>

            <div className="py-2 px-4 text-left flex items-center cursor-pointer" onClick={() => HandleSort("category")}>
              หมวดหมู่
              <Icon icon={sortField === "category" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>

            <div className="py-2 px-4 text-left flex items-center cursor-pointer" onClick={() => HandleSort("sub_section")}>
              ฝ่ายย่อย
              <Icon icon={sortField === "sub_section" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>
            
            <div className="py-2 px-4 text-left flex items-center whitespace-nowrap cursor-pointer" onClick={() => HandleSort("quantity")}>
              คงเหลือ
              <Icon icon={sortField === "quantity" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>
            
            <div className="py-2 px-4 text-left flex items-center cursor-pointer" onClick={() => HandleSort("last_edited")}>
              แก้ไขล่าสุด
              <Icon icon={sortField === "last_edited" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>
            <div className="py-2 px-4 text-left flex items-center whitespace-nowrap cursor-pointer" onClick={() => HandleSort("status_text")}>
              สถานะ
              <Icon icon={sortField === "status_text" ? (sortDirection === "asc" ? "bx:sort-down" : "bx:sort-up") : "bx:sort-down"} width="20" className="ml-1 text-gray-400" />
            </div>
            <div className="py-2 px-4 text-center">จัดการ</div>
          </div>

          {/* Table Body */}
          <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-[16px] min-h-[200px] overflow-hidden">
            {filtered.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Icon icon="tabler:database-off" width="48" height="48" />
                    <span className="mt-2">ไม่พบข้อมูลอุปกรณ์</span>
                </div>
            ) : (
                pageRows.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-[50px_220px_130px_130px_130px_100px_140px_120px_100px] 
                        items-center hover:bg-gray-50 text-[15px] gap-3 min-h-[60px] border-b last:border-b-0 border-gray-100 pr-2"
                    >
                        <div className="py-2 px-4 flex items-center justify-center">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                            />
                        </div>

                        <div className="py-2 px-4 flex items-center">
                        {item.image ? (
                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = ""; 
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                            />
                        ) : (
                            <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                                <Icon icon="ph:image" width="20" />
                            </div>
                        )}
                         <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0 hidden items-center justify-center text-gray-400">
                                <Icon icon="ph:image" width="20" />
                         </div>

                        <span className="ml-3 truncate font-medium text-gray-900" title={item.name}>{item.name}</span>
                        </div>
                        
                        <div className="py-2 px-4 truncate text-gray-600">{item.department}</div>
                        <div className="py-2 px-4 truncate text-gray-600">{item.category}</div>
                        <div className="py-2 px-4 truncate text-gray-600">{item.sub_section}</div>
                        <div className="py-2 px-4 text-gray-900">{item.quantity}</div>
                        
                        <div className="py-2 px-4 text-gray-600 text-sm">{FormatThaiDate(item.last_edited)}</div>
                        <div className="py-2 px-4">
                        <span className={`flex items-center justify-center w-[110px] h-[28px] border rounded-full text-xs font-medium ${item.status_type === "active" ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                            {item.status_text}
                        </span>
                        </div>

                        <div className="py-2 px-4 flex items-center justify-center gap-2">
                            {/* ปุ่มแก้ไข */}
                            <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                title="แก้ไข"
                            >
                                <Icon icon="prime:pen-to-square" width="20" height="20" />
                            </button>
                            
                        </div>
                    </div>
                ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 mb-[24px] pt-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-4 h-8">
                {selectedItems.length > 0 && (
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={isLoading}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors border border-red-200"
                  >
                      <Icon icon="solar:trash-bin-trash-bold" width="16" />
                      ลบ {selectedItems.length} รายการ
                  </button>
                )}
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-gray-300 border-gray-300 hover:bg-gray-50 disabled:bg-white">{"<"}</button>
              <div className="text-sm text-gray-600 px-2">
                 หน้า {page} จาก {totalPages}
              </div>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-gray-300 border-gray-300 hover:bg-gray-50 disabled:bg-white">{">"}</button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isAlertOpen}
        title="ยืนยันการลบ"
        description={
            isDeleting 
            ? "กำลังลบข้อมูล..." 
            : (deleteId 
                ? "คุณต้องการลบอุปกรณ์นี้ใช่หรือไม่?" // ข้อความกรณีลบแถวเดียว
                : `คุณต้องการลบอุปกรณ์ ${selectedItems.length} รายการใช่หรือไม่?`) // ข้อความกรณีลบหลายตัว
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
            if (!isDeleting) {
                setIsAlertOpen(false);
                setDeleteId(null); // เคลียร์ ID เมื่อยกเลิก
            }
        }}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        tone="danger"
      />
    </div>
  );
};