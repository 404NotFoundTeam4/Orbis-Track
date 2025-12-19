export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  STAFF = "STAFF",
  HOD = "HOD",
  HOS = "HOS"
}

export const UserRoleTH: Record<UserRole, string> = {
  [UserRole.ADMIN]: "ผู้ดูแลระบบ",
  [UserRole.USER]: "ผู้ใช้งาน",
  [UserRole.STAFF]: "เจ้าหน้าที่",
   [UserRole.HOD]: "หัวหน้าแผนก",
    [UserRole.HOS]: "หัวหน้าแผนกฝ่ายย่อย",
};
