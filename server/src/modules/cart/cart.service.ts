import { prisma } from "../../infrastructure/database/client.js";
import { AccessoriesSchema, CartItemSchema, CategoriesSchema, DeviceChildSchema, DeviceSchema, IdParamDto } from "./cart.schema.js";
import { DepartmentSchema, SectionSchema } from "../departments/departments.schema.js";

async function getCartItem(params: IdParamDto) {
    const { id } = params;
    const cartItem = await prisma.cart_items.findMany({ where: { cti_ct_id: id } });
    if (!cartItem) throw new Error("Cart not found");
    const [cart_items, device_childs, devices, accessories, categories, departments, sections] = await Promise.all([
        prisma.cart_items.findMany({
            where: { cti_ct_id: id },
            select: {
                cti_id: true,
                cti_us_name: true,
                cti_phone: true,
                cti_note: true,
                cti_usage_location: true,
                cti_quantity: true,
                cti_start_date: true,
                cti_end_date: true,
                cti_ct_id: true,
                cti_dec_id: true,
            },
        }) as Promise<CartItemSchema[]>,
        prisma.device_childs.findMany({
            select: {
                dec_id: true,
                dec_serial_number: true,
                dec_asset_code: true,
                dec_has_serial_number: true,
                dec_status: true,
                dec_de_id: true,
            },
        }) as Promise<DeviceChildSchema[]>,
        prisma.devices.findMany({
            select: {
                de_id: true,
                de_serial_number: true,
                de_name: true,
                de_description: true,
                de_location: true,
                de_max_borrow_days: true,
                de_images: true,
                de_af_id: true,
                de_ca_id: true,
                de_us_id: true,
                de_sec_id: true,
                de_acc_id: true,
            },
        }) as Promise<DeviceSchema[]>,
        prisma.accessories.findMany({
            select: {
                acc_id: true,
                acc_name: true,
                acc_quantity: true,
            },
        }) as Promise<AccessoriesSchema[]>,
        prisma.categories.findMany({
            select: {
                ca_id: true,
                ca_name: true,
            },
        }) as Promise<CategoriesSchema[]>,
        prisma.departments.findMany({
            select: {
                dept_id: true,
                dept_name: true,
            },
        }) as Promise<DepartmentSchema[]>,
        prisma.sections.findMany({
            select: {
                sec_id: true,
                sec_name: true,
                sec_dept_id: true,
            },
        }) as Promise<SectionSchema[]>,
    ]);

    if (!cart_items.length) throw new Error("Cart not found");

    // นับจำนวน device_child ทั้งหมด ต่อ de_id (เช็ค null/undefined ก่อน)
    const deviceChildCountByDeviceId = device_childs.reduce<Record<number, number>>(
        (acc, dc) => {
            const deId = dc.dec_de_id;
            if (deId == null) return acc; // กัน null/undefined
            acc[deId] = (acc[deId] ?? 0) + 1;
            return acc;
        },
        {}
    );

    // นับจำนวน device_child ที่ dec_status = "READY" ต่อ de_id (เช็ค null/undefined + status)
    const deviceChildReadyCountByDeviceId = device_childs.reduce<Record<number, number>>(
        (acc, dc) => {
            const deId = dc.dec_de_id;
            if (deId == null) return acc;
            if (dc.dec_status === "READY") {
                acc[deId] = (acc[deId] ?? 0) + 1;
            }
            return acc;
        },
        {}
    );

    // แปลงข้อมูล cart_items
    const itemData = cart_items.map((cartItem: CartItemSchema) => {
        const device_child: DeviceChildSchema | undefined = device_childs.find(
            (dc) => dc.dec_id === cartItem.cti_dec_id
        );

        const device: DeviceSchema | undefined = devices.find(
            (d) => d.de_id === device_child?.dec_de_id
        );

        const category: CategoriesSchema | undefined = categories.find(
            (c) => c.ca_id === device?.de_ca_id
        );

        const accessory: AccessoriesSchema | undefined = accessories.find(
            (a) => a.acc_id === device?.de_acc_id
        );

        const section: SectionSchema | undefined = sections.find(
            (s) => s.sec_id === device?.de_sec_id
        );

        const department: DepartmentSchema | undefined = departments.find(
            (d) => d.dept_id === section?.sec_dept_id
        );

        // ใช้ de_id แบบ type-safe
        const deId = device?.de_id ?? null;

        const dec_count =
            deId != null ? deviceChildCountByDeviceId[deId] ?? 0 : 0;

        const dec_ready_count =
            deId != null ? deviceChildReadyCountByDeviceId[deId] ?? 0 : 0;

        const dec_availability = dec_ready_count > 0 ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน";
        return {
            ...cartItem,
            device: device || null,
            de_ca_name: category?.ca_name || null,
            de_acc_name: accessory?.acc_name || null,
            de_dept_name: department?.dept_name || null,
            de_sec_name: section?.sec_name || null,
            dec_count,
            dec_ready_count,
            dec_availability,
        };
    });

    return { itemData };
}

async function deleteCartItemById(params: IdParamDto) {
    const { id } = params;
    const cartItem = await prisma.cart_items.findUnique({ where: { cti_id: id } });
    if (!cartItem) throw new Error("CartItem not found");

    // ลบจริง
    await prisma.cart_items.delete({
        where: { cti_id: id },
    });

    return { message: "Delete Cart Item successfully" };
};

export const cartsService = {
    getCartItem, deleteCartItemById,
};