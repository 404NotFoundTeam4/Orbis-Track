/**
 * Description: Modal สำหรับคืนอุปกรณ์ - แสดงรายการอุปกรณ์ย่อยและให้เลือกสถานะแต่ละชิ้น
 * - ตาราง: ลำดับ | รหัสอุปกรณ์ | สถานะ (Dropdown)
 * - ต้องเลือกสถานะทุกชิ้นก่อนยืนยัน
 * - อุปกรณ์ที่เป็น DAMAGED/LOST จะมีค่าเริ่มต้นเป็นสถานะเดิม แต่ยังเปลี่ยนได้
 * Input : DeviceReturnModalProps { isOpen, onClose, devices, onConfirm }
 * Output : React Component
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { TicketDevice } from "../services/TicketsService";
import DropDown from "./DropDown";
import Button from "./Button";
import { AlertDialog } from "./AlertDialog";

export interface DeviceReturnStatus {
    id: number;
    status: string;
}

interface DeviceReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    devices: TicketDevice[];
    onConfirm: (devicesWithStatus: DeviceReturnStatus[]) => void;
}

// Status options for return dropdown
const returnStatusItems = [
    { id: "READY", label: "พร้อมใช้งาน", value: "READY", textColor: "#73D13D" },
    { id: "DAMAGED", label: "ชำรุด", value: "DAMAGED", textColor: "#FF4D4F" },
    { id: "LOST", label: "สูญหาย", value: "LOST", textColor: "#FF7A45" },
];

const DeviceReturnModal = ({
    isOpen,
    onClose,
    devices,
    onConfirm,
}: DeviceReturnModalProps) => {
    // State เก็บสถานะที่เลือกของแต่ละอุปกรณ์
    const [deviceStatuses, setDeviceStatuses] = useState<Record<number, string>>(
        {},
    );
    // State สำหรับ AlertDialog
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    /**
     * Description: Reset state เมื่อเปิด modal
     * - อุปกรณ์ปกติ (BORROWED) จะเริ่มต้นเป็นค่าว่าง
     * - อุปกรณ์ที่เป็น DAMAGED/LOST จะเริ่มต้นเป็นสถานะเดิม
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    useEffect(() => {
        if (isOpen) {
            const initialStatuses: Record<number, string> = {};
            devices.forEach((device) => {
                if (device.current_status === "BORROWED") {
                    initialStatuses[device.child_id] = "READY";
                } else {
                    initialStatuses[device.child_id] = device.current_status;
                }
            });
            setDeviceStatuses(initialStatuses);
        }
    }, [isOpen, devices]);

    if (!isOpen) return null;

    /**
     * Description: อัปเดตสถานะเมื่อเลือกจาก dropdown
     * Input      : childId, newStatus
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const handleStatusChange = (childId: number, newStatus: string) => {
        setDeviceStatuses((prev) => ({
            ...prev,
            [childId]: newStatus,
        }));
    };

    /**
     * Description: ตรวจสอบว่าเลือกสถานะครบทุกชิ้นหรือยัง
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const isAllStatusSelected = () => {
        return devices.every((device) => deviceStatuses[device.child_id] !== "");
    };

    /**
     * Description: เปิด AlertDialog เพื่อยืนยัน
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const handleConfirmClick = () => {
        if (!isAllStatusSelected()) return;
        setIsAlertOpen(true);
    };

    /**
     * Description: จัดการเมื่อกดยืนยันใน AlertDialog
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const handleConfirm = () => {
        const devicesWithStatus: DeviceReturnStatus[] = devices.map((device) => ({
            id: device.child_id,
            status: deviceStatuses[device.child_id],
        }));

        onConfirm(devicesWithStatus);
        setIsAlertOpen(false);
    };

    /**
     * Description: ตรวจสอบว่ามีอุปกรณ์ใดมี Serial Number หรือไม่ (สำหรับแสดง/ซ่อน column)
     * Input      : devices (TicketDevice[])
     * Output     : boolean
     * Author     : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const hasSerialNumber = devices.some(
        (device) => device.serial && device.serial.trim() !== "",
    );

    /**
     * Description: หา dropdown item จากสถานะ
     * Input      : status (string)
     * Output     : DropdownItem | null
     * Author     : Pakkapon Chomchoey (Tonnam) 66160080
     */
    const getSelectedItem = (status: string) => {
        return returnStatusItems.find((item) => item.value === status) || null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-[1025px] h-full max-h-[90vh] overflow-hidden flex flex-col sm:px-[43px] px-6 sm:py-[25px] py-6 m-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4">
                    <h2 className="text-2xl font-bold text-black">รับคืนอุปกรณ์</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full border border-black flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <Icon icon="mdi:close" width="20" height="20" />
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto mt-4">
                    <div className="min-w-[600px]">
                        {/* Table Header */}
                        <div className="bg-[#F5F5F5] rounded-full text-black sticky top-0 flex py-3 px-6 z-10">
                            <div className="font-medium w-[80px] sm:w-[100px]">ลำดับ</div>
                            {!hasSerialNumber && <div className="text-black flex-1"></div>}
                            <div className={`font-medium flex-1`}>รหัสอุปกรณ์</div>
                            {!hasSerialNumber && <div className="text-black flex-1"></div>}
                            {hasSerialNumber && (
                                <div className="font-medium flex-1">Serial Number</div>
                            )}
                            <div className="font-medium w-[130px] sm:w-[150px] text-left">
                                สถานะ
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="mt-2">
                            {devices.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    ไม่มีอุปกรณ์ที่ต้องคืน
                                </div>
                            ) : (
                                devices.map((device, index) => (
                                    <div
                                        key={device.child_id}
                                        className="flex border-b border-gray-100 items-center py-4 px-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="text-black w-[80px] sm:w-[100px]">
                                            {index + 1}
                                        </div>
                                        {!hasSerialNumber && (
                                            <div className="text-black flex-1"></div>
                                        )}
                                        <div className={`text-black flex-1`}>
                                            {device.asset_code}
                                        </div>
                                        {!hasSerialNumber && (
                                            <div className="text-black flex-1"></div>
                                        )}
                                        {hasSerialNumber && (
                                            <div className="text-black flex-1">
                                                {device.serial || "-"}
                                            </div>
                                        )}
                                        <div className="w-[130px] sm:w-[150px] flex justify-start">
                                            <DropDown
                                                items={returnStatusItems}
                                                value={getSelectedItem(deviceStatuses[device.child_id])}
                                                onChange={(item) =>
                                                    handleStatusChange(device.child_id, item.value)
                                                }
                                                placeholder="สถานะ"
                                                searchable={false}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 mt-4">
                    <Button
                        variant="primary"
                        onClick={handleConfirmClick}
                        disabled={!isAllStatusSelected()}
                    >
                        ยืนยัน
                    </Button>
                </div>
            </div>

            {/* AlertDialog */}
            <AlertDialog
                open={isAlertOpen}
                onOpenChange={setIsAlertOpen}
                title="ยืนยันการรับคืนอุปกรณ์?"
                description={`การดำเนินการนี้ไม่สามารถกู้คืนได้`}
                tone="warning"
                onConfirm={handleConfirm}
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
            />
        </div>
    );
};

export default DeviceReturnModal;
