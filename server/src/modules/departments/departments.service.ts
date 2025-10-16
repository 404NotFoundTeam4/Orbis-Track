import { departments } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";

async function getAllDepartment() {
    const [departments] = await Promise.all([
        prisma.departments.findMany({
            select: {
                dept_id: true,
                dept_name: true
            }
        }),
    ]);

    return ({
        departments,
    })
}

async function getSectionById(id: number) {
    return prisma.sections.findMany({
        where: { sec_dept_id: id },
        select: {
            sec_id: true,
            sec_name: true,
            sec_dept_id: true,
        },
    });
}

export const departmentService = { getAllDepartment, getSectionById };
