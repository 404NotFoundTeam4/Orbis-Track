import { prisma } from "../../infrastructure/database/client.js";

export async function getUserById(id: number) {
    return prisma.users.findUnique({
        where: { user_id: id },
        select: {
            user_id: true,
            firstname: true,
            lastname: true,
            username: true,
            email: true,
            phone: true,
            images: true,
            role_id: true,
            dept_id: true,
            sec_id: true,
            is_active: true,
            created_at: true,
            updated_at: true,
        },
    });
}