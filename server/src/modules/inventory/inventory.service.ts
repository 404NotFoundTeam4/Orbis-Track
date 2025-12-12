import { prisma } from "../../infrastructure/database/client.js";
import { IdParamDto } from "./inventory.schema.js";

async function getDeviceById(params: IdParamDto) {
    const { id } = params;
    const device = await prisma.devices.findUnique({ 
        where: { de_id: id },
        include: {
            category: true,
            section: { include: { department: true } }, 
            device_childs: {
                select: {
                    dec_id: true,
                    dec_serial_number: true,
                    dec_status: true, 
                }
            }
        }
    });
    
    if (!device) throw new Error("Device not found");

    const deptName = device.section?.department?.dept_name || "";
    let subSecName = device.section?.sec_name || "-";
    if (deptName && subSecName.startsWith(deptName)) {
        subSecName = subSecName.replace(deptName, "").trim();
    }

    return {
        ...device,
        category_name: device.category?.ca_name || "-",
        sub_section_name: subSecName, 
        department_name: deptName, 
        
        quantity: device.device_childs.length, 
        device_childs: device.device_childs 
    };
}

async function getAllDevices() {
    const devices = await prisma.devices.findMany({
        where: { deleted_at: null },
        include: {
            category: true,
            section: { include: { department: true } }, 
            device_childs: {
                select: {
                    dec_id: true,
                    dec_serial_number: true,
                    dec_status: true 
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });

    const formattedDevices = devices.map((item) => {
        const hasBorrowedItem = item.device_childs.some(child => child.dec_status === 'BORROWED');
        const availableQuantity = item.device_childs.filter(c => c.dec_status === 'READY').length;
        const totalQuantity = item.device_childs.length;

        let statusType = 'READY';
        if (hasBorrowedItem) {
            statusType = 'BORROWED'; 
        } else if (totalQuantity > 0 && availableQuantity === 0) {
            statusType = 'OUT_OF_STOCK'; 
        } else if (totalQuantity === 0) {
            statusType = 'OUT_OF_STOCK'; 
        }

        // Logic ตัดคำเหมือนเดิม
        const deptName = item.section?.department?.dept_name || "";
        let subSecName = item.section?.sec_name || "-";
        if (deptName && subSecName.startsWith(deptName)) {
            subSecName = subSecName.replace(deptName, "").trim();
        }

        return {
            ...item,
            category_name: item.category?.ca_name || "-",
            sub_section_name: subSecName, // ชื่อฝ่ายย่อยที่ตัดแล้ว
            department_name: deptName,    
            
            quantity: totalQuantity, 
            status_type: statusType,
            device_childs: item.device_childs
        };
    });
    return formattedDevices;
}

export async function softDeleteDevice(de_id: number) {
    const device = await prisma.devices.findUnique({ where: { de_id } });
    if (!device) throw new Error("Device not found");

    const updated = await prisma.devices.update({
        where: { de_id },
        data: { deleted_at: new Date() },
        select: { de_id: true, deleted_at: true },
    });

    return { de_id: updated.de_id, deletedAt: updated.deleted_at };
}

export const inventoryService = { 
    getDeviceById, 
    getAllDevices, 
    softDeleteDevice 
};