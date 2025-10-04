import { prisma } from "../../infrastructure/database/client.js";

async function getUserById(id: number) {
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

//ADD
async function getAllUsers() {
    return prisma.users.findMany({
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

// await argon2.hash(data.password);
async function createUser(data: {
    emp_code?: string;
    firstname: string;
    lastname: string;
    username: string;
    password: string; // hash ก่อน
    email?: string;
    phone?: string;
    images?: string;
    role_id: number;
    dept_id?: number;
    sec_id?: number;
}) {
    return prisma.users.create({
        data: {
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
        },
        select: {
            user_id: true,
            firstname: true,
            lastname: true,
            username: true,
            email: true,
            phone: true,
            role_id: true,
            dept_id: true,
            sec_id: true,
            is_active: true,
            created_at: true,
            updated_at: true,
        },
    });
}

export const userService = { getUserById, createUser, getAllUsers};