export enum UserRole {
  ADMIN = "ADMIN",
  HEADDEPT = "HOD",
  HEADSEC = "HOS",
  TECHNICAL = "TECHNICAL",
  STAFF = "STAFF",
  USER = "EMPLOYEE",
}

export const UserRoleTH: Record<UserRole, string> = {
  [UserRole.ADMIN]: "แอดมิน",
  [UserRole.HEADDEPT]: "หัวหน้าแผนก",
  [UserRole.HEADSEC]: "หัวหน้าฝ่ายย่อย",
  [UserRole.TECHNICAL]: "ช่างเทคนิค",
  [UserRole.STAFF]: "เจ้าหน้าที่",
  [UserRole.USER]: "พนักงาน",
};
