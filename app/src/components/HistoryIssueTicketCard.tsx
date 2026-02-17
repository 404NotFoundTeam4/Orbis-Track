/**
 * Description: Component แสดงรายการประวัติการแจ้งซ่อมแบบ Expandable (Read-only)
 * - Summary Row: อุปกรณ์แม่, หัวข้อปัญหา, วันที่แจ้ง, ผู้รับผิดชอบ, สถานะ, ปุ่มขยาย
 * - Expanded: รายละเอียดอุปกรณ์, ผู้ส่งคำร้อง, สถานที่รับอุปกรณ์, รายละเอียดปัญหา,
 *             รหัสอุปกรณ์ลูก + Serial (ผ่าน tooltip) + เปิด Modal ดูรายการทั้งหมด
 * - เพิ่ม: ปุ่มดูรูป -> เปิด modal รูปขนาดใหญ่
 * Input : { item, detail, isOpen, isLoadingDetail, onToggle }
 * Output : React Component
 * Author: Chanwit Muangma (Boom) 66160224
 */

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";
import DeviceListModal from "../components/DeviceListModal";
import getImageUrl from "../services/GetImage";
import type { TicketDevice } from "../services/TicketsService";
import type { HistoryIssueDetail, HistoryIssueItem } from "../services/HistoryIssueService";

/**
 * Description: ฟอร์แมตวันที่ (DD/MM/YYYY)
 */
function formatDate(dateTimeString: string | null): string {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Description: ฟอร์แมตเวลา (HH:mm)
 */
function formatTime(dateTimeString: string | null): string {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Description: แปลงชื่อแผนกให้เป็นรูปแบบสำหรับแสดงผลใน UI
 */
function extractDepartmentDisplayName(
  departmentName: string | null | undefined
): string {
  if (!departmentName) return "-";
  const trimmedDepartmentName = departmentName.trim();
  const departmentMatch = trimmedDepartmentName.match(/^แผนก\s*(.+)$/u);
  if (departmentMatch?.[1]) return departmentMatch[1].trim();
  return trimmedDepartmentName;
}

/**
 * Description: แปลงชื่อฝ่ายย่อยให้เหลือเฉพาะชื่อฝ่ายย่อยจริงสำหรับแสดงผลใน UI
 */
function extractSectionDisplayNameOnly(
  sectionName: string | null | undefined
): string {
  if (!sectionName) return "-";
  const trimmedSectionName = sectionName.trim();
  const sectionMatch = trimmedSectionName.match(/ฝ่ายย่อย\s*(.+)$/u);
  if (sectionMatch?.[1]) return sectionMatch[1].trim();
  return trimmedSectionName;
}

/**
 * Description: สร้างข้อความแสดงผล "แผนก / ฝ่ายย่อย"
 */
function formatDepartmentAndSectionDisplay(
  departmentName: string | null | undefined,
  sectionName: string | null | undefined
): string {
  const departmentDisplayName = extractDepartmentDisplayName(departmentName);
  const sectionDisplayName = extractSectionDisplayNameOnly(sectionName);
  return `${departmentDisplayName} / ${sectionDisplayName}`;
}

/**
 * Description: mapping label และ class ของสถานะ ticket แจ้งซ่อม (สำหรับ pill)
 * Rule:
 * - PENDING: รอรับเรื่อง
 * - IN_PROGRESS: กำลังซ่อม
 * - COMPLETED + SUCCESS: ซ่อมแล้ว
 * - COMPLETED + FAILED: ซ่อมไม่สำเร็จ
 */
function getIssueStatusPill(params: {
  issueStatus: string;
  issueResult: string;
}): { label: string; className: string } {
  const issueStatus = String(params.issueStatus).toUpperCase().trim();
  const issueResult = String(params.issueResult).toUpperCase().trim();

  if (issueStatus === "PENDING") {
    return { label: "รอรับเรื่อง", className: "border-[#FBBF24] text-[#FBBF24]" };
  }

  if (issueStatus === "IN_PROGRESS") {
    return { label: "กำลังซ่อม", className: "border-[#40A9FF] text-[#40A9FF]" };
  }

  if (issueStatus === "COMPLETED" && issueResult === "SUCCESS") {
    return { label: "ซ่อมแล้ว", className: "border-[#73D13D] text-[#73D13D]" };
  }

  if (issueStatus === "COMPLETED" && issueResult === "FAILED") {
    return { label: "ซ่อมไม่สำเร็จ", className: "border-[#FF4D4F] text-[#FF4D4F]" };
  }

  return { label: "ไม่ทราบสถานะ", className: "border-[#BFBFBF] text-[#8C8C8C]" };
}

type Props = {
  item: HistoryIssueItem;
  isOpen: boolean;
  detail?: HistoryIssueDetail;
  isLoadingDetail?: boolean;
  onToggle: () => void;
};

export default function HistoryIssueTicketCard({
  item,
  isOpen,
  detail,
  isLoadingDetail,
  onToggle,
}: Props) {
  /**
   * Description: state ควบคุมการเปิด/ปิด Modal รายการอุปกรณ์ลูกทั้งหมด
   */
  const [isDeviceListModalOpen, setDeviceListModalOpen] = useState(false);

  /**
   * Description: state ควบคุมการเปิด/ปิด Modal รูปขนาดใหญ่
   */
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  /**
   * Description: สถานะสำหรับแสดง pill (ใช้ detail ก่อน item)
   */
  const effectiveIssueStatus = String(detail?.issueStatus ?? item.issueStatus);
  const effectiveIssueResult = String(detail?.issueResult ?? item.issueResult);

  const issueStatusPill = getIssueStatusPill({
    issueStatus: effectiveIssueStatus,
    issueResult: effectiveIssueResult,
  });

  /**
   * Description: รายการอุปกรณ์ลูก (ใช้ detail ก่อน)
   */
  const deviceChildList = detail?.deviceChildList ?? [];

  /**
   * Description: map เป็น TicketDevice[] เพื่อ reuse DeviceListModal
   */
  const modalDevices = useMemo(() => {
    const ticketDeviceList = deviceChildList.map((deviceChild) => ({
      child_id: String(deviceChild.deviceChildId),
      asset_code: deviceChild.deviceChildAssetCode,
      serial: deviceChild.deviceChildSerialNumber ?? "",
      current_status: deviceChild.deviceChildStatus as unknown,
    }));

    return ticketDeviceList as unknown as TicketDevice[];
  }, [deviceChildList]);

  /**
   * Description: แผนก/ฝ่ายย่อยสำหรับแสดงผล (ใช้ detail ก่อน)
   */
  const departmentName =
    detail?.parentDevice.departmentName ?? item.parentDevice.departmentName ?? null;
  const sectionName =
    detail?.parentDevice.sectionName ?? item.parentDevice.sectionName ?? null;

  /**
   * Description: รูปอุปกรณ์แม่ (ถ้า backend/DTO ยังไม่มี imageUrl จะเป็น null ได้)
   */
  const parentDeviceImageUrl =
    detail?.parentDevice.imageUrl ?? item.parentDevice.imageUrl ?? null;

  return (
    <div className="bg-white mb-2 overflow-hidden transition-all duration-300 rounded-[16px]">
      {/* ---------- Summary Row ---------- */}
      <div
        className="grid [grid-template-columns:1.2fr_1.2fr_0.8fr_0.9fr_0.6fr_70px] items-center p-4 pl-6 cursor-pointer"
        onClick={onToggle}
      >
        {/* อุปกรณ์แม่ */}
        <div className="flex flex-col">
          <span className="text-[#000000] font-medium">{item.parentDevice.name}</span>
          <span className="text-[#8C8C8C]">รหัส : {item.parentDevice.serialNumber}</span>
        </div>

        {/* หัวข้อปัญหา */}
        <div className="text-[#000000] truncate" title={item.issueTitle}>
          {item.issueTitle}
        </div>

        {/* วันที่แจ้ง */}
        <div className="flex flex-col">
          <span className="text-[#000000]">{formatDate(item.reportedAt)}</span>
          <span className="text-[#7BACFF]">เวลา : {formatTime(item.reportedAt)}</span>
        </div>

        {/* ผู้รับผิดชอบ */}
        <div className="flex flex-col">
          <span className="text-[#000000]">{item.assigneeUser?.fullName ?? "-"}</span>
        </div>

        {/* สถานะ */}
        <div>
          <span
            className={`flex items-center justify-center w-[99px] h-[34px] border rounded-full text-base ${issueStatusPill.className}`}
          >
            {issueStatusPill.label}
          </span>
        </div>

        {/* ปุ่มขยาย */}
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

      {/* ---------- Expanded ---------- */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isLoadingDetail ? (
          <div className="p-6 flex items-center justify-center">
            <span className="text-gray-500">กำลังโหลด...</span>
          </div>
        ) : (
          <div className="mx-6 pb-6 pt-2 bg-white border-b border-[#D9D9D9]">
            <div className="font-bold text-black py-4">ข้อมูลการแจ้งซ่อม</div>

            <div className="flex gap-10 items-start">
              {/* ---------- กล่องรูป + ปุ่มดูรูป ---------- */}
              <div className="w-[300px] flex flex-col gap-2">
                <div className="w-full h-[180px] bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[#D9D9D9] p-4">
                  {parentDeviceImageUrl ? (
                    <img
                      src={getImageUrl(parentDeviceImageUrl)}
                      alt={detail?.parentDevice.name ?? item.parentDevice.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-[#BFBFBF] flex flex-col items-center gap-2">
                      <Icon icon="mdi:image-outline" width="40" height="40" />
                      <span className="text-sm">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>

                {/* ปุ่มดูรูป (เปิดรูปขนาดใหญ่) */}
                <button
                  type="button"
                  disabled={!parentDeviceImageUrl}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsImageModalOpen(true);
                  }}
                  className={[
                    "h-[48px] rounded-[14px] border text-[18px] font-semibold",
                    parentDeviceImageUrl
                      ? "border-[#D9D9D9] bg-[#F3F3F3] text-[#000000] hover:bg-neutral-200"
                      : "border-[#E5E5E5] bg-[#FAFAFA] text-[#BFBFBF] cursor-not-allowed",
                  ].join(" ")}
                >
                  ดูรูปภาพ
                </button>

              </div>

              {/* ---------- ข้อมูลฝั่งขวา ---------- */}
              <div className="flex-1 flex gap-10 pt-1">
                {/* ซ้ายของฝั่งขวา: กำหนดความกว้างเองด้วย basis */}
                <div className="flex flex-col gap-2 basis-[480px] shrink-0">
                  <FieldRow
                    label="ผู้ส่งคำร้อง"
                    value={detail?.reporterUser.fullName ?? item.reporterUser.fullName}
                  />

                  <FieldRow
                    label="ชื่ออุปกรณ์"
                    value={detail?.parentDevice.name ?? item.parentDevice.name}
                  />

                  <FieldRow
                    label="หมวดหมู่"
                    value={detail?.parentDevice.categoryName ?? item.parentDevice.categoryName}
                  />

                  <FieldRow
                    label="แผนก/ฝ่ายย่อย"
                    value={formatDepartmentAndSectionDisplay(departmentName, sectionName)}
                  />

                  {/* รหัสอุปกรณ์ลูก (chips) + ปุ่ม ... (แบบ B) */}
                  <div className="grid grid-cols-[150px_1fr] items-start">
                    <span className="text-[#000000] text-sm">รหัสอุปกรณ์ลูก</span>

                    <div className="grid grid-cols-3 gap-1.5 w-fit">
                      {(deviceChildList ?? []).slice(0, 8).map((deviceChild) => {
                        const serialText = deviceChild.deviceChildSerialNumber
                          ? ` | SN: ${deviceChild.deviceChildSerialNumber}`
                          : "";

                        return (
                          <span
                            key={deviceChild.deviceChildId}
                            className="bg-[#F0F0F0] border border-[#BFBFBF] px-1 py-0.5 mb-0 rounded-full text-[#636363] text-[11px] text-center w-[110px] truncate"
                            title={`${deviceChild.deviceChildAssetCode}${serialText}`}
                          >
                            {deviceChild.deviceChildAssetCode}
                          </span>
                        );
                      })}

                      {/* ===== แบบ B: มีอุปกรณ์ลูกอย่างน้อย 1 ชิ้น ก็ให้ปุ่ม ... โผล่เลย ===== */}
                      {(deviceChildList?.length ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeviceListModalOpen(true);
                          }}
                          className="bg-[#FFFFFF] border border-[#BFBFBF] rounded-full flex justify-center items-center w-10 h-[22px] text-[#595959] hover:bg-neutral-50"
                          title="ดูรายการอุปกรณ์ทั้งหมด"
                        >
                          <Icon icon="ph:dots-three-bold" width="18" height="18" />
                        </button>
                      )}
                    </div>
                  </div>

                  <FieldRow
                    label="จำนวนอุปกรณ์ลูก"
                    value={`${detail?.deviceChildCount ?? item.deviceChildCount} ชิ้น`}
                  />
                </div>

                {/* ขวาสุด: ถ้าอยากกำหนดความกว้างเอง ให้เปลี่ยน flex-1 เป็น basis เช่น basis-[520px] */}
                <div className="flex flex-col gap-2 flex-1">
                  <FieldRow
                    label="สถานที่รับอุปกรณ์"
                    value={detail?.receiveLocationName ?? item.receiveLocationName ?? "-"}
                  />

                  <FieldRow label="หัวข้อปัญหา" value={detail?.issueTitle ?? item.issueTitle} />

                  {/* รายละเอียดปัญหา */}
                  <div className="grid grid-cols-[150px_1fr] items-start">
                    <span className="text-[#000000] text-sm">รายละเอียดปัญหา</span>
                    <span className="text-[#636363] text-sm whitespace-pre-wrap">
                      {detail?.issueDescription ?? item.issueDescription ?? "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal แสดงรายการอุปกรณ์ลูกทั้งหมด */}
      <DeviceListModal
        isOpen={isDeviceListModalOpen}
        onClose={() => setDeviceListModalOpen(false)}
        devices={modalDevices}
      />

      {/* Modal รูปขนาดใหญ่ */}
      <ImagePreviewModal
        isOpen={isImageModalOpen}
        imageUrl={parentDeviceImageUrl}
        title={detail?.parentDevice.name ?? item.parentDevice.name}
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
}

/**
 * Description: Component แสดง label/value แบบแถวเดียว
 */
function FieldRow(props: { label: string; value: string }) {
  const { label, value } = props;

  return (
    <div className="grid grid-cols-[150px_1fr] items-baseline">
      <span className="text-[#000000] text-sm">{label}</span>
      <span className="text-[#636363] text-sm">{value || "-"}</span>
    </div>
  );
}

/**
 * Description: Modal แสดงรูปขนาดใหญ่ (ใช้ใน Detail)
 */
function ImagePreviewModal(props: {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}) {
  const { isOpen, imageUrl, title, onClose } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close overlay"
      />

      <div className="relative mx-auto mt-12 w-[min(980px,92vw)] rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="font-semibold text-neutral-900 truncate pr-4">
            {title ?? "รูปภาพอุปกรณ์"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-neutral-200 grid place-items-center hover:bg-neutral-50"
            aria-label="Close modal"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        <div className="p-5">
          {imageUrl ? (
            <img
              src={getImageUrl(imageUrl)}
              alt={title ?? "device"}
              className="w-full max-h-[72vh] object-contain rounded-xl border border-neutral-200 bg-white"
            />
          ) : (
            <div className="h-[320px] grid place-items-center rounded-xl border border-neutral-200 text-neutral-400">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
