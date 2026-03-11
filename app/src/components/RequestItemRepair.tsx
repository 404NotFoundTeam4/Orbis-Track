/**
 * Description: Component สำหรับแสดงรายการคำร้องแจ้งซ่อมแต่ละรายการ (List Item)
 * รองรับการกดขยาย (Expand) เพื่อดูรายละเอียดเพิ่มเติม และฟังก์ชันการกดรับงาน (Approve)
 * Input : RequestItemRepairProps (ข้อมูล ticket, ฟังก์ชัน onExpand, onApprove, ฯลฯ)
 * Output : React Component
 * Author: Worrawat Namwat (Wave) 66160372
 */

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";
import { useToast } from "./Toast";
import { AlertDialog } from "./AlertDialog";
import getImageUrl from "../services/GetImage";
import {
  type RepairTicketStatus,
  type RepairTicketItem,
  type RepairTicketDetail,
} from "../services/RequestRepairService";
import DeviceListModalRepair from "./DeviceListModalRepair";
import DeviceManageModalRepair, {
  type RepairDeviceUpdate,
} from "./DeviceManageModalRepair";

interface RequestItemRepairProps {
  ticket: RepairTicketItem;
  ticketDetail?: RepairTicketDetail | null;
  isLoadingDetail?: boolean;
  onExpand: (ticketId: number, isExpandUI: boolean) => void;
  onApprove?: (ticketId: number) => Promise<void>;
  onSave?: (ticketId: number, updates: RepairDeviceUpdate[]) => void;
  activeTabKey?: string;
  currentUserId?: number;
  currentUserName?: string;
  isForceExpand?: boolean;
  expandTrigger?: unknown;
}

const statusConfig: Record<
  RepairTicketStatus | string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "รออนุมัติ",
    className: "bg-white text-[#FBBF24] border border-[#FBBF24]",
  },
  IN_PROGRESS: {
    label: "กำลังซ่อม",
    className: "bg-white text-[#40A9FF] border border-[#40A9FF]",
  },
  COMPLETED: {
    label: "เสร็จสิ้น",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
};

/**
 * Description: ฟังก์ชันสำหรับแปลงวันที่จากรูปแบบ ISO เป็นรูปแบบวันที่ภาษาไทย
 * Input : string (วันที่ในรูปแบบ ISO เช่น "2024-06-01T08:30:00Z") หรือ null
 * Output : string (วันที่ในรูปแบบ "dd/mm/yyyy" หรือ "-" หากค่าเป็น null)
 * Author : Worrawat Namwat (Wave) 66160372
 */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Description: ฟังก์ชันสำหรับแปลงวันที่จากรูปแบบ ISO เป็นรูปแบบเวลาในภาษาไทย
 * Input : string (วันที่ในรูปแบบ ISO เช่น "2024-06-01T08:30:00Z") หรือ null
 * Output : string (เวลาที่ในรูปแบบ "HH:mm" หรือ "-" หากค่าเป็น null)
 * Author : Worrawat Namwat (Wave) 66160372
 */
const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RequestItemRepair({
  ticket,
  ticketDetail,
  isLoadingDetail,
  onExpand,
  onApprove,
  onSave,
  activeTabKey,
  isForceExpand,
  currentUserName,
}: RequestItemRepairProps) {
  const [isExpanded, setIsExpanded] = useState(isForceExpand || false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);
  const { push } = useToast();

  const [localApprover, setLocalApprover] = useState<string | null>(
    ticket.approver?.fullname || null,
  );
  const [localStatus, setLocalStatus] = useState<RepairTicketStatus | string>(
    ticket.status,
  );

  useEffect(() => {
    setLocalStatus(ticket.status);
    if (ticket.approver?.fullname) {
      setLocalApprover(ticket.approver.fullname);
    }
  }, [ticket.status, ticket.approver]);

  /**
   * Description: ฟังก์ชันสำหรับจัดการการคลิกเพื่อขยายหรือยุบรายละเอียดของคำร้อง
   * Input : - ticketId: number (รหัสคำร้องที่ถูกคลิก)
   *         - isExpandUI: boolean (สถานะใหม่ของการขยาย UI หลังจากคลิก)
   * Output : void (ฟังก์ชันนี้จะอัปเดตสถานะการขยายของ UI และเรียกใช้ฟังก์ชัน onExpand ที่ส่งมาจาก props เพื่อแจ้งให้พาเรนต์คอมโพเนนต์ทราบถึงการเปลี่ยนแปลง)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleExpandClick = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    onExpand(ticket.id, newExpandState);
  };

  /**
   * Description: ฟังก์ชันสำหรับจัดการการคลิกปุ่มอนุมัติคำร้อง โดยจะแสดง AlertDialog เพื่อยืนยันการรับคำร้องก่อนที่จะดำเนินการต่อ
   * Input : event: React.MouseEvent (เหตุการณ์การคลิกที่เกิดขึ้นเมื่อผู้ใช้คลิกปุ่มอนุมัติ)
   * Output : void (ฟังก์ชันนี้จะเปิด AlertDialog โดยตั้งค่า isAlertOpen เป็น true เพื่อแสดงกล่องยืนยันการรับคำร้อง)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const openApproveDialog = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsAlertOpen(true);
  };

  /**
   * Description: ฟังก์ชันสำหรับจัดการการยืนยันการรับคำร้องหลังจากที่ผู้ใช้คลิกปุ่มอนุมัติและยืนยันใน AlertDialog แล้ว โดยจะทำการเรียกใช้ฟังก์ชัน onApprove ที่ส่งมาจาก props เพื่อดำเนินการรับคำร้อง และอัปเดตสถานะและผู้รับงานใน UI ตามผลลัพธ์ที่ได้รับ
   * Input : event: React.MouseEvent (เหตุการณ์การคลิกที่เกิดขึ้นเมื่อผู้ใช้ยืนยันการรับคำร้องใน AlertDialog)
   * Output : void (ฟังก์ชันนี้จะปิด AlertDialog โดยตั้งค่า isAlertOpen เป็น false และถ้า onApprove มีอยู่ จะเรียกใช้ฟังก์ชันนั้นเพื่อรับคำร้อง และอัปเดตสถานะและผู้รับงานใน UI ตามผลลัพธ์ที่ได้รับจากการเรียกใช้ onApprove)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const submitApprovalRequest = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setIsAlertOpen(false);

    if (onApprove) {
      try {
        await onApprove(ticket.id);
        setLocalApprover(currentUserName || "ผู้รับเรื่อง");
        setLocalStatus("IN_PROGRESS");
        push({ message: "รับคำร้องสำเร็จ!", tone: "success", duration: 3000 });
      } catch (error) {
        console.error("เซฟลง Database ไม่สำเร็จ:", error);
        push({
          message: "เกิดข้อผิดพลาดในการรับงาน",
          tone: "danger",
          duration: 3000,
        });
      }
    }
  };

  /**
   * Description: ป้องกันไม่ให้ Event การคลิกทะลุไปทำให้ Accordion กาง/หุบ
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const preventAccordionToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  /**
   * Description: ฟังก์ชันสำหรับแปลงข้อมูลอุปกรณ์ที่ได้รับจาก API ให้เป็นรูปแบบที่เหมาะสมสำหรับการจัดการใน DeviceManageModalRepair โดยจะทำการแมปข้อมูลอุปกรณ์ที่แจ้งซ่อมมาเป็นอาร์เรย์ของอ็อบเจ็กต์ที่มี id, asset_code, serial_number และ current_status เพื่อใช้ในการแสดงผลและจัดการสถานะของอุปกรณ์ในโมดัลจัดการอุปกรณ์
   * Input : - ticket.device_info.reported_devices: array (อาร์เรย์ของอุปกรณ์ที่ถูกแจ้งซ่อมมาในข้อมูล ticket ซึ่งแต่ละอุปกรณ์จะมีข้อมูลเช่น id, asset_code, serial_number เป็นต้น)
   * Output : array (อาร์เรย์ของอ็อบเจ็กต์ที่มีรูปแบบ { id: number, asset_code: string, serial_number: string, current_status: string } ซึ่งถูกแมปมาจากข้อมูลอุปกรณ์ที่แจ้งซ่อมมาใน ticket)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const mappedDevicesForManage =
    ticket.device_info.reported_devices?.map((d) => ({
      id: d.id,
      asset_code: d.asset_code || "ไม่ระบุรหัสทรัพย์สิน",
      serial_number: d.serial_number || "ไม่ระบุ S/N",
      current_status: "REPAIRING",
    })) || [];

  const currentStatus = statusConfig[localStatus] || statusConfig["PENDING"];
  const startDate = ticket.dates.created;
  const rawImage = ticket.device_info.image;
  const deviceImage = rawImage?.startsWith("/")
    ? rawImage.substring(1)
    : rawImage;

  return (
    <div className="w-full bg-white overflow-hidden transition-all duration-300">
      <div
        className="w-full bg-white font-medium text-[#000000] rounded-[16px] mb-[16px] h-[61px] grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_1fr_240px_70px] items-center pl-2 "
        onClick={handleExpandClick}
      >
        <div className="flex flex-col pl-2 overflow-hidden pr-2 ">
          <span
            className="text-[#000000] font-medium truncate ml-1"
            title={ticket.device_info.name}
          >
            {ticket.device_info.name}
          </span>
          <span className="text-[#9E9E9E]  mt-0.5 ml-1">
            รหัส : {ticket.device_info.asset_code || "-"}
          </span>
        </div>

        <div className="text-[#000000] ml-1">
          {ticket.device_info.quantity} ชิ้น
        </div>

        <div
          className="text-[#000000] truncate "
          title={ticket.device_info.category || "-"}
        >
          {ticket.device_info.category || "-"}
        </div>

        <div className="flex flex-col overflow-hidden pr-2 -ml-1 ">
          <span
            className="text-[#000000] truncate"
            title={ticket.requester.fullname}
          >
            {ticket.requester.fullname}
          </span>
          <span
            className="text-[#9E9E9E]  truncate"
            title={ticket.requester.emp_code || "-"}
          >
            {ticket.requester.emp_code || "-"}
          </span>
        </div>

        <div className="flex flex-col -ml-2">
          <span className="text-[#000000] ">
            {formatDate(startDate ?? null)}
          </span>
          <span className="text-[#7BACFF] ">
            เวลา : {formatTime(startDate ?? null)}
          </span>
        </div>

        <div>
          <span
            className={`flex items-center justify-center -ml-3 w-[99px] h-[34px] border rounded-full  font-medium ${currentStatus.className}`}
          >
            {currentStatus.label}
          </span>
        </div>

        {/* ช่องจัดการ */}
        <div
          className="flex action-buttons-container"
          onClick={preventAccordionToggle}
        >
          {activeTabKey === "mine" ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsManageModalOpen(true);
              }}
              className="bg-[#40A9FF] border border-[#40A9FF] text-white w-[105px] h-[44px] rounded-full flex items-center justify-center hover:bg-[#1890FF] transition-colors -ml-3.5"
            >
              บันทึก
            </button>
          ) : localApprover ? (
            <div className="flex items-center  -ml-3">
              <span className="text-[#73D13D] mr-1">ผู้รับคำร้อง :</span>

              <span
                className="text-[#73D13D] truncate max-w-[120px]"
                title={localApprover}
              >
                {localApprover}
              </span>
            </div>
          ) : localStatus === "PENDING" ? (
            <button
              onClick={openApproveDialog}
              className="bg-[#73D13D] border border-[#73D13D] text-white w-[105px] h-[44px] rounded-full flex items-center justify-center hover:bg-[#52C41A] transition-colors -ml-4"
            >
              รับคำร้อง
            </button>
          ) : (
            <span className="bg-white border border-[#73D13D] text-[#73D13D] w-[105px] h-[44px] rounded-full flex items-center justify-center">
              -
            </span>
          )}
        </div>

        <div className="text-gray-400 flex justify-center">
          <FontAwesomeIcon
            size="lg"
            icon={faChevronDown}
            className={`text-[#000000] transition-transform duration-300 ${isExpanded ? "transform rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[800px] opacity-100 visible mb-4 " : "max-h-0 opacity-0 invisible border-t-0"}`}
      >
        {isLoadingDetail ? (
          <div className="p-8 flex items-center justify-center gap-2">
            <Icon icon="eos-icons:loading" className="text-2xl text-blue-500" />
            <span className="text-gray-500 font-medium">
              กำลังโหลดข้อมูล...
            </span>
          </div>
        ) : (
          <>
            <div className="font-bold text-black px-6 py-4">
              ข้อมูลการแจ้งซ่อมอุปกรณ์
            </div>
            <div className="mx-6 pb-8 pt-4 grid grid-cols-[300px_1fr] gap-x-10 gap-y-6 items-start">
              <div className="w-[300px] flex flex-col gap-2 shrink-0">
                <div className="w-full h-[120px] bg-[#F4F4F4] rounded-lg flex items-center justify-center overflow-hidden border border-[#D9D9D9]">
                  {deviceImage ? (
                    <img
                      src={getImageUrl(deviceImage)}
                      alt={ticket.device_info.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setIsPreviewImageOpen(true)}
                    />
                  ) : (
                    <Icon
                      icon="mdi:image-off-outline"
                      className="text-3xl text-gray-300"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewImageOpen(true)}
                  disabled={!deviceImage}
                  className={`w-full h-[36px] border border-[#D9D9D9] rounded-lg  transition-colors ${
                    deviceImage
                      ? "bg-[#EAEAEA] hover:bg-[#DCDCDC] text-gray-700 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {deviceImage ? "ดูรูปภาพ" : "ไม่มีรูปภาพ"}
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-4 w-full">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      ผู้ส่งคำร้อง
                    </span>
                    <span className="text-[#636363] ">
                      {ticket.requester.fullname} (
                      {ticket.requester.emp_code || "-"})
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      ชื่ออุปกรณ์
                    </span>
                    <span className="text-[#636363] text-sm">
                      {ticket.device_info.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      หมวดหมู่
                    </span>
                    <span className="text-[#636363] ">
                      {ticket.device_info.category || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      แผนก/ฝ่ายย่อย
                    </span>
                    <span className="text-[#636363] ">
                      {ticket.requester.department || "-"} /{" "}
                      {ticket.requester.section || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-start mt-1">
                    <span className="text-[#000000] font-medium  pt-1">
                      รหัสอุปกรณ์ที่แจ้งซ่อม
                    </span>
                    <div className="flex flex-wrap gap-1.5 w-fit">
                      {ticket.device_info.reported_devices &&
                      ticket.device_info.reported_devices.length > 0 ? (
                        <>
                          {ticket.device_info.reported_devices
                            .slice(0, 8)
                            .map((device, index) => (
                              <span
                                key={index}
                                className="bg-[#F0F0F0] border border-[#BFBFBF] px-2 py-1 rounded-full text-[#636363]  text-center min-w-[88px] truncate"
                                title={device.asset_code || "-"}
                              >
                                {device.asset_code || "-"}
                              </span>
                            ))}
                          {ticket.device_info.reported_devices.length > 8 && (
                            <button
                              onClick={() => setIsDeviceModalOpen(true)}
                              className="bg-[#FFFFFF] border border-[#BFBFBF] rounded-full flex justify-center items-center px-3 py-1 cursor-pointer hover:bg-gray-100 transition-colors"
                              title="ดูทั้งหมด"
                            >
                              <Icon
                                icon="ph:dots-three-bold"
                                width="18"
                                height="18"
                                color="#595959"
                              />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="bg-[#F0F0F0] border border-[#BFBFBF] px-2 py-1 rounded-full text-[#636363]  text-center min-w-[88px] truncate">
                          {ticket.device_info.asset_code || "-"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline mt-1">
                    <span className="text-[#000000] font-medium ">
                      จำนวน
                    </span>
                    <span className="text-[#636363] ">
                      {ticket.device_info.quantity} ชิ้น
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      สถานที่รับอุปกรณ์
                    </span>
                    <span className="text-[#636363] ">
                      {ticket.device_info.location || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      หัวข้อแจ้งซ่อม
                    </span>
                    <span className="text-[#636363] font-medium ">
                      {ticket.problem.title || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-x-4 items-baseline">
                    <span className="text-[#000000] font-medium ">
                      รายละเอียดแจ้งซ่อม
                    </span>
                    <span className="text-[#636363] font-medium ">
                      {ticket.problem.description || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-6 border-b border-[#D9D9D9]"></div>
          </>
        )}
      </div>

      {isDeviceModalOpen && (
        <DeviceListModalRepair
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          devices={ticketDetail?.devices || []}
        />
      )}

      {/* Modal เปลี่ยนสถานะอุปกรณ์ */}
      <DeviceManageModalRepair
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        devices={mappedDevicesForManage}
        onConfirm={(updates) => {
          if (onSave) {
            onSave(ticket.id, updates);
          }
          setIsManageModalOpen(false);
        }}
      />

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title="คุณแน่ใจหรือไม่ว่าต้องการรับคำร้อง?"
        description="การดำเนินการนี้ไม่สามารถกู้คืนได้"
        tone="warning"
        actionsMode="double"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={submitApprovalRequest}
        padX={30}
      />
      {/* Modal แสดงภาพขนาดเต็มเมื่อคลิกที่รูปภาพ */}
      {isPreviewImageOpen && deviceImage && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 transition-opacity"
          onClick={() => setIsPreviewImageOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex justify-center items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsPreviewImageOpen(false)}
            >
              <Icon icon="mdi:close-circle-outline" width="36" height="36" />
            </button>
            <img
              src={getImageUrl(deviceImage)}
              alt="Preview Fullscreen"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
