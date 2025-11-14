// services/auth.storage.ts

const ACCESS_TOKEN_KEY = "token";

/** decode payload จาก JWT แบบง่าย ๆ */
function decodeJwtPayload(token: string): any | null {
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

/** ตรวจ token หมดอายุจาก exp (วินาที) */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true; // ไม่มี exp ถือว่าหมดอายุ/ไม่ใช้

  const nowInSec = Math.floor(Date.now() / 1000);
  
  return payload.exp <= nowInSec;
}

/** บันทึก token ตาม remember */
export const saveToken = (token: string, isRemember: boolean) => {
  if (isTokenExpired(token)) {
    clearToken();
    return;
  }

  if (isRemember) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

/** ดึง token ที่ยังไม่หมดอายุ (ไม่งั้นคืน null) */
export const getValidToken = (): string | null => {
  let token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearToken();
    return null;
  }

  return token;
};

export const clearToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
};
