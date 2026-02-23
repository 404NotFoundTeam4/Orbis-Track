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
  RepairTicketStatus,
  type RepairTicketItem,
  type RepairTicketDetail,
} from "../services/RepairService";
import DeviceListModalRepair from "./DeviceListModalRepair";

interface RequestItemRepairProps {
  ticket: RepairTicketItem;
  ticketDetail?: RepairTicketDetail | null;
  isLoadingDetail?: boolean;
  onExpand: (ticketId: number, isExpandUI: boolean) => void;
  onApprove?: (ticketId: number) => Promise<void>;
  currentUserId?: number;
  currentUserName?: string;
  isForceExpand?: boolean;
  expandTrigger?: unknown;
}

// Config สำหรับตั้งค่าสีและข้อความของแต่ละ Status
const statusConfig: Record<string, { label: string; className: string }> = {
  [RepairTicketStatus.PENDING]: {
    label: "รอดำเนินการ",
    className: "bg-white text-[#FBBF24] border border-[#FBBF24]",
  },
  [RepairTicketStatus.IN_PROGRESS]: {
    label: "กำลังดำเนินการ",
    className: "bg-white text-[#40A9FF] border border-[#40A9FF]",
  },
  [RepairTicketStatus.COMPLETED]: {
    label: "เสร็จสิ้น",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
};

/**
 * Description: ฟังก์ชันสำหรับจัดรูปแบบวันที่ให้อ่านง่าย (DD/MM/YYYY)
 * Input : dateStr (ข้อมูลวันที่รูปแบบ String หรือ null)
 * Output : วันที่ที่จัดรูปแบบแล้ว หรือ "-" ถ้าไม่มีข้อมูล
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
 * Description: ฟังก์ชันสำหรับจัดรูปแบบเวลา (HH:MM)
 * Input : dateStr (ข้อมูลเวลาในรูปแบบ String หรือ null)
 * Output : เวลาที่จัดรูปแบบแล้ว หรือ "-" ถ้าไม่มีข้อมูล
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
  forceExpand,
  currentUserId,
  currentUserName,
}: RequestItemRepairProps) {
  const [isExpanded, setIsExpanded] = useState(forceExpand || false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { push } = useToast();

  const [localApprover, setLocalApprover] = useState<string | null>(
    ticket.approver?.fullname || null
  );
  const [localStatus, setLocalStatus] = useState<string>(ticket.status as string);

  useEffect(() => {
    setLocalStatus(ticket.status as string);
    // ถ้าไม่ส่งมา (เป็น null) จะไม่เอา null ไปทับชื่อที่เพิ่งเซ็ตไว้ตอนกดรับงาน
    if (ticket.approver?.fullname) {
      setLocalApprover(ticket.approver.fullname);
    }
  }, [ticket.status, ticket.approver]);
  
  
  /**
 * Description: ฟังก์ชันสำหรับจัดการการกดขยาย (Expand) โดยจะสลับสถานะ isExpanded และเรียก onExpand เพื่อแจ้งพ่อแม่ให้โหลดข้อมูลรายละเอียดถ้ายังไม่มี
 * Input : - ticketId (ID ของ ticket ที่จะขยาย)
 *         - isExpandUI (สถานะใหม่ของการขยาย ว่าขยายหรือไม่)
 * Output : เปลี่ยนสถานะภายในและแจ้งพ่อแม่ผ่าน onExpand
 * Author : Worrawat Namwat (Wave) 66160372
 */
  const handleExpandClick = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    onExpand(ticket.id, newExpandState);
  };

/**
 * Description: ฟังก์ชันสำหรับจัดการการกดปุ่มอนุมัติ โดยจะเปิด AlertDialog เพื่อยืนยันการรับงาน และถ้าผู้ใช้ยืนยัน จะเรียก onApprove เพื่ออัปเดตสถานะในระบบ และอัปเดตสถานะภายในของ component พร้อมแสดง Toast แจ้งผลลัพธ์
 * Input : - e (เหตุการณ์การคลิกปุ่มอนุมัติ)
 * Output : เปิด AlertDialog และถ้าผู้ใช้ยืนยัน จะอัปเดตสถานะและแสดง Toast
 * Author : Worrawat Namwat (Wave) 66160372
 */
  const handleApproveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAlertOpen(true); 
  };

  /**
 * Description: ฟังก์ชันสำหรับจัดการการยืนยันรับงานจาก AlertDialog โดยจะเรียก onApprove เพื่ออัปเดตสถานะในระบบ และอัปเดตสถานะภายในของ component พร้อมแสดง Toast แจ้งผลลัพธ์
 * Input : - e (เหตุการณ์การคลิกปุ่มยืนยันใน AlertDialog)
 * Output : ปิด AlertDialog และถ้าการอัปเดตสถานะสำเร็จ จะอัปเดตสถานะภายในและแสดง Toast แจ้งความสำเร็จ ถ้าล้มเหลว จะจับข้อผิดพลาดและแสดง Toast แจ้งความล้มเหลว
 * Author : Worrawat Namwat (Wave) 66160372
 */
  const handleConfirmApprove = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // ป้องกันไม่ให้ปุ่มมันเผลอรีเฟรชหน้าเว็บ
      e.stopPropagation();
    }
    
    setIsAlertOpen(false);

    if (onApprove) {
      try {
        await onApprove(ticket.id);

        setLocalApprover(currentUserName || "ผู้รับเรื่อง"); 
        setLocalStatus(RepairTicketStatus.IN_PROGRESS);

        push({
          message: "รับคำร้องสำเร็จ",
          tone: "success",
          duration: 3000,
        });

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

  const currentStatus = statusConfig[localStatus] || {
    label: localStatus,
    className: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  const startDate = ticket.dates.created;
  const deviceImage = ticket.device_info.image;

  return (
    <div className="w-full bg-white overflow-hidden transition-all duration-300">
      <div
        className="w-full bg-white font-medium text-[#000000] h-[61px] grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_0.7fr_1fr_70px] items-center"
        onClick={handleExpandClick}
      >
        {/* Device Name & Asset Code */}
        <div className="flex flex-col pl-2 overflow-hidden pr-2">
          <span className="text-[#000000] font-medium truncate" title={ticket.device_info.name}>
            {ticket.device_info.name}
          </span>
          <span className="text-[#9E9E9E] text-xs mt-0.5">
            รหัส : {ticket.device_info.asset_code || "-"}
          </span>
        </div>

        {/* Quantity */}
        <div className="text-[#000000] ml-2">{ticket.device_info.quantity} ชิ้น</div>

        {/* Category */}
        <div className="text-[#000000] truncate ml-2" title={ticket.device_info.category || "-"}>
          {ticket.device_info.category || "-"}
        </div>

        {/* Requester & Emp Code */}
        <div className="flex flex-col overflow-hidden pr-2 ml-2">
          <span className="text-[#000000] truncate" title={ticket.requester.fullname}>
            {ticket.requester.fullname}
          </span>
          <span className="text-[#9E9E9E] text-xs truncate" title={ticket.requester.emp_code || "-"}>
            รหัส: {ticket.requester.emp_code || "-"}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col ml-2">
          <span className="text-[#000000] text-sm">{formatDate(startDate ?? null)}</span>
          <span className="text-[#7BACFF] text-xs">เวลา : {formatTime(startDate ?? null)}</span>
        </div>

        {/* Status */}
        <div>
          <span className={`flex items-center justify-center w-[105px] h-[44px] border rounded-full text-sm font-medium ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* ช่องจัดการ (ปุ่มอนุมัติ หรือ ผู้ที่อนุมัติ) */}
        <div className="flex ml-2">
          {localApprover ? (
            <div className="flex flex-col text-center">
              <span className="text-[11px] text-gray-500"></span>
              
              <span 
                className="bg-white border border-[#73D13D] text-[#73D13D] rounded-full flex items-center justify-center px-3 py-1 text-[13px] truncate max-w-[105px]" 
                title={localApprover}
              >
                {localApprover}
              </span>
            </div>
          ) : localStatus === RepairTicketStatus.PENDING ? (
            <button
              onClick={handleApproveClick}
              className="bg-[#73D13D] border border-[#73D13D] text-white w-[105px] h-[44px] rounded-full flex items-center justify-center hover:bg-[#E6F4EA] transition-colors"
            >
              อนุมัติ
            </button>
          ) : (
            <span className="bg-white border border-[#73D13D] text-[#73D13D] w-[105px] h-[44px] rounded-full flex items-center justify-center">-</span>
          )}
        </div>

        {/* Expand Icon */}
        <div className="text-gray-400 flex justify-center">
          <FontAwesomeIcon
            size="lg"
            icon={faChevronDown}
            className={`text-[#000000] transition-transform duration-300 ${isExpanded ? "transform rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[800px] opacity-100 visible" : "max-h-0 opacity-0 invisible border-t-0"}`}>
        {isLoadingDetail ? (
          <div className="p-8 flex items-center justify-center gap-2">
            <Icon icon="eos-icons:loading" className="text-2xl text-blue-500" />
            <span className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <>
            <div className="font-bold text-black px-6 py-4">ข้อมูลการแจ้งซ่อมอุปกรณ์</div>
            <div className="mx-6 pb-6 pt-4 grid grid-cols-[300px_1fr] gap-4 items-start">
              {/* Image Column */}
              <div className="w-[300px] flex flex-col gap-2 shrink-0">
                <div className="w-full h-[120px] bg-[#F4F4F4] rounded-lg flex items-center justify-center overflow-hidden border border-[#D9D9D9] p-2">
                  {deviceImage ? (
                    <img src={getImageUrl(deviceImage)} alt={ticket.device_info.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Icon icon="mdi:image-off-outline" className="text-3xl text-gray-300" />
                  )}
                </div>
                <button type="button" className="w-full h-[36px] bg-[#EAEAEA] hover:bg-[#DCDCDC] border border-[#D9D9D9] rounded-lg text-sm text-gray-700 transition-colors">
                  ดูรูปภาพ
                </button>
              </div>

              {/* Info Columns */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-3 w-full">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">ผู้ส่งคำร้อง</span>
                    <span className="text-[#636363] text-sm">{ticket.requester.fullname} ({ticket.requester.emp_code || "-"})</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">ชื่ออุปกรณ์</span>
                    <span className="text-[#636363] text-sm">{ticket.device_info.name}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">หมวดหมู่</span>
                    <span className="text-[#636363] text-sm">{ticket.device_info.category || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">แผนก/ฝ่ายย่อย</span>
                    <span className="text-[#636363] text-sm">{ticket.requester.department || "-"} / {ticket.requester.section || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start mt-1">
                    <span className="text-[#000000] font-medium text-sm pt-1">รหัสอุปกรณ์ที่แจ้งซ่อม</span>
                    <div className="flex flex-wrap gap-1.5 w-fit">
                      {ticket.device_info.reported_devices && ticket.device_info.reported_devices.length > 0 ? (
                        <>
                          {ticket.device_info.reported_devices.slice(0, 8).map((device, index) => (
                            <span key={index} className="bg-[#F0F0F0] border border-[#BFBFBF] px-2 py-1 rounded-full text-[#636363] text-xs text-center min-w-[88px] truncate" title={device.asset_code || "-"}>
                              {device.asset_code || "-"}
                            </span>
                          ))}
                          {ticket.device_info.reported_devices.length > 8 && (
                            <button onClick={() => setIsDeviceModalOpen(true)} className="bg-[#FFFFFF] border border-[#BFBFBF] rounded-full flex justify-center items-center px-3 py-1 cursor-pointer hover:bg-gray-100 transition-colors" title="ดูทั้งหมด">
                              <Icon icon="ph:dots-three-bold" width="18" height="18" color="#595959" />
                            </button>
                          )}
                        </>
                      ) : (
                         <span className="bg-[#F0F0F0] border border-[#BFBFBF] px-2 py-1 rounded-full text-[#636363] text-xs text-center min-w-[88px] truncate">
                           {ticket.device_info.asset_code || "-"}
                         </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline mt-1">
                    <span className="text-[#000000] font-medium text-sm">จำนวน</span>
                    <span className="text-[#636363] text-sm">{ticket.device_info.quantity} ชิ้น</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">สถานที่รับอุปกรณ์</span>
                    <span className="text-[#636363] text-sm">{ticket.device_info.location || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">หัวข้อแจ้งซ่อม</span>
                    <span className="text-[#636363] font-medium text-sm">{ticket.problem.title || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] font-medium text-sm">รายละเอียดแจ้งซ่อม</span>
                    <span className="text-[#636363] font-medium text-sm">{ticket.problem.description || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isDeviceModalOpen && (
        <DeviceListModalRepair isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} devices={ticketDetail?.devices || []} />
      )}
      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title="ยืนยันรับคำร้องแจ้งซ่อม"
        description="คุณต้องการรับงานแจ้งซ่อมนี้ใช่หรือไม่?"
        tone="success" 
        actionsMode="double" 
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}