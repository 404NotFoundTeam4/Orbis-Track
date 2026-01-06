
/**
 * Description: Service สำหรับจัดการ “ภาษาแอป” ฝั่ง Frontend โดยเก็บค่าไว้ใน localStorage
 * - ใช้ KEY เดียวกันทั้งอ่าน/เขียน เพื่อให้หน้า Settings และส่วนอื่น ๆ ของระบบเรียกใช้ร่วมกันได้
 * - ไม่มีการเรียก Backend 
 * Author : Chanwit Muangma (Boom) 66160224
 */

export type AppLanguage = "th" | "en";

/**
 * Description: Key ที่ใช้เก็บค่าภาษาใน localStorage
 * Note      : ห้ามเปลี่ยนชื่อ KEY หากมีการใช้งานในหลายหน้า/หลาย module เพราะจะทำให้ค่าเดิมอ่านไม่เจอ
 * Author    : Chanwit Muangma (Boom) 66160224
 */
const KEY = "app_language";

/**
 * Description: อ่านค่าภาษาปัจจุบันจาก localStorage
 * Input     : -
 * Output    : AppLanguage ("th" | "en")
 * Note      : ถ้าไม่พบค่า หรือค่าไม่ใช่ "en" จะ fallback เป็น "th" (default)
 * Author    : Chanwit Muangma (Boom) 66160224
 */
export function getLanguage(): AppLanguage {
  const v = localStorage.getItem(KEY);
  return v === "en" ? "en" : "th"; // default th
}

/**
 * Description: บันทึกค่าภาษาใหม่ลง localStorage เพื่อให้แอปจำค่าที่ผู้ใช้เลือกได้
 * Input     : lang: AppLanguage ("th" | "en")
 * Output    : void
 * Note      : ยังไม่ได้ทำให้เปลี่ยนภาษาได้จริง
 * Author    : Chanwit Muangma (Boom) 66160224
 */
export function setLanguage(lang: AppLanguage) {
  localStorage.setItem(KEY, lang);
}