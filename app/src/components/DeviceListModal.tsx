/**
 * Description: Modal แสดงรายการอุปกรณ์ย่อย (Device Childs) สำหรับ Ticket
 * - แสดงตาราง: ลำดับ, รหัสอุปกรณ์, Serial Number, สถานะ
 * - สถานะแสดงเป็น Badge แบบมีสี (READY, IN_USE, REPAIRING, etc.)
 * Input : DeviceListModalProps { isOpen, onClose, devices, onConfirm }
 * Output : React Component (Modal)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { Icon } from "@iconify/react";
import type { TicketDevice } from "../services/TicketsService";

interface DeviceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: TicketDevice[];
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
  LOST: {
    label: "สูญหาย",
    className: "border-[#9CA3AF] text-[#111827]",
  },
};

const DeviceListModal = ({
  isOpen,
  onClose,
  devices,
}: DeviceListModalProps) => {
  if (!isOpen) return null;

  // Check if any device has serial number
  const hasSerialNumber = devices.some(
    (d) => d.serial && d.serial.trim() !== "",
  );

  // const hasSerialNumber = null;

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
            className="w-8 h-8 rounded-full border border-black flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width="20" height="20" />
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
                const statusStyle = getStatusStyle(device.current_status);
                return (
                  <div
                    key={device.child_id || index}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceListModal;
