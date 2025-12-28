export enum UserRole {
  ADMIN = "ADMIN",
  HOD = "HOD",
  HOS = "HOS",
  TECHNICAL = "TECHNICAL",
  STAFF = "STAFF",
  EMPLOYEE = "แ",
}

export const UserRoleTH: Record<UserRole, string> = {
  [UserRole.ADMIN]: "แอดมิน",
  [UserRole.HOD]: "หัวหน้าแผนก",
  [UserRole.HOS]: "หัวหน้าฝ่ายย่อย",
  [UserRole.TECHNICAL]: "ช่างเทคนิค",
  [UserRole.STAFF]: "เจ้าหน้าที่",
  [UserRole.EMPLOYEE]: "ผู้ใช้ทั่วไป",
  
};
