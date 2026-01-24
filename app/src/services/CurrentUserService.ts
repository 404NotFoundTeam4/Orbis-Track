// src/services/CurrentUserService.ts
import api from "../api/axios.js";

/**
 * Description: Role ที่ frontend ใช้สำหรับควบคุมการแสดงผล (ควรให้ตรงกับ US_ROLE ของ backend)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type UserRole =
  | "ADMIN"
  | "STAFF"
  | "HOD"
  | "HOS"
  | "TECHNICAL"
  | "EMPLOYEE"
  | string;

/**
 * Description: ข้อมูลผู้ใช้ปัจจุบันขั้นต่ำที่หน้า UI ต้องใช้ (role + scope)
 * Author: Chanwit Muangma (Boom) 66160224
 */
export type CurrentUserProfile = {
  userId: number;
  userRole: UserRole;
  departmentId: number | null;
  sectionId: number | null;
};

/**
 * Description: แกะ payload ของ fetch-me ให้ได้ CurrentUserProfile ที่หน้า UI ใช้งานได้
 * - รองรับหลายรูปแบบ:
 *   1) { success, message, data: { us_id, us_role, ... } }
 *   2) { success, message, data: { user: { us_id, us_role, ... } } }
 *   3) { us_id, us_role, ... } (กรณี backend ไม่ห่อ)
 *
 * Input : payload (any)
 * Output : CurrentUserProfile
 * Author: Chanwit Muangma (Boom) 66160224
 */
function unwrapCurrentUserProfilePayload(payload: any): CurrentUserProfile {
  // normalizedPayload: รองรับกรณี backend ห่อด้วย { data: ... }
  const normalizedPayload = payload?.data ?? payload;

  // userRecord: รองรับกรณี data ซ้อนเป็น { user: {...} }
  const userRecord =
    normalizedPayload?.user ??
    normalizedPayload?.currentUser ??
    normalizedPayload?.profile ??
    normalizedPayload;

  const rawUserId = userRecord?.us_id ?? userRecord?.userId ?? userRecord?.id;
  const rawUserRole =
    userRecord?.us_role ?? userRecord?.userRole ?? userRecord?.role;

  if (!rawUserId || !rawUserRole) {
    throw new Error("Invalid current user payload shape");
  }

  const rawDepartmentId =
    userRecord?.us_dept_id ?? userRecord?.departmentId ?? null;

  const rawSectionId = userRecord?.us_sec_id ?? userRecord?.sectionId ?? null;

  return {
    userId: Number(rawUserId),
    userRole: String(rawUserRole),
    departmentId:
      rawDepartmentId === null || rawDepartmentId === undefined
        ? null
        : Number(rawDepartmentId),
    sectionId:
      rawSectionId === null || rawSectionId === undefined
        ? null
        : Number(rawSectionId),
  };
}

/**
 * Description: เรียก API เพื่อดึงข้อมูลผู้ใช้ปัจจุบัน (ใช้สำหรับเช็คสิทธิ์การแสดงผลในหน้า UI)
 * - ต้องยิง path ให้ตรงกับ backend จริง ไม่เช่นนั้นจะ 404 แล้วทำให้ role เช็คไม่ได้
 *
 * Input : -
 * Output : Promise<CurrentUserProfile>
 * Author: Chanwit Muangma (Boom) 66160224
 */
async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
  const response = await api.get("/user");
  return unwrapCurrentUserProfilePayload(response.data);
}

/**
 * Description: Export service สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน
 * Author: Chanwit Muangma (Boom) 66160224
 */
export const currentUserService = {
  getCurrentUserProfile,
};
