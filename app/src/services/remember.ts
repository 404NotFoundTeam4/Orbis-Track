
const accessTokenKey = "token";

/**
 * Function: DecodeJwtPayload
 * Features:
 *  - แปลงข้อมูลส่วน payload ของ JWT (Base64URL → JSON)
 *  - แยก token เป็น 3 ส่วน (header,payload,signature)
 *  - decode เฉพาะ payload
 *  - คืนค่าเป็น object หรือ null หากไม่ถูกต้อง
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
function DecodeJwtPayload(token: string): any | null {
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    console.error("decodeJwtPayload error:", e);
    return null;
  }
}

/**
 * Function: IsTokenExpired
 * Features:
 *  - ตรวจสอบว่า JWT token หมดอายุหรือไม่ จากค่า exp (วินาที)
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export function IsTokenExpired(token: string): boolean {
  const payload = DecodeJwtPayload(token);
  if (!payload || !payload.exp) return true;

  const nowInSec = Math.floor(Date.now() / 1000);

  return payload.exp <= nowInSec;
}

/**
 * Function: SaveToken
 * Features:
 *  - บันทึก Token ลง storage ตามตัวเลือก จำฉันไว้ (Remember me)
 * 
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const SaveToken = (token: string, isRemember: boolean) => {
  if (IsTokenExpired(token)) {
    ClearToken();
    return;
  }

  if (isRemember) {
    localStorage.setItem(accessTokenKey, token);
    sessionStorage.removeItem(accessTokenKey);
  } else {
    // Force save to localStorage as requested
    localStorage.setItem(accessTokenKey, token);
    sessionStorage.removeItem(accessTokenKey);
  }
};

/**
 * Function: GetValidToken
 * Features:
 *  - ดึง token ที่ยังไม่หมดอายุจาก sessionStorage หรือ localStorage
 * 
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const GetValidToken = (): string | null => {
  let token = sessionStorage.getItem(accessTokenKey);
  if (!token) token = localStorage.getItem(accessTokenKey);
  if (!token) return null;

  if (IsTokenExpired(token)) {
    ClearToken();
    return null;
  }

  return token;
};
/**
 * Function: ClearToken
 * Features:
 *  - ลบ token ออกจากทั้ง sessionStorage และ localStorage
 * 
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const ClearToken = () => {
  localStorage.removeItem(accessTokenKey);
  sessionStorage.removeItem(accessTokenKey);
};
