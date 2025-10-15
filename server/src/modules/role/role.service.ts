import { users } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";

// async function getAllUserRoles() {
//   const roles = await prisma.users.findMany({
//     select: {
//       us_role: true,
//     },
//     distinct: ['us_role'], // ✅ ไม่ให้ role ซ้ำกัน
//   });

//   // แปลงให้ง่ายต่อการใช้งาน เช่น ['admin', 'user', 'manager']
//   return roles.map((r) => r.us_role);
// }

async function getAllUserRoles() {
    const [roles] = await Promise.all([
        prisma.users.findMany({
            select: {
                us_role: true,
            },
            distinct: ['us_role'],
        }),
    ]);

    return ({
        roles,
    })
}

export const roleService = { getAllUserRoles };