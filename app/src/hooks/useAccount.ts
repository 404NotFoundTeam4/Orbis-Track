/**
 * File: useAccount.ts
 * Description:
 *  - จัดการดึงข้อมูลบัญชีผู้ใช้จาก API
 *  - บันทึกข้อมูลผู้ใช้ลง localStorage และ sessionStorage
 *  - แจ้งเตือนระบบเมื่อข้อมูลผู้ใช้ถูกอัปเดต
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */

import { UserData } from "../services/AccountService.js";
import { GetValidToken } from "../services/Remember.js";

/**
 * Function: getAccount
 * Description:
 *  - ดึง token ที่ยังใช้งานได้
 *  - เรียก API เพื่อดึงข้อมูลผู้ใช้
 *  - อัปเดตข้อมูล User ใน storage
 *  - dispatch event เพื่อแจ้ง component อื่น ๆ ให้ sync ข้อมูลใหม่
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export async function getAccount() {
  const validToken = GetValidToken();
  const User = await UserData(validToken);

  localStorage.removeItem("User");
  localStorage.setItem("User", JSON.stringify(User));
  sessionStorage.setItem("User", JSON.stringify(User));

  window.dispatchEvent(new Event("user-updated"));
}

/**
 * Constant: Account
 * Description:
 *  - รวม function ที่เกี่ยวข้องกับ account
 *  - ใช้ export แบบ object เพื่อเรียกใช้งานได้สะดวก
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const Account = { getAccount };
