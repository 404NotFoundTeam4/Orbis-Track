import * as XLSX from "xlsx";
import type { LinePoint } from "../components/LineChartCard";
import type {
  MostBorrowedPoint,
  OverdueTicket,
} from "../services/dashboard";

type RepairChartItem = {
  name: string;
  value: number;
};

type ExportDashboardExcelPayload = {
  fileName: string;
  borrowMonthData: LinePoint[];
  issueLineData: LinePoint[];
  mostBorrowedData: MostBorrowedPoint[];
  repairChartData: RepairChartItem[];
  overdueTableData: OverdueTicket[];
  year: number;
  quarterLabel: string;
};

/**
 * Description: แปลงชื่อไฟล์ให้อยู่ในรูปแบบที่ปลอดภัยต่อการสร้างไฟล์ โดยแทนที่อักขระต้องห้ามและช่องว่าง
 * Input : fileName
 * Output: ชื่อไฟล์ที่พร้อมใช้งานสำหรับ export
 * Author: Chanwit Muangma (Boom) 66160224
 */
function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_");
}

/**
 * Description: แปลงค่าวันที่ให้อยู่ในรูปแบบวันที่ภาษาไทยสำหรับแสดงในไฟล์ Excel
 * Input : value
 * Output: วันที่ในรูปแบบ dd/mm/yyyy หรือ "-" หากไม่มีข้อมูล
 * Author: Chanwit Muangma (Boom) 66160224
 */
function formatExcelDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Description: ส่งออกข้อมูล Dashboard เป็นไฟล์ Excel โดยแยกข้อมูลออกเป็นหลาย Sheet ตามประเภทข้อมูล
 * Input : fileName, borrowMonthData, issueLineData, mostBorrowedData, repairChartData, overdueTableData, year, quarterLabel
 * Output: สร้างไฟล์ Excel (.xlsx) จากข้อมูล Dashboard
 * Author: Chanwit Muangma (Boom) 66160224
 */
export function exportDashboardToExcel({
  fileName,
  borrowMonthData,
  issueLineData,
  mostBorrowedData,
  repairChartData,
  overdueTableData,
  year,
  quarterLabel,
}: ExportDashboardExcelPayload) {
  const safeName = sanitizeFileName(fileName || "dashboard-report");
  const workbook = XLSX.utils.book_new();

  // Sheet 1: ข้อมูลการส่งออก
  const infoSheet = XLSX.utils.json_to_sheet([
    {
      ปี: year,
      ช่วงเวลา: quarterLabel,
      วันที่ส่งออก: new Date().toLocaleString("th-TH"),
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, infoSheet, "ข้อมูลแดชบอร์ด");

  // Sheet 2: สถิติการยืม
  const borrowSheet = XLSX.utils.json_to_sheet(
    borrowMonthData.map((item) => ({
      เดือน: item.label,
      จำนวนการยืม: item.value,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, borrowSheet, "สถิติการยืม");

  // Sheet 3: สถิติการแจ้งปัญหา
  const issueSheet = XLSX.utils.json_to_sheet(
    issueLineData.map((item) => ({
      เดือน: item.label,
      จำนวนการแจ้งปัญหา: item.value,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, issueSheet, "สถิติแจ้งปัญหา");

  // Sheet 4: อุปกรณ์ที่ถูกยืมมากที่สุด
  const mostBorrowedSheet = XLSX.utils.json_to_sheet(
    mostBorrowedData.map((item, index) => ({
      ลำดับ: index + 1,
      ชื่ออุปกรณ์: item.equipmentName,
      จำนวนครั้งที่ถูกยืม: item.value,
    })),
  );
  XLSX.utils.book_append_sheet(
    workbook,
    mostBorrowedSheet,
    "อุปกรณ์ที่ถูกยืมมากสุด",
  );

  // Sheet 5: สถานะงานซ่อม
  const repairSheet = XLSX.utils.json_to_sheet(
    repairChartData.map((item) => ({
      สถานะงานซ่อม: item.name,
      จำนวน: item.value,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, repairSheet, "สถานะงานซ่อม");

  // Sheet 6: รายการเกินกำหนด
  const overdueSheet = XLSX.utils.json_to_sheet(
    overdueTableData.map((item, index) => ({
      ลำดับ: index + 1,
      รหัสใบยืม: item.ticketId,
      ชื่อผู้ยืม: item.userName,
      อีเมล: item.userEmail,
      รหัสพนักงาน: item.userEmpCode ?? "-",
      บทบาทผู้ใช้: item.userRole,
      แผนก: item.department ?? "-",
      Section: item.section ?? "-",
      เบอร์โทร: item.phone,
      ชื่ออุปกรณ์: item.equipments.join(", "),
      หมวดหมู่: item.categories.join(", "),
      รหัสทรัพย์สิน: item.assetCodes.join(", "),
      จำนวน: item.quantity,
      วัตถุประสงค์: item.purpose,
      สถานที่ใช้งาน: item.location,
      ผู้ดูแล: item.staffName ?? "-",
      จำนวนวันเกินกำหนด: item.delayedDays,
      วันที่ต้องคืน: formatExcelDate(item.returnDate),
      วันที่เริ่มยืม: formatExcelDate(item.startDate),
    })),
  );
  XLSX.utils.book_append_sheet(workbook, overdueSheet, "รายการเกินกำหนด");

  XLSX.writeFile(workbook, `${safeName}.xlsx`);
}