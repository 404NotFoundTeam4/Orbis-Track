import type { OverdueTicket } from "../../services/dashboard";
import { Icon } from "@iconify/react";

interface Props {
  data: OverdueTicket | null;
  onClose: () => void;
}

export default function BorrowDetailModal({ data, onClose }: Props) {
  if (!data) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date) + " น.";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] transition-opacity">
      <div className="bg-white w-[606px] rounded-[24px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-[24px] font-bold text-[#1F1F1F]">รายละเอียด</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <Icon icon="mdi:close-circle-outline" width="36" height="36" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-2 text-[#FF4D4F] mb-6">
            <Icon icon="mdi:clock-outline" width="24" height="24" />
            <span className="text-[18px] font-bold">เลยกำหนด</span>
          </div>

          <div className="flex flex-col gap-4">
            <DetailRow label="วันที่ - เวลา" value={formatDate(data.returnDate)} />
            <DetailRow label="ผู้ส่งคำขอ" value={data.userName} />
            <DetailRow label="เบอร์โทรศัพท์" value={data.phone} />
            <DetailRow label="อุปกรณ์" value={data.equipments.join(", ")} />
            <DetailRow label="หมวดหมู่" value={data.categories.join(", ") || "-"} />
            <DetailRow label="รหัสอุปกรณ์" value={data.assetCodes.join(", ") || "-"} />
            <DetailRow label="จำนวน" value={`${data.quantity} รายการ`} />
            <DetailRow label="เหตุผลในการยืม" value={data.purpose} />
            <DetailRow label="สถานที่ใช้งาน" value={data.location} />
            <DetailRow label="ผู้ดำเนินการ" value={data.staffName || "-"} />
            <DetailRow label="วันที่ยืม" value={formatDate(data.startDate)} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 flex justify-center border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full max-w-[180px] bg-[#40A9FF] hover:bg-[#1890FF] text-white py-3.5 rounded-2xl text-[18px] font-bold transition-all shadow-md active:scale-95"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-4">
      <span className="text-[#8C8C8C] text-[16px]">{label}</span>
      <span className="text-[#1F1F1F] text-[16px] font-medium leading-relaxed">{value}</span>
    </div>
  );
}