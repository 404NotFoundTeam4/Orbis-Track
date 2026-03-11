/**
 * Description: Modal แสดงรายการอุปกรณ์ย่อย (Device Childs) สำหรับ Ticket
 * - แสดงตาราง: ลำดับ, รหัสอุปกรณ์, Serial Number, สถานะ
 * - สถานะแสดงเป็น Badge แบบมีสี (ตั้งค่าเป็น กำลังซ่อม สำหรับงานแจ้งซ่อม)
 * Input : DeviceListModalProps { isOpen, onClose, devices }
 * Output : React Component (Modal)
 * Author: Worrawat Namwat (Wave) 66160372 (Refactored for Repair)
 */
import { Icon } from "@iconify/react";
import type { RepairTicketReportedDevice } from "../services/RepairService";

interface DeviceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: RepairTicketReportedDevice[];
}

// Status display configuration (matching Figma)
const statusConfig: Record<string, { label: string; className: string }> = {
  READY: {
    label: "พร้อมใช้งาน",
    className: "border-[#73D13D] text-[#73D13D]",
  },
  BORROWED: {
    label: "กำลังใช้งาน",
    className: "border-[#40A9FF] text-[#40A9FF]",
  },
  REPAIRING: {
    label: "กำลังซ่อม",
    className: "border-[#FDBA74] text-[#C2410C]",
  },
  DAMAGED: {
    label: "ชำรุด",
    className: "border-[#FCA5A5] text-[#B91C1C]",
  },
};

const DeviceListModalRepair = ({
  isOpen,
  onClose,
  devices,
}: DeviceListModalProps) => {
  if (!isOpen) return null;

  /**
   * Description: ตรวจสอบว่ามีอุปกรณ์ใดมี Serial Number หรือไม่ (สำหรับแสดง/ซ่อน column)
   * Input      : devices (RepairTicketReportedDevice[])
   * Output     : boolean
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const hasSerialNumber = devices.some(
    (device) => device.serial_number && device.serial_number.trim() !== "",
  );

  /**
   * Description: ดึง style (label, className) ตามสถานะอุปกรณ์
   * Input      : status (string) - สถานะ (READY, BORROWED, DAMAGED, etc.)
   * Output     : { label: string, className: string }
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const getStatusStyle = (status: string) => {
    return (
      statusConfig[status] || {
        label: status,
        className: "border-[#1890FF] text-[#1890FF]",
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal - Responsive sizing */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-[1025px] h-full max-h-[90vh] overflow-hidden flex flex-col sm:px-[43px] px-6 sm:py-[25px] py-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-2xl font-bold text-black">รายการอุปกรณ์</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width="20" height="20" className="text-gray-600" />
          </button>
        </div>

        {/* Table content area */}
        <div className="flex-1 overflow-auto mt-4">
          <div className="min-w-[600px]">
            {/* Table Header - Rounded */}
            <div className="bg-[#F5F5F5] rounded-full text-black sticky top-0 flex py-3 px-6 z-10">
              <div className="font-medium w-[80px] sm:w-[100px]">ลำดับ</div>
              {!hasSerialNumber && <div className="text-black flex-1"></div>}
              <div className={`font-medium flex-1`}>รหัสอุปกรณ์</div>
              {!hasSerialNumber && <div className="text-black flex-1"></div>}
              {hasSerialNumber && (
                <div className="font-medium flex-1">Serial Number</div>
              )}
              <div className="font-medium w-[100px] sm:w-[120px] text-left">
                สถานะ
              </div>
            </div>

            {/* Table Body */}
            <div className="mt-2">
              {devices.map((device, index) => {
                // อุปกรณ์ที่อยู่ใน List แจ้งซ่อม จะถูกกำหนดให้เป็นสถานะ "กำลังซ่อม" (REPAIRING) เสมอ
                const statusStyle = getStatusStyle("REPAIRING");
                
                return (
                  <div
                    key={device.asset_code || device.serial_number || index}
                    className="flex border-b border-gray-100 items-center py-4 px-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-black w-[80px] sm:w-[100px]">
                      {index + 1}
                    </div>
                    
                    {!hasSerialNumber && <div className="text-black flex-1"></div>}
                    
                    <div className={`text-black flex-1 truncate pr-4`}>
                      {device.asset_code || "-"}
                    </div>
                    
                    {!hasSerialNumber && <div className="text-black flex-1"></div>}
                    
                    {hasSerialNumber && (
                      <div className="text-black flex-1 truncate pr-4">
                        {device.serial_number || "-"}
                      </div>
                    )}
                    
                    <div className="w-[100px] sm:w-[120px] flex justify-start">
                      <span
                        className={`flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border rounded-full text-xs sm:text-sm whitespace-nowrap ${statusStyle.className}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {devices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบรายการรหัสอุปกรณ์ย่อย
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceListModalRepair;