import { prisma } from "../../infrastructure/database/client.js";
import { CreateBorrowTicketPayload, IdParamDto } from "./borrows.schema.js";

/**
 * Description: ดึงข้อมูลทอุปกรณ์
 * Input : -
 * Output : รายการอุปกรณ์ (ข้อมูลอุปกรณ์ หมวดหมู่ แผนก ฝ่ายย่อย จำนวนอุปกรณ์ทั้งหมด จำนวนอุปกรณ์ที่พร้อมใช้งาน)
 * Author: Sutaphat Thahin (Yeen) 66160378
 */
async function getInventory() {
    const devices = await prisma.devices.findMany({
        where: {
            deleted_at: null
        },
        select: {
            de_id: true,
            de_serial_number: true,
            de_name: true,
            de_description: true,
            de_location: true,
            de_max_borrow_days: true,
            de_images: true,
            category: {
                select: {
                    ca_name: true
                }
            },
            section: {
                select: {
                    sec_name: true
                }
            },
            // นับจำนวน device ทั้งหมด
            _count: {
                select: {
                    device_childs: true
                }
            },
            // นับจำนวน device ที่สถานะ READY
            device_childs: {
                where: {
                    dec_status: "READY"
                },
                select: {
                    dec_status: true
                }
            }
        }
    });

    // ฟังก์ชันแยกแชื่อแผนก แและ ฝ่ายย่อย
    function extractDepartmentAndSection(sectionName: string) {
        const match = sectionName.match(/แผนก\s*(.*?)\s*ฝ่ายย่อย\s*(.*)/); // แยก แผนก และ ฝ่ายย่อย ออกจากข้อความเดียวกัน

        return {
            department: match?.[1]?.trim(), // ข้อความหลังคำว่า แผนก
            sub_section: match?.[2]?.trim(), // ข้อความหลังคำว่า ฝ่ายย่อย
        }
    }

    // Destructure เอาเฉพาะ fields ที่ต้องการ
    const result = devices.map(({ section, category, device_childs, _count, ...device }) => {
        // แยกแชื่อแผนก แและ ฝ่ายย่อย
        const { department, sub_section } = section?.sec_name
            ? extractDepartmentAndSection(section.sec_name)
            : { department: null, sub_section: null };

        return {
            ...device,
            category: category.ca_name,
            department,
            sub_section,
            total: _count.device_childs,
            available: device_childs.length
        };
    });


    return result;
}

async function getDeviceForBorrow(params: IdParamDto) {
    const { id } = params;

    // ข้อมูลอุปกรณ์
    const device = await prisma.devices.findFirst({
        where: {
            de_id: id,
            deleted_at: null
        },
        select: {
            // อุปกรณ์แม่
            de_serial_number: true,
            de_name: true,
            de_description: true,
            de_location: true,
            de_max_borrow_days: true,
            de_images: true,

            // หมวดหมู่อุปกรณ์
            category: {
                select: {
                    ca_name: true
                }
            },

            // อุปกรณ์เสริม
            accessories: {
                select: {
                    acc_name: true,
                    acc_quantity: true,
                }
            },

            // แผนกและฝ่ายย่อย
            section: {
                select: {
                    sec_name: true
                }
            },

            // อุปกรณ์ลูก
            device_childs: {
                where: {
                    deleted_at: null
                },
                select: {
                    dec_id: true,
                    dec_status: true,
                }
            }
        }
    });

    if (!device) {
        throw new Error("Device not found");
    }

    // แยกชื่อแผนก และ ฝ่ายย่อย
    function extractDepartmentAndSection(sectionName: string) {
        const match = sectionName.match(/แผนก\s*(.*?)\s*ฝ่ายย่อย\s*(.*)/); // แยก แผนก และ ฝ่ายย่อย ออกจากข้อความเดียวกัน

        return {
            department: match?.[1]?.trim(), // ข้อความหลังคำว่า แผนก
            section: match?.[2]?.trim(), // ข้อความหลังคำว่า ฝ่ายย่อย
        }
    }

    const { department, section } = extractDepartmentAndSection(device.section?.sec_name ?? "");

    return {
        ...device,
        department,
        section
    };
}

async function createBorrowTicket(payload: CreateBorrowTicketPayload & { userId: number }) {
    const {
        userId,
        deviceChilds,
        borrowStart,
        borrowEnd,
        reason,
        placeOfUse,
    } = payload;

    return await prisma.$transaction(async (tx) => {

        // ค้นหารหัส Preset ของอุปกรณ์แม่
        const device = await tx.devices.findFirst({
            where: {
                device_childs: {
                    some: {
                        dec_id: deviceChilds[0]
                    }
                }
            }
        });

        // สร้าง borrow return ticket
        const ticket = await tx.borrow_return_tickets.create({
            data: {
                brt_user_id: userId,
                brt_borrow_purpose: reason,
                brt_usage_location: placeOfUse,
                brt_start_date: borrowStart,
                brt_end_date: borrowEnd,
                brt_quantity: deviceChilds.length,
                brt_current_stage: 1,
                brt_af_id: device?.de_af_id,
                brt_status: "PENDING",
                created_at: new Date()
            },
        });

        // สร้าง ticket device
        await tx.ticket_devices.createMany({
            data: deviceChilds.map((decId) => ({
                td_brt_id: ticket.brt_id,
                td_dec_id: decId
            }))
        });

        // เปลี่ยนสถานะอุปกรณ์ (แต่ละตัวที่ถูกยืม)
        await tx.device_availabilities.createMany({
            data: deviceChilds.map((decId) => ({
                da_dec_id: decId,
                da_brt_id: ticket.brt_id,
                da_start: borrowStart,
                da_end: borrowEnd,
                da_status: "ACTIVE",
            }))
        });

        return {
            brt_id: ticket.brt_id,
            brt_status: ticket.brt_status,
            brt_start_date: ticket.brt_start_date,
            brt_end_date: ticket.brt_end_date,
            brt_quantity: ticket.brt_quantity
        };
    });

}

export const borrowService = { getInventory, getDeviceForBorrow, createBorrowTicket };