import { prisma } from "../../infrastructure/database/client.js";
import { IdParamDto } from "./inventory.schema.js";

/**
 * ดึงข้อมูลอุปกรณ์ตาม ID
 */
async function getDeviceById(params: IdParamDto) {
    const { id } = params;
    const device = await prisma.devices.findUnique({ 
        where: { de_id: id } 
    });
    
    if (!device) throw new Error("Device not found");
    return device;
}

/**
 * ดึงข้อมูลอุปกรณ์ทั้งหมด (เฉพาะที่ยังไม่ถูกลบ)
 */
async function getAllDevices() {
    const devices = await prisma.devices.findMany({
        where: {
            deleted_at: null 
        },
        orderBy: {
            created_at: 'desc'
        }
    });
    return devices;
}

/**
 * ลบอุปกรณ์ (Soft Delete) โดยการอัปเดต deleted_at
 */
export async function softDeleteDevice(de_id: number) {
    // ตรวจสอบก่อนว่ามีอุปกรณ์นี้จริงไหม
    const device = await prisma.devices.findUnique({ where: { de_id } });
    if (!device) throw new Error("Device not found");

    // อัปเดตเวลาที่ลบ
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