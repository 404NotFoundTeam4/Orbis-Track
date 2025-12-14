import { useEffect, useMemo, useState } from "react"
import { inventoryService, type GetInventory } from "../services/InventoryService";
import SearchFilter from "../components/SearchFilter";
import DropDown from "../components/DropDown";
import DevicesCard from "../components/DevicesCard";

const ListDevices = () => {

  // เก็บข้อมูลอุปกรณ์
  const [devices, setDevices] = useState<GetInventory[]>([]);

  useEffect(() => {
    // ดึงข้อมูลอุปกรณ์
    const fetchDevices = async () => {
      const res = await inventoryService.getInventory();
      setDevices(res); // เก็บข้อมูลอุปกรณ์
    }
    fetchDevices();
  }, []);

  //Search Filter
  const [searchFilter, setSearchFilters] = useState({
    search: "",
  });

  // Dropdown
  const [categoryFilter, setCategoryFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);
  const [sectionFilter, setSectionFilter] = useState<{
    id: number | string;
    label: string;
    value: string;
  } | null>(null);

  const categoryOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    ...Array.from(new Set(devices.map(d => d.category)))
      .filter(Boolean)
      .map((c, i) => ({
        id: i,
        label: c,
        value: c,
      })),
  ];

  const departmentOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    ...Array.from(new Set(devices.map(d => d.department)))
      .filter(Boolean)
      .map((d, i) => ({
        id: i,
        label: d!,
        value: d!,
      })),
  ];

  const sectionOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    ...Array.from(new Set(devices.map(d => d.sub_section)))
      .filter(Boolean)
      .map((s, i) => ({
        id: i,
        label: s!,
        value: s!,
      })),
  ];

  const filtered = useMemo(() => {
    const search = searchFilter.search.trim().toLowerCase();
    let result = devices.filter((device) => {
      const bySearch =
        !search ||
        [
          device.de_name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const byCategory = !categoryFilter?.value || device.category === categoryFilter.value;
      const byDepartment =
        !departmentFilter?.value || device.department === departmentFilter.value;
      const bySection =
        !sectionFilter?.value || device.sub_section === sectionFilter.value;
      return bySearch && byCategory && byDepartment && bySection;
    });

    return result;
  }, [devices, searchFilter, categoryFilter, departmentFilter, sectionFilter]);

  //จัดการแบ่งแต่ละหน้า
  const [page, setPage] = useState(1);
  const pageSize = 10; // 10/20/50 ก็ได้

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [
    searchFilter,
    categoryFilter,
    departmentFilter,
    sectionFilter,
  ]); // เปลี่ยนกรอง/เรียง → กลับหน้า 1

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="flex-1 flex flex-col gap-[20px] w-full min-h-[843px] p-4">

      {/* Header */}
      <div className="flex flex-col">
        <span className="mb-[8px]">รายการอุปกรณ์</span>
        <div className="flex items-center gap-[14px]">
          <h1 className="text-2xl font-semibold">รายการอุปกรณ์</h1>
          <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
            อุปกรณ์ทั้งหมด {devices.length}
          </div>

        </div>

      </div>

      {/* Search & Dropdown */}
      <div className="flex flex-wrap justify-between items-center">
        <SearchFilter onChange={setSearchFilters} />
        <div className="flex gap-[10px]">
          <DropDown
            items={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="หมวดหมู่"
          />
          <DropDown
            items={departmentOptions}
            value={departmentFilter}
            onChange={setDepartmentFilter}
            placeholder="แผนก"
          />
          <DropDown
            items={sectionOptions}
            value={sectionFilter}
            onChange={setSectionFilter}
            placeholder="ฝ่ายย่อย"
          />
        </div>
      </div>

      {/* Card */}
      <div className="min-h-[680px]">

        <div className="grid grid-cols-5 gap-x-[30px] gap-y-[24px]">
          {
            pageRows.map((device) => (
              <DevicesCard
                key={ device.de_id }
                device={ device }
              />
            ))
          }
        </div>

      </div>

      {/* ปุ่มหน้า */}
      <div className="mt-auto py-4 mr-6 flex items-center justify-end">
        {/* ขวา: ตัวแบ่งหน้า */}
        <div className="flex items-center gap-2">
          {/* ปุ่มก่อนหน้า */}
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-[gray-50]"
          >
            {"<"}
          </button>

          {/* หน้า 1 */}
          <button
            type="button"
            onClick={() => setPage(1)}
            className={`h-8 min-w-8 px-2 rounded border text-sm ${page === 1 ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"}`}
          >
            1
          </button>

          {/* หน้าปัจจุบันถ้าไม่ใช่ 1 และไม่ใช่หน้าสุดท้าย แสดงด้วยกรอบดำ */}
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

          {/* หน้าสุดท้าย (ถ้ามากกว่า 1) */}
          {totalPages > 1 && (
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className={`h-8 min-w-8 px-2 rounded border text-sm ${page === totalPages ? "border-[#000000] text-[#000000]" : "border-[#D9D9D9]"}`}
            >
              {totalPages}
            </button>
          )}

          {/* ถัดไป */}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 min-w-8 px-2 rounded border text-sm disabled:text-[#D9D9D9] border-[#D9D9D9] disabled:bg-gray-50"
          >
            {">"}
          </button>

          {/* ไปหน้าที่ */}
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
  )
}

export default ListDevices
