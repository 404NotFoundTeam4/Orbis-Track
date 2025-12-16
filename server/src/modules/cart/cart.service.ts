import { prisma } from "../../infrastructure/database/client.js";
import { AccessoriesSchema, CartItemSchema, CartSchema, CategoriesSchema, CreateBorrowTicketPayload, DeviceChildSchema, DeviceSchema, IdParamDto, TicketDevicesSchema } from "./cart.schema.js";
import { DepartmentSchema, SectionSchema } from "../departments/departments.schema.js";

/**
 * Description : ดึงข้อมูลรายการอุปกรณ์ทั้งหมดในรถเข็นตาม Cart ID
 * รวมข้อมูลอุปกรณ์, หมวดหมู่, แผนก, ฝ่ายย่อย และสถานะความพร้อมใช้งาน
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
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

/**
 * Description : ลบรายการอุปกรณ์ออกจากรถเข็นตาม Cart Item ID
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
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

/**
 * Description : สร้าง Borrow Return Ticket จาก Cart Item ที่เลือก
 * ใช้ข้อมูลอุปกรณ์และผู้ใช้จากรถเข็นในการสร้างคำร้อง
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
async function createBorrowTecket(params: CreateBorrowTicketPayload) {
    const { cartItemId } = params;

    const cartItem = await prisma.cart_items.findMany({ where: { cti_id: cartItemId } });
    if (!cartItem) throw new Error("Cart not found");
    const [cart_items, device_childs, devices, ticket_devices, carts] = await Promise.all([
        prisma.cart_items.findMany({
            where: { cti_id: cartItemId },
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
        prisma.ticket_devices.findMany({
            select: {
                td_id: true,
                td_brt_id: true,
                td_dec_id: true,
            },
        }) as Promise<TicketDevicesSchema[]>,
        prisma.carts.findMany({
            select: {
                ct_id: true,
                ct_us_id: true,
            },
        }) as Promise<CartSchema[]>,
    ]);

    const cart_item = cart_items.find((ct) => ct.cti_id === cartItemId);
    const device_child = device_childs.find((dec) => dec.dec_id === cart_item?.cti_dec_id);
    const device = devices.find((de) => de.de_id === device_child?.dec_de_id);
    const cart = carts.find((ct) => ct.ct_id === cart_item?.cti_ct_id);

    // เพิ่มข้อมูลผู้ใช้ใหม่ลงในตาราง users
    const newBorrowTicket = await prisma.borrow_return_tickets.create({
        data: {
            brt_status: "PENDING",
            brt_usage_location: cart_item?.cti_usage_location,
            brt_borrow_purpose: cart_item?.cti_note,
            brt_start_date: cart_item?.cti_start_date,
            brt_end_date: cart_item?.cti_end_date,
            brt_quantity: cart_item?.cti_quantity,
            brt_current_stage: null,
            brt_reject_reason: null,
            brt_pickup_location: null,
            brt_pickup_datetime: null,
            brt_return_location: null,
            brt_return_datetime: null,
            // brt_af_id: device?.de_af_id,
            // brt_staff_id: null,
            // brt_user_id: cart?.ct_us_id,
            created_at: new Date(),
            requester: {
                connect: {
                    us_id: cart!.ct_us_id,
                },
            },
            flow: {
                connect: {
                    af_id: device?.de_af_id,
                },
            },
        },
        select: {
            brt_status: true,
            brt_usage_location: true,
            brt_borrow_purpose: true,
            brt_start_date: true,
            brt_end_date: true,
            brt_quantity: true,
            brt_current_stage: true,
            brt_reject_reason: true,
            brt_pickup_location: true,
            brt_pickup_datetime: true,
            brt_return_location: true,
            brt_return_datetime: true,
            // brt_af_id: true,
            // brt_staff_id: true,
            // brt_user_id: true,
            requester: { select: { us_id: true } },
            flow: { select: { af_id: true } },
            created_at: true,
        }
    });

    // const newTicketDevice = await prisma.ticket_devices.create({
    //     data: {
    //         td_brt_id: newBorrowTicket?.brt_id,
    //         td_dec_id: device_child?.dec_id,
    //         created_at: new Date(),
    //     },
    //     select: {
    //         td_brt_id: true,
    //         td_dec_id: true,
    //         created_at: true,
    //     }
    // });

    return newBorrowTicket;
}

export const cartsService = {
    getCartItem, deleteCartItemById, createBorrowTecket,
};