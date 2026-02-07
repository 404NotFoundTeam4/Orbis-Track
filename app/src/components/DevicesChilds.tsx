import { Icon } from "@iconify/react"
import Button from "./Button"
import QuantityInput from "./QuantityInput"
import Checkbox from "./Checkbox"
import DropDown from "./DropDown"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { AlertDialog } from "./AlertDialog"
import { useMemo } from "react"
import type { DeviceChild } from "../services/InventoryService"

// โครงสร้าง props ที่ต้องส่งมาเรียกใช้งาน
interface DevicesChildsProps {
    devicesChilds: DeviceChild[]; // ข้อมูลอุปกรณ์ลูก
    onAdd: ( quantity: number) => Promise<void>; // ฟังก์ชันเพิ่มอุปกรณ์ลูก
    onUpload?: (file: File | undefined) => void; // ฟังก์ชันเพิ่มอุปกรณ์ลูกแบบอัปโหลดไฟล์ (CSV / Excel)
    onDelete: (ids: number[]) => Promise<void>; // ฟังก์ชันลบอุปกรณ์ลูก
    onChangeStatus: (id: number, status: DeviceChild["dec_status"]) => void; // ฟังก์ชันเปลี่ยนสถานะอุปกรณ์ลูก
}

const DevicesChilds = ({ devicesChilds, onAdd, onUpload, onDelete, onChangeStatus }: DevicesChildsProps) => {
    // สถานะของอุปกรณ์ลูก
    const statusItems = [
        { id: 1, label: "พร้อมใช้งาน", value: "READY", textColor: "#73D13D" },
        { id: 2, label: "ถูกยืม", value: "BORROWED", textColor: "#40A9FF" },
        { id: 3, label: "ชำรุด", value: "DAMAGED", textColor: "#FF4D4F" },
        { id: 4, label: "กำลังซ่อม", value: "REPAIRING", textColor: "#FF7A45" },
        { id: 5, label: "สูญหาย", value: "LOST", textColor: "#000000" },
    ];

    // กดปุ่มเพิ่มอุปกรณ์ลูก
    const [isAddAletOpen, setIsAddAletOpen] = useState<boolean>(false);
    // กดปุ่มลบอุปกรณ์ลูก
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
    // จำนวนอุปกรณ์ลูกที่ต้องการเพิ่ม
    const [quantity, setQuantity] = useState<number | null>(null);
    // เก็บไฟล์อุปกรณ์ที่อัปโหลดเข้ามา
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    // กดเลือกไฟล์อุปกรณ์ที่จะเพิ่ม
    const [isUploadAlertOpen, setIsUploadAlertOpen] = useState(false);
    // เก็บรายการอุปกรณ์ลูกที่ต้องการลบ
    const [selectedDevices, setSelectedDevices] = useState<number[]>([]);

    // ดึง id อุปกรณ์แม่จาก URL
    const { id } = useParams();

    // เลือกรายการทีละตัว
    const toggleSelect = (id: number) => {
        setSelectedDevices((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id) // ถ้าติ๊กซ้ำ เอาออก
                : [...prev, id] // ถ้ายังกดไม่เลือก เพิ่มเข้า
        );
    }

    // เลือกรายการทั้งหมด
    const toggleSelectAll = () => {
        if (selectedDevices.length === devicesChilds.length) {
            setSelectedDevices([]); // เอาออกทั้งหมด
        } else {
            setSelectedDevices(devicesChilds.map(device => device.dec_id)); // เลือกทั้งหมด
        }
    }

    // เพิ่มอุปกรณ์ลูก
    const handleAdd = async () => {
        // if (quantity === null || Number(quantity) <= 0 || isNaN(Number(id))) return;
        if (quantity === null || Number(quantity) <= 0) return;
        console.log(quantity)
        await onAdd( Number(quantity)); // เรียกใช้งานฟังก์ชันเพิ่มอุปกรณ์ที่ส่งมา
        setQuantity(null); // รีเซ็ตจำนวน
        setIsAddAletOpen(false);
    }

    // ลบอุปกรณ์ลูก
    const handleDelete = async () => {
        await onDelete(selectedDevices); // เรียกใช้ฟังก์ชันลบที่ส่งมา
        setSelectedDevices([]); // เคลียร์ list
        setIsDeleteAlertOpen(false);
    }

    // เปลี่ยนสถานะอุปกรณ์ลูก
    const changeStatusDevice = (id: number, status: DeviceChild["dec_status"]) => {
        onChangeStatus(id, status);
    }

    // อัปโหลดไฟล์อุปกรณ์ที่จะเพิ่ม
    const handleUploadFile = async () => {
        if (!uploadFile) return;
        await onUpload?.(uploadFile); // เรียกใช้ฟังก์ชันเพิ่มอุปกรณ์ด้วยไฟล์ที่ส่งมา
        setUploadFile(null); // เคลียร์ไฟล์ที่เก็บไว้
        setIsUploadAlertOpen(false);
    };

    const [sortField, setSortField] = useState<"dec_serial_number" | "dec_status" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const filteredDevices = useMemo(() => {
        let result = [...devicesChilds];

        // SORT
        if (sortField) {
            result.sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];

                if (typeof valA === "string" && typeof valB === "string") {
                    return sortDirection === "asc"
                        ? valA.localeCompare(valB, "th")
                        : valB.localeCompare(valA, "th");
                }
                return 0;
            });
        }

        return result;
    }, [devicesChilds, sortField, sortDirection]);

    useEffect(() => {
        setPage(1);
    }, [sortField, sortDirection]); // เปลี่ยนกรอง/เรียง → กลับหน้า 1

    const handleSort = (field: "dec_serial_number" | "dec_status") => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    //จัดการแบ่งแต่ละหน้า
    const [page, setPage] = useState(1);
    const pageSize = 10; // จำนวนรายการต่อหน้า

    const totalPages = Math.max(1, Math.ceil(filteredDevices.length / pageSize));

    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredDevices.slice(start, start + pageSize);
    }, [filteredDevices, page, pageSize]);

    return (
        <div className="flex flex-col gap-[20px] bg-[#FFFFFF] border border-[#BFBFBF] rounded-[16px] w-[1660px] h-[984px] px-[30px] py-[60px] pt-[30px] pb-[60px]">
            {/* จำนวน / เพิ่ม / อัปโหลดไฟล์ */}
            <div className="flex justify-between">
                <div className="flex items-center gap-[16px] w-[590px] h-[66px]">
                    <div className="flex justify-center items-center bg-[#D9D9D9] rounded-[100px] min-w-[144px] h-[33px] px-[3px] py-[5px]">
                        <p className="text-[18px] font-medium">จำนวนอุปกรณ์ {devicesChilds.length}</p>
                    </div>
                    <QuantityInput
                        label=""
                        value={quantity}
                        width={260}
                        onChange={(val) => setQuantity(val)}
                    />
                    <Button
                        className="!bg-[#1890FF] !w-[69px]"
                        onClick={() => {
                            if (quantity === null || Number(quantity) <= 0) {
                                return;
                            } else {
                                setIsAddAletOpen(true);
                            }
                        }}>
                        + เพิ่ม
                    </Button>
                </div>
                {/* อัปโหลดไฟล์ */}
                <div className="w-[144px] h-[66px] px-[10px] py-[10px]">
                    <Button className="relative flex gap-[5px] !bg-[#1890FF] min-w-[124px] overflow-hidden cursor-pointer">
                        <Icon
                            icon="ic:baseline-upload"
                            width="20"
                            height="20"
                        />
                        อัปโหลดไฟล์
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadFile(file);
                                setIsUploadAlertOpen(true);
                            }}
                        />
                    </Button>
                </div>
            </div>
            {/* หัวข้ออุปกรณ์ลูก */}
            <div className="flex flex-col gap-[5px] w-full h-[742px]">
                <div className="flex gap-[270px] items-center h-[62px] border-y border-[#D8D8D8]">
                    <div className="flex items-center gap-[10px] w-[147px] h-full">
                        <Checkbox
                            className="bg-[#FFFFFF] border border-[#BFBFBF]"
                            isChecked={
                                devicesChilds.length > 0 &&
                                selectedDevices.length === devicesChilds.length
                            }
                            onClick={toggleSelectAll}
                        />
                        <p>ลำดับ</p>
                    </div>
                    <p className="flex items-center w-[230px] h-full">Asset Code</p>
                    <div
                        className="flex items-center w-[230px] h-full cursor-pointer"
                        onClick={() => handleSort("dec_serial_number")}
                    >
                        <p>Serial Number</p>
                        <Icon
                            icon={
                                sortField === "dec_serial_number"
                                    ? sortDirection === "asc"
                                        ? "bx:sort-down"
                                        : "bx:sort-up"
                                    : "bx:sort-down" //default icon
                            }
                            width="24"
                            height="24"
                            className="ml-1"
                        />
                    </div>
                    <div
                        className="flex items-center w-[200px] h-full cursor-pointer"
                        onClick={() => handleSort("dec_status")}
                    >
                        <p>สถานะ</p>
                        <Icon
                            icon={
                                sortField === "dec_status"
                                    ? sortDirection === "asc"
                                        ? "bx:sort-down"
                                        : "bx:sort-up"
                                    : "bx:sort-down" //default icon
                            }
                            width="24"
                            height="24"
                            className="ml-1"
                        />
                    </div>
                </div>
                {/* รายการอุปกรณ์ */}
                {pageRows.map((device, index) => (
                    <div key={device.dec_id} className="w-full">
                        {/* หัวข้อ */}
                        <div className="flex gap-[270px] items-center h-[62px]">
                            <div className="flex gap-[10px] w-[147px]">
                                <Checkbox
                                    className="bg-[#FFFFFF] border border-[#BFBFBF]"
                                    isChecked={selectedDevices.includes(device.dec_id)}
                                    onClick={() => toggleSelect(device.dec_id)}
                                />
                                <p>{(page - 1) * pageSize + (index + 1)}</p>
                            </div>
                            <p className="w-[230px]">{device.dec_asset_code}</p>
                            <div className="flex w-[230px]">
                                <p className="flex items-center w-[330px] h-[46px] rounded-[16px] border border-[#D8D8D8] pl-[20px]">
                                    {device.dec_serial_number}
                                </p>
                            </div>
                            <div className="flex w-[200px]">
                                <DropDown
                                    className="!w-[137px]"
                                    items={statusItems}
                                    value={statusItems.find(s => s.value === device.dec_status)}
                                    onChange={(status) => changeStatusDevice(device.dec_id, status.value as DeviceChild["dec_status"])}
                                    triggerClassName="!border-[#a2a2a2]"
                                    searchable={false}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Footer */}
            <div className={`flex items-center mt-4 ${selectedDevices.length > 0 ? "justify-between" : "justify-end"
                }`}>
                {/* ปุ่มลบ (เลือกอุปกรณ์อย่างน้อย 1 ตัวถึงจะแสดง) */}
                {
                    selectedDevices.length > 0 && (
                        <div className="flex items-center gap-[14px]">
                            <Button
                                className="flex items-center gap-[5px] bg-[#F5222D] w-[150px] hover:bg-red-600"
                                onClick={() => setIsDeleteAlertOpen(true)}
                            >
                                <Icon
                                    icon="solar:trash-bin-trash-outline"
                                    width="22"
                                    height="22"
                                />
                                ลบอุปกรณ์
                            </Button>
                            <p className="text-[#F5222D]">เลือกลบอุปกรณ์ ({selectedDevices.length})</p>
                        </div>
                    )
                }
                {/* ปุ่มหน้า */}
                {/* ขวา: ตัวแบ่งหน้า */}
                <div className="flex items-center gap-2 h-[46px]">
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
            {/* Add Device Child Alert */}
            {
                isAddAletOpen && (
                    <AlertDialog
                        open={isAddAletOpen}
                        onOpenChange={(o) => !o && setIsAddAletOpen(false)}
                        icon={
                            <Icon
                                className="text-[#52C41A]"
                                icon="material-symbols-light:box-add-outline-sharp"
                                width="72"
                                height="72"
                            />
                        }
                        tone="success"
                        title="ต้องการเพิ่มอุปกรณ์นี้ลงในคลัง?"
                        description="อุปกรณ์นี้จะถูกเพิ่มลงในรายการคลังของคุณ"
                        onConfirm={handleAdd}
                    />
                )
            }
            {/* Add Device Child  By File Alert */}
            {
                isUploadAlertOpen && (
                    <AlertDialog
                        open={isUploadAlertOpen}
                        onOpenChange={(o) => !o && setIsUploadAlertOpen(false)}
                        icon={
                            <Icon
                                className="text-[#52C41A]"
                                icon="material-symbols-light:box-add-outline-sharp"
                                width="72"
                                height="72"
                            />
                        }
                        tone="success"
                        title="ต้องการเพิ่มอุปกรณ์นี้ลงในคลัง?"
                        description="อุปกรณ์นี้จะถูกเพิ่มลงในรายการคลังของคุณ"
                        onConfirm={handleUploadFile}
                    />
                )
            }
            {/* Delete Device Child Alert */}
            {
                isDeleteAlertOpen && (
                    <AlertDialog
                        className="!w-[675px]"
                        open={isDeleteAlertOpen}
                        onOpenChange={(o) => !o && setIsDeleteAlertOpen(false)}
                        tone="warning"
                        title="คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์?"
                        description="การดำเนินการนี้ไม่สามารถกู้คืนได้"
                        actions={
                            <div className="flex gap-6">
                                {/* ปุ่มยกเลิก */}
                                <Button
                                    className="bg-[#D9D9D9] text-black hover:bg-gray-200"
                                    onClick={() => setIsDeleteAlertOpen(false)}
                                >
                                    ยกเลิก
                                </Button>
                                {/* ปุ่มยืนยัน */}
                                <Button
                                    className="bg-[#F5222D] text-white hover:bg-red-600"
                                    onClick={() => handleDelete()}
                                >
                                    ยืนยัน
                                </Button>
                            </div>
                        }
                    />
                )
            }
        </div>
    )
}

export default DevicesChilds