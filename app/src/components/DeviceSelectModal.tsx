/**
 * Description: Modal เลือกอุปกรณ์ที่จะเพิ่ม (แสดงเฉพาะสถานะ "ว่าง")
 * - ช่องค้นหา
 * - รายการอุปกรณ์พร้อม badge "พร้อมยืม"
 * - ปุ่ม "ยกเลิก" และ "ยืนยันการเลือก"
 * Input : DeviceSelectModalProps
 * Output : React Component (Modal)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useState } from "react";
import { Icon } from "@iconify/react";
import type { TicketDevice } from "../services/TicketsService";
import Button from "./Button";
import SearchFilter from "./SearchFilter";

interface DeviceSelectModalProps {
  availableDeviceChilds: TicketDevice[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDevices: TicketDevice[]) => void;
}

const DeviceSelectModal = ({
  isOpen,
  onClose,
  onConfirm,
  availableDeviceChilds,
}: DeviceSelectModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<TicketDevice[]>([]);

  if (!isOpen) return null;

  const checkLastIndex = (currIndex: number, lengthDeviceChild: number) => {
    return currIndex === lengthDeviceChild;
  };

  const searchAvailableDeviceChilds = availableDeviceChilds.filter(
    (availableDevice) =>
      availableDevice.asset_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      availableDevice.serial?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const availableDevicesLength = searchAvailableDeviceChilds.length - 1;

  const toggleSelectDevice = (device: TicketDevice) => {
    setSelectedDevices((prev) => {
      const exists = prev.some(
        (selectedDevice) => selectedDevice.child_id === device.child_id,
      );
      if (exists) {
        return prev.filter(
          (selectedDevice) => selectedDevice.child_id !== device.child_id,
        );
      }
      return [...prev, device];
    });
  };

  const isSelected = (deviceChildId: number) =>
    selectedDevices.some((device) => device.child_id === deviceChildId);

  const handleConfirm = () => {
    onConfirm(selectedDevices);
    setSelectedDevices([]);
    setSearchTerm("");
  };

  const handleClose = () => {
    setSelectedDevices([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

      {/* Modal */}
      <div
        className="relative bg-white rounded-[16px] shadow-xl w-[95%] max-w-[700px] flex flex-col py-6 px-10"
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-black">
            เลือกอุปกรณ์
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full border border-black flex items-center justify-center hover:bg-gray-100 cursor-pointer"
          >
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-5">
          <SearchFilter
            onChange={({ search }) => setSearchTerm(search)}
            className={"rounded-xl w-full"}
            debounceMs={300}
          />
        </div>

        {/* Note */}
        <p className="text-sm text-black mb-3">
          * ระบบแสดงเฉพาะอุปกรณ์ที่สถานะ <b>"ว่าง"</b> เท่านั้น
        </p>

        {/* Device List */}
        <div
          className="border border-[#D9D9D9] rounded-xl overflow-y-auto"
          style={{ maxHeight: "270px" }}
        >
          {searchAvailableDeviceChilds.length === 0 ? (
            <div className="py-8 text-center text-gray-400"> ไม่พบอุปกรณ์</div>
          ) : (
            searchAvailableDeviceChilds.map((device, index) => (
              <div
                key={`${device.child_id}-${index}`}
                onClick={() => toggleSelectDevice(device)}
                className={`flex items-center py-4 px-4 md:px-6 ${!checkLastIndex(index, availableDevicesLength) ? "border-b border-[#D9D9D9]" : "rounded-xl"} cursor-pointer transition-colors ${
                  isSelected(device.child_id)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="w-[50px] text-black">{index + 1}</div>
                <div className="flex-1">
                  <div className="text-black font-medium">
                    {device.asset_code}
                  </div>
                  <div className="text-sm text-black">
                    Serial no. {device.serial || "-"}
                  </div>
                </div>
                <div>
                  <span className="px-4 py-2 bg-[#00AA1A]/10 text-[#00AA1A] rounded-md text-sm">
                    พร้อมยืม
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 mt-5">
          <Button
            variant="secondary"
            onClick={handleClose}
            className={"rounded-2xl"}
            style={{ width: 112, height: 46 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className={"rounded-2xl"}
            disabled={selectedDevices.length === 0}
            style={{ minWidth: 151, height: 46 }}
          >
            ยืนยันการเลือก
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelectModal;
