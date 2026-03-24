import { jsPDF } from "jspdf";

/**
 * Description: โหลดไฟล์ฟอนต์ .ttf จาก public และแปลงเป็น base64 string สำหรับใช้งานกับ jsPDF
 * Input : fontUrl
 * Output: base64 string ของไฟล์ฟอนต์
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function loadFontAsBase64(fontUrl: string) {
  const response = await fetch(fontUrl);
  const buffer = await response.arrayBuffer();

  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

/**
 * Description: ลงทะเบียนฟอนต์ภาษาไทยให้กับเอกสาร jsPDF และตั้งเป็นฟอนต์เริ่มต้น
 * Input : doc
 * Output: doc ที่พร้อมใช้งานฟอนต์ภาษาไทย
 * Author: Chanwit Muangma (Boom) 66160224
 */
export async function registerThaiFont(doc: jsPDF) {
  const fontBase64 = await loadFontAsBase64("/fonts/Sarabun-Regular.ttf");

  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun", "normal");
}