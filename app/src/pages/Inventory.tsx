// import { useEffect, useState } from "react"
// import MainDeviceModal from "../components/DeviceModal"
// import DevicesChilds from "../components/DevicesChilds"
// import { useToast } from "../components/Toast";
// import { DeviceService, type DeviceChild, type GetDeviceWithChildsResponse } from "../services/InventoryService";
// import { useParams } from "react-router-dom";

// const Inventory = () => {
//   // ดึง parent id จาก URL
//   const { id } = useParams();
//   const parentId = Number(id);

//   // เก็บข้อมูลอุปกรณ์แม่
//   const [parentDevice, setParentDevice] = useState<GetDeviceWithChildsResponse | null>(null);
//   // เก็บข้อมูลอุปกรณ์ลูก
//   const [deviceChilds, setDeviceChilds] = useState<DeviceChild[]>([]);

//   // ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
//   const fetchDevice = async () => {
//     const device = await DeviceService.getDeviceWithChilds(parentId);
//     setParentDevice(device); // เก็บข้อมูลอุปกรณ์แม่เข้า state
//     setDeviceChilds(device?.device_childs ?? []); // เก็บข้อมูลอุปกรณ์ลูกเข้า state
//   }

//   // โหลดข้อมูลเมื่อเรนเดอร์หน้าเว็บครั้งแรก
//   useEffect(() => {
//     fetchDevice();
//   }, [parentId]);

//   // เรียกใช้งาน toast
//   const { push } = useToast();

//   // เพิ่มอุปกรณ์ลูก
//   const handleAddDeviceChild = async (parentId: number, quantity: number) => {
//     if (!quantity) {
//       push({ tone: "warning", message: "กรุณาระบุจำนวนอุปกรณ์!" });
//       return;
//     }

//     const payload = { dec_de_id: parentId, quantity };
//     // เรียกใช้งาน service
//     await DeviceService.createDeviceChild(payload);
//     push({ tone: "success", message: "เพิ่มอุปกรณ์ใหม่ในคลังแล้ว!" });
//     await fetchDevice(); // โหลดข้อมูลใหม่
//   }

//   // ลบอุปกรณ์ลูก
//   const handleDeleteDeviceChild = async (ids: number[]) => {
//     await DeviceService.deleteDeviceChild({ dec_id: ids });
//     push({ tone: "danger", message: "ลบอุปกรณ์สำเร็จ!" });
//     setDeviceChilds(prev => prev.filter(device => !ids.includes(device.dec_id)));
//     await fetchDevice(); // โหลดข้อมูลใหม่
//   };

//   // เปลี่ยนสถานะอุปกรณ์
//   const handleChangeStatus = (id: number, status: DeviceChild["dec_status"]) => {
//     setDeviceChilds(prev =>
//       prev.map(device =>
//         device.dec_id === id
//           ? { ...device, dec_status: status }
//           : device
//       )
//     );
//   };

//   // อัปโหลดไฟล์อุปกรณ์ลูก
//   const handleUploadFile = async (file?: File) => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       // เรียกใช้งาน service
//       await DeviceService.uploadFileDeviceChild(parentId, formData);
//       push({ tone: "success", message: "อัปโหลดไฟล์สำเร็จ!" });
//       await fetchDevice(); // โหลดข้อมูลใหม่
//     } catch (error) {
//       push({ tone: "danger", message: "อัปโหลดไฟล์ล้มเหลว" });
//     }
//   }

//   return (
//     <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
//       {/* แถบนำทาง */}
//       <div className="text-[18px] mb-[8px] space-x-[9px]">
//         <span className="text-[#858585]">การจัดการ</span>
//         <span className="text-[#858585]">&gt;</span>
//         <span className="text-[#858585]">คลังอุปกรณ์</span>
//         <span className="text-[#858585]">&gt;</span>
//         <span className="text-[#000000]">แก้ไขอุปกรณ์</span>
//       </div>
//       {/* ชื่อหน้า */}
//       <div className="flex items-center gap-[14px] mb-[21px]">
//         <h1 className="text-[36px] font-semibold">แก้ไขอุปกรณ์</h1>
//       </div>
//       <MainDeviceModal
//         mode="edit"
//         defaultValues={parentDevice}
//         onSubmit={() => console.log("Submit Device")}
//       />
//       <DevicesChilds
//         devicesChilds={deviceChilds}
//         onAdd={handleAddDeviceChild}
//         onUpload={handleUploadFile}
//         onDelete={handleDeleteDeviceChild}
//         onChangeStatus={handleChangeStatus}
//       />
//     </div>
//   )
// }

// export default Inventory
/**
 * Page: Inventory.
 * Features:
 *  - UI หน้าจัดการคลังอุปกรณ์หลัก
 *
 * Author: Worrawat Namwat (Wave) 66160372
 */
import "../styles/css/User.css";
import "../styles/css/icon.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button.js";
import SearchFilter from "../components/SearchFilter.js";
import Dropdown from "../components/DropDown.js";
import { Icon } from "@iconify/react";
import { useToast } from "../components/Toast.js";
import { AlertDialog } from "../components/AlertDialog.js";
import api from "../api/axios.js";
import getImageUrl from "../services/GetImage";




// type อุปกรณ์ย่อย
type DeviceChild = {
  dec_id: number;
  dec_serial_number: string;
  dec_status: "READY" | "BORROWED" | "REPAIRING" | "DAMAGED" | "LOST";
};
// type อุปกรณ์หลัก
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
  status_type: "READY" | "BORROWED" | "OUT_OF_STOCK";
  created_at: string | Date;
  device_childs: DeviceChild[];
  dept_id: number | null;
  ca_id: number | null;
  sec_id: number | null;
  af_id: number | null;
};

type DropdownOption = {
  id: number | string;
  label: string;
  value: string;
};
/**
 * Description:ฟังก์ชันช่วยดึงค่า Unique จาก Data เพื่อนำไปสร้าง Options สำหรับ Dropdown
 * Author: Worrawat Namwat (Wave) 66160372
 */
const extractOptions = (
  data: Equipment[],
  key: keyof Equipment
): DropdownOption[] => {
  const uniqueValues = Array.from(
    new Set(
      data.map((item) => String(item[key] || "")).filter((val) => val !== "")
    )
  );
  return [
    { id: "all", label: "ทั้งหมด", value: "" },
    ...uniqueValues.map((val, index) => ({
      id: index,
      label: val,
      value: val,
    })),
  ];
};

export const Inventory = () => {
  const location = useLocation();
  const isStaff = location.pathname.includes("/staff");

  //States: Data & UI
  const [items, setItems] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //States: Selection & Deletion
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  //States: Dropdown Options
  const [deptOptions, setDeptOptions] = useState<DropdownOption[]>([]);
  const [subSecOptions, setSubSecOptions] = useState<DropdownOption[]>([]);
  const [catOptions, setCatOptions] = useState<DropdownOption[]>([]);

  //States: Filters & Sorting
  const [deptFilter, setDeptFilter] = useState<DropdownOption | null>(null);
  const [subSecFilter, setSubSecFilter] = useState<DropdownOption | null>(null);
  const [catFilter, setCatFilter] = useState<DropdownOption | null>(null);
  const [searchFilter, setSearchFilters] = useState({ search: "" });

  const [sortField, setSortField] = useState<keyof Equipment | "status_text">(
    "last_edited"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  //States: Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // เปลี่ยนหน้า
  const navigate = useNavigate();

  //Handler: Modal Actions
  const handleOpenAddModal = () => navigate("/inventory/add");

  const handleOpenEditModal = (item: Equipment) => {
    navigate(`/inventory/edit/${item.id}`, {
      state: {
        device: item,
      },
    });

  };

  //Handlers: Delete Logic
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    setDeleteId(null); // null แปลว่าลบหลายรายการตาม selectedItems
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const idsToDelete = deleteId ? [deleteId] : selectedItems;
    try {
      await Promise.all(
        idsToDelete.map((id) => api.delete(`/inventory/${id}`))
      );
      toast.push({ message: "ลบอุปกรณ์เสร็จสิ้น!", tone: "danger" });  
      setSelectedItems([]);
      setDeleteId(null);
      setIsAlertOpen(false);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Delete error:", error);
      toast.push({ message: "เกิดข้อผิดพลาดในการลบ", tone: "danger" });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/inventory`);
        const rawData = response.data.data || response.data || [];

        const formattedData: Equipment[] = rawData.map((item: any) => {
          const statusType = item.status_type || "READY";

          let statusText = "พร้อมใช้งาน";
          if (statusType === "BORROWED") statusText = "มีคนยืม";
          else if (statusType === "OUT_OF_STOCK") statusText = "ของหมด";
          return {
            id: item.de_id,
            serial_number: item.de_serial_number || "-",
            name: item.de_name || "ไม่มีชื่อ",
            description: item.de_description || "",
            location: item.de_location || "-",
            image: getImageUrl(item.de_images?.replace(/\\/g, "/")),
            department: item.department_name || "-",
            category: item.category_name || "-",
            sub_section: item.sub_section_name || "-",

            dept_id: item.dept_id,
            ca_id: item.ca_id,
            sec_id: item.sec_id,
            af_id: item.af_id,

            quantity: item.quantity,

            max_borrow_days: item.de_max_borrow_days || 7,
            last_edited: item.updated_at || item.created_at,
            created_at: item.created_at,

            status_text: statusText,
            status_type: statusType,
            device_childs: item.device_childs || [],
          };
        });

        setItems(formattedData);
        setDeptOptions(extractOptions(formattedData, "department"));
        setCatOptions(extractOptions(formattedData, "category"));
        setSubSecOptions(extractOptions(formattedData, "sub_section"));
      } catch (error) {
        toast.push({ message: "เชื่อมต่อ Backend ไม่สำเร็จ", tone: "danger" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, [refreshTrigger, isStaff]);

  //แปลงวันที่เป็น format ไทย
  const FormatThaiDate = (iso: string | Date) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  };

  //จัดการ Sort
  const HandleSort = (field: keyof Equipment | "status_text") => {
    if (sortField === field)
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Logic การกรองและการเรียงลำดับข้อมูล
  const filtered = useMemo(() => {
    const search = searchFilter.search?.trim().toLowerCase() || "";
    let result = items.filter((item) => {
      const bySearch =
        !search ||
        [item.name, item.department, item.category, item.serial_number]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return (
        bySearch &&
        (!deptFilter?.value || item.department === deptFilter.value) &&
        (!subSecFilter?.value || item.sub_section === subSecFilter.value) &&
        (!catFilter?.value || item.category === catFilter.value)
      );
    });
    return result.sort((a, b) => {
      let valA: any = a[sortField as keyof Equipment];
      let valB: any = b[sortField as keyof Equipment];
      if (sortField === "last_edited" || sortField === "created_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === "string")
        return sortDirection === "asc"
          ? valA.localeCompare(valB, "th")
          : valB.localeCompare(valA, "th");
      return sortDirection === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
          ? 1
          : -1;
    });
  }, [
    items,
    searchFilter,
    deptFilter,
    subSecFilter,
    catFilter,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // Reset หน้าและ Selection เมื่อมีการเปลี่ยน Filter
  useEffect(() => {
    setPage(1);
    setSelectedItems([]);
  }, [searchFilter, deptFilter, subSecFilter, catFilter]);

  //Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // เลือกเฉพาะรายการที่สถานะไม่ใช่ BORROWED (ยืมอยู่)
      const validItems = filtered
        .filter((item) => item.status_type !== "BORROWED")
        .map((item) => item.id);
      setSelectedItems(validItems);
    } else {
      setSelectedItems([]);
    }
  };
  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((prevId) => prevId !== id) : [...prev, id]
    );
  };
  // จำนวนรายการที่สามารถเลือกได้
  const selectableItemsCount = filtered.filter(
    (item) => item.status_type !== "BORROWED"
  ).length;
  const isAllSelected =
    selectableItemsCount > 0 && selectedItems.length === selectableItemsCount;

  const gridCols = "1.8fr 1fr 1fr 1fr 0.7fr 1fr 1fr";

  return (
    <div className="w-full min-h-screen flex flex-col p-4">
      <div className="flex-1">
        {/* Breadcrumbs */}
        <div className="mb-[8px] space-x-[9px]">
          <span className="text-[#858585]">การจัดการ</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000]">คลังอุปกรณ์</span>
        </div>

        {/* Title */}
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
              />
              <Dropdown
                items={subSecOptions}
                value={subSecFilter}
                onChange={setSubSecFilter}
                placeholder="ฝ่ายย่อย"
              />
              <Dropdown
                items={catOptions}
                value={catFilter}
                onChange={setCatFilter}
                placeholder="หมวดหมู่"
              />

              <Button
                size="md"
                onClick={handleOpenAddModal}
                icon={
                  <Icon icon="ic:baseline-plus" width="20px" height="20px" />
                }
              >
                เพิ่มอุปกรณ์
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="w-auto">
          {/* 1. Header (แยกออกมา) */}
          <div
            className="grid bg-[#FFFFFF] border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] items-center"
            style={{ gridTemplateColumns: gridCols }}
          >
            {/* --- รวม Checkbox และ ชื่ออุปกรณ์ ไว้ใน div เดียวกัน --- */}
            <div className="flex items-center gap-[10px] pl-[35px] h-full">
              <input
                type="checkbox"
                className="custom-checkbox-inventory "
                checked={isAllSelected}
                onChange={handleSelectAll}
                disabled={isLoading}
              />
              <div className="flex items-center cursor-pointer truncate">
                ชื่ออุปกรณ์
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
                  onClick={() => HandleSort("name")}
                  className="cursor-pointer hover:text-blue-500 shrink-0"
                />
              </div>
            </div>

            <div className="py-2 px-4 text-left flex items-center">
              แผนก{" "}
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
                onClick={() => HandleSort("department")}
                className="cursor-pointer hover:text-blue-500"
              />
            </div>

            <div className="py-2 px-4 text-left flex items-center">
              หมวดหมู่{" "}
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
                onClick={() => HandleSort("category")}
                className="cursor-pointer hover:text-blue-500"
              />
            </div>

            <div className="py-2 px-4 text-left flex items-center">
              ฝ่ายย่อย{" "}
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
                onClick={() => HandleSort("sub_section")}
                className="cursor-pointer hover:text-blue-500"
              />
            </div>

            <div className="py-2 px-4 text-left flex items-center whitespace-nowrap">
              จำนวนคงเหลือ(ชิ้น)
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
                onClick={() => HandleSort("quantity")}
                className="cursor-pointer hover:text-blue-500"
              />
            </div>

            <div className="py-2 px-4 text-left flex items-center justify-center">
              แก้ไขล่าสุด{" "}
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
                onClick={() => HandleSort("last_edited")}
                className="cursor-pointer hover:text-blue-500"
              />
            </div>
            <div className="py-2 px-4 text-left flex items-center whitespace-nowrap ">
              การใช้งาน{" "}
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
                onClick={() => HandleSort("status_text")}
                className="cursor-pointer hover:text-blue-500"
              />
            </div>
          </div>

          {/* 2. Body (ตารางข้อมูล) */}
          <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-[16px] h-[620px] flex flex-col">
            <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Icon
                  icon="eos-icons:loading"
                  width="40"
                  className="animate-spin text-blue-500 mb-2"
                />
                กำลังโหลด...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Icon
                  icon="tabler:database-off"
                  width="48"
                  className="mb-2 opacity-50"
                />
                ไม่พบข้อมูลอุปกรณ์
              </div>
            ) : (
              pageRows.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center hover:bg-gray-50 text-[16px] min-h-[70px]"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* --- รวม Checkbox และ ชื่ออุปกรณ์ --- */}
                  <div className="flex items-center gap-[10px] pl-[35px] h-full overflow-hidden">
                    <input
                      type="checkbox"
                      className="custom-checkbox-inventory focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      disabled={item.status_type === "BORROWED"}
                    />
                    <div
                      className=" text-black truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                  </div>
                  <div
                    className="py-2 px-4 truncate text-black -ml-2"
                    title={item.department}
                  >
                    {item.department}
                  </div>
                  <div
                    className="py-2 px-4 truncate text-black -ml-3"
                    title={item.category}
                  >
                    {item.category}
                  </div>
                  <div
                    className="py-2 px-4 truncate text-black -ml-4"
                    title={item.sub_section}
                  >
                    {item.sub_section}
                  </div>
                  <div className="py-2 px-4 text-black font-medium -ml-4">
                    {item.quantity}
                  </div>
                  <div className="py-2 px-4 text-black flex items-center justify-center">
                    {FormatThaiDate(item.last_edited)}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-[25px] py-2 px-4">
                    {/* Status */}
                    {item.status_type === "BORROWED" ? (
                      <span className="flex items-center justify-center w-[120px] h-[35px] border border-[#73D13D] text-[#73D13D] rounded-full text-base">
                        มีการยืมอยู่
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-[120px] h-[35px] border border-[#868686] text-[#868686] rounded-full text-base">
                        ไม่มีการยืม
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-[#1890FF] hover:text-[#1890FF] cursor-pointer"
                        title="แก้ไข"
                      >
                        <Icon
                          icon="prime:pen-to-square"
                          width="30"
                          height="30"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
            <div className="flex flex-wrap items-center justify-between px-[35px] py-4 mt-auto ">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors h-[40px] shadow-sm bg-[#fc0400] hover:bg-[#D32F2F] text-white cursor-pointer disabled:cursor-not-allowed"
                >
                  <Icon
                    icon="solar:trash-bin-trash-bold"
                    width="18"
                    className="text-white"
                  />
                  ลบอุปกรณ์
                </button>

                <span className="text-[#ff0400] text-sm font-medium">
                  เลือกลบอุปกรณ์ ({selectedItems.length})
                </span>
              </div>
              {/* ด้านขวา: Pagination */}
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
                  className={`h-8 min-w-8 px-2 rounded border text-sm ${page === 1
                    ? "border-[#000000] text-[#000000]"
                    : "border-[#D9D9D9]"
                    }`}
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
                    className={`h-8 min-w-8 px-2 rounded border text-sm ${page === totalPages
                      ? "border-[#000000] text-[#000000]"
                      : "border-[#D9D9D9]"
                      }`}
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
                  className="flex items-center gap-1 ml-2"
                >
                  <span className="text-sm text-gray-600">ไปที่หน้า</span>
                  <input
                    name="goto"
                    type="number"
                    min={1}
                    max={totalPages}
                    className="h-8 w-14 rounded border border-[#D9D9D9] px-2 text-sm text-center"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isAlertOpen}
        title={
          <span style={{ whiteSpace: "nowrap" }}>
            คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์?
          </span>
        }
        description={
          isDeleting
            ? "กำลังลบข้อมูล..."
            : deleteId
              ? "การดำเนินการนี้ไม่สามารถกู้คืนได้"
              : `การดำเนินการนี้ไม่สามารถกู้คืนได้`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setIsAlertOpen(false)}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        tone="devicewarning"
        padX={30}
      />
    </div>
  );
};

export default Inventory