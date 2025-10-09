import { departments } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";

async function getUserById(id: number) {
    return prisma.users.findUnique({
        where: { us_id: id },
        select: {
            us_id: true,
            us_firstname: true,
            us_lastname: true,
            us_username: true,
            us_email: true,
            us_phone: true,
            us_images: true,
            us_role: true,
            us_dept_id: true,
            us_sec_id: true,
            us_is_active: true,
            created_at: true,
            updated_at: true,
        },
    });
}

/**
 * Description: ดึงข้อมูลพนักงานพร้อมแผนก และฝ่ายย่อย
 * Input : -
 * Output : ข้อมูลพนักงานพร้อมแนก และฝ่ายย่อย
 * Author: Thakdanai Makmi (Ryu) 66160355
*/

async function getAllUsers() {
    const [departments, sections, users] = await Promise.all([
        prisma.departments.findMany({
            select: {
                dept_id: true,
                dept_name: true
            }
        }),
        prisma.sections.findMany({
            select: {
                sec_id: true,
                sec_name: true,
                sec_dept_id: true
            }
        }),
        prisma.users.findMany({
            select: {
                us_id: true,
                us_emp_code: true,
                us_firstname: true,
                us_lastname: true,
                us_username: true,
                us_email: true,
                us_phone: true,
                us_images: true,
                us_role: true,
                us_dept_id: true,
                us_sec_id: true,
                us_is_active: true
            }
        })
    ]);

    // แปลงแผนกและฝ่ายย่อยเป็นข้อความ
    const userWithDetails = users.map((user) => {
        // หา dept_id ที่ตรงกับ us_dept_id
        const deptpartment = departments.find((data) => data.dept_id === user.us_dept_id);
        // หา sec_id ที่ตรงกับ us_sec_id
        const section = sections.find((data) => data.sec_id === user.us_sec_id);

        // คืนค่าพร้อมขื่อแผนกและฝ่ายย่อย
        return {
            ...user,
            us_dept_name: deptpartment?.dept_name,
            us_sec_name: section?.sec_name
        }
    })

    return ({
        departments,
        sections,
        userWithDetails
    })
}

// // await argon2.hash(data.password);
// async function createUser(data: {
//     emp_code?: string;
//     firstname: string;
//     lastname: string;
//     username: string;
//     password: string; // hash ก่อน
//     email?: string;
//     phone?: string;
//     images?: string;
//     role_id: number;
//     dept_id?: number;
//     sec_id?: number;
// }) {
//     return prisma.users.create({
//         data: {
//             ...data,
//             created_at: new Date(),
//             updated_at: new Date(),
//         },
//         select: {
//             us_id: true,
//             us_firstname: true,
//             us_lastname: true,
//             us_username: true,
//             us_email: true,
//             us_phone: true,
//             us_role: true,
//             us_dept_id: true,
//             us_sec_id: true,
//             us_is_active: true,
//             created_at: true,
//             updated_at: true,
//         },
//     });
// }

export const userService = { getUserById, getAllUsers};