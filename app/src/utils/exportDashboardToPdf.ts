import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { LinePoint } from "../components/LineChartCard";
import type {
  MostBorrowedPoint,
  OverdueTicket,
} from "../services/dashboard";
import { registerThaiFont } from "./pdfFont";

type RepairChartItem = {
  name: string;
  value: number;
};

type ExportDashboardPdfPayload = {
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
 * Description: แปลงค่าวันที่ให้อยู่ในรูปแบบวันที่ภาษาไทยสำหรับแสดงในไฟล์ PDF
 * Input : value
 * Output: วันที่ในรูปแบบ dd/mm/yyyy หรือ "-" หากไม่มีข้อมูล
 * Author: Chanwit Muangma (Boom) 66160224
 */
function formatPdfDate(value?: string | null) {
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
 * Description: ดึงตำแหน่งแกน Y ล่าสุดหลังจากวาดตารางด้วย autoTable เพื่อใช้วางตารางถัดไป
 * Input : doc, fallbackY
 * Output: ค่าแกน Y ล่าสุดของเอกสาร PDF
 * Author: Chanwit Muangma (Boom) 66160224
 */
function getLastAutoTableY(doc: jsPDF, fallbackY: number) {
  const pdfDoc = doc as jsPDF & {
    lastAutoTable?: { finalY: number };
  };

  return pdfDoc.lastAutoTable?.finalY ?? fallbackY;
}

/**
 * Description: ส่งออกข้อมูล Dashboard เป็นไฟล์ PDF โดยสรุปข้อมูลเป็นหลายตารางตามประเภทข้อมูล
 * Input : fileName, borrowMonthData, issueLineData, mostBorrowedData, repairChartData, overdueTableData, year, quarterLabel
 * Output: สร้างไฟล์ PDF (.pdf) จากข้อมูล Dashboard
 * Author: Chanwit Muangma (Boom) 66160224
 */
export async function exportDashboardToPdf({
  fileName,
  borrowMonthData,
  issueLineData,
  mostBorrowedData,
  repairChartData,
  overdueTableData,
  year,
  quarterLabel,
}: ExportDashboardPdfPayload) {
  const safeName = sanitizeFileName(fileName || "dashboard-report");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  await registerThaiFont(doc);

  let currentY = 14;

  doc.setFont("Sarabun", "normal");
  doc.setFontSize(16);
  doc.text("รายงานแดชบอร์ด", 14, currentY);

  currentY += 8;
  doc.setFont("Sarabun", "normal");
  doc.setFontSize(11);
  doc.text(`ปี: ${year}`, 14, currentY);

  currentY += 6;
  doc.text(`ช่วงเวลา: ${quarterLabel}`, 14, currentY);

  currentY += 6;
  doc.text(`วันที่ส่งออก: ${new Date().toLocaleString("th-TH")}`, 14, currentY);

  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [["รายการ", "จำนวน"]],
    body: [
      ["ข้อมูลการยืม", String(borrowMonthData.length)],
      ["ข้อมูลการแจ้งปัญหา", String(issueLineData.length)],
      ["อุปกรณ์ที่ถูกยืมมากที่สุด", String(mostBorrowedData.length)],
      ["สถานะงานซ่อม", String(repairChartData.length)],
      ["รายการเกินกำหนด", String(overdueTableData.length)],
    ],
    styles: {
      font: "Sarabun",
      fontSize: 10,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [88, 179, 255],
      textColor: 255,
      font: "Sarabun",
      fontStyle: "normal",
    },
  });

  currentY = getLastAutoTableY(doc, currentY) + 8;

  autoTable(doc, {
    startY: currentY,
    head: [["เดือน", "จำนวนการยืม"]],
    body: borrowMonthData.map((item) => [item.label, String(item.value)]),
    styles: {
      font: "Sarabun",
      fontSize: 10,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [88, 179, 255],
      textColor: 255,
      font: "Sarabun",
      fontStyle: "normal",
    },
  });

  currentY = getLastAutoTableY(doc, currentY) + 8;

  autoTable(doc, {
    startY: currentY,
    head: [["เดือน", "จำนวนการแจ้งปัญหา"]],
    body: issueLineData.map((item) => [item.label, String(item.value)]),
    styles: {
      font: "Sarabun",
      fontSize: 10,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [88, 179, 255],
      textColor: 255,
      font: "Sarabun",
      fontStyle: "normal",
    },
  });

  currentY = getLastAutoTableY(doc, currentY) + 8;

  autoTable(doc, {
    startY: currentY,
    head: [["ลำดับ", "ชื่ออุปกรณ์", "จำนวนครั้งที่ถูกยืม"]],
    body: mostBorrowedData.map((item, index) => [
      String(index + 1),
      item.equipmentName,
      String(item.value),
    ]),
    styles: {
      font: "Sarabun",
      fontSize: 10,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [88, 179, 255],
      textColor: 255,
      font: "Sarabun",
      fontStyle: "normal",
    },
  });

  currentY = getLastAutoTableY(doc, currentY) + 8;

  autoTable(doc, {
    startY: currentY,
    head: [["สถานะงานซ่อม", "จำนวน"]],
    body: repairChartData.map((item) => [item.name, String(item.value)]),
    styles: {
      font: "Sarabun",
      fontSize: 10,
      fontStyle: "normal",
    },
    headStyles: {
      fillColor: [88, 179, 255],
      textColor: 255,
      font: "Sarabun",
      fontStyle: "normal",
    },
  });

  currentY = getLastAutoTableY(doc, currentY) + 10;

  autoTable(doc, {
    startY: currentY,
    head: [[
      "รหัสใบยืม",
      "ชื่อผู้ยืม",
      "ชื่ออุปกรณ์",
      "จำนวน",
      "วันเกินกำหนด",
      "วันที่ต้องคืน",
    ]],
    body: overdueTableData.map((item) => [
      String(item.ticketId),
      item.userName,
      item.equipments.join(", "),
      String(item.quantity),
      String(item.delayedDays),
      formatPdfDate(item.returnDate),
    ]),
    styles: {
      font: "Sarabun",
      fontSize: 8,
      fontStyle: "normal",
      cellWidth: "wrap",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [88, 179, 255],
      textColor: 255,
      font: "Sarabun",
      fontStyle: "normal",
    },
    margin: { left: 8, right: 8 },
  });

  doc.save(`${safeName}.pdf`);
}