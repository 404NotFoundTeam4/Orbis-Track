/**
 * Service: Inventory Service
 * Description: Service สำหรับจัดการข้อมูลอุปกรณ์ (Device) ในคลังสินค้า
 * Author: Worrawat Namwat (Wave) 66160372
 */
import { prisma } from "../../infrastructure/database/client.js";
import { IdParamDto } from "./inventory.schema.js";

/**
 * Description: ดึงข้อมูลอุปกรณ์รายการเดียวตาม ID พร้อมข้อมูลความสัมพันธ์ (Category, Section, Children)
 * Input: params (IdParamDto) - Object ที่มี id ของอุปกรณ์
 * Output: ข้อมูลอุปกรณ์ที่จัดรูปแบบชื่อแผนก/ฝ่าย และจำนวนคงเหลือแล้ว
 * Author: Worrawat Namwat (Wave) 66160372
 */
async function getDeviceById(params: IdParamDto) {
    const { id } = params;
    // Query ข้อมูลจากฐานข้อมูล พร้อม include ตารางที่เกี่ยวข้อง
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

    // Logic: ตัดชื่อแผนกออกจากชื่อฝ่ายย่อย เพื่อไม่ให้แสดงผลซ้ำซ้อน
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

/**
 * Description: ดึงข้อมูลอุปกรณ์ทั้งหมดพร้อมสถานะรวมของอุปกรณ์
 * Input: -
 * Output: รายการอุปกรณ์ทั้งหมด พร้อมสถานะ
 * Author: Worrawat Namwat (Wave) 66160372
 */
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
        // Logic: คำนวณสถานะรวมของ Device แม่ โดยดูจากลูกๆ (Device Childs)
        const hasBorrowedItem = item.device_childs.some(child => child.dec_status === 'BORROWED');
        const availableQuantity = item.device_childs.filter(c => c.dec_status === 'READY').length;
        const totalQuantity = item.device_childs.length;

        let statusType = 'READY';
        if (hasBorrowedItem) {
            statusType = 'BORROWED'; // ถ้ามีลูกตัวใดตัวหนึ่งถูกยืม -> สถานะรวมเป็น "ยืม"  
        } else if (totalQuantity > 0 && availableQuantity === 0) {
            statusType = 'OUT_OF_STOCK'; // ถ้ามีของแต่ไม่พร้อมใช้งาน "ของหมด"
        } else if (totalQuantity === 0) {
            statusType = 'OUT_OF_STOCK'; // ถ้าไม่มีของเลย -> "ของหมด"
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

/**
 * Description: ลบอุปกรณ์แบบ Soft Delete
 * Input: de_id (number) - รหัสอุปกรณ์
 * Output: Object ที่ระบุ ID และเวลาที่ถูกลบ
 * Author: Worrawat Namwat (Wave) 66160372
 */
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