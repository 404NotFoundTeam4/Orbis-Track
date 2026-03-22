import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

type ExportDashboardModalProps = {
  open: boolean;
  defaultFileName?: string;
  onClose: () => void;
  onConfirm: (fileName: string) => void;
};

/**
 * Description: แสดง Modal สำหรับส่งออกข้อมูล Dashboard โดยให้ผู้ใช้กรอกชื่อไฟล์และยืนยันการ Export เป็น Excel
 * Input : open, defaultFileName, onClose, onConfirm
 * Output: แสดงหน้าต่าง Modal สำหรับกรอกชื่อไฟล์และเรียก callback เมื่อผู้ใช้กด Export
 * Author: Chanwit Muangma (Boom) 66160224
 */
export default function ExportDashboardModal({
  open,
  defaultFileName = "dashboard-device-report",
  onClose,
  onConfirm,
}: ExportDashboardModalProps) {
  const [fileName, setFileName] = useState(defaultFileName);

  /**
   * Description: รีเซ็ตชื่อไฟล์เริ่มต้นทุกครั้งเมื่อ Modal ถูกเปิด
   * Input : open, defaultFileName
   * Output: อัปเดตค่า fileName ให้กลับเป็นค่าเริ่มต้น
   * Author: Chanwit Muangma (Boom) 66160224
   */
  useEffect(() => {
    if (open) setFileName(defaultFileName);
  }, [open, defaultFileName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-4">
      <div className="relative w-full max-w-[500px] rounded-[20px] bg-white p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-[32px] font-bold text-black">Export File</h2>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center text-black"
            aria-label="close"
          >
            <svg viewBox="0 0 35 35" className="h-7 w-7" aria-hidden="true">
              <path
                d="M10.6937 24.3024C10.5297 24.1383 10.4375 23.9158 10.4375 23.6838C10.4375 23.4518 10.5297 23.2293 10.6937 23.0652L16.2622 17.4967L10.6937 11.9282C10.5343 11.7632 10.4461 11.5421 10.4481 11.3127C10.4501 11.0833 10.5421 10.8638 10.7043 10.7016C10.8666 10.5394 11.086 10.4473 11.3155 10.4453C11.5449 10.4434 11.7659 10.5315 11.9309 10.6909L17.4994 16.2594L23.0679 10.6909C23.233 10.5315 23.454 10.4434 23.6834 10.4453C23.9128 10.4473 24.1323 10.5394 24.2945 10.7016C24.4568 10.8638 24.5488 11.0833 24.5508 11.3127C24.5528 11.5421 24.4646 11.7632 24.3052 11.9282L18.7367 17.4967L24.3052 23.0652C24.4646 23.2302 24.5528 23.4512 24.5508 23.6807C24.5488 23.9101 24.4568 24.1295 24.2945 24.2918C24.1323 24.454 23.9128 24.546 23.6834 24.548C23.454 24.55 23.233 24.4618 23.0679 24.3024L17.4994 18.7339L11.9309 24.3024C11.7669 24.4665 11.5443 24.5586 11.3123 24.5586C11.0803 24.5586 10.8578 24.4665 10.6937 24.3024Z"
                fill="currentColor"
              />
              <path
                d="M17.5 35C27.1652 35 35 27.1652 35 17.5C35 7.83475 27.1652 0 17.5 0C7.83475 0 0 7.83475 0 17.5C0 27.1652 7.83475 35 17.5 35ZM17.5 33.25C26.1984 33.25 33.25 26.1984 33.25 17.5C33.25 8.80163 26.1984 1.75 17.5 1.75C8.80163 1.75 1.75 8.80163 1.75 17.5C1.75 26.1984 8.80163 33.25 17.5 33.25Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="mt-8">
          <label className="mb-2 block text-[18px] font-semibold text-black">
            ชื่อไฟล์
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="กรอกชื่อไฟล์"
            className="h-[52px] w-full rounded-[16px] border border-[#D9D9D9] px-4 text-[16px] outline-none placeholder:text-[#BFBFBF] focus:border-[#40A9FF]"
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-[18px] font-semibold text-black">
            ประเภทไฟล์
          </label>

          <div className="flex h-[76px] w-[200px] items-center gap-3 rounded-[16px] border border-[#40A9FF] bg-[#E6F4FF] px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white">
              <Icon
                icon="vscode-icons:file-type-excel"
                className="text-[28px]"
              />
            </div>
            <span className="text-[18px] font-medium text-black">
              Excel File
            </span>
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] min-w-[110px] rounded-full bg-[#E5E7EB] px-6 text-[18px] font-semibold text-[#4B5563]"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={!fileName.trim()}
            onClick={() => onConfirm(fileName.trim())}
            className="h-[48px] min-w-[110px] rounded-full bg-[#40A9FF] px-6 text-[18px] font-semibold text-white disabled:opacity-60"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}