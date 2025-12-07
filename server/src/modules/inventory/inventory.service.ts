import { prisma } from "../../infrastructure/database/client.js";
import { IdParamDto } from "./inventory.schema.js";

/**
 * ดึงข้อมูลอุปกรณ์ตาม ID
 */
async function getDeviceById(params: IdParamDto) {
    const { id } = params;
    
    // ค้นหาและ Join ตาราง
    const device = await prisma.devices.findUnique({ 
        where: { de_id: id },
        include: {
            category: true, 
            section: {      
                include: {
                    department: true // Join departments ต่อจาก section
                }
            },
            _count: {       // นับจำนวนลูก (items) ใน device_childs
                select: { device_childs: true }
            }
        }
    });
    
    if (!device) throw new Error("Device not found");

    // จัดรูปแบบข้อมูล (Flatten Data) ก่อนส่งกลับ
    return {
        ...device,
        category_name: device.category?.ca_name || "-",
        sub_section_name: device.section?.sec_name || "-",
        department_name: device.section?.department?.dept_name || "-",
        quantity: device._count.device_childs // ดึงจำนวนที่นับได้
    };
}

/**
 * ดึงข้อมูลอุปกรณ์ทั้งหมด
 */
async function getAllDevices() {
    const devices = await prisma.devices.findMany({
        where: {
            deleted_at: null 
        },
        include: {
            category: true,
            section: {
                include: {
                    department: true
                }
            },
            _count: {
                select: { device_childs: true }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    const formattedDevices = devices.map((item) => {
        return {
            ...item,
            category_name: item.category?.ca_name || "-",
            sub_section_name: item.section?.sec_name || "-",
            department_name: item.section?.department?.dept_name || "-",
            quantity: item._count.device_childs // ใช้ค่าที่นับได้จากตาราง device_childs
        };
    });

    return formattedDevices;
}

/**
 * ลบอุปกรณ์ (Soft Delete)
 */
export async function softDeleteDevice(de_id: number) {
    const device = await prisma.devices.findUnique({ where: { de_id } });
    if (!device) throw new Error("Device not found");

    const updated = await prisma.devices.update({
        where: { de_id },
        data: {
            deleted_at: new Date(),
        },
        select: { de_id: true, deleted_at: true },
    });

    return {
        de_id: updated.de_id,
        deletedAt: updated.deleted_at
    };
}

export const inventoryService = { 
    getDeviceById, 
    getAllDevices, 
    softDeleteDevice 
};