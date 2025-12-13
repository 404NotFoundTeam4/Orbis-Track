import { prisma } from "../../infrastructure/database/client.js";


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
            available: device_childs.length,
        };
    });


    return result;
}

export const inventoryService = { getInventory };