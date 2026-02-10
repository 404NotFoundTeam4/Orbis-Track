// src/components/ApprovalHistoryDetailModal.tsx
import { Icon } from "@iconify/react";
import type { HistoryApprovalDetail } from "../services/HistoryApprovalService";

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Input : classNameParts (Array<string | false | undefined | null>)
 * Output : string (className)
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
function mergeClassNames(...classNameParts: Array<string | false | undefined | null>) {
  return classNameParts.filter(Boolean).join(" ");
}

/**
 * Description: ฟอร์แมตวันเวลาให้เป็นรูปแบบภาษาไทย (ใกล้เคียง mock)
 * Input : isoString (string)
 * Output : string
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
function formatThaiDateTime(isoString: string): string {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Description: Props ของ ApprovalHistoryDetailModal
 * Input :
 * - isOpen: boolean เปิด/ปิด modal
 * - isLoading: boolean สถานะกำลังโหลด detail
 * - detail: ApprovalHistoryDetail | null ข้อมูล detail ที่จะแสดง
 * - onClose: () => void callback เมื่อปิด modal
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type ApprovalHistoryDetailModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  detail: HistoryApprovalDetail | null;
  onClose: () => void;
};

/**
 * Description: Modal แสดงรายละเอียด "ประวัติการอนุมัติ" (ตาม mock)
 * - แสดงสถานะ (อนุมัติ/ปฏิเสธ) + ข้อมูลรายละเอียด ticket
 * - ถ้าเป็น REJECTED ให้แสดงเหตุผลการปฏิเสธด้วย
 *
 * Author: Chanwit Muangma (Boom) 66160224
 */
export default function ApprovalHistoryDetailModal(props: ApprovalHistoryDetailModalProps) {
  const { isOpen, isLoading, detail, onClose } = props;

  if (!isOpen) return null;

  const isRejected = detail?.decision === "REJECTED";
  const decisionLabel = isRejected ? "ปฏิเสธคำขอ" : "อนุมัติคำขอ";
  const decisionIcon = isRejected ? "mdi:close" : "mdi:check";
  const decisionIconContainerClassName = isRejected
    ? "bg-white text-red-600 border border-red-600"
    : "bg-white text-green-600 border border-green-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        /**
         * Description: คลิกนอกกล่องเพื่อปิด (กันคลิกในกล่องแล้วปิด)
         * Input : event (mouse event)
         * Output : void
         *
         * Author: Chanwit Muangma (Boom) 66160224
         */
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="text-lg font-extrabold text-neutral-900">รายละเอียด</div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
            aria-label="close"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {isLoading && (
            <div className="flex items-center gap-2 py-4 text-sm text-neutral-600">
              <Icon icon="mdi:loading" className="animate-spin text-lg" />
              กำลังโหลดรายละเอียด...
            </div>
          )}

          {!isLoading && !detail && (
            <div className="py-4 text-sm text-neutral-600">ไม่พบรายละเอียด</div>
          )}

          {!isLoading && detail && (
            <>
              <div className="flex items-center gap-3">
                <div
                  className={mergeClassNames(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    decisionIconContainerClassName
                  )}
                >
                  <Icon icon={decisionIcon} className="text-xl" />
                </div>

                <div
                  className={mergeClassNames(
                    "text-base font-extrabold",
                    isRejected ? "text-red-600" : "text-green-600"
                  )}
                >
                  {decisionLabel}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
                <div className="text-neutral-700 font-semibold">วันที่ - เวลา</div>
                <div className="text-neutral-700">
                  {formatThaiDateTime(detail.actionDateTime)} น.
                </div>

                <div className="text-neutral-700 font-semibold">ผู้ส่งคำขอ</div>
                <div className="text-neutral-700">{detail.requester.fullName}</div>

                <div className="text-neutral-700 font-semibold">อุปกรณ์</div>
                <div className="text-neutral-700">{detail.device.deviceName}</div>

                {/**
                 * Description: ฟิลด์ "หมวดหมู่อุปกรณ์" (เพิ่มตาม backend ใหม่)
                 * - backend ส่งมาใน detail.device.categoryName (nullable)
                 *
                 * Author: Chanwit Muangma (Boom) 66160224
                 */}
                <div className="text-neutral-700 font-semibold">หมวดหมู่</div>
                <div className="text-neutral-700">{detail.device.categoryName ?? "-"}</div>

                <div className="text-neutral-700 font-semibold">รหัสอุปกรณ์</div>
                <div className="text-neutral-700">{detail.device.deviceSerialNumber}</div>

                <div className="text-neutral-700 font-semibold">จำนวน</div>
                <div className="text-neutral-700">{detail.deviceChildCount} รายการ</div>

                {/**
                 * Description: ฟิลด์ "เหตุผลในการยืม" (เพิ่มตาม backend ใหม่)
                 * - backend ส่งมาใน detail.borrowPurpose (nullable)
                 *
                 * Author: Chanwit Muangma (Boom) 66160224
                 */}
                <div className="text-neutral-700 font-semibold">เหตุผลในการยืม</div>
                <div className="text-neutral-700">{detail.borrowPurpose ?? "-"}</div>

                {/**
                 * Description: ฟิลด์ "สถานที่ใช้งาน" (เพิ่มตาม backend ใหม่)
                 * - backend ส่งมาใน detail.usageLocation (nullable)
                 *
                 * Author: Chanwit Muangma (Boom) 66160224
                 */}
                <div className="text-neutral-700 font-semibold">สถานที่ใช้งาน</div>
                <div className="text-neutral-700">{detail.usageLocation ?? "-"}</div>

                <div className="text-neutral-700 font-semibold">ผู้ดำเนินการ</div>
                <div className="text-neutral-700">{detail.actor?.fullName ?? "-"}</div>

                {/**
                 * Description: ฟิลด์ "วันที่ยืม/วันที่คืน" (เพิ่มตาม backend ใหม่)
                 * - backend ส่งมาใน detail.borrowDateRange.startDateTime / endDateTime
                 * - กันกรณีไม่มี borrowDateRange เพื่อไม่ให้ UI พัง
                 *
                 * Author: Chanwit Muangma (Boom) 66160224
                 */}
                <div className="text-neutral-700 font-semibold">วันที่ยืม</div>
                <div className="text-neutral-700">
                  {detail.borrowDateRange?.startDateTime
                    ? `${formatThaiDateTime(detail.borrowDateRange.startDateTime)} น.`
                    : "-"}
                </div>

                <div className="text-neutral-700 font-semibold">วันที่คืน</div>
                <div className="text-neutral-700">
                  {detail.borrowDateRange?.endDateTime
                    ? `${formatThaiDateTime(detail.borrowDateRange.endDateTime)} น.`
                    : "-"}
                </div>
              </div>

              {isRejected && (
                <div className="mt-4">
                  <div className="text-sm font-extrabold text-neutral-900">เหตุผล/หมายเหตุ</div>
                  <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                    {detail.rejectReason ?? "-"}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="mx-auto block w-[180px] rounded-full bg-sky-500 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
