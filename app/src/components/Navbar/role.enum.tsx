export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  STAFF = "STAFF",
}

export const UserRoleTH: Record<UserRole, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  USER: "ผู้ใช้งาน",
  STAFF: "เจ้าหน้าที่",
};
