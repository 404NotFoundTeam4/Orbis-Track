/**
 * Description: Component แสดงรายการคำร้องยืมอุปกรณ์แบบ Expandable
 * - แถวสรุป: อุปกรณ์, จำนวน, หมวดหมู่, ผู้ร้องขอ, วันที่, สถานะ, ปุ่มจัดการ
 * - ส่วนขยาย: Timeline อนุมัติ, รูปภาพ, รายละเอียดการยืม
 * - รองรับ Modal แสดงรายการอุปกรณ์ย่อย
 * Input : RequestItemProps { ticket, ticketDetail, isLoadingDetail, onApprove, onReject, onExpand }
 * Output : React Component
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  type TicketItem,
  type TicketDetail,
  ticketsService,
} from "../services/TicketsService";
import Button from "./Button";
import { Icon } from "@iconify/react";
import getImageUrl from "../services/GetImage";
import DeviceListModal from "./DeviceListModal";
import DeviceManageModal, {
  type DeviceChildChanges,
} from "./DeviceManageModal";
import type { TicketDevice } from "../services/TicketsService";
import { useToast } from "./Toast";

interface RequestItemProps {
  ticket: TicketItem;
  ticketDetail?: TicketDetail | null;
  isLoadingDetail?: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onExpand: (id: number, isManual?: boolean) => void;
  forceExpand?: boolean;
  pickupLocation?: string;
  onPickupLocationChange?: (id: number, value: string) => void;
  isInvalid?: boolean;
  expandTrigger?: number;
  onManage?: (
    ticketId: number,
    devices: TicketDevice[],
    changes: DeviceChildChanges,
  ) => void;
}

// Status display configuration
const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "รออนุมัติ",
    className: "border-[#FBBF24] text-[#FBBF24]",
  },
  APPROVED: {
    label: "อนุมัติแล้ว",
    className: "border-[#73D13D] text-[#73D13D]",
  },
  REJECTED: {
    label: "ถูกปฏิเสธ",
    className: "border-[#FF4D4F] text-[#FF4D4F]",
  },
  IN_USE: {
    label: "กำลังใช้งาน",
    className: "border-[#40A9FF] text-[#40A9FF]",
  },
  OVERDUE: {
    label: "เลยกำหนด",
    className: "border-[#FF4D4F] text-[#FF4D4F]",
  },

  // COMPLETED: {
  //   label: "คืนแล้ว",
  //   className: "border-gray-400 text-gray-600 bg-gray-50",
  // },
};

/**
 * Description: ตรวจสอบว่าลำดับปัจจุบันเป็นลำดับสุดท้ายหรือไม่ (ใช้สำหรับ Timeline)
 * Input     : currentStage (number | null), stageLength (number) - ลำดับปัจจุบันและจำนวนลำดับทั้งหมด
 * Output    : boolean - true ถ้าเป็นลำดับสุดท้าย
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
const checkLastStage = (
  currentStage: number | null | undefined,
  stageLength: number,
) => {
  return currentStage === stageLength;
};

/**
 * Description: แปลงวันที่เป็นรูปแบบภาษาไทย (DD/MM/YYYY)
 * Input : dateStr - date string หรือ null
 * Output : string (รูปแบบวันที่)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
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
 * Description: แปลงเวลาเป็นรูปแบบ HH:MM
 * Input : dateStr - date string หรือ null
 * Output : string (รูปแบบเวลา)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Description: แปลงวันที่เวลาแบบเต็ม (D / MMM / YYYY | HH:MM น.)
 * Input : dateStr - date string หรือ null
 * Output : string (รูปแบบวันที่เวลาเต็ม)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
const formatFullDateTime = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString("th-TH", { month: "short" });
  const year = date.getFullYear() + 543;
  const time = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} / ${month} / ${year} | ${time} น.`;
};

/**
 * Description: แปลงวันที่เวลาสำหรับแสดงเวลาอัปเดต (D MMM YYYY HH:MM น.)
 * Input     : dateStr (string | null) - วันที่จาก Backend
 * Output    : string - รูปแบบวันที่เวลาภาษาไทย
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
const formatUpdateByDateTime = (dateStr: string | null): string => {
  if (!dateStr || dateStr === "-") return "-";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString("th-TH", { month: "short" });
  const year = date.getFullYear() + 543;
  const time = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!day && !month && !year && !time) return "-";
  return `${day} ${month} ${year} ${time} น.`;
};

const RequestItem = ({
  ticket,
  ticketDetail,
  isLoadingDetail,
  onApprove,
  onReject,
  onExpand,
  forceExpand,
  pickupLocation = "",
  onPickupLocationChange,
  isInvalid,
  expandTrigger,
  onManage,
}: RequestItemProps) => {
  const { push } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  /**
   * Description: ดึงสถานะปัจจุบันของ ticket (สำหรับ Timeline)
   * Input      : void
   * Output     : TicketStatus | undefined
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const getStepTicket = () => {
    return ticketDetail?.status;
  };

  /**
   * Description: เปิด DeviceManageModal และโหลด ticketDetail (ไม่ expand UI)
   * Input      : void
   * Output     : void - เปิด modal จัดการอุปกรณ์
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const manageButton = () => {
    // โหลด ticketDetail โดยไม่ expand UI
    onExpand(ticket.id, false);
    setIsManageModalOpen(true);
  };

  /**
   * Description: Toggle การเปิด/ปิดรายละเอียด ticket
   * Input      : void
   * Output     : void - เปลี่ยน isExpanded และเรียก onExpand
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    if (newExpanded) {
      onExpand(ticket.id, true);
    }
  };

  /**
   * Description: ส่งการเปลี่ยนแปลงอุปกรณ์ไปยัง parent component
   * Input      : changes (DeviceChildChanges) - การเปลี่ยนแปลง (เพิ่ม/ลบ/อัปเดต)
   * Output     : Promise<void>
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleManageDeviceChilds = async (changes: DeviceChildChanges) => {
    if (onManage && ticketDetail) {
      onManage(ticket.id, ticketDetail.devices, changes);
    }
    await ticketsService.manageDeviceChildsInTicket(ticket.id, changes);
    push({
      tone: "confirm",
      message: "บันทึกการเปลี่ยนแปลงแล้ว",
    });
    setIsManageModalOpen(false);
  };

  // Handle external force expansion (e.g. from notification navigation)
  useEffect(() => {
    if (forceExpand) {
      setIsExpanded(true);
      onExpand(ticket.id, false);
    }
    // We only want to trigger this when forceExpand prop changes to true.
    // Removing isExpanded from dependencies allows user to collapse it manually.
  }, [forceExpand, ticket.id, onExpand, expandTrigger]);

  const status = statusConfig[ticket.status] || statusConfig.PENDING;
  const deviceImage =
    ticket.device_summary.image ||
    "https://placehold.co/200x150/png?text=Device";
  const sectionName =
    typeof ticket.device_summary.section === "object" &&
      ticket.device_summary.section
      ? ticket.device_summary.section
      : ticket.device_summary.section || "-";

  return (
    <div className="bg-white mb-2 overflow-hidden transition-all duration-300">
      {/* Summary Row */}
      <div
        className="grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_0.7fr_1fr_70px] items-center p-4 pl-6 cursor-pointer"
        onClick={toggleExpand}
      >
        {/* Device Name & ID */}
        <div className="flex flex-col">
          <span className="text-[#000000]">{ticket.device_summary.name}</span>
          <span className="text-[#8C8C8C]">
            รหัส : {ticket.device_summary.serial_number || ticket.id}
          </span>
        </div>

        {/* Quantity */}
        <div className="text-[#000000]">
          {ticket.device_summary.total_quantity} ชิ้น
        </div>

        {/* Category */}
        <div className="text-[#000000]">{ticket.device_summary.category}</div>

        {/* Requester */}
        <div className="flex flex-col">
          <span className="text-[#000000]">{ticket.requester.fullname}</span>
          <span className="text-[#8C8C8C]">
            {ticket.requester.empcode || "-"}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col">
          <span className="text-[#000000]">
            {formatDate(ticket.request_date)}
          </span>
          <span className="text-[#7BACFF]">
            เวลา : {formatTime(ticket.request_date)}
          </span>
        </div>

        {/* Status */}
        <div>
          <span
            className={`flex items-center justify-center w-[99px] h-[34px] border rounded-full text-base ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {(ticket.status === "PENDING" && (
            <>
              <Button
                variant="accept"
                onClick={() => onApprove(ticket.id)}
                style={{ width: 105, height: 44, padding: "5px 15px" }}
              >
                อนุมัติ
              </Button>
              <Button
                variant="danger"
                onClick={() => onReject(ticket.id)}
                style={{ width: 105, height: 44, padding: "5px 15px" }}
              >
                ปฏิเสธ
              </Button>
            </>
          )) ||
            ((ticket.status === "IN_USE" || ticket.status === "APPROVED") && (
              <>
                <Button
                  variant="primary"
                  onClick={() => onApprove(ticket.id)}
                  style={{ width: 105, height: 44, padding: "5px 15px" }}
                >
                  รับคืน
                </Button>
                <Button
                  variant="manage"
                  onClick={() => manageButton()}
                  style={{ width: 105, height: 44, padding: "5px 15px" }}
                >
                  จัดการ
                </Button>
              </>
            ))}
        </div>

        {/* Expand Icon */}
        <div className="text-gray-400 flex justify-center">
          <FontAwesomeIcon
            size="lg"
            icon={faChevronDown}
            className={`text-[#000000] transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""
              }`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {isLoadingDetail ? (
          <div className="p-6 flex items-center justify-center">
            <span className="text-gray-500">กำลังโหลด...</span>
          </div>
        ) : (
          <>
            {/* Rejection Banner */}
            {ticket.status === "REJECTED" && ticketDetail && (
              <div className="mx-6 mt-4 bg-[#FFF2F2] border  border-[#FF4D4F] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FF4D4F] rounded-full flex items-center justify-center shrink-0">
                    <Icon
                      icon="ph:file-x-fill"
                      width="30"
                      height="30"
                      color="white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#7B1F20] font-bold text-lg">
                      คำขอถูกปฏิเสธ ({" "}
                      {ticketDetail.details.reject_date
                        ? new Date(
                          ticketDetail.details.reject_date,
                        ).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }) +
                        " - " +
                        new Date(
                          ticketDetail.details.reject_date,
                        ).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) +
                        " น."
                        : "-"}{" "}
                      )
                    </span>
                    <span className="text-[#FF4D4F]">
                      เหตุผล : {ticketDetail.details.reject_reason || "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="font-bold text-black px-6 py-4">
              ข้อมูลการยืมอุปกรณ์
            </div>
            <div className="mx-6 pb-6 pt-2 bg-white flex gap-24 items-start border-b-1 border-[#D9D9D9]">
              {/* --- COLUMN 1: Timeline (ซ้ายสุด) --- */}
              <div className="min-w-[120px] flex flex-col pt-2">
                {/* Step 1: Request */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${getStepTicket() === "PENDING"
                        ? "border-[#4CAF50] text-[#4CAF50]"
                        : getStepTicket() === "APPROVED"
                          ? "border-[#4CAF50] text-[#4CAF50]"
                          : getStepTicket() === "IN_USE"
                            ? "border-[#4CAF50] text-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "border-[#4CAF50] text-[#4CAF50]"
                              : getStepTicket() === "REJECTED"
                                ? "border-[#4CAF50] text-[#4CAF50]"
                                : "border-[#9E9E9E] text-[#9E9E9E]"
                        }`}
                    >
                      <Icon
                        icon="ic:sharp-check"
                        width="20"
                        height="20"
                      // color="blue"
                      />
                    </div>
                    <div
                      className={`w-[2px] h-12 -my-1 ${getStepTicket() === "PENDING"
                        ? "bg-[#4CAF50]"
                        : getStepTicket() === "APPROVED"
                          ? "bg-[#4CAF50]"
                          : getStepTicket() === "IN_USE"
                            ? "bg-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "bg-[#4CAF50]"
                              : getStepTicket() === "REJECTED"
                                ? "bg-[#4CAF50]"
                                : "bg-[#9E9E9E]"
                        }`}
                    ></div>
                  </div>

                  <div className="pt-2">
                    <span
                      className={`text-sm font-medium ${getStepTicket() === "PENDING"
                        ? " text-[#4CAF50]"
                        : getStepTicket() === "APPROVED"
                          ? " text-[#4CAF50]"
                          : getStepTicket() === "IN_USE"
                            ? " text-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "text-[#4CAF50]"
                              : getStepTicket() === "REJECTED"
                                ? "text-[#4CAF50]"
                                : " text-[#9E9E9E]"
                        }`}
                    >
                      ส่งคำร้อง
                    </span>
                  </div>
                </div>

                {/* Step 2: Approve - with hover tooltip */}
                <div className="flex gap-3 relative group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white cursor-pointer ${getStepTicket() === "PENDING"
                        ? "border-[#000000] text-[#000000]"
                        : getStepTicket() === "APPROVED"
                          ? "border-[#4CAF50] text-[#4CAF50]"
                          : getStepTicket() === "IN_USE"
                            ? "border-[#4CAF50] text-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "border-[#4CAF50] text-[#4CAF50]"
                              : getStepTicket() === "REJECTED"
                                ? "border-[#FF4D4F] text-[#FF4D4F]"
                                : "border-[#9E9E9E] text-[#9E9E9E]"
                        }`}
                    >
                      {getStepTicket() !== "REJECTED" ? (
                        <Icon
                          icon="streamline-ultimate:task-list-approve"
                          width="20"
                          height="20"
                        />
                      ) : (
                        <Icon icon="mdi:close" width="20" height="20" />
                      )}
                    </div>
                    <div
                      className={`w-[2px] h-12 -my-1 ${getStepTicket() === "PENDING"
                        ? "bg-[#9E9E9E]"
                        : getStepTicket() === "APPROVED"
                          ? "bg-[#4CAF50]"
                          : getStepTicket() === "IN_USE"
                            ? "bg-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "bg-[#4CAF50]"
                              : "bg-[#9E9E9E]"
                        }`}
                    ></div>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`cursor-pointer ${getStepTicket() === "PENDING"
                        ? " text-[#000000]"
                        : getStepTicket() === "APPROVED"
                          ? " text-[#4CAF50]"
                          : getStepTicket() === "IN_USE"
                            ? " text-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "text-[#4CAF50]"
                              : getStepTicket() === "REJECTED"
                                ? "border-[#FF4D4F] text-[#FF4D4F]"
                                : " text-[#9E9E9E]"
                        }`}
                    >
                      อนุมัติ
                    </span>
                  </div>

                  {/* Tooltip - Approval Hierarchy with Timeline Style */}
                  {ticketDetail?.timeline &&
                    ticketDetail.timeline.length > 0 && (
                      <div className="absolute left-14 top-5 -translate-y-1/2 hidden group-hover:block z-50">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[330px] max-h-[300px] overflow-y-auto">
                          <div className="flex flex-col">
                            {ticketDetail.timeline.map((stage, index) => {
                              const isLast =
                                index === ticketDetail.timeline.length - 1;
                              const prevStage =
                                index > 0
                                  ? ticketDetail.timeline[index - 1]
                                  : null;
                              // If previous stage is APPROVED but current is PENDING, show black (next in queue)
                              const isNextApprover =
                                prevStage?.status === "APPROVED" &&
                                stage.status === "PENDING";
                              return (
                                <div key={index} className="flex gap-3">
                                  {/* Icon & Line */}
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${stage.status === "APPROVED"
                                        ? "border-[#4CAF50] text-[#4CAF50]"
                                        : stage.status === "REJECTED"
                                          ? "border-[#FF4D4F] text-[#FF4D4F]"
                                          : isNextApprover
                                            ? "border-[#000000] text-[#000000]"
                                            : "border-[#9E9E9E] text-[#9E9E9E]"
                                        }`}
                                    >
                                      {stage.status === "REJECTED" ? (
                                        <Icon
                                          icon="mdi:close"
                                          width="14"
                                          height="14"
                                        />
                                      ) : (
                                        <Icon
                                          icon="ic:sharp-check"
                                          width="14"
                                          height="14"
                                        />
                                      )}
                                    </div>
                                    {/* Connecting Line - hide for last item */}
                                    {!isLast && (
                                      <div
                                        className={`w-0.5 h-12 -my-1 ${stage.status === "APPROVED"
                                          ? "bg-[#4CAF50]"
                                          : "bg-[#9E9E9E]"
                                          }`}
                                      ></div>
                                    )}
                                  </div>
                                  {/* Text */}
                                  <div
                                    className={`${stage.status === "APPROVED" || stage.status === "REJECTED" ? "" : "pt-1"} ${!isLast ? "pb-3" : ""} `}
                                  >
                                    <span
                                      className={`text-sm ${stage.status === "APPROVED"
                                        ? "text-[#4CAF50]"
                                        : stage.status === "REJECTED"
                                          ? "text-[#FF4D4F]"
                                          : isNextApprover
                                            ? "text-[#000000]"
                                            : "text-[#9E9E9E]"
                                        }`}
                                    >
                                      {stage.role_name}
                                      {stage.dept_name && ` ${stage.dept_name}`}
                                    </span>
                                    {stage.status === "APPROVED" ||
                                      stage.status === "REJECTED" ? (
                                      <>
                                        <div
                                          className={`text-xs text-[#9E9E9E]`}
                                        >
                                          {stage.status === "APPROVED"
                                            ? "ผู้อนุมัติ"
                                            : ""}{" "}
                                          {stage.status === "REJECTED"
                                            ? "ผู้ดำเนินการ"
                                            : ""}{" "}
                                          : {stage.approved_by}
                                        </div>
                                        <div
                                          className={`text-xs text-[#9E9E9E]`}
                                        >
                                          เวลา :{" "}
                                          {formatUpdateByDateTime(
                                            stage.updated_at || "-",
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Step 3: In Use */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${getStepTicket() === "PENDING"
                        ? "border-[#9E9E9E] text-[#9E9E9E]"
                        : getStepTicket() === "APPROVED"
                          ? "border-[#000000] text-[#000000]"
                          : getStepTicket() === "IN_USE"
                            ? "border-[#4CAF50] text-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "border-[#4CAF50] text-[#4CAF50]"
                              : "border-[#9E9E9E] text-[#9E9E9E]"
                        }`}
                    >
                      <Icon
                        icon="material-symbols-light:devices-outline"
                        width="23"
                        height="23"
                      // color="blue"
                      />
                    </div>
                    <div
                      className={`w-[2px] h-12 -my-1 ${getStepTicket() === "PENDING"
                        ? "bg-[#9E9E9E]"
                        : getStepTicket() === "APPROVED"
                          ? "bg-[#9E9E9E]"
                          : getStepTicket() === "IN_USE"
                            ? "bg-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "bg-[#4CAF50]"
                              : "bg-[#9E9E9E]"
                        }`}
                    ></div>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`${getStepTicket() === "PENDING"
                        ? " text-[#9E9E9E]"
                        : getStepTicket() === "APPROVED"
                          ? " text-[#000000]"
                          : getStepTicket() === "IN_USE"
                            ? " text-[#4CAF50]"
                            : getStepTicket() === "COMPLETED"
                              ? "text-[#4CAF50]"
                              : " text-[#9E9E9E]"
                        }`}
                    >
                      กำลังใช้งาน
                    </span>
                  </div>
                </div>

                {/* Step 4: Return */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${getStepTicket() === "PENDING"
                        ? "border-[#9E9E9E] text-[#9E9E9E]"
                        : getStepTicket() === "APPROVED"
                          ? "border-[#9E9E9E] text-[#9E9E9E]"
                          : getStepTicket() === "IN_USE"
                            ? "border-[#000000] text-[#000000]"
                            : getStepTicket() === "COMPLETED"
                              ? "border-[#4CAF50] text-[#4CAF50]"
                              : "border-[#9E9E9E] text-[#9E9E9E]"
                        }`}
                    >
                      <Icon
                        icon="streamline:return-2"
                        width="20"
                        height="20"
                      // color="blue"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`${getStepTicket() === "PENDING"
                        ? " text-[#9E9E9E]"
                        : getStepTicket() === "APPROVED"
                          ? " text-[#9E9E9E]"
                          : getStepTicket() === "IN_USE"
                            ? " text-[#000000]"
                            : getStepTicket() === "COMPLETED"
                              ? "text-[#4CAF50]"
                              : " text-[#9E9E9E]"
                        }`}
                    >
                      คืนอุปกรณ์
                    </span>
                  </div>
                </div>
              </div>

              {/* --- COLUMN 2: Image & Description (ตรงกลาง) --- */}
              <div className="w-[300px] flex flex-col gap-2">
                {/* Device Image */}
                <div className="w-full h-[180px] bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[#D9D9D9] p-4">
                  <img
                    src={getImageUrl(deviceImage)}
                    alt={ticket.device_summary.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="bg-[#F4F4F4] p-3 rounded-lg border border-[#D9D9D9]">
                  <div className="font-bold text-[#000000] text-sm">
                    รายละเอียด —{" "}
                    <span className="text-sm text-[#636363]">
                      {ticket.device_summary.description || "ไม่มีรายละเอียด"}
                    </span>
                  </div>
                </div>

                {/* Footer Alert */}
                <div className="bg-[#FFE8E8] border border-[#FF4D4F] text-[#FF4D4F] p-1 rounded-lg text-sm text-center">
                  *อุปกรณ์นี้ถูกยืมได้สูงสุด{" "}
                  {ticket.device_summary.max_borrow_days ?? "-"} วัน
                </div>
              </div>

              {/* --- COLUMN 3: Info & Fields (ขวาสุด) --- */}
              <div className="flex-1 flex gap-10 pt-2">
                {/* Left Column */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">ผู้ส่งคำร้อง</span>
                    <span className="text-[#636363] text-sm">
                      {ticket.requester.fullname}
                    </span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">ชื่ออุปกรณ์</span>
                    <span className="text-[#636363] text-sm">
                      {ticket.device_summary.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">หมวดหมู่</span>
                    <span className="text-[#636363] text-sm">
                      {ticket.device_summary.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">
                      แผนก/ฝ่ายย่อย
                    </span>
                    <span className="text-[#636363] text-sm">
                      {ticket.device_summary.department || "-"} / {sectionName}
                    </span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start">
                    <span className="text-[#000000] text-sm">รหัสอุปกรณ์</span>
                    <div className="grid grid-cols-3 gap-1.5 w-fit">
                      {ticketDetail?.devices?.slice(0, 8).map((device, index) => (
                        <span
                          key={device.child_id || index}
                          className="bg-[#F0F0F0] border border-[#BFBFBF] px-1 py-0.5 mb-0 rounded-full text-[#636363] text-[11px] text-center w-[88px] truncate"
                          title={device.asset_code}
                        >
                          {device.asset_code || "CH-001"}
                        </span>
                      ))}
                      {ticketDetail?.devices && (
                        <button
                          onClick={() => setIsDeviceModalOpen(true)}
                          className="bg-[#FFFFFF] border border-[#BFBFBF] rounded-full flex justify-center items-center w-10 h-[22px] cursor-pointer hover:bg-gray-100"
                        >
                          <Icon
                            icon="ph:dots-three-bold"
                            width="18"
                            height="18"
                            color="#595959"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">จำนวน</span>
                    <span className="text-[#636363] text-sm">
                      {ticket.device_summary.total_quantity} ชิ้น
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">วันที่ยืม</span>
                    <span className="text-[#636363] text-sm">
                      {formatFullDateTime(
                        ticketDetail?.details.dates.start || "-",
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">วันที่คืน</span>
                    <span className="text-[#636363] text-sm">
                      {formatFullDateTime(
                        ticketDetail?.details.dates.end || "-",
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">
                      เหตุผลในการยืม
                    </span>
                    <span className="text-[#636363] text-sm">
                      {ticketDetail?.details.purpose || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">
                      สถานที่ใช้งาน
                    </span>
                    <span className="text-[#636363] text-sm">
                      {ticketDetail?.details.location_use || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] text-sm">
                      เบอร์โทรศัพท์ผู้ยืม
                    </span>
                    <span className="text-[#636363] text-sm">
                      {ticketDetail?.requester.us_phone
                        ? ticketDetail.requester.us_phone.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          "$1-$2-$3",
                        )
                        : "000-000-0000"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] font-semibold text-md">
                      อุปกรณ์เสริม
                    </span>
                    <span className="text-[#000000] font-semibold text-md">
                      จำนวน
                    </span>
                  </div>
                  {ticketDetail?.accessories &&
                    ticketDetail.accessories.length > 0 ? (
                    ticketDetail.accessories.map((acc, index) => (
                      <div
                        key={acc.acc_id || index}
                        className="grid grid-cols-[150px_1fr] items-baseline"
                      >
                        <span className="text-[#636363] text-sm">
                          - {acc.acc_name}
                        </span>
                        <span className="text-[#636363] text-sm">
                          {acc.acc_quantity} ชิ้น
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-[150px_1fr] items-baseline">
                      <span className="text-[#636363] text-sm">-ไม่มี</span>
                      <span className="text-[#636363] text-sm">-</span>
                    </div>
                  )}

                  {/* Textarea */}
                  <div className="grid grid-cols-[150px_1fr] items-start">
                    <span className="text-[#000000] text-sm">
                      สถานะที่รับอุปกรณ์
                    </span>
                    {checkLastStage(
                      ticketDetail?.details.current_stage,
                      ticketDetail?.timeline?.length || 0,
                    ) && ticket.status === "PENDING" ? (
                      <textarea
                        className={`w-[80%] h-[100px] p-3 bg-white border rounded-xl resize-none text-sm transition-all ${isInvalid
                          ? "border-red-500 ring-1 ring-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                          : "border-[#BFBFBF] focus:border-[#40A9FF] focus:ring-1 focus:ring-[#40A9FF]"
                          }`}
                        placeholder="กรอกสถานที่รับอุปกรณ์ (เช่น ตึก A ชั้น 2)"
                        value={pickupLocation}
                        onChange={(e) =>
                          onPickupLocationChange?.(ticket.id, e.target.value)
                        }
                      ></textarea>
                    ) : (
                      <span className="text-[#000000] text-sm">
                        {ticketDetail?.details.locations.pickup || "-"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Device List Modal */}
      <DeviceListModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        devices={ticketDetail?.devices || []}
      />

      {/* Device Manage Modal */}
      <DeviceManageModal
        deviceSummary={ticket?.device_summary}
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        devices={ticketDetail?.devices || []}
        ticketDate={ticketDetail?.details?.dates}
        onConfirm={(_, changes) => {
          handleManageDeviceChilds(changes);
        }}
      />
    </div>
  );
};

export default RequestItem;
