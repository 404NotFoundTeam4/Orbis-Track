import { users } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";

/**
 * Description: ดึง role ของผู้ใช้ทั้งหมดจากฐานข้อมูล (ไม่ซ้ำ)
 * Input : void
 * Output : object { roles: Array<{ us_role: string }> }
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
async function getAllUserRoles() {
  // ดึง role ของผู้ใช้ทั้งหมด ใช้ distinct เพื่อเอา role ซ้ำออก
  const [roles] = await Promise.all([
    prisma.users.findMany({
      select: {
        us_role: true,
      },
      distinct: ["us_role"],
    }),
  ]);

  return {
    roles,
  };
}

export const roleService = { getAllUserRoles };
