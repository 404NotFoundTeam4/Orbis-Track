/**
 * Description: Component แสดงรายการประวัติการยืม-คืนแบบ Expandable (Read-only)
 * - Summary Row: อุปกรณ์, จำนวน, หมวดหมู่, ผู้ร้องขอ, วันที่, สถานะ, ปุ่มขยาย
 * - Expanded: Timeline (4 step), รูป/รายละเอียด, ข้อมูลการยืม
 * - Tooltip ที่ขั้น "อนุมัติ" เพื่อดู Approval Flow (จาก detail.timeline)
 * Input : { item, detail, isOpen, loadingDetail, onToggle }
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";
import getImageUrl from "../services/GetImage";
import type {
  HistoryBorrowTicketItem,
  HistoryBorrowTicketDetail,
  HistoryBorrowTimelineStep,
  ApproverUser,
} from "../services/HistoryBorrowService";
import DeviceListModal from "../components/DeviceListModal";
import type { TicketDevice } from "../services/TicketsService";
import type { ReactNode } from "react";

/**
 * Description: โทนสีของแต่ละ step ใน tooltip timeline (สีสถานะของวงกลม/เส้น/ข้อความ)
 * Input : - (union type)
 * Output : ใช้เลือก style ของ step
 * Author: Chanwit Muangma (Boom) 66160224
 */
type StepTone = "done" | "current" | "todo" | "rejected";

/**
 * Description: คำนวณโทนสีของ step ใน tooltip timeline ตามสถานะ และคิวปัจจุบัน
 * Input : stepStatus, hasAnyRejected, isCurrentQueue
 * Output : StepTone
 * Author: Chanwit Muangma (Boom) 66160224
 */
function getTimelineTone(params: {
  stepStatus: string;
  isAnyRejected: boolean;
  isCurrentQueue: boolean;
}): StepTone {
  const { stepStatus, isAnyRejected, isCurrentQueue } = params;

  if (stepStatus === "REJECTED") return "rejected";
  if (stepStatus === "APPROVED") return "done";

  if (isAnyRejected) return "todo";
  if (isCurrentQueue) return "current";
  return "todo";
}

/**
 * Description: คืนค่า class ของสีวงกลม/เส้น/ข้อความ ตาม tone ที่คำนวณได้
 * Input : tone (StepTone)
 * Output : { ring, line, text }
 * Author: Chanwit Muangma (Boom) 66160224
 */
function toneClass(tone: StepTone) {
  switch (tone) {
    case "done":
      return {
        ring: "border-[#4CAF50] text-[#4CAF50]",
        line: "bg-[#4CAF50]",
        text: "text-[#4CAF50]",
      };
    case "current":
      return {
        ring: "border-[#000000] text-[#000000]",
        line: "bg-[#9E9E9E]",
        text: "text-[#000000]",
      };
    case "rejected":
      return {
        ring: "border-[#FF4D4F] text-[#FF4D4F]",
        line: "bg-[#9E9E9E]",
        text: "text-[#FF4D4F]",
      };
    default:
      return {
        ring: "border-[#9E9E9E] text-[#9E9E9E]",
        line: "bg-[#9E9E9E]",
        text: "text-[#9E9E9E]",
      };
  }
}

/**
 * Description: ฟอร์แมตวันที่ (DD/MM/YYYY) สำหรับแสดงใน summary row
 * Input : dateTimeString (string | null)
 * Output : string
 * Author: Chanwit Muangma (Boom) 66160224
 */
const formatDate = (dateTimeString: string | null): string => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Description: ฟอร์แมตเวลา (HH:mm) สำหรับแสดงใน summary row
 * Input : dateTimeString (string | null)
 * Output : string
 * Author: Chanwit Muangma (Boom) 66160224
 */
const formatTime = (dateTimeString: string | null): string => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Description: ฟอร์แมตวันเวลาแบบเต็มสำหรับแสดงในส่วนรายละเอียด (DD / MMM / YYYY | HH:mm น.)
 * Input : dateTimeString (string | null)
 * Output : string
 * Author: Chanwit Muangma (Boom) 66160224
 */
const formatFullDateTime = (dateTimeString: string | null): string => {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  const dayOfMonth = date.getDate();
  const monthShortName = date.toLocaleDateString("th-TH", { month: "short" });
  const buddhistYear = date.getFullYear() + 543;
  const timeString = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayOfMonth} / ${monthShortName} / ${buddhistYear} | ${timeString} น.`;
};

/**
 * Description: ฟอร์แมตวันเวลา update ใน tooltip timeline (DD MMM YYYY HH:mm น.)
 * Input : dateTimeString (string | null)
 * Output : string
 * Author: Chanwit Muangma (Boom) 66160224
 */
const formatUpdateByDateTime = (dateTimeString: string | null): string => {
  if (!dateTimeString || dateTimeString === "-") return "-";
  const date = new Date(dateTimeString);
  const dayOfMonth = date.getDate();
  const monthShortName = date.toLocaleDateString("th-TH", { month: "short" });
  const buddhistYear = date.getFullYear() + 543;
  const timeString = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayOfMonth} ${monthShortName} ${buddhistYear} ${timeString} น.`;
};

/**
 * Description: เลือกข้อความ “ตำแหน่ง/หน่วยงาน” ที่จะแสดงใน Tooltip/Timeline ของแต่ละ Step
 * Rule:
 * - HOS: แสดง "ฝ่ายย่อย (Section)" เป็นหลัก
 * - HOD: แสดง "แผนก (Department)" เป็นหลัก
 * - ADMIN: แสดง "ผู้ดูแลระบบ"
 * - อื่น ๆ: fallback เป็น Section -> Department -> "-"
 *
 * Input : stage (HistoryBorrowTimelineStep)
 * Output : string (ข้อความที่ใช้แสดง scope)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function getApproverScopeLabel(stage: HistoryBorrowTimelineStep): string {
  const role = String(stage?.requiredRole ?? stage?.approver?.role ?? "")
    .toUpperCase()
    .trim();

  const sectionName =
    stage?.approver?.sectionName ?? stage?.sectionName ?? null;
  const departmentName =
    stage?.approver?.departmentName ?? stage?.departmentName ?? null;

  if (role === "HOS") return sectionName ?? departmentName ?? "-";
  if (role === "HOD") return departmentName ?? sectionName ?? "-";
  if (role === "ADMIN") return "ผู้ดูแลระบบ";

  return sectionName ?? departmentName ?? "-";
}

/**
 * Description: เงื่อนไขการโชว์เวลาใต้ step ใน Tooltip
 * - ถ้ายังไม่มีคนดำเนินการ (approver = null) => ไม่โชว์เวลา
 * - ถ้ามีคนดำเนินการแล้ว แต่ updatedAt ไม่มี => ไม่โชว์
 *
 * Input : stage (HistoryBorrowTimelineStep)
 * Output : boolean
 * Author: Chanwit Muangma (Boom) 66160224
 */
function shouldShowTimelineTime(stage: HistoryBorrowTimelineStep): boolean {
  const isApprover = Boolean(stage?.approver);
  const isUpdatedAt = Boolean(stage?.updatedAt);
  return isApprover && isUpdatedAt;
}

/**
 * Description: เงื่อนไขการแสดงเวลาใต้ Step หลัก
 * - ต้องมี detail ก่อน (เพราะเวลาอยู่ใน detail)
 * - ถ้าสถานะยังไปไม่ถึง step นั้น ให้ไม่แสดง
 *
 * Input : stepKey, effectiveTicketStatus
 * Output : boolean
 * Author: Chanwit Muangma (Boom) 66160224
 */
function shouldShowMainStepTime(params: {
  stepKey: "REQUEST" | "APPROVAL" | "IN_USE" | "RETURN";
  effectiveTicketStatus: string;
}): boolean {
  const { stepKey, effectiveTicketStatus } = params;

  const stage = effectiveTicketStatus.toUpperCase();

  if (stepKey === "REQUEST") return true; // มี ticket ก็ถือว่ามีเวลาส่งคำร้องได้
  if (stepKey === "APPROVAL")
    return ["APPROVED", "IN_USE", "COMPLETED", "OVERDUE", "REJECTED"].includes(
      stage,
    );
  if (stepKey === "IN_USE")
    return ["IN_USE", "COMPLETED", "OVERDUE"].includes(stage);
  if (stepKey === "RETURN") return ["COMPLETED", "OVERDUE"].includes(stage);

  return false;
}

/**
 * Description: แปลงชื่อแผนกให้เป็นรูปแบบสำหรับแสดงผลใน UI
 * - ถ้าค่า departmentName เป็น null/undefined/ว่าง ให้คืนค่า "-" แทน
 * - ถ้าข้อความขึ้นต้นด้วย "แผนก" ให้ตัดคำนำหน้าออก และคืนเฉพาะชื่อแผนกจริง
 *   (เช่น "แผนก Media" -> "Media")
 * - ถ้าไม่ขึ้นต้นด้วย "แผนก" ให้คืนค่าเดิมหลัง trim
 *
 * Input : departmentName (string | null | undefined) ชื่อแผนกที่อาจมีคำนำหน้า "แผนก"
 * Output : string ชื่อแผนกสำหรับแสดงผล (เช่น "Media" หรือ "-" เมื่อไม่มีค่า)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function extractDepartmentDisplayName(
  departmentName: string | null | undefined,
): string {
  if (!departmentName) return "-";

  const trimmedDepartmentName = departmentName.trim();

  const departmentMatch = trimmedDepartmentName.match(/^แผนก\s*(.+)$/u);
  if (departmentMatch?.[1]) return departmentMatch[1].trim();

  return trimmedDepartmentName;
}

/**
 * Description: แปลงชื่อฝ่ายย่อยให้เหลือเฉพาะชื่อฝ่ายย่อยจริงสำหรับแสดงผลใน UI
 * - ถ้าค่า sectionName เป็น null/undefined/ว่าง ให้คืนค่า "-" แทน
 * - ถ้าพบคำว่า "ฝ่ายย่อย" ให้ดึงข้อความหลัง "ฝ่ายย่อย" เท่านั้น
 *   (เช่น "แผนก Media ฝ่ายย่อย A" -> "A")
 * - ถ้าไม่พบคำว่า "ฝ่ายย่อย" ให้คืนค่าเดิมหลัง trim
 *
 * Input : sectionName (string | null | undefined) ชื่อฝ่ายย่อยที่อาจมีคำนำหน้า และมีคำว่า "ฝ่ายย่อย"
 * Output : string ชื่อฝ่ายย่อยสำหรับแสดงผล (เช่น "A" หรือ "-" เมื่อไม่มีค่า)
 * Author: Chanwit Muangma (Boom) 66160224
 */
function extractSectionDisplayNameOnly(
  sectionName: string | null | undefined,
): string {
  if (!sectionName) return "-";

  const trimmedSectionName = sectionName.trim();

  const sectionMatch = trimmedSectionName.match(/ฝ่ายย่อย\s*(.+)$/u);
  if (sectionMatch?.[1]) return sectionMatch[1].trim();

  return trimmedSectionName;
}

/**
 * Description: สร้างข้อความแสดงผล "แผนก / ฝ่ายย่อย" ให้เป็นรูปแบบสั้นสำหรับ UI
 * - แปลงชื่อแผนกด้วยการตัดคำนำหน้า "แผนก" (เช่น "แผนก Media" -> "Media")
 * - แปลงชื่อฝ่ายย่อยให้เหลือเฉพาะชื่อจริงหลังคำว่า "ฝ่ายย่อย" (เช่น "แผนก Media ฝ่ายย่อย A" -> "A")
 * - รวมเป็นข้อความรูปแบบ "<department> / <section>" เพื่อใช้กับ FieldRow
 *
 * Input : departmentName (string | null | undefined) ชื่อแผนกจาก backend
 *         sectionName (string | null | undefined) ชื่อฝ่ายย่อยจาก backend
 * Output : string ข้อความสำหรับแสดงผล (เช่น "Media / A")
 * Author: Chanwit Muangma (Boom) 66160224
 */
function formatDepartmentAndSectionDisplay(
  departmentName: string | null | undefined,
  sectionName: string | null | undefined,
): string {
  const departmentDisplayName = extractDepartmentDisplayName(departmentName);
  const sectionDisplayName = extractSectionDisplayNameOnly(sectionName);

  return `${departmentDisplayName} / ${sectionDisplayName}`;
}

/**
 * Description: แสดง Approver Candidates แบบสั้น (2 ชื่อ + badge "+N")
 * - ใช้ใน Tooltip เพื่อให้เห็นว่า step นี้ใครมีสิทธิ์อนุมัติได้บ้าง
 * - คืนค่าเป็น ReactNode เพื่อทำ badge แบบกรอบได้
 *
 * Input : candidates (ApproverUser[] | undefined)
 * Output : ReactNode
 * Author: Chanwit Muangma (Boom) 66160224
 */
function renderApproverCandidateSummary(
  candidates: ApproverUser[] | undefined,
): ReactNode {
  if (!candidates || candidates.length === 0) return "-";

  const topTwoCandidates = candidates.slice(0, 2);
  const remainingCandidateCount = candidates.length - topTwoCandidates.length;

  const topTwoCandidateNames = topTwoCandidates
    .map((candidateUser) => candidateUser.fullName)
    .join(", ");

  return (
    <span className="inline-flex items-center gap-2">
      {/* รายชื่อ 2 คนแรก */}
      <span>{topTwoCandidateNames}</span>

      {/* ป้ายจำนวนที่เหลือ (+N) */}
      {remainingCandidateCount > 0 && (
        <span
          className={[
            "inline-flex items-center justify-center",
            "h-7 min-w-[30px] px-2",
            "rounded-lg border border-neutral-300",
            "bg-white text-neutral-700 text-sm font-medium",
            "leading-none",
          ].join(" ")}
        >
          +{remainingCandidateCount}
        </span>
      )}
    </span>
  );
}

/**
 * Description: mapping label และ class ของสถานะ ticket สำหรับแสดงเป็น pill
 * Input : status string
 * Output : { label, className }
 * Author: Chanwit Muangma (Boom) 66160224
 */
const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รออนุมัติ", className: "border-[#FBBF24] text-[#FBBF24]" },
  APPROVED: {
    label: "อนุมัติแล้ว",
    className: "border-[#73D13D] text-[#73D13D]",
  },
  IN_USE: {
    label: "กำลังใช้งาน",
    className: "border-[#40A9FF] text-[#40A9FF]",
  },
  COMPLETED: { label: "คืนแล้ว", className: "border-[#BFBFBF] text-[#8C8C8C]" },
  OVERDUE: { label: "เลยกำหนด", className: "border-[#FF4D4F] text-[#FF4D4F]" },
  REJECTED: { label: "ปฏิเสธ", className: "border-[#FF4D4F] text-[#FF4D4F]" },
};

type Props = {
  item: HistoryBorrowTicketItem;
  isOpen: boolean;
  detail?: HistoryBorrowTicketDetail;
  isLoadingDetail?: boolean;
  onToggle: () => void;
};

export default function HistoryBorrowTicket({
  item,
  isOpen,
  detail,
  isLoadingDetail,
  onToggle,
}: Props) {
  /**
   * Description: state ควบคุมการเปิด/ปิด Modal รายการอุปกรณ์ลูก (กดจากปุ่ม "...").
   * Input : - (React state)
   * Output : isDeviceListModalOpen (boolean), setDeviceListModalOpen (setter)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [isDeviceListModalOpen, setDeviceListModalOpen] = useState(false);

  /**
   * Description: แปลง deviceChildren ของ history-borrow ให้เป็นรูปแบบ TicketDevice[] เพื่อส่งให้ DeviceListModal
   * - DeviceListModal ถูกออกแบบให้ใช้ TicketDevice จาก TicketsService
   * - จึงต้อง map ชื่อ field ให้ตรง (child_id, asset_code, serial, current_status)
   *
   * Input : detail.deviceChildren (HistoryBorrowTicketDetail.deviceChildren)
   * Output : TicketDevice[] (สำหรับ DeviceListModal)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const modalDevices = useMemo(() => {
    const deviceChildrenList = detail?.deviceChildren ?? [];

    const ticketDeviceList = deviceChildrenList.map((deviceChild) => ({
      child_id: String(deviceChild.deviceChildId),

      asset_code: deviceChild.assetCode,

      // Modal ใช้ตรวจ hasSerialNumber ด้วย .trim()
      serial: deviceChild.serialNumber ?? "",

      current_status: deviceChild.status as unknown,
    }));

    return ticketDeviceList as unknown as TicketDevice[];
  }, [detail?.deviceChildren]);

  /**
   * Description: สถานะของ Ticket ที่ใช้แสดงใน UI
   * - status: เอาไว้ render pill ใน summary (ใช้ item.status เป็นหลัก)
   * - effectiveTicketStatus: สถานะจริงล่าสุด (detail มาก่อน item)
   *
   * Input : item.status, detail.status
   * Output : statusConfig ที่ใช้ render label/class และ string สถานะล่าสุด
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 5000); // 30 วิ

    return () => clearInterval(timer);
  }, []);

  const toMinute = (d: Date) =>
    new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
    );

  const endDateRaw = detail?.borrowDateRange?.endDateTime;

  const isOverdate =
    endDateRaw &&
    toMinute(new Date(endDateRaw)).getTime() <= toMinute(now).getTime();

  const statusKey = isOverdate ? "OVERDUE" : String(item.status);

  const status = statusConfig[statusKey] || statusConfig.PENDING;

  const effectiveTicketStatus = String(detail?.status ?? item.status)
    .toUpperCase()
    .trim();
  console.log(status);
  /**
   * Description: หาเวลา "อนุมัติ/ปฏิเสธ" จาก timeline
   * - เลือก stage ที่มี approver และ status เป็น APPROVED หรือ REJECTED
   * - เอา updatedAt มาแสดง
   *
   * Input : detail.timeline
   * Output : string | null
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const approvalUpdatedAt = useMemo(() => {
    const timeline = detail?.timeline ?? [];
    const actedStage = timeline.find((stage) => {
      const status = String(stage.status).toUpperCase();
      return (
        Boolean(stage.approver) &&
        (status === "APPROVED" || status === "REJECTED")
      );
    });
    return actedStage?.updatedAt ?? null;
  }, [detail?.timeline]);

  /**
   * Description: เวลาใต้ Step หลักทั้ง 4 ขั้น
   * Input : detail + item
   * Output : object ของเวลาตาม step
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const mainStepTimes = useMemo(() => {
    return {
      request: detail?.requestDateTime ?? item.requestDateTime ?? null,
      approval: approvalUpdatedAt,
      inUse: detail?.inUseDateTime ?? null,
      returned: detail?.fulfillmentDateTimes?.returnDateTime ?? null,
    };
  }, [
    detail?.requestDateTime,
    item.requestDateTime,
    approvalUpdatedAt,
    detail?.inUseDateTime,
    detail?.fulfillmentDateTimes?.returnDateTime,
  ]);
  /**
   * Description: ข้อมูลอุปกรณ์ที่ใช้ render ในส่วน Expanded (รูป + แผนก/ฝ่ายย่อย)
   * Input : detail.device
   * Output : deviceImageUrl, departmentName, sectionName
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const deviceImageUrl = detail?.device?.imageUrl ?? null;
  const sectionName = detail?.device?.sectionName ?? "-";
  const departmentName = detail?.device?.departmentName ?? "-";
  console.log(detail);
  /**
   * Description: หา step ใน timeline ที่ถูกปฏิเสธ (ไว้แสดง banner ปฏิเสธ)
   * Input : detail.timeline
   * Output : rejectedStage (HistoryBorrowTimelineStep | undefined)
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const rejectedStage = useMemo(() => {
    return detail?.timeline?.find(
      (timelineItem) =>
        String(timelineItem.status).toUpperCase() === "REJECTED",
    );
  }, [detail?.timeline]);

  /**
   * Description: สร้าง flag ตามสถานะ เพื่อใช้กำหนดสี Timeline หลัก 4 ขั้น
   * Input : effectiveTicketStatus
   * Output : boolean flags
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const isRejected = effectiveTicketStatus === "REJECTED";
  const isPending = effectiveTicketStatus === "PENDING";
  const isApproved = effectiveTicketStatus === "APPROVED";
  const isInUse = effectiveTicketStatus === "IN_USE";
  const isCompleted = effectiveTicketStatus === "COMPLETED";
  const isOverdue = effectiveTicketStatus === "OVERDUE";

  /**
   * Description: class ของ Timeline หลัก 4 ขั้น (Step 1-4) ตามสถานะปัจจุบัน
   * Input : flags (isPending/isApproved/isInUse/isCompleted/isOverdue/isRejected)
   * Output : stepXRingClass / stepXLineClass / stepXTextClass
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const step1RingClass = "border-[#4CAF50] text-[#4CAF50]";
  const step1LineClass = "bg-[#4CAF50]";
  const step1TextClass = "text-[#4CAF50]";

  const step2RingClass = isRejected
    ? "border-[#FF4D4F] text-[#FF4D4F]"
    : isPending
      ? "border-[#000000] text-[#000000]"
      : isApproved || isInUse || isCompleted || isOverdue
        ? "border-[#4CAF50] text-[#4CAF50]"
        : "border-[#9E9E9E] text-[#9E9E9E]";

  const step2LineClass = isPending
    ? "bg-[#9E9E9E]"
    : isApproved || isInUse || isCompleted || isOverdue
      ? "bg-[#4CAF50]"
      : "bg-[#9E9E9E]";

  const step2TextClass = isRejected
    ? "text-[#FF4D4F]"
    : isPending
      ? "text-[#000000]"
      : isApproved || isInUse || isCompleted || isOverdue
        ? "text-[#4CAF50]"
        : "text-[#9E9E9E]";

  const step3RingClass = isPending
    ? "border-[#9E9E9E] text-[#9E9E9E]"
    : isApproved
      ? "border-[#000000] text-[#000000]"
      : isInUse || isCompleted || isOverdue
        ? "border-[#4CAF50] text-[#4CAF50]"
        : "border-[#9E9E9E] text-[#9E9E9E]";

  const step3LineClass =
    isPending || isApproved
      ? "bg-[#9E9E9E]"
      : isInUse || isCompleted || isOverdue
        ? "bg-[#4CAF50]"
        : "bg-[#9E9E9E]";

  const step3TextClass = isPending
    ? "text-[#9E9E9E]"
    : isApproved
      ? "text-[#000000]"
      : isInUse || isCompleted || isOverdue
        ? "text-[#4CAF50]"
        : "text-[#9E9E9E]";

  const step4RingClass =
    isPending || isApproved
      ? "border-[#9E9E9E] text-[#9E9E9E]"
      : isInUse
        ? "border-[#000000] text-[#000000]"
        : isCompleted || isOverdue
          ? "border-[#4CAF50] text-[#4CAF50]"
          : "border-[#9E9E9E] text-[#9E9E9E]";

  const step4TextClass =
    isPending || isApproved
      ? "text-[#9E9E9E]"
      : isInUse
        ? "text-[#000000]"
        : isCompleted || isOverdue
          ? "text-[#4CAF50]"
          : "text-[#9E9E9E]";

  return (
    <div className="bg-white mb-2 overflow-hidden transition-all duration-300 rounded-[16px] ">
      <div
        className="grid [grid-template-columns:1.3fr_0.6fr_0.8fr_1fr_0.7fr_0.7fr_70px] items-center p-4 pl-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex flex-col">
          <span className="text-[#000000] font-medium">
            {item.deviceSummary.deviceName}
          </span>
          <span className="text-[#8C8C8C]">
            รหัส : {item.deviceSummary.deviceSerialNumber || item.ticketId}
          </span>
        </div>

        <div className="text-[#000000]">{item.deviceChildCount} ชิ้น</div>

        <div className="text-[#000000]">{item.deviceSummary.categoryName}</div>

        <div className="flex flex-col">
          <span className="text-[#000000]">
            {item?.requester?.borrowName || "-"}
          </span>
          {/**
          <span className="text-[#8C8C8C]">
            {item.requester.employeeCode || "-"}
          </span>
          */}
        </div>

        <div className="flex flex-col">
          <span className="text-[#000000]">
            {formatDate(item.requestDateTime)}
          </span>
          <span className="text-[#7BACFF]">
            เวลา : {formatTime(item.requestDateTime)}
          </span>
        </div>

        <div>
          <span
            className={`flex items-center justify-center w-[99px] h-[34px] border rounded-full text-base ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="text-gray-400 flex justify-center">
          <FontAwesomeIcon
            size="lg"
            icon={faChevronDown}
            className={`text-[#000000] transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isLoadingDetail ? (
          <div className="p-6 flex items-center justify-center">
            <span className="text-gray-500">กำลังโหลด...</span>
          </div>
        ) : (
          <>
            {effectiveTicketStatus === "REJECTED" && detail && (
              <div className="mx-6 mt-4 bg-[#FFF2F2] border border-[#FF4D4F] rounded-xl p-4">
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
                      คำขอถูกปฏิเสธ (
                      {rejectedStage?.updatedAt
                        ? formatUpdateByDateTime(rejectedStage.updatedAt)
                        : "-"}
                      )
                    </span>

                    <span className="text-[#FF4D4F]">
                      เหตุผล : {detail.rejectReason || "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="font-bold text-black px-6 py-4">
              ข้อมูลการยืมอุปกรณ์
            </div>

            <div className="mx-6 pb-6 pt-2 bg-white flex gap-24 items-start border-b border-[#D9D9D9]">
              <div className="min-w-[120px] flex flex-col pt-2">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${step1RingClass}`}
                    >
                      <Icon icon="ic:sharp-check" width="20" height="20" />
                    </div>
                    <div
                      className={`w-[2px] h-12 -my-1 ${step1LineClass}`}
                    ></div>
                  </div>

                  <div className="pt-2">
                    <div className={`text-sm font-medium ${step1TextClass}`}>
                      ส่งคำร้อง
                    </div>

                    {shouldShowMainStepTime({
                      stepKey: "REQUEST",
                      effectiveTicketStatus,
                    }) && (
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {formatUpdateByDateTime(mainStepTimes.request)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 relative group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white cursor-pointer ${step2RingClass}`}
                    >
                      {isRejected ? (
                        <Icon icon="mdi:close" width="20" height="20" />
                      ) : (
                        <Icon
                          icon="streamline-ultimate:task-list-approve"
                          width="20"
                          height="20"
                        />
                      )}
                    </div>
                    <div
                      className={`w-[2px] h-12 -my-1 ${step2LineClass}`}
                    ></div>
                  </div>

                  <div className="pt-2">
                    <span
                      className={`cursor-pointer text-sm font-medium ${step2TextClass}`}
                    >
                      อนุมัติ{" "}
                      <Icon
                        icon="mdi:chevron-down"
                        className="inline-block align-middle"
                      />
                      {shouldShowMainStepTime({
                        stepKey: "APPROVAL",
                        effectiveTicketStatus,
                      }) &&
                        mainStepTimes.approval && (
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {formatUpdateByDateTime(mainStepTimes.approval)}
                          </div>
                        )}
                    </span>
                  </div>

                  {detail?.timeline && detail.timeline.length > 0 && (
                    <div className="absolute left-14 top-5 -translate-y-1/2 hidden group-hover:block z-50">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[360px] max-h-[320px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-semibold text-neutral-800">
                            ลำดับการอนุมัติ
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {detail.timeline.map((stage, index) => {
                            const timeline = detail.timeline;

                            const isAnyRejected = timeline.some(
                              (timelineStage) =>
                                String(timelineStage.status).toUpperCase() ===
                                "REJECTED",
                            );

                            const currentIndex = timeline.findIndex(
                              (timelineStage) => {
                                const st = String(
                                  timelineStage.status,
                                ).toUpperCase();
                                return st !== "APPROVED" && st !== "REJECTED";
                              },
                            );

                            const isCurrentQueue =
                              !isAnyRejected && currentIndex === index;

                            const tone = getTimelineTone({
                              stepStatus: String(stage.status).toUpperCase(),
                              isAnyRejected,
                              isCurrentQueue,
                            });

                            const classNames = toneClass(tone);

                            const icon =
                              tone === "rejected"
                                ? "mdi:close"
                                : tone === "done"
                                  ? "mdi:check"
                                  : "mdi:check";

                            /**
                             * Description: สร้าง node สำหรับแสดงสรุปรายชื่อผู้มีสิทธิ์อนุมัติ
                             * - แสดง 2 ชื่อแรก + ถ้ามีมากกว่า 2 คน จะมี badge "+N"
                             *
                             * Input : stage.approverCandidates
                             * Output : ReactNode สำหรับ render ใน tooltip
                             * Author: Chanwit Muangma (Boom) 66160224
                             */
                            const candidateSummaryNode =
                              renderApproverCandidateSummary(
                                stage.approverCandidates,
                              );

                            return (
                              <div
                                key={`${stage.stepNumber}-${index}`}
                                className="flex gap-3"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={[
                                      "grid h-9 w-9 place-items-center rounded-full border bg-white",
                                      classNames.ring,
                                    ].join(" ")}
                                  >
                                    <Icon icon={icon} className="text-lg" />
                                  </div>

                                  {index !== timeline.length - 1 && (
                                    <div
                                      className={[
                                        "mt-1 h-8 w-px",
                                        classNames.line,
                                      ].join(" ")}
                                    />
                                  )}
                                </div>

                                <div className="min-w-0 pt-0.5">
                                  <div
                                    className={[
                                      "text-sm font-medium",
                                      classNames.text,
                                    ].join(" ")}
                                  >
                                    <span className="text-neutral-500 font-normal">
                                      {getApproverScopeLabel(stage)}
                                    </span>
                                  </div>

                                  {!stage.approver ? (
                                    <div className="text-xs text-neutral-700 mt-0.5">
                                      ผู้มีสิทธิ์อนุมัติ :{" "}
                                      <span className="font-medium">
                                        {candidateSummaryNode}
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-xs text-neutral-700 mt-0.5">
                                        {String(stage.status).toUpperCase() ===
                                        "REJECTED"
                                          ? "ผู้ปฏิเสธ"
                                          : "ผู้อนุมัติ"}
                                        {" : "}
                                        <span className="font-medium">
                                          {stage.approver.fullName}
                                        </span>
                                      </div>

                                      {shouldShowTimelineTime(stage) && (
                                        <div className="text-xs text-neutral-500 mt-0.5">
                                          {formatUpdateByDateTime(
                                            stage.updatedAt,
                                          )}
                                        </div>
                                      )}
                                    </>
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

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${step3RingClass}`}
                    >
                      <Icon
                        icon="material-symbols-light:devices-outline"
                        width="23"
                        height="23"
                      />
                    </div>
                    <div
                      className={`w-[2px] h-12 -my-1 ${step3LineClass}`}
                    ></div>
                  </div>

                  <div className="pt-2">
                    <span className={`text-sm font-medium ${step3TextClass}`}>
                      กำลังใช้งาน
                    </span>

                    {shouldShowMainStepTime({
                      stepKey: "IN_USE",
                      effectiveTicketStatus,
                    }) &&
                      mainStepTimes.inUse && (
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {formatUpdateByDateTime(mainStepTimes.inUse)}
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white ${step4RingClass}`}
                    >
                      <Icon
                        icon="streamline:return-2"
                        width="20"
                        height="20"
                        className="-scale-y-100"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className={`text-sm font-medium ${step4TextClass}`}>
                      คืนอุปกรณ์
                    </span>

                    {shouldShowMainStepTime({
                      stepKey: "RETURN",
                      effectiveTicketStatus,
                    }) &&
                      mainStepTimes.returned && (
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {formatUpdateByDateTime(mainStepTimes.returned)}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="w-[300px] flex flex-col gap-2">
                <div className="w-full h-[180px] bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[#D9D9D9] p-4">
                  {deviceImageUrl ? (
                    <img
                      src={getImageUrl(deviceImageUrl)}
                      alt={
                        detail?.device?.deviceName ||
                        item.deviceSummary.deviceName
                      }
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-[#BFBFBF] flex flex-col items-center gap-2">
                      <Icon icon="mdi:image-outline" width="40" height="40" />
                      <span className="text-sm">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#F4F4F4] p-3 rounded-lg border border-[#D9D9D9]">
                  <div className="font-bold text-[#000000] text-sm">
                    รายละเอียด —{" "}
                    <span className="text-sm text-[#636363]">
                      {detail?.device?.description || "-"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFE8E8] border border-[#FF4D4F] text-[#FF4D4F] p-1 rounded-lg text-sm text-center">
                  *อุปกรณ์นี้ถูกยืมได้สูงสุด{" "}
                  {detail?.device?.maximumBorrowDays ?? "-"} วัน
                </div>
              </div>

              <div className="flex-1 flex gap-10 pt-2">
                <div className="flex flex-col gap-2 flex-1">
                  <FieldRow
                    label="ชื่อผู้ร้องขอ"
                    value={item?.requester?.borrowName || "-"}
                  />
                  <FieldRow
                    label="ชื่ออุปกรณ์"
                    value={
                      detail?.device?.deviceName ||
                      item.deviceSummary.deviceName
                    }
                  />
                  <FieldRow
                    label="หมวดหมู่"
                    value={
                      detail?.device?.categoryName ||
                      item.deviceSummary.categoryName
                    }
                  />
                  <FieldRow
                    label="แผนก/ฝ่ายย่อย"
                    value={formatDepartmentAndSectionDisplay(
                      departmentName,
                      sectionName,
                    )}
                  />

                  <div className="grid grid-cols-[140px_1fr] items-start">
                    <span className="text-[#000000] text-sm">รหัสอุปกรณ์</span>

                    <div className="grid grid-cols-3 gap-1.5 w-fit">
                      {(detail?.deviceChildren || [])
                        .slice(0, 8)
                        .map((deviceChild) => (
                          <span
                            key={deviceChild.deviceChildId}
                            className="bg-[#F0F0F0] border border-[#BFBFBF] px-1 py-0.5 mb-0 rounded-full text-[#636363] text-[11px] text-center w-[88px] truncate"
                            title={deviceChild.assetCode}
                          >
                            {deviceChild.assetCode}
                          </span>
                        ))}

                      {detail?.deviceChildren && (
                        /**
                         * Description: ปุ่ม "..." สำหรับเปิด Modal แสดงรายการอุปกรณ์ลูกทั้งหมด
                         * - ใช้ e.stopPropagation() เพื่อไม่ให้ไป trigger การพับ/ขยาย card (onToggle)
                         *
                         * Input : click event
                         * Output : เปิด DeviceListModal (setDeviceListModalOpen(true))
                         * Author: Chanwit Muangma (Boom) 66160224
                         */
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeviceListModalOpen(true);
                          }}
                          className="bg-[#FFFFFF] border border-[#BFBFBF] rounded-full flex justify-center items-center w-10 h-[22px] text-[#595959] hover:bg-neutral-50"
                          title="ดูรายการอุปกรณ์ทั้งหมด"
                        >
                          <Icon
                            icon="ph:dots-three-bold"
                            width="18"
                            height="18"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <FieldRow
                    label="จำนวน"
                    value={`${detail?.deviceChildCount ?? item.deviceChildCount} ชิ้น`}
                  />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <FieldRow
                    label="วันที่ยืม"
                    value={formatFullDateTime(
                      detail?.borrowDateRange?.startDateTime ?? null,
                    )}
                  />
                  <FieldRow
                    label="วันที่คืน"
                    value={formatFullDateTime(
                      detail?.borrowDateRange?.endDateTime ?? null,
                    )}
                  />
                  <FieldRow
                    label="เหตุผลในการยืม"
                    value={detail?.borrowPurpose || "-"}
                  />
                  <FieldRow
                    label="สถานที่ใช้งาน"
                    value={detail?.usageLocation || "-"}
                  />
                  <FieldRow
                    label="เบอร์โทรศัพท์ผู้ยืม"
                    value={
                      item?.requester?.borrowPhone
                        ? item?.requester?.borrowPhone.replace(
                            /(\d{3})(\d{3})(\d{4})/,
                            "$1-$2-$3",
                          )
                        : "000-000-0000"
                    }
                  />

                  <div className="grid grid-cols-[150px_1fr] items-baseline">
                    <span className="text-[#000000] font-semibold text-md">
                      อุปกรณ์เสริม
                    </span>
                    <span className="text-[#000000] font-semibold text-md">
                      จำนวน
                    </span>
                  </div>

                  {detail?.accessories && detail.accessories.length > 0 ? (
                    detail.accessories.map((accessory) => (
                      <div
                        key={accessory.accessoryId}
                        className="grid grid-cols-[150px_1fr] items-baseline"
                      >
                        <span className="text-[#636363] text-sm">
                          - {accessory.accessoryName}
                        </span>
                        <span className="text-[#636363] text-sm">
                          {accessory.quantity * (detail.deviceChildCount || 1)}{" "}
                          ชิ้น
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-[150px_1fr] items-baseline">
                      <span className="text-[#636363] text-sm">-ไม่มี</span>
                      <span className="text-[#636363] text-sm">-</span>
                    </div>
                  )}

                  <div className="grid grid-cols-[150px_1fr] items-start">
                    <span className="text-[#000000] text-sm">
                      สถานที่รับอุปกรณ์
                    </span>
                    <span className="text-[#000000] text-sm">
                      {detail?.pickupLocation || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal แสดงรายการอุปกรณ์ลูกทั้งหมด (เปิดจากปุ่ม "...") */}
      <DeviceListModal
        isOpen={isDeviceListModalOpen}
        onClose={() => setDeviceListModalOpen(false)}
        devices={modalDevices}
      />
    </div>
  );
}

/**
 * Description: Component แสดง label/value แบบแถวเดียว เพื่อจัด layout ให้เหมือน RequestItem (grid label/value)
 * Input : label (string), value (string)
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline">
      <span className="text-[#000000] text-sm">{label}</span>
      <span className="text-[#636363] text-sm">{value || "-"}</span>
    </div>
  );
}
