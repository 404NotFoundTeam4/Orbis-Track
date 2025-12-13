import { $Enums } from "@prisma/client";
import { prisma } from "../../infrastructure/database/client.js";
import xlsx from "xlsx";
import fs from "fs";
import {
    CreateDeviceChildPayload,
    DeleteDeviceChildPayload,
    IdParamDto,
    UploadFileDeviceChildPayload
} from "./inventory.schema.js";

/**
 * Description: ดึงข้อมูลอุปกรณ์แม่พร้อมอุปกรณ์ลูก
 * Input     : params (id) - รหัสอุปกรณ์แม่
 * Output    : ข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function getDeviceWithChilds(params: IdParamDto) {
    const { id } = params;

    const device = await prisma.devices.findFirst({
        where: {
            de_id: id,
            deleted_at: null,
            approval_flow: {
                af_is_active: true,
            },
        },
        select: {
            // อุปกรณ์แม่
            de_id: true,
            de_serial_number: true,
            de_name: true,
            de_description: true,
            de_location: true,
            de_max_borrow_days: true,
            de_images: true,

            // อุปกรณ์ลูก
            device_childs: {
                where: {
                    deleted_at: null,
                },
                orderBy: { dec_id: "asc" },
                select: {
                    dec_id: true,
                    dec_serial_number: true,
                    dec_asset_code: true,
                    dec_status: true,
                    dec_has_serial_number: true,
                    dec_de_id: true
                },
            },

            // หมวดหมู่
            category: {
                select: {
                    ca_id: true,
                    ca_name: true,
                },
            },

            // ฝ่ายย่อย
            section: {
                select: {
                    sec_id: true,
                    sec_name: true,
                    sec_dept_id: true,
                },
            },

            // อุปกรณ์เสริม
            accessory: {
                select: {
                    acc_id: true,
                    acc_name: true,
                    acc_quantity: true
                }
            },

            // ลำดับการอนุมัติ
            approval_flow: {
                select: {
                    af_id: true,
                    af_name: true,
                    steps: {
                        where: {
                            deleted_at: null,
                        },
                        select: {
                            afs_id: true,
                            afs_step_approve: true,
                            afs_role: true,
                            afs_dept_id: true,
                            afs_sec_id: true,
                        },
                        orderBy: {
                            afs_step_approve: "asc",
                        },
                    },
                },
            },
        },
    });

    return {
        ...device,
        total_quantity: device?.device_childs.length
    };
}

/**
 * Description: เพิ่มอุปกรณ์ลูก
 * Input     : payload { dec_de_id, quantity } - รหัสของอุปกรณ์แม่และจำนวนอุปกรณ์ลูกที่ต้องการเพิ่ม
 * Output    : ข้อมูลอุปกรณ์ลูกที่เพิ่มใหม่
 * Logic     :
 *   - ดึง dec_de_id และ quantity จาก payload
 *   - ค้นหาอุปกรณ์แม่จาก dec_de_id และเอาข้อมูลชื่อกับ serial number
 *   - ถ้าค้นหาอุปกรณ์แม่ไม่เจอ ให้โยน error
 *   - ค้นหา Serial Number ของอุปกรณ์ลูกตัวล่าสุด
 *   - หา Serial Number ถัดไป
 *   - สร้าง Prefix Serial Number จากชื่ออุปกรณ์แม่
 *   - สร้าง Prefix Asset Code จาก Serial Number ของอุปกรณ์แม่
 *   - Loop เพิ่มอุปกรณ์ตามจำนวน quantity
 *   - คืนค่ารายการอุปกรณ์ลูกที่เพิ่มทั้งหมด
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function createDeviceChild(payload: CreateDeviceChildPayload) {
    const { dec_de_id, quantity } = payload;

    // หาอุปกรณ์แม่
    const parent = await prisma.devices.findFirst({
        where: {
            de_id: dec_de_id,
            deleted_at: null
        },
        select: {
            de_name: true,
            de_serial_number: true
        }
    });

    if (!parent) throw new Error("Parent device not found");

    // ดึง serial number ล่าสุด
    const lastedChild = await prisma.device_childs.findFirst({
        where: {
            dec_de_id
        },
        orderBy: {
            dec_id: "desc"
        },
        select: {
            dec_serial_number: true
        }
    });

    // หาเลข serial number ถัดไป
    let nextSerialNumber = 1; // serial number เริ่มต้นที่ 1
    if (lastedChild?.dec_serial_number) { // ถ้ามีอุปกรณ์ลูกล่าสุด (ตัวท้าย)
        const extract = lastedChild.dec_serial_number.split("-").pop(); // ตัดคำด้วย - แล้วเอาส่วนสุดท้าย
        const lastSerialNumber = parseInt(extract || "0");  // แปลงจาก string เป็น int (ถ้า extract เป็น undefined ใช้ 0 แทน)
        if (!isNaN(lastSerialNumber)) { // ถ้าเป็นตัวเลข
            nextSerialNumber = lastSerialNumber + 1; // serial number บวก 1 จากเลขล่าสุด
        }
    }

    // prefix serial number
    const SERIAL_PREFIX = parent.de_name
        .split(" ") // แยกชื่ออุปกรณ์แม่ด้วยช่องว่าง
        .filter(word => /^[A-Za-z0-9-]+$/.test(word)) // เก็บเฉพาะ a-z, A-Z, 0-9 หรือ -
        .join("-") // นำคำมาต่อกันด้วย -
        .replace(/([A-Za-z])-(\d)/g, "$1$2") // ตัด - ระหว่างตัวอักษรกับตัวเลข
        .toUpperCase(); // ตัวพิมพ์ใหญ่

    // prefix asset code
    const assetParts = parent.de_serial_number.split("-"); // แยกคำด้วย -
    const ASSET_PREFIX = assetParts.slice(0, -1).join("-"); // ตัดตัวสุดท้ายออก (ตัวเลข) แล้วรวมคำด้วย -

    // // สร้างอุปกรณ์ลูกตามจำนวน
    const newDeviceChilds = await Promise.all(
        Array.from({ length: quantity }).map((_, index) => { // สร้าง array เปล่าที่มีความยาว = quantity แล้วลูปตามจำนวน
            const serialNumber = String(nextSerialNumber + index).padStart(3, "0"); // สร้าง serial number และเติม 0 ให้เป็นเลข 3 หลัก
            return prisma.device_childs.create({
                data: {
                    dec_serial_number: `SN-${SERIAL_PREFIX}-${serialNumber}`,
                    dec_asset_code: `ASSET-${ASSET_PREFIX}-${serialNumber}`,
                    dec_status: $Enums.DEVICE_CHILD_STATUS.READY,
                    dec_has_serial_number: true,
                    dec_de_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                select: {
                    dec_id: true,
                    dec_serial_number: true,
                    dec_asset_code: true,
                    dec_status: true,
                    dec_has_serial_number: true,
                    dec_de_id: true,
                    created_at: true,
                    updated_at: true,
                }
            });
        })
    );

    return newDeviceChilds;
}

/**
 * Description: เพิ่มอุปกรณ์ลูกโดยการอัปโหลดไฟล์ (CSV / Excel)
 * Input     : payload { de_id, filePath } - รหัสอุปกรณ์แม่และตำแหน่งไฟล์
 * Output    : จำนวนอุปกรณ์ลูกที่ถูกเพิ่ม
 * Logic     :
 *   - อ่านไฟล์ CSV / Excel ด้วย xlsx
 *   - แปลงข้อมูลเป็น JSON
 *   - ค้นหาข้อมูลอุปกรณ์แม่เพื่อนำ Serial Number Prefix มาใช้ตรวจสอบ
 *   - ตรวจสอบ Serial Number แต่ละแถวต้องมีรูปแบบขึ้นต้นด้วย Prefix เดียวกัน
 *   - เพิ่มรายการอุปกรณ์ลูกลงฐานข้อมูล
 *   - ลบไฟล์ออกจาก Server หลังจากอัปโหลดเสร็จ
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function uploadFileDeviceChild(payload: UploadFileDeviceChildPayload) {
    const { de_id, filePath } = payload;

    const workbook = xlsx.readFile(filePath); // อ่านไฟล์ Excel / CSV
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // ใช้เฉพาะ sheet แรก
    const data = xlsx.utils.sheet_to_json(sheet); // แปลงข้อมูล sheet ให้เป็น array

    // ค้นหาข้อมูลอุปกรณ์แม่
    const parent = await prisma.devices.findFirst({
        where: {
            de_id,
            deleted_at: null
        },
        select: {
            de_serial_number: true
        }
    });

    if (!parent) throw new Error("Parent device not found");

    const serialParts = parent.de_serial_number.split("-"); // แยกคำด้วย -
    const SERIAL_PREFIX = serialParts.slice(1, serialParts.length - 1).join("-"); // ตัดส่วนหน้าสุดและท้ายสุดออก แล้วรวมคำด้วย -

    // วนลูปเพื่อ map ข้อมูลในไฟล์
    const childs = data.map((row: any) => {
        const serialNumber = row["Serial Number"]?.trim(); // ดึง Serial Number จากไฟล์

        if (!serialNumber) throw new Error("Serial Number is required in first upload");

        // ตรวจสอบว่า Serial Number ว่าคำเริ่มต้นถูกไหม
        if (!serialNumber.startsWith(`SN-${SERIAL_PREFIX}-`)) {
            throw new Error(
                `Serial Number '${serialNumber}' is invalid. Expected prefix 'SN-${SERIAL_PREFIX}-'`
            );
        }

        // คืนค่าข้อมูลที่พร้อม insert ลงฐานข้อมูล
        return {
            dec_serial_number: serialNumber,
            dec_asset_code: row["Asset Code"] || null,
            dec_has_serial_number: true,
            dec_status: $Enums.DEVICE_CHILD_STATUS.READY,
            dec_de_id: de_id
        };
    });

    // บันทึกลงฐานข้อมูล
    await prisma.device_childs.createMany({
        data: childs,
        skipDuplicates: true // ข้ามข้อมูลที่ซ้ำ
    });

    // ลบไฟล์ออกจาก server
    fs.unlinkSync(filePath);

    return { inserted: childs.length };
}

/**
 * Description: ลบอุปกรณ์ลูก
 * Input     : payload { dec_id } - รหัสอุปกรณ์ลูก (รองรับการลบแบบหลายรายการ)
 * Output    : { message: string } - ผลการลบอุปกรณ์ลูก
 * Logic     :
 *   - ดึง dec_id จาก payload
 *   - อัปเดต field deleted_at ของตาราง device_childs เป็นวันปัจจุบัน (soft delete)
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
async function deleteDeviceChild(payload: DeleteDeviceChildPayload) {
    const { dec_id } = payload;
    await prisma.device_childs.updateMany({
        where: {
            dec_id: {
                in: dec_id
            }
        },
        data: {
            deleted_at: new Date()
        }
    });

    return { message: "Delete device child successfully" }
}

export const inventoryService = { getDeviceWithChilds, createDeviceChild, uploadFileDeviceChild, deleteDeviceChild }