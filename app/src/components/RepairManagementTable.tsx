import { Icon } from "@iconify/react";
import type { RepairItem } from "../services/RepairService";

type SortField =
  | "device_name"
  | "quantity"
  | "category"
  | "requester"
  | "request_date"
  | "status";

type SortDirection = "asc" | "desc";

type RepairManagementTableProps = {
  items: RepairItem[];
  loading?: boolean;
  onSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => string;
  onOpenAction: (item: RepairItem) => void;
};

/**
 * Description: ตารางสำหรับการจัดการคำขอซ่อมแซม รวมถึงการจัดเรียงและแสดงข้อมูลการซ่อมแซม
 * - แสดงตารางพร้อมหัวข้อสำหรับชื่ออุปกรณ์, จำนวน, หมวดหมู่, ผู้ขอ, วันที่ขอ, และสถานะ
 * - รองรับการจัดเรียงตามแต่ละฟิลด์
 * - แสดงปุ่มเพื่อเปิดรายละเอียดสำหรับรายการซ่อม
 * Input     : RepairManagementTableProps (items, loading, onSort, getSortIcon, onOpenAction)
 * Output    : JSX.Element (Repair Management Table)
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export default function RepairManagementTable({
  items,
  loading = false,
  onSort,
  getSortIcon,
  onOpenAction,
}: Readonly<RepairManagementTableProps>) {
  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-[#D8D8D8] bg-white p-6 text-center text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  // กำหนด Grid ให้ตรงกันทั้ง Header และ Body
  const gridLayout = "grid grid-cols-[2.2fr_0.8fr_1.2fr_1.8fr_1.2fr_1fr] items-center gap-4 px-8";

  return (
    <div className="w-full flex flex-col gap-4"> {/* เพิ่ม gap เพื่อแยกส่วนบนกับล่าง */}
      
      {/* ส่วนหัวตาราง (Header) แยกเป็นหนึ่ง Card */}
      <div className={`${gridLayout} h-[61px] bg-white border border-[#D9D9D9] rounded-[16px] font-medium text-[#000000] items-center px-4 pl-6`}>
        <div className="flex items-center">
          อุปกรณ์ที่ยืม
          <button type="button" onClick={() => onSort("device_name")}>
            <Icon icon={getSortIcon("device_name")} width="24" height="24" className="ml-1" />
          </button>
        </div>
        <div className="flex items-center">
          จำนวน
          <button type="button" onClick={() => onSort("quantity")}>
            <Icon icon={getSortIcon("quantity")} width="24" height="24" className="ml-1" />
          </button>
        </div>
        <div className="flex items-center">
          หมวดหมู่
          <button type="button" onClick={() => onSort("category")}>
            <Icon icon={getSortIcon("category")} width="24" height="24" className="ml-1" />
          </button>
        </div>
        <div className="flex items-center">
          ชื่อผู้ร้องขอ
          <button type="button" onClick={() => onSort("requester")}>
            <Icon icon={getSortIcon("requester")} width="24" height="24" className="ml-1" />
          </button>
        </div>
        <div className="flex items-center">
          วันที่ร้องขอ
          <button type="button" onClick={() => onSort("request_date")}>
            <Icon icon={getSortIcon("request_date")} width="24" height="24" className="ml-1" />
          </button>
        </div>
      </div>
  
      {/* ส่วนเนื้อหา (Body) แยกแต่ละแถวหรือรวมเป็นหนึ่ง Card ตามต้องการ */}
      <div className="border bg-[#FFFFFF] border-[#D9D9D9] rounded-2xl">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            ไม่พบข้อมูลการแจ้งซ่อม
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`${gridLayout} py-5 hover:bg-gray-50 transition-colors`}
            >
              <div className="text-[15px] text-black">
                <div className="font-medium text-gray-800">{item.device_name}</div>
                <div className="text-[13px] text-gray-400">{item.title || "รหัส : PJ"}</div>
              </div>
              <div className="text-[15px] text-gray-700 font-medium">{item.quantity}</div>
              <div className="text-[15px] text-gray-600">{item.category}</div>
              <div className="text-[15px] text-gray-700">
                <div className="font-medium">{item.requester_name}</div>
                <div className="text-[13px] text-gray-400">{item.requester_emp_code ?? "-"}</div>
              </div>
              <div className="text-[15px] text-gray-700">
                <div>{new Date(item.request_date).toLocaleDateString("th-TH")}</div>
                <div className="text-[12px] text-blue-500">
                   เวลา : {new Date(item.request_date).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenAction(item)}
                  className="rounded-full bg-[#F44336] px-6 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors shadow-sm"
>
                  แจ้งซ่อม
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
