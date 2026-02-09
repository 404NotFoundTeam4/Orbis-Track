import { Icon } from "@iconify/react"
import Button from "./Button"
import QuantityInput from "./QuantityInput"
import Checkbox from "./Checkbox"
import DropDown from "./DropDown"
import { useEffect, useState } from "react"
import { AlertDialog } from "./AlertDialog"
import { useMemo } from "react"
import type { DeviceChild } from "../services/InventoryService"

// อุปกรณ์ลูกจริง
type RealDeviceRow = DeviceChild & {
    __draft?: false;
};

// อุปกรณ์ลูกแบบร่าง
type DraftDeviceRow = DraftDevice & {
    __draft: true;
    dec_id: number; // id ชั่วคราว
};

type DeviceRow = RealDeviceRow | DraftDeviceRow;

// โครงสร้างของอุปกรณ์ลูกแบบร่าง
export interface DraftDevice {
    draft_id: number;
    dec_serial_number: string | null;
    dec_asset_code: string;
    dec_status: DeviceChild["dec_status"];
}

// โครงสร้าง props ที่ต้องส่งมาเรียกใช้งาน
interface DevicesChildsProps {
    parentCode: string | undefined;
    devicesChilds: DeviceChild[]; // ข้อมูลอุปกรณ์ลูก
    onSaveDraft: (drafts: DraftDevice[]) => Promise<void>;
    onUpload?: (file: File | undefined) => void; // ฟังก์ชันเพิ่มอุปกรณ์ลูกแบบอัปโหลดไฟล์ (CSV / Excel)
    onDelete: (ids: number[]) => Promise<void>; // ฟังก์ชันลบอุปกรณ์ลูก
    onChangeStatus: (id: number, status: DeviceChild["dec_status"]) => void; // ฟังก์ชันเปลี่ยนสถานะอุปกรณ์ลูก
    lastAssetCode: string | null; // รหัส asset code ล่าสุด
}

const DevicesChilds = ({ parentCode, devicesChilds, onSaveDraft, onUpload, onDelete, onChangeStatus, lastAssetCode }: DevicesChildsProps) => {
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
    // เก็บรายการอุปกรณ์ลูกแบบ draft
    const [draftDevice, setDraftDevice] = useState<DraftDevice[]>([]);
    // เก็บรายการอุปกรณ์ลูก (draft) ที่ต้องการลบ
    const [selectedDraft, setSelectedDraft] = useState<number[]>([]);

    /**
    * Description: ฟังก์ชันสำหรับเลือกหรือยกเลิกการเลือกอุปกรณ์ลูก
    * Input     : device - ข้อมูลอุปกรณ์ลูก
    * Output    : อัปเดต state การเลือกอุปกรณ์
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const toggleSelect = (device: DeviceRow) => {
        // กรณีเป็นอุปกรณ์แบบ draft
        if (device.__draft) {
            setSelectedDraft(prev =>
                // ถ้าเคยถูกเลือกแล้วเอาออก
                prev.includes(device.draft_id)
                    ? prev.filter(id => id !== device.draft_id)
                    // ถ้ายังไม่ถูกเลือกเพิ่มเข้าไป
                    : [...prev, device.draft_id]
            );
        } else {
            setSelectedDevices(prev =>
                prev.includes(device.dec_id)
                    ? prev.filter(id => id !== device.dec_id)
                    : [...prev, device.dec_id]
            );
        }
    }

    /**
    * Description: ฟังก์ชันสำหรับเลือกหรือยกเลิกการเลือกอุปกรณ์ลูกทั้งหมด
    * Input     : -
    * Output    : อัปเดต state selectedDevices
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const toggleSelectAll = () => {
        if (selectedDevices.length === devicesChilds.length) {
            setSelectedDevices([]); // เอาออกทั้งหมด
        } else {
            setSelectedDevices(devicesChilds.map(device => device.dec_id)); // เลือกทั้งหมด
        }
    }

    /**
    * Description: ฟังก์ชันสำหรับบันทึกอุปกรณ์ลูกที่อยู่ในสถานะ draft
    * Input     : -
    * Output    :
    *             - ส่งข้อมูลไปให้ parent
    *             - ล้างข้อมูล draft ออกจาก state
    *             - รีเซ็ตจำนวนอุปกรณ์ที่กรอก
    *             - ปิด dialog การบันทึก
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const handleSaveDraft = async () => {
        if (draftDevice.length === 0) return; // ถ้าไม่มี draft ไม่ต้องทำอะไร

        await onSaveDraft(draftDevice);   // ส่ง draft ไปให้ parent
        setDraftDevice([]);         // ล้าง draft
        setQuantity(null);          // reset จำนวน
        setIsAddAletOpen(false);    // ปิด dialog
    }

    /**
    * Description: ฟังก์ชันสำหรับลบอุปกรณ์ลูกที่ถูกเลือก
    * Input     : -
    * Output    :
    *             - ลบอุปกรณ์ลูก
    *             - เรียกใช้งานฟังก์ชันลบอุปกรณ์จาก parent
    *             - รีเซ็ตสถานะการเลือกอุปกรณ์
    *             - ปิด dialog ยืนยันการลบ
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const handleDelete = async () => {
        // ตรวจสอบว่ามี draft ที่ถูกเลือกไว้หรือไม่
        if (selectedDraft.length > 0) {
            // ลบ draft ที่มี draft_id อยู่ในรายการที่ถูกเลือก
            setDraftDevice(prev =>
                prev.filter(d => !selectedDraft.includes(d.draft_id))
            );
            // // รีเซ็ตรายการ draft ที่ถูกเลือก
            setSelectedDraft([]);
        }

        // ตรวจสอบว่ามีอุปกรณ์จริงที่ถูกเลือกไว้หรือไม่
        if (selectedDevices.length > 0) {
            // เรียกใช้งานฟังก์ชันลบจาก parent
            await onDelete(selectedDevices);
            // รีเซ็ตรายการอุปกรณ์จริงที่ถูกเลือก
            setSelectedDevices([]);
        }

        // ปิด dialog ยืนยันการลบ
        setIsDeleteAlertOpen(false);
    }

    /**
    * Description: ฟังก์ชันสำหรับเปลี่ยนสถานะของอุปกรณ์ลูก
    * Input     : id, status - รหัสอุปกรณ์ลูก, สถานะใหม่
    * Output    : ให้ parent component อัปเดตสถานะอุปกรณ์ลูก
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const changeStatusDevice = (id: number, status: DeviceChild["dec_status"]) => {
        onChangeStatus(id, status);
    }

    /**
    * Description: ฟังก์ชันสำหรับอัปโหลดไฟล์อุปกรณ์ลูก
    * Input     : -
    * Output    : 
    *             - ส่งไฟล์อัปโหลดไปให้ parent
    *             - รีเซ็ตไฟล์ที่เลือก
    *             - ปิด dialog ยืนยันการอัปโหลด
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const handleUploadFile = async () => {
        if (!uploadFile) return;
        await onUpload?.(uploadFile); // เรียกใช้ฟังก์ชันเพิ่มอุปกรณ์ด้วยไฟล์ที่ส่งมา
        setUploadFile(null); // เคลียร์ไฟล์ที่เก็บไว้
        setIsUploadAlertOpen(false);
    };

    const [sortField, setSortField] = useState<"dec_serial_number" | "dec_status" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const filteredDevices = useMemo(() => {
        // แปลงรายการ draft ให้มีโครงสร้างเหมือนอุปกรณ์จริง
        const draftAsDevices: DeviceRow[] = draftDevice.map(d => ({
            ...d,
            dec_id: d.draft_id,
            __draft: true,
        }));

        // รวมอุปกรณ์จริงและอุปกรณ์ draft เข้าเป็น array เดียว
        let result = [...devicesChilds, ...draftAsDevices];

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
    }, [devicesChilds, draftDevice, sortField, sortDirection]);

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

    /**
    * Description: คำนวณเลข running number ที่มากที่สุดจาก asset code
    * Input     : -
    * Output    : ค่า running number ที่มากที่สุด
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const getMaxRunningNo = () => {
        // ดึง asset code ของอุปกรณ์ลูกทั้งหมด
        const numbers = devicesChilds
            .map(device => {
                const match = device.dec_asset_code?.match(/(\d+)$/); // ดึงตัวเลขที่อยู่ท้ายสุดของ asset code
                return match ? Number(match[1]) : null; // แปลงเป็น number
            })
            .filter((number): number is number => number !== null); // กรองเฉพาะค่าที่เป็น number จริง

        return numbers.length > 0 ? Math.max(...numbers) : 0; // คืนค่าเลขที่มากที่สุด
    };

    /**
    * Description: สร้าง asset code ของอุปกรณ์ลูก โดยอิงจาก asset code ของอุปกรณ์แม่
    * Input     : parentCode, runningNo - รหัสอุปกรณ์แม่, เลข running number
    * Output    : asset code ใหม่ในรูปแบบ ASSET-{prefix}-{runningNo}
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const makeAssetCode = (parentCode: string, runningNo: number) => {
        const parts = parentCode.split("-"); // แยกรหัสอุปกรณ์แม่ด้วยเครื่องหมาย "-"
        const last = parts[parts.length - 1]; // ดึงค่าตัวสุดท้ายของรหัสอุปกรณ์แม่

        // ถ้าตัวสุดท้ายไม่ใช่ตัวเลข
        if (!/^\d+$/.test(last)) {
            return `ASSET-${parentCode}`; // สร้าง asset code แบบไม่มี running number ต่อท้าย
        }

        const prefix = parts.slice(0, -1).join("-"); // ดึงส่วนหน้าของรหัสอุปกรณ์แม่ (ตัดตัวเลขท้ายออก)
        const next = String(runningNo).padStart(last.length, "0"); // แปลง running number เป็น string แล้วเติมเลข 0 ด้านหน้า

        return `ASSET-${prefix}-${next}`; // รวม prefix และ running number
    };

    /**
    * Description: ดึงค่า running number ที่อยู่ท้ายสุดของ asset code
    * Input     : assetCode - รหัส asset
    * Output    : ค่า running number
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const getRunningFromAssetCode = (assetCode: string | null) => {
        if (!assetCode) return 0;
        // ดึงตัวเลขที่อยู่ท้ายสุดของ asset code
        const match = assetCode.match(/(\d+)$/);
        // ถ้าพบตัวเลข แปลงเป็น number ถ้าไม่พบคืนค่า 0
        return match ? Number(match[1]) : 0;
    };

    /**
    * Description: สร้างรายการอุปกรณ์ลูกแบบ draft ตามจำนวนที่ระบุ
    * Input     : qty - จำนวนอุปกรณ์ลูกที่ต้องการเพิ่ม
    * Output    : อัปเดต draft device
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const generateDraftDevice = (qty: number) => {
        // ตรวจสอบว่ามี parentCode และ qty มากกว่า 0
        if (!parentCode || !qty || qty <= 0) return;
        // ดึง running number ล่าสุดจาก asset code ตัวสุดท้าย
        const maxRunning = getRunningFromAssetCode(lastAssetCode);
        // ดึง running number ที่มากที่สุดจากอุปกรณ์ลูกใน state ปัจจุบัน
        const localRunning = getMaxRunningNo();
        // เลือกค่า running number ที่มากที่สุด เพื่อป้องกัน asset code ซ้ำ
        const start = Math.max(maxRunning, localRunning) + 1;
        // สร้าง draft อุปกรณ์ลูกตามจำนวนที่ระบุ
        const draft: DraftDevice[] = Array.from({ length: qty }).map((_, index) => {
            // คำนวณ running number ของแต่ละอุปกรณ์
            const runningNo = start + index;
            // คืนค่า object draft อุปกรณ์ลูก
            return {
                draft_id: Date.now() + index,
                dec_serial_number: "",
                dec_asset_code: makeAssetCode(parentCode, runningNo),
                dec_status: "READY",
            };
        });

        setDraftDevice(draft);
    };

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
                            if (quantity === null) {
                                return;
                            } else {
                                generateDraftDevice(quantity);
                            }
                        }}>
                        + เพิ่ม
                    </Button>
                </div>
                {/* อัปโหลดไฟล์ */}
                <div className="flex items-center min-w-[144px] h-[66px] px-[10px] py-[10px]">
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
                    {
                        draftDevice.length > 0 && (
                            <div className="flex justify-end px-[10px] py-[10px]">
                                <Button
                                    className="!bg-[#1890FF]"
                                    onClick={() => setIsAddAletOpen(true)}
                                >
                                    บันทึก
                                </Button>
                            </div>
                        )
                    }
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
                                    isChecked={
                                        "__draft" in device
                                            ? selectedDraft.includes(device.draft_id)
                                            : selectedDevices.includes(device.dec_id)
                                    }
                                    onClick={() => toggleSelect(device)}
                                />
                                <p>{(page - 1) * pageSize + (index + 1)}</p>
                            </div>
                            <p className="w-[230px]">{device.dec_asset_code}</p>
                            <div className="flex w-[230px]">
                                <input
                                    type="text"
                                    value={device.dec_serial_number ?? ""}
                                    onChange={(event) => {
                                        if ("__draft" in device) {
                                            setDraftDevice(prev =>
                                                prev.map(d =>
                                                    d.draft_id === device.dec_id
                                                        ? { ...d, dec_serial_number: event.target.value }
                                                        : d
                                                )
                                            );
                                        }
                                    }}
                                    className="w-[330px] h-[46px] rounded-[16px] border border-[#D8D8D8] pl-[20px]"
                                />
                            </div>
                            <div className="flex w-[200px]">
                                <DropDown
                                    className="!w-[137px]"
                                    items={statusItems}
                                    value={statusItems.find(s => s.value === device.dec_status)}
                                    onChange={(status) => {
                                        if ("__draft" in device) {
                                            setDraftDevice(prev =>
                                                prev.map(d =>
                                                    d.draft_id === device.dec_id
                                                        ? { ...d, dec_status: status.value as DeviceChild["dec_status"] }
                                                        : d
                                                )
                                            );
                                        } else {
                                            changeStatusDevice(device.dec_id, status.value as DeviceChild["dec_status"]);
                                        }
                                    }}
                                    triggerClassName="!border-[#a2a2a2]"
                                    searchable={false}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Footer */}
            <div className={`flex items-center mt-4 ${selectedDevices.length > 0 || selectedDraft.length > 0 ? "justify-between" : "justify-end"}`}>
                {/* ปุ่มลบ (เลือกอุปกรณ์อย่างน้อย 1 ตัวถึงจะแสดง) */}
                {
                    (selectedDevices.length > 0 || selectedDraft.length > 0) && (
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
                            <p className="text-[#F5222D]">เลือกลบอุปกรณ์ ({selectedDevices.length + selectedDraft.length})</p>
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
                        onConfirm={handleSaveDraft}
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