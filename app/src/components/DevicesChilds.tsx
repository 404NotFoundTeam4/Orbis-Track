import { Icon } from "@iconify/react"
import Button from "./Button"
import QuantityInput from "./QuantityInput"
import Checkbox from "./Checkbox"
import DropDown from "./DropDown"
import { useEffect, useState } from "react"
import { AlertDialog } from "./AlertDialog"
import { useMemo } from "react"
import type { DeviceChild, UpdateDevices } from "../services/InventoryService"
import UploadFileDeviceChild from "./UploadFileDeviceChild"

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

// โครงสร้าง status ที่ใช้ใน Dropdown
export type StatusItem = {
  id: number;
  value: DeviceChild["dec_status"];
  label: string;
  textColor: string;
};

// โครงสร้าง props ที่ต้องส่งมาเรียกใช้งาน
interface DevicesChildsProps {
    devicesChilds: DeviceChild[]; // ข้อมูลอุปกรณ์ลูก
    onUpload?: (file: File | undefined) => void; // ฟังก์ชันเพิ่มอุปกรณ์ลูกแบบอัปโหลดไฟล์ (CSV / Excel)
    onDelete: (ids: number[]) => Promise<void>; // ฟังก์ชันลบอุปกรณ์ลูก
    onSaveAll: (drafts: DraftDevice[], updates: UpdateDevices[]) => Promise<void>;
    lastAssetCode: string | null; // รหัส asset code ล่าสุด
    statusItems: StatusItem[]; // status ทั้งหมดของอุปกรณ์ลูก
}

const DevicesChilds = ({ devicesChilds, onUpload, onDelete, onSaveAll, lastAssetCode, statusItems }: DevicesChildsProps) => {
    // กดปุ่มบันทึก
    const [isSaveAlertOpen, setIsSaveAlertOpen] = useState<boolean>(false);
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
    // เก็บรายการอุปกรณ์ที่มีการแก้ไข
    const [updateDevices, setUpdateDevices] = useState<UpdateDevices[]>([]);
    // เก็บข้อความ error ของ serial number
    const [serialErrors, setSerialErrors] = useState<Record<number, string>>({});

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
    * Description: ฟังก์ชันจัดการเปลี่ยนสถานะของอุปกรณ์ลูก
    * Input     : payload (id, status) - รหัสอุปกรณ์ลูก, สถานะใหม่
    * Output    : อัปเดตรายการอุปกรณ์ที่มีการแก้ไข (status)
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const changeStatusDevice = (payload: UpdateDevices) => {
        // หาอุปกรณ์ลูกตัวเดิม
        const original = devicesChilds.find(device => device.dec_id === payload.id);

        setUpdateDevices(prev => {
            // ถ้าเป็นค่าเดิม (ก่อนเปลี่ยน) ลบออกจาก list
            if (original && original.dec_status === payload.status) {
                return prev.filter(item => item.id !== payload.id);
            }
            // เช็คว่ามีรายการนี้อยู่ใน update list แล้วหรือยัง
            const exists = prev.find(item => item.id === payload.id);
            // ถ้ามีอยู่แล้ว แก้ไขค่า status ในรายการนั้น
            if (exists) {
                return prev.map(item =>
                    item.id === payload.id
                        ? { ...item, status: payload.status }
                        : item
                );
            }
            // ถ้ายังไม่เคยถูกแก้ไข เพิ่มเข้า update list
            return [...prev, payload];
        });
    };

    /**
    * Description: ดึงค่าสถานะปัจจุบันสำหรับแสดงผล
    * Input     : device - ข้อมูลอุปกรณ์
    * Output    : status ที่แสดงในหน้าจอ
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const getCurrentStatus = (device: DeviceRow) => {
        // ถ้าเป็น draft ให้ใช้ status จาก draft
        if ("__draft" in device) {
            return device.dec_status;
        }
        // ถ้ามีการเปลี่ยนใน updateDevices ให้ใช้ค่านั้น
        const updated = updateDevices.find(item => item.id === device.dec_id);
        // ถ้ามีค่าใน updateDevices ใช้ค่าที่ถูกแก้ไข ถ้าไม่มี ใช้ค่าจากข้อมูลเดิม
        return updated?.status ?? device.dec_status;
    };

    /**
    * Description: ฟังก์ชันสำหรับจัดการเปลี่ยน Serial Number ของอุปกรณ์
    * Input     : id, serial - รหัสอุปกรณ์ลูก, serial number ใหม่
    * Output    : อัปเดตรายการอุปกรณ์ที่มีการแก้ไข (serial number)
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const changeSerialNumber = (id: number, serial: string) => {
        // หา Serial เดิม
        const original = devicesChilds.find(device => device.dec_id === id);

        setUpdateDevices(prev => {
            // ถ้าเป็น serial ค่าเดิม ลบออกจาก update list
            if (original?.dec_serial_number === serial) {
                return prev.filter(item => item.id !== id);
            }
            // เช็คว่ามีรายการนี้อยู่ใน update list แล้วหรือยัง
            const exists = prev.find(item => item.id === id);
            // ถ้ามีอยู่แล้ว แก้ไขค่า serial number ในรายการนั้น
            if (exists) {
                return prev.map(item =>
                    item.id === id
                        ? { ...item, serialNumber: serial }
                        : item
                );
            }
            // ถ้ายังไม่เคยถูกแก้ไข เพิ่มเข้า update list
            return [...prev, { id, serialNumber: serial }];
        });
    };

    /**
    * Description: ดึงค่า Serial Number ปัจจุบันกสำหรับแสดงผล
    * Input     : device - ข้อมูลอุปกรณ์
    * Output    : serial number ที่แสดงในหน้าจอ
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const getCurrentSerial = (device: DeviceRow) => {
        if ("__draft" in device) {
            return device.dec_serial_number;
        }

        const updated = updateDevices.find(item => item.id === device.dec_id);

        return updated?.serialNumber ?? device.dec_serial_number;
    };

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
    * Description: ใช้สำหรับแยก asset code
    * Input     : assetCode (string): asset code ล่าสุด
    * Output    : { prefix: string, numberLength: number }
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const splitAssetCode = (assetCode: string) => {
        // แยกข้อความด้านหน้าและตัวเลขท้ายสุด
        const match = assetCode.match(/^(.*?)(\d+)$/);
        // ถ้าไม่มีตัวเลขท้ายเลย
        if (!match) {
            return { prefix: assetCode, numberLength: 3 };
        }

        return {
            prefix: match[1], // ส่วนข้อความด้านหน้า
            numberLength: match[2].length // ความยาวของตัวเลขท้ายสุด
        };
    };

    /**
    * Description: สร้าง asset code ตัวถัดไป
    * Input     : lastAssetCode (string): asset ล่าสุด, nextRunning (number): running number ใหม่
    * Output    : asset code ใหม่
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const makeNextAssetFromLast = (lastAssetCode: string, nextRunning: number) => {
        const { prefix, numberLength } = splitAssetCode(lastAssetCode);

        const nextNumber = String(nextRunning).padStart(numberLength, "0");

        return `${prefix}${nextNumber}`;
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
        // ไม่มี asset ล่าสุด หรือ qty
        if (!lastAssetCode || qty <= 0) return;

        // หา running ล่าสุดจาก backend
        const backendRunning = getRunningFromAssetCode(lastAssetCode);

        // หา running ล่าสุดจาก draft ที่ยังไม่ save
        const draftRunning = draftDevice.length > 0
            ? Math.max(
                ...draftDevice.map(draft => getRunningFromAssetCode(draft.dec_asset_code))
            )
            : 0;

        // เลือกค่าที่มากที่สุด เพื่อป้องกัน asset ซ้ำ
        const baseRunning = Math.max(backendRunning, draftRunning);

        // สร้าง draft ตามจำนวนที่ระบุ
        const draft: DraftDevice[] = Array.from({ length: qty }).map((_, index) => {
            const nextRunning = baseRunning + index + 1;
            return {
                draft_id: Date.now() + index,
                dec_serial_number: "",
                dec_asset_code: makeNextAssetFromLast(lastAssetCode, nextRunning),
                dec_status: "UNAVAILABLE",
            };
        });

        setDraftDevice(prev => [...prev, ...draft]);
    };

    const hasSerialNumber = devicesChilds.length > 0 ? devicesChilds[0].dec_has_serial_number : false;
    // ควบคุมการเปิดปิด Modal Upload File
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

    /**
    * Description: ฟังก์ชันบันทึกการเปลี่ยนแปลงอุปกรณ์ทั้งหมด
    * Input     : -
    * Output    : เรียกใช้งานฟังก์ชันบันทึกการเปลี่ยนแปลง และ reset state
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const handleSaveAll = async () => {
        await onSaveAll(draftDevice, updateDevices); // เรียกฟังก์ชันจาก parent
        // reset state
        setDraftDevice([]);
        setUpdateDevices([]);
        setQuantity(null);
    }

    /**
    * Description: ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
    * Input     : -
    * Output    : true - ข้อมูลถูกต้อง, false - ข้อมูลไม่ถูกต้อง
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const validateSave = () => {
        // ตัดช่องว่างด้านหน้าและหลัง
        const normalize = (value?: string | null) => value?.trim();
        // เก็บ error
        const newErrors: Record<number, string> = {};
        // เช็ค serial number เดิมทั้งหมดในระบบ
        const existingSet = new Set(
            devicesChilds
                .map(device => normalize(device.dec_serial_number)) // ดึง serial แล้วตัดช่องว่าง
                .filter(Boolean)
        );
        // ตรวจ draft ซ้ำกันเอง
        const draftSet = new Set<string>();

        // ตรวจ draft
        draftDevice.forEach(draft => {
            const serial = normalize(draft.dec_serial_number);
            if (!serial) return;
            // เช็ค draft ซ้ำกันเอง
            if (draftSet.has(serial)) {
                newErrors[draft.draft_id] = "Serial ซ้ำกัน";
            }
            // เช็ค draft ซ้ำกับข้อมูลเดิมในระบบ
            if (existingSet.has(serial)) {
                newErrors[draft.draft_id] = "Serial ซ้ำกับข้อมูลเดิม";
            }

            draftSet.add(serial); // ถ้าไม่ซ้ำ เพิ่มเข้า Set
        });

        // ตรวจ update
        updateDevices.forEach(update => {
            const serial = normalize(update.serialNumber); // ดึง serial แล้วตัดช่องว่าง
            if (!serial) return;
            // ค่าเดิม
            const original = devicesChilds.find(device => device.dec_id === update.id);
            // เช็ค update ซ้ำกับข้อมูลเดิมในระบบ (ยกเว้นตัวเอง)
            if (existingSet.has(serial) && original?.dec_serial_number !== serial) {
                newErrors[update.id] = "Serial ซ้ำกับข้อมูลเดิม";
            }
        });

        setSerialErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    return (
        <div className="flex flex-col gap-[20px] bg-[#FFFFFF] border border-[#BFBFBF] rounded-[16px] w-[1660px] min-h-[984px] px-[30px] py-[60px] pt-[30px] pb-[30px]">
            {/* จำนวน / เพิ่ม / อัปโหลดไฟล์ */}
            <div className="flex justify-between">
                <div className="flex items-center gap-[16px] w-[590px] h-[66px]">
                    <div className="flex justify-center items-center bg-[#40A9FF]/10 rounded-[100px] min-w-[179px] h-[46px] px-[3px] py-[5px]">
                        <p className="text-[18px] text-[#40A9FF] font-medium">จำนวนอุปกรณ์ {devicesChilds.length}</p>
                    </div>
                </div>
                {/* อัปโหลดไฟล์ */}
                <div className="flex items-center gap-[10px] min-w-[144px] h-[66px] px-[10px] py-[10px]">
                    <Button
                        variant="outline"
                        className="relative flex gap-[5px] !border-[#40A9FF] !text-[#40A9FF] min-w-[124px] overflow-hidden cursor-pointer"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <Icon
                            icon="ic:baseline-upload"
                            width="20"
                            height="20"
                        />
                        อัปโหลดไฟล์
                    </Button>
                    <QuantityInput
                        label=""
                        value={quantity}
                        width={70}
                        onChange={(val) => setQuantity(val)}
                        rounded="rounded-[16px]"
                    />
                    <Button
                        className="!bg-[#40A9FF] hover:!bg-[#1890FF] !min-w-[150px]"
                        onClick={() => {
                            if (quantity === null) {
                                return
                            } else {
                                generateDraftDevice(quantity);
                            }
                        }}
                        disabled={!quantity}>
                        + เพิ่มอุปกรณ์ย่อย
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
                    <div className="flex items-center w-[230px] h-full">
                        <div
                            className="flex items-center cursor-pointer"
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
                {pageRows.map((device, index) => {
                    // id กลางสำหรับทั้ง draft และอุปกรณ์จริง
                    const rowId = "__draft" in device ? device.draft_id : device.dec_id;
                    return (
                        <div key={rowId} className="w-full">
                            {/* หัวข้อ */}
                            <div className="flex gap-[270px] items-start min-h-[62px] py-2">
                                <div className="flex items-center gap-[10px] w-[147px] min-h-[46px]">
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
                                <div className="flex items-center w-[230px] min-h-[46px]">
                                    <p>{device.dec_asset_code}</p>
                                </div>
                                <div className="flex flex-col w-[230px]">
                                    <input
                                        type="text"
                                        value={hasSerialNumber ? (getCurrentSerial(device) ?? "") : "-"}
                                        onChange={(event) => {
                                            if ("__draft" in device) {
                                                setDraftDevice(prev =>
                                                    prev.map(draft =>
                                                        draft.draft_id === device.draft_id
                                                            ? { ...draft, dec_serial_number: event.target.value }
                                                            : draft
                                                    )
                                                );
                                            } else {
                                                changeSerialNumber(device.dec_id, event.target.value);
                                            }
                                        }}
                                        className={`w-full h-[46px] rounded-[16px] border pl-[20px]
                                            ${serialErrors[rowId]
                                                ? "border-red-500"
                                                : "border-[#D8D8D8]"
                                            }`}
                                        disabled={!hasSerialNumber}
                                    />
                                    {
                                        serialErrors[rowId] && (
                                            <span className="text-red-500 text-sm mt-1">
                                                {serialErrors[rowId]}
                                            </span>
                                        )
                                    }
                                </div>
                                <div className="flex items-center w-[200px] min-h-[46px]">
                                    <DropDown
                                        className="!w-[160px]"
                                        items={statusItems}
                                        value={statusItems.find(
                                            status => status.value === getCurrentStatus(device)
                                        )}
                                        onChange={(status) => {
                                            if ("__draft" in device) {
                                                setDraftDevice(prev =>
                                                    prev.map(draft =>
                                                        draft.draft_id === device.draft_id
                                                            ? { ...draft, dec_status: status.value as DeviceChild["dec_status"] }
                                                            : draft
                                                    )
                                                );
                                            } else {
                                                changeStatusDevice({
                                                    id: device.dec_id,
                                                    status: status.value as DeviceChild["dec_status"]
                                                });
                                            }
                                        }}
                                        triggerClassName="!border-[#a2a2a2]"
                                        searchable={false}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end mt-4">
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

            <hr className="text-[#D8D8D8]" />

            {/* ปุ่มลบ (เลือกอุปกรณ์อย่างน้อย 1 ตัวถึงจะแสดง) / บันทึก */}
            <div className="flex justify-between">
                {/* ฝั่งซ้าย */}
                <div className="flex items-center gap-[14px]">
                    {(selectedDevices.length > 0 || selectedDraft.length > 0) && (
                        <>
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

                            <p className="text-[#F5222D]">
                                เลือกลบอุปกรณ์ ({selectedDevices.length + selectedDraft.length})
                            </p>
                        </>
                    )}
                </div>
                {/* ฝั่งขวา */}
                <div className="flex flex-col items-end gap-[15px]">
                    {(draftDevice.length > 0 || updateDevices.length > 0) && (
                        <>
                            <div className="flex items-center gap-[5px] text-[#E4C600]">
                                <Icon
                                    icon="mingcute:warning-line"
                                    height={24}
                                    width={24}
                                />
                                <p>มีการเปลี่ยนแปลงอุปกรณ์ย่อยที่ยังไม่ได้บันทึก</p>
                            </div>
                            <Button
                                className="!bg-[#40A9FF] hover:!bg-[#1890FF] w-[150px]"
                                onClick={() => {
                                    if (!validateSave()) return;
                                    setIsSaveAlertOpen(true);
                                }}
                            >
                                บันทึก
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Add Device Child Alert */}
            {
                isSaveAlertOpen && (
                    <AlertDialog
                        open={isSaveAlertOpen}
                        onOpenChange={(o) => !o && setIsSaveAlertOpen(false)}
                        icon={
                            <Icon
                                className="text-[#52C41A]"
                                icon="material-symbols-light:box-edit-outline-sharp"
                                width="72"
                                height="72"
                            />
                        }
                        tone="success"
                        title="ยืนยันการบันทึกการเปลี่ยนแปลง?"
                        description="ข้อมูลอุปกรณ์ย่อยที่แก้ไขและเพิ่มใหม่จะถูกบันทึก"
                        onConfirm={handleSaveAll}
                        width={615}
                    />
                )
            }
            {/* Add Device Child  By File Alert */}
            {/* Modal Upload File */}
            {
                isUploadModalOpen && (
                    <UploadFileDeviceChild
                        key={isUploadModalOpen ? "open" : "closed"}
                        onClose={() => setIsUploadModalOpen(false)}
                        onConfirm={(file) => {
                            setUploadFile(file)
                            setIsUploadModalOpen(false)
                            setIsUploadAlertOpen(true)
                        }}
                    />
                )
            }
            {/* Alert */}
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