import { prisma } from "../../infrastructure/database/client.js";
import type { z } from "zod";
import {
    EditCategoryPayload,
    GetCategoriesQuerySchema,
    AddCategoryPayload,
    idParamSchema,
} from "./category.schema.js";
import { ca } from "zod/locales";

type IdParamDto = z.infer<typeof idParamSchema>;

/**
 * Description: ดึงรายการหมวดหมู่อุปกรณ์ (Categories) พร้อมรองรับค้นหา, เรียงลำดับ และแบ่งหน้า
 * Input     : query (q, page, limit, sortBy, sortOrder, includeDeleted)
 *             - q             : คำค้นหาจากชื่อหมวดหมู่ (ค้นใน ca_name แบบ contains, ไม่สนตัวพิมพ์เล็ก/ใหญ่)
 *             - page          : หน้าปัจจุบัน (เริ่มที่ 1)
 *             - limit         : จำนวนรายการต่อหน้า (1–100)
 *             - sortBy        : ฟิลด์ที่ใช้เรียงลำดับ (ca_id | ca_name | created_at | updated_at)
 *             - sortOrder     : ทิศทางการเรียงลำดับ (asc | desc)
 *             - includeDeleted: รวมรายการที่ถูก soft-delete (deleted_at != null) หรือไม่
 * Output    : { data, meta }
 *             - data          : รายการหมวดหมู่ที่ตรงตามเงื่อนไขและอยู่ในหน้าที่ร้องขอ
 *             - meta          : ข้อมูลประกอบการแบ่งหน้า (page, limit, total, totalPages)
 * Author    : Chanwit Muangma (Boom) 66160224
 */
export async function getCategories(query: GetCategoriesQuerySchema) {
    const { q, page, limit, sortBy, sortOrder, includeDeleted } = query;

    const where: any = {
        ...(includeDeleted ? {} : { deleted_at: null }),
        ...(q ? { ca_name: { contains: q, mode: "insensitive" } } : {}),
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
        prisma.categories.count({ where }),
        prisma.categories.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            select: {
                ca_id: true,
                ca_name: true,
                created_at: true,
                updated_at: true,
                deleted_at: true,

            }
        })
    ]);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

/**
 * Description: ดึงข้อมูลหมวดหมู่อุปกรณ์ตามรหัส (Category By ID) เฉพาะรายการที่ยังไม่ถูกลบ (deleted_at = null)
 * Input     : id (number) - รหัสหมวดหมู่อุปกรณ์ (ca_id)
 * Output    : ข้อมูลหมวดหมู่อุปกรณ์ที่พบ 1 รายการ หากไม่พบจะได้ค่า null
 * Author    : Chanwit Muangma (Boom) 66160224
 */
export async function getCategoryById(id: number) {
    return prisma.categories.findFirst({
        where: { ca_id: id, deleted_at: null },
        select: {
            ca_id: true,
            ca_name: true,
            created_at: true,
            updated_at: true,
            deleted_at: true,
        },
    });

}

/**
 * Description: ลบหมวดหมู่อุปกรณ์แบบ Soft Delete โดยตั้งค่า deleted_at
 *              - ตรวจสอบก่อนว่า category มีอยู่จริงและยังไม่ถูกลบ (deleted_at = null)
 *              - ถ้าไม่พบ จะ throw error เพื่อให้ controller ส่งสถานะผิดพลาดกลับไป
 * Input     : id (number) - รหัสหมวดหมู่ (ca_id) ที่ต้องการลบ
 * Output    : { ca_id, deleted_at } - คืนค่า id และเวลาที่ถูกลบ (ใช้ยืนยันผลการลบ)
 * Author    : Chanwit Muangma (Boom) 66160224
 */

export async function softDeleteCategory(id: number) {

    //เช็คว่ามีและยังไม่โดนลบ
    const existing = await prisma.categories.findFirst({
        where: { ca_id: id, deleted_at: null },
        select: { ca_id: true },
    });

    //ถ้าไม่พบข้อมูล ให้แจ้งว่าไม่พบหมวดหมู่
    if (!existing) {
        throw new Error("Category not Found");

    }

    //ตั้งเวลาลบ แล้วอัปเดต deleted_at เพื่อเป็นการ Soft Delete
    const deletedAt = new Date();
    const updated = await prisma.categories.update({
        where: { ca_id: id },
        data: { deleted_at: deletedAt },
        select: { ca_id: true, deleted_at: true },
    });

    return {
        ca_id: updated.ca_id,
        deleted_at: updated.deleted_at!,

    };

}

/**
 * Description: แก้ไขหมวดหมู่อุปกรณ์
 * Input     : payload (caId, caName) - รหัสหมวดหมู่และชื่อหมวดหมู่ใหม่
 * Output    : { message } - ข้อความแจ้งเตือนอัปเดตเสร็จสิ้น
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
export async function editCategory(payload: EditCategoryPayload) {
    // ดึงข้อมูลจาก payload ที่ส่งมา
    const { caId, caName } = payload;

    // ค้นหาว่ามี category id นี้ หรือไม่
    const existing = await prisma.categories.findUnique({
        where: {
            ca_id: caId
        }
    });

    // ถ้าไม่เจอ category id ที่ส่งมา
    if (!existing) {
        throw new Error("Category not found");
    }

    // ตัดช่องว่างออกจากชื่อที่ส่งมา
    const trimmedName = caName.trim();

    // ถ้าตัดช่องว่างออกแล้วเป็นค่าว่าง ("")
    if (!trimmedName) {
        throw new Error("Category name is required");
    }

    // ค้นหาชื่อที่แก้ไขใหม่ว่ามีอยู่แล้วหรือไม่ (ยกเว้นของตัวเอง)
    const duplicateName = await prisma.categories.findFirst({
        where: {
            ca_id: {
                not: caId
            },
            ca_name: trimmedName
        }
    });

    // ถ้ามีชื่อที่ซ้ำกัน
    if (duplicateName) {
        throw new Error("Category name already exists");
    }

    // อัปเดตชื่อหมวดหมู่
    await prisma.categories.update({
        where: {
            ca_id: caId
        },
        data: {
            ca_name: trimmedName
        }
    });

    return { message: "Category updated successfully" };
}
/**
 * Description: เพิ่มหมวดหมู่อุปกรณ์ (Category) ใหม่
 * Input     : payload { ca_name: string } - ชื่อหมวดหมู่ที่ต้องการเพิ่ม
 * Output    : { ca_id, ca_name, created_at, updated_at, deleted_at } - ข้อมูลหมวดหมู่ที่เพิ่มเข้ามา
 * Logic     :
 *   - ตรวจสอบว่าชื่อหมวดหมู่ไม่ซ้ำกับที่มีอยู่ในระบบ
 *   - บันทึกหมวดหมู่ใหม่ลงฐานข้อมูล
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
export async function addCategory(payload: AddCategoryPayload) {
    const { ca_name } = payload;

    // ตรวจสอบว่าหมวดหมู่ชื่อเดียวกันมีอยู่แล้วหรือไม่
    const existingCategory = await prisma.categories.findFirst({
        where: {
            ca_name: { equals: ca_name, mode: "insensitive" },
            deleted_at: null,
        },
    });

    if (existingCategory) {
        throw new Error("Category name already exists");
    }

    // เพิ่มหมวดหมู่ใหม่
    const createdCategory = await prisma.categories.create({
        data: {
            ca_name,
            created_at: new Date(),
            updated_at: new Date(),
        },
    });

    return createdCategory;
}

export const categoryService = {
    getCategories,
    getCategoryById,
    softDeleteCategory,
    editCategory,
    addCategory,
}
