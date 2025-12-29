import { prisma } from "../../infrastructure/database/client.js";
import { AccessoriesSchema, ApprovalFlowsSchema, ApprovalFlowStepsSchema, BorrowReturnTicketsSchema,UpdateCartDeviceDetailDataSchema, CartDeviceChildSchema, CartItemSchema, CartSchema, CategoriesSchema, CreateBorrowTicketPayload, CreateBorrowTicketStagePayload, CreateTicketDevicePayload, DeviceChildSchema, DeviceSchema, IdParamDto, TicketDevicesSchema, updateCartDeviceDetailBodySchema, updateCartDeviceDetailParamSchema, getCartDeviceDetailParamSchema, CartDeviceDetailSchema, UpdateCartDeviceDetailBodySchema,UpdateCartDeviceDetailBodyDto } from "./cart.schema.js";
import { DepartmentSchema, SectionSchema } from "../departments/departments.schema.js";
import { AccessoriesSchema, ApprovalFlowsSchema, ApprovalFlowStepsSchema, BorrowReturnTicketsSchema, CartDeviceChildSchema, CartItemSchema, CartSchema, CategoriesSchema, CreateBorrowTicketPayload, CreateBorrowTicketStagePayload, CreateTicketDevicePayload, DeviceChildSchema, DeviceSchema, IdParamDto, TicketDevicesSchema, DeleteCartItemPayload, LogBorrowReturnSchema } from "./cart.schema.js";
import { DepartmentSchema, SectionSchema } from "../departments/departments.schema.js";

/**
 * Description: ฟังก์ชันสำหรับดึงรายการอุปกรณ์ทั้งหมดในรถเข็น “ตาม User ID (us_id)”
 *              - ค้นหา cart ของผู้ใช้ (ct_us_id = userId)
 *              - หากไม่พบ cart จะสร้าง cart ใหม่ให้ผู้ใช้
 *              - ดึง cart_items ของ cart และแนบข้อมูลประกอบ (device/category/department/section/accessories)
 *              - คำนวณจำนวน device_child และสถานะความพร้อมใช้งานจาก READY
 * Input : userId (number)
 * Output : Promise<{ itemData: any[] }>  // หากไม่มี cart_items คืน { itemData: [] }
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
async function getCartItem(params: IdParamDto) {
    const { userId } = params;

    return prisma.$transaction(async (tx) => {

        //หา cart ของ user
        const existingCart = await tx.carts.findFirst({
            where: { ct_us_id: userId, deleted_at: null },
            orderBy: { ct_id: "asc" },
            select: { ct_id: true, ct_us_id: true },
        });

        //ถ้าไม่มี cart -> สร้าง cart ใหม่
        const cart =
            existingCart ??
            (await tx.carts.create({
                data: {
                    ct_us_id: userId,
                    created_at: new Date(),
                },
                select: { ct_id: true, ct_us_id: true },
            }));

        const cartId = cart.ct_id;

        //ดึง cart_items ด้วย cartId (ถ้าไม่มี item ก็คืน [] ได้เลย)
        const cart_items = (await tx.cart_items.findMany({
            where: { cti_ct_id: cartId, deleted_at: null },
            orderBy: { cti_id: "asc" },
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
                cti_de_id: true,
            },
        })) as CartItemSchema[];

        if (cart_items.length === 0) {
            return { itemData: [] };
        }

        const [
            device_childs,
            devices,
            accessories,
            categories,
            departments,
            sections,
            cart_device_childs,
        ] = await Promise.all([
            tx.device_childs.findMany({
                where: { deleted_at: null },
                select: {
                    dec_id: true,
                    dec_serial_number: true,
                    dec_asset_code: true,
                    dec_has_serial_number: true,
                    dec_status: true,
                    dec_de_id: true,
                },
            }) as Promise<DeviceChildSchema[]>,

            tx.devices.findMany({
                where: { deleted_at: null },
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
                },
            }) as Promise<DeviceSchema[]>,

            tx.accessories.findMany({
                where: { deleted_at: null },
                select: {
                    acc_id: true,
                    acc_name: true,
                    acc_quantity: true,
                    acc_de_id: true,
                },
            }) as Promise<AccessoriesSchema[]>,

            tx.categories.findMany({
                where: { deleted_at: null },
                select: { ca_id: true, ca_name: true },
            }) as Promise<CategoriesSchema[]>,

            tx.departments.findMany({
                where: { deleted_at: null },
                select: { dept_id: true, dept_name: true },
            }) as Promise<DepartmentSchema[]>,

            tx.sections.findMany({
                where: { deleted_at: null },
                select: { sec_id: true, sec_name: true, sec_dept_id: true },
            }) as Promise<SectionSchema[]>,

            tx.cart_device_childs.findMany({
                where: { deleted_at: null },
                select: { cdc_id: true, cdc_cti_id: true, cdc_dec_id: true },
            }) as Promise<CartDeviceChildSchema[]>,
        ]);

        /**
        * Description: สร้าง Map สำหรับ lookup device_child ตาม dec_id เพื่อลดการวน find ซ้ำหลายรอบ
        * Input : device_childs (DeviceChildSchema[])
        * Output : Map<number, DeviceChildSchema>
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const deviceChildById = new Map<number, DeviceChildSchema>();
        for (const dc of device_childs) deviceChildById.set(dc.dec_id, dc);

        /**
        * Description: จัดกลุ่ม cart_device_childs ตาม cti_id เพื่อดึง device_childs ของแต่ละ cart item ได้รวดเร็ว
        * Input : cart_device_childs (CartDeviceChildSchema[])
        * Output : Map<number, CartDeviceChildSchema[]>
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const cartDeviceChildsByCtiId = new Map<number, CartDeviceChildSchema[]>();
        for (const cdc of cart_device_childs) {
            const key = cdc.cdc_cti_id;
            if (!cartDeviceChildsByCtiId.has(key)) cartDeviceChildsByCtiId.set(key, []);
            cartDeviceChildsByCtiId.get(key)!.push(cdc);
        }

        /**
        * Description: ฟังก์ชัน reducer สำหรับนับจำนวน device_child ทั้งหมดแยกตาม de_id
        * Input : acc (Record<number, number>), dc (DeviceChildSchema)
        * Output : acc (Record<number, number>)
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const deviceChildCountByDeviceId = device_childs.reduce<Record<number, number>>(
            (acc, dc) => {
                const deId = dc.dec_de_id;
                if (deId == null) return acc;
                acc[deId] = (acc[deId] ?? 0) + 1;
                return acc;
            },
            {},
        );

        /**
        * Description: ฟังก์ชัน reducer สำหรับนับจำนวน device_child ที่ READY แยกตาม de_id
        * Input : acc (Record<number, number>), dc (DeviceChildSchema)
        * Output : acc (Record<number, number>)
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const deviceChildReadyCountByDeviceId = device_childs.reduce<Record<number, number>>(
            (acc, dc) => {
                const deId = dc.dec_de_id;
                if (deId == null) return acc;
                if (dc.dec_status === "READY") acc[deId] = (acc[deId] ?? 0) + 1;
                return acc;
            },
            {},
        );

        /**
        * Description: ฟังก์ชัน reducer สำหรับจัดกลุ่ม accessories ตาม de_id (acc_de_id)
        * Input : acc (Record<number, AccessoriesSchema[]>), a (AccessoriesSchema)
        * Output : acc (Record<number, AccessoriesSchema[]>)
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const accessoriesByDeviceId = accessories.reduce<Record<number, AccessoriesSchema[]>>(
            (acc, a) => {
                const deId = a.acc_de_id;
                if (deId == null) return acc;
                (acc[deId] ??= []).push(a);
                return acc;
            },
            {},
        );

        /**
         * Description: ฟังก์ชัน mapper สำหรับแปลง cart_items ให้อยู่ในรูปแบบ response ที่ frontend ใช้
         *              - แนบข้อมูล device/category/department/section/accessories
         *              - แนบ device_childs ของแต่ละ cart item
         *              - คำนวณ availability จากจำนวน READY
         * Input : cartItem (CartItemSchema)
         * Output : object (หนึ่งรายการของ itemData)
         * Author : Nontapat Sinhum (Guitar) 66160104
         **/
        const itemData = cart_items.map((cartItem: CartItemSchema) => {
            const device = devices.find((d) => d.de_id === cartItem.cti_de_id);

            const matchedCartDeviceChilds = cartDeviceChildsByCtiId.get(cartItem.cti_id) ?? [];

            /**
            * Description: map + filter เพื่อแปลง cdc_dec_id -> DeviceChildSchema[] (เฉพาะที่หาเจอจริง)
            * Input : matchedCartDeviceChilds
            * Output : matchedDeviceChilds (DeviceChildSchema[])
            * Author : Nontapat Sinhum (Guitar) 66160104
            **/
            const matchedDeviceChilds: DeviceChildSchema[] = matchedCartDeviceChilds
                .map((cdc) => deviceChildById.get(cdc.cdc_dec_id))
                .filter((dc): dc is DeviceChildSchema => Boolean(dc));

            const category = categories.find((c) => c.ca_id === device?.de_ca_id);

            const accessory = accessories.find((a) => a.acc_de_id === device?.de_id);

            const section = sections.find((s) => s.sec_id === device?.de_sec_id);

            const department = departments.find((d) => d.dept_id === section?.sec_dept_id);

            const deId = device?.de_id ?? null;

            const dec_count = deId != null ? deviceChildCountByDeviceId[deId] ?? 0 : 0;
            const dec_ready_count = deId != null ? deviceChildReadyCountByDeviceId[deId] ?? 0 : 0;

            const dec_availability = dec_ready_count > 0 ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน";

            const deviceAccessories = deId != null ? accessoriesByDeviceId[deId] ?? [] : [];

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
                accessories: deviceAccessories,
                device_childs: matchedDeviceChilds,
            };
        });

        return { itemData };
    });
}

/**
 * Description: ฟังก์ชันลบรายการอุปกรณ์ออกจากรถเข็นตาม Cart Item ID (ลบแบบถาวร)
 * Input : params (IdParamDto) = { id: number } (Cart Item ID)
 * Output : Promise<{ message: string }>
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
async function deleteCartItemById(params: DeleteCartItemPayload) {
    const { cartItemId } = params;

    const cartItem = await prisma.cart_items.findUnique({ where: { cti_id: cartItemId } });
    if (!cartItem) throw new Error("CartItem not found");

    // ลบจริง
    await prisma.cart_items.delete({
        where: { cti_id: cartItemId },
    });

    return { message: "Delete Cart Item successfully" };
};

/**
 * Description: ฟังก์ชันสร้าง Borrow Return Ticket จาก Cart Item ที่เลือก
 * ใช้ข้อมูลอุปกรณ์และผู้ใช้จากรถเข็นในการสร้างคำร้อง และทำ soft-delete cart item หลังสร้างสำเร็จ
 * Input : params (CreateBorrowTicketPayload) = { cartItemId: number }
 * Output : Promise<any> = ข้อมูล Borrow Ticket ที่สร้างใหม่
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export async function createBorrowTicket(params: CreateBorrowTicketPayload) {
    const { cartItemId } = params;

    return prisma.$transaction(async (tx) => {
        //ดึง cart_item (ของจริงเป็น 1 record ใช้ findUnique/First แทน findMany)
        const cartItem = await tx.cart_items.findUnique({
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
                cti_de_id: true,
                deleted_at: true,
            },
        });

        if (!cartItem || cartItem.deleted_at) {
            throw new Error("Cart item not found");
        }

        if (cartItem.cti_de_id == null) {
            throw new Error("Device not found on cart item");
        }

        //ดึง device เพื่อเอา flow (af_id)
        const device = await tx.devices.findUnique({
            where: { de_id: cartItem.cti_de_id },
            select: {
                de_id: true,
                de_af_id: true,
            },
        });

        if (!device?.de_af_id) {
            throw new Error("Approval flow not found on device");
        }

        //ดึง cart เพื่อเอา requester (ct_us_id)
        const cart = await tx.carts.findUnique({
            where: { ct_id: cartItem.cti_ct_id },
            select: {
                ct_id: true,
                ct_us_id: true,
            },
        });

        if (!cart?.ct_us_id) {
            throw new Error("Cart requester not found");
        }

        const user = await tx.users.findUnique({
            where: { us_id: cart.ct_us_id },
            select: {
                us_id: true,
                us_firstname: true,
                us_lastname: true,
            },
        });
        //สร้าง borrow_return_ticket
        const newBorrowTicket = await tx.borrow_return_tickets.create({
            data: {
                brt_status: "PENDING",
                brt_usage_location: cartItem.cti_usage_location,
                brt_borrow_purpose: cartItem.cti_note,
                brt_start_date: cartItem.cti_start_date,
                brt_end_date: cartItem.cti_end_date,
                brt_quantity: cartItem.cti_quantity,
                brt_current_stage: 1,
                created_at: new Date(),
                requester: {
                    connect: { us_id: cart.ct_us_id },
                },
                flow: {
                    connect: { af_id: device.de_af_id },
                },
            },
            select: {
                brt_id: true,
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
                requester: { select: { us_id: true } },
                flow: { select: { af_id: true } },
                created_at: true,
            },
        });

        //บันทึก log การสร้างคำร้อง
        await tx.log_borrow_returns.create({
            data: {
                lbr_action: "CREATED",
                lbr_new_status: "CREATED",
                lbr_note: `${user.us_firstname} ${user.us_lastname} ส่งคำร้องการยืมอุปกรณ์`,
                lbr_actor_id: cart.ct_us_id,
                lbr_brt_id: newBorrowTicket.brt_id,
                created_at: new Date(),
            },
        });

        //soft-delete cart item
        await tx.cart_items.update({
            where: { cti_id: cartItemId },
            data: { deleted_at: new Date() },
        });

        return newBorrowTicket;
    });
}
/**
 * Description: ฟังก์ชันสร้าง ticket_devices และ device_availabilities ตาม device_child ที่ถูกเลือกใน cart
 * ทำงานภายใต้ transaction เพื่อให้ข้อมูลสอดคล้องกัน (สร้างสำเร็จทั้งหมดหรือ rollback ทั้งหมด)
 * Input : params (CreateTicketDevicePayload) = { cartItemId: number, borrowTicketId: number }
 * Output : Promise<Array<{ ticketDevice: any; availability: any }>> = ผลลัพธ์ที่สร้างต่อ device_child
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
async function createTicketDevice(params: CreateTicketDevicePayload) {

    const { cartItemId, borrowTicketId } = params;

    //ครอบทั้งฟังก์ชันด้วย transaction
    return prisma.$transaction(async (tx) => {

        //ใช้ tx แทน prisma
        const borrowTicket = await tx.borrow_return_tickets.findUnique({
            where: { brt_id: borrowTicketId },
            select: { brt_id: true, brt_af_id: true },
        });

        if (!borrowTicket) throw new Error("Ticket not found");

        //ชดึง cart_item เป็น record เดียว
        const cart_item = await tx.cart_items.findUnique({
            where: { cti_id: cartItemId },
            select: { cti_id: true, cti_de_id: true, cti_start_date: true, cti_end_date: true, },
        });
        if (!cart_item) throw new Error("Cart item not found");

        //td_dec_id เป็น Int ห้าม null/undefined
        if (cart_item.cti_de_id == null) {
            throw new Error("Cart item has no device child (cti_dec_id is null)");
        }

        const cartDeviceChilds = await tx.cart_device_childs.findMany({
            where: { cdc_cti_id: cartItemId, deleted_at: null },
            select: { cdc_id: true, cdc_dec_id: true },
            orderBy: { cdc_id: "asc" },
        });

        if (cartDeviceChilds.length === 0) {
            return [];
        }

        const results = await Promise.all(
            cartDeviceChilds.map(async (cdc) => {
                const [ticketDevice, availability] = await Promise.all([
                    tx.ticket_devices.create({
                        data: {
                            td_brt_id: borrowTicket.brt_id,
                            td_dec_id: cdc.cdc_dec_id,
                            td_origin_cti_id: cartItemId,
                            created_at: new Date(),
                        },
                        select: {
                            td_id: true,
                            td_brt_id: true,
                            td_dec_id: true,
                            td_origin_cti_id: true,
                            created_at: true,
                        },
                    }),

                    tx.device_availabilities.create({
                        data: {
                            da_dec_id: cdc.cdc_dec_id,
                            da_brt_id: borrowTicket.brt_id,
                            da_start: cart_item.cti_start_date,
                            da_end: cart_item.cti_end_date,
                            da_status: "ACTIVE",
                            created_at: new Date(),
                        },
                        select: {
                            da_id: true,
                            da_dec_id: true,
                            da_brt_id: true,
                            da_start: true,
                            da_end: true,
                            da_status: true,
                            created_at: true,
                        },
                    }),
                ]);

                return { ticketDevice, availability };
            })
        );

        return results;
    });

}

/**
 * Description: ฟังก์ชันสร้าง stages ของ Borrow Ticket ตาม approval flow steps และเพิ่ม stage STAFF Distribution ปิดท้าย
 * ทำงานภายใต้ transaction เพื่อให้สร้าง stage ได้ครบชุดหรือ rollback ทั้งหมด
 * Input : params (CreateBorrowTicketStagePayload) = { cartItemId: number, borrowTicketId: number }
 * Output : Promise<any[]> = stages ที่สร้างจาก approval_flow_steps (ไม่รวม stage STAFF Distribution ที่สร้างเพิ่มท้าย)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
async function createBorrowTicketStages(params: CreateBorrowTicketStagePayload) {
    const { cartItemId, borrowTicketId } = params;

    //ครอบทั้งฟังก์ชันด้วย transaction
    return prisma.$transaction(async (tx) => {

        //ใช้ tx แทน prisma
        const borrowTicket = await tx.borrow_return_tickets.findUnique({
            where: { brt_id: borrowTicketId },
            select: { brt_id: true, brt_af_id: true },
        });

        if (!borrowTicket) throw new Error("Ticket not found");

        //ดึงข้อมูลทั้งหมดภายใต้ transaction เดียว
        const [
            approval_flows,
            sections,
            departments,
            cart_items,
            device_childs,
            devices,
        ] = await Promise.all([
            tx.approval_flows.findMany({
                select: {
                    af_id: true,
                    af_name: true,
                    af_is_active: true,
                    af_us_id: true,
                },
            }),
            tx.sections.findMany({
                select: {
                    sec_id: true,
                    sec_name: true,
                    sec_dept_id: true,
                },
            }),
            tx.departments.findMany({
                select: {
                    dept_id: true,
                    dept_name: true,
                },
            }),
            tx.cart_items.findMany({
                where: { cti_id: cartItemId },
                select: {
                    cti_id: true,
                    cti_de_id: true,
                },
            }),
            tx.device_childs.findMany({
                select: {
                    dec_id: true,
                    dec_de_id: true,
                },
            }),
            tx.devices.findMany({
                select: {
                    de_id: true,
                    de_sec_id: true,
                },
            }),
        ]);

        const approval_flow = approval_flows.find(
            (af) => af.af_id === borrowTicket.brt_af_id
        );

        if (!approval_flow) {
            throw new Error("Approval flow not found");
        }

        /**
        * Description: ดึงขั้นตอนการอนุมัติทั้งหมดของ approval flow และเรียงตามลำดับการอนุมัติ
        * Input : approval_flow.af_id
        * Output : approval_flow_steps (array)
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const approval_flow_steps = await tx.approval_flow_steps.findMany({
            where: { afs_af_id: approval_flow.af_id },
            orderBy: { afs_step_approve: "asc" },
        });

        //section / department ของอุปกรณ์ (ใช้ STAFF stage)
        const cart_item = cart_items[0];
        const device = devices.find(
            (de) => de.de_id === cart_item.cti_de_id
        );
        const device_child = device_childs.find(
            (dc) => dc.dec_de_id === device.de_id
        );
        const section = sections.find(
            (sec) => sec.sec_id === device?.de_sec_id
        );
        const department = departments.find(
            (dept) => dept.dept_id === section?.sec_dept_id
        );

        /**
        * Description: helper สำหรับดึงชื่อแผนกจาก dept_id
        * Input : deptId (number | null | undefined)
        * Output : string | null
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const getDeptName = (deptId?: number | null) =>
            departments.find((dept) => dept.dept_id === deptId)?.dept_name ?? null;

        /**
        * Description: helper สำหรับดึงชื่อฝ่ายย่อยจาก sec_id
        * Input : secId (number | null | undefined)
        * Output : string | null
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const getSecName = (secId?: number | null) =>
            sections.find((sec) => sec.sec_id === secId)?.sec_name ?? null;

        /**
        * Description: สร้าง stages ตาม approval_flow_steps โดยตั้งค่าเริ่มต้นเป็น PENDING และเชื่อมกับ ticket
        * Input : approval_flow_steps, borrowTicketId
        * Output : Promise<any[]> = stages ที่สร้างจาก steps
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const stages = await Promise.all(
            approval_flow_steps.map((step) => {
                return tx.borrow_return_ticket_stages.create({
                    data: {
                        brts_name: `${step.afs_role ?? ""} Approval`.trim(),
                        brts_step_approve: step.afs_step_approve,
                        brts_role: step.afs_role,
                        department: step.afs_dept_id
                            ? { connect: { dept_id: step.afs_dept_id } }
                            : undefined,
                        section: step.afs_sec_id
                            ? { connect: { sec_id: step.afs_sec_id } }
                            : undefined,
                        brts_dept_name: getDeptName(step.afs_dept_id),
                        brts_sec_name: getSecName(step.afs_sec_id),
                        brts_status: "PENDING",
                        ticket: {
                            connect: { brt_id: borrowTicketId },
                        },
                        created_at: new Date(),
                    },
                });
            })
        );

        /**
        * Description: สร้าง stage สุดท้ายสำหรับ STAFF Distribution ตามแผนก/ฝ่ายย่อยของอุปกรณ์
        * Input : department, section, borrowTicketId
        * Output : Promise<any>
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        await tx.borrow_return_ticket_stages.create({
            data: {
                brts_name: "STAFF Distribution",
                brts_step_approve: approval_flow_steps.length + 1,
                brts_role: "STAFF",
                department: department?.dept_id
                    ? { connect: { dept_id: department.dept_id } }
                    : undefined,
                section: section?.sec_id
                    ? { connect: { sec_id: section.sec_id } }
                    : undefined,
                brts_dept_name: department?.dept_name ?? null,
                brts_sec_name: section?.sec_name ?? null,
                brts_status: "PENDING",
                created_at: new Date(),
                ticket: {
                    connect: { brt_id: borrowTicketId },
                },
            },
        });

        return stages;
    });

}

/**
 * Description: ฟังก์ชันสร้าง ticket_devices และ device_availabilities ตาม device_child ที่ถูกเลือกใน cart
 * ทำงานภายใต้ transaction เพื่อให้ข้อมูลสอดคล้องกัน (สร้างสำเร็จทั้งหมดหรือ rollback ทั้งหมด)
 * Input : params (CreateTicketDevicePayload) = { cartItemId: number, borrowTicketId: number }
 * Output : Promise<Array<{ ticketDevice: any; availability: any }>> = ผลลัพธ์ที่สร้างต่อ device_child
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
async function createTicketDevice(params: CreateTicketDevicePayload) {

    const { cartItemId, borrowTicketId } = params;

    //ครอบทั้งฟังก์ชันด้วย transaction
    return prisma.$transaction(async (tx) => {

        //ใช้ tx แทน prisma
        const borrowTicket = await tx.borrow_return_tickets.findUnique({
            where: { brt_id: borrowTicketId },
            select: { brt_id: true, brt_af_id: true },
        });

        if (!borrowTicket) throw new Error("Ticket not found");

        //ชดึง cart_item เป็น record เดียว
        const cart_item = await tx.cart_items.findUnique({
            where: { cti_id: cartItemId },
            select: { cti_id: true, cti_de_id: true, cti_start_date: true, cti_end_date: true, },
        });
        if (!cart_item) throw new Error("Cart item not found");

        //td_dec_id เป็น Int ห้าม null/undefined
        if (cart_item.cti_de_id == null) {
            throw new Error("Cart item has no device child (cti_dec_id is null)");
        }

        const cartDeviceChilds = await tx.cart_device_childs.findMany({
            where: { cdc_cti_id: cartItemId, deleted_at: null },
            select: { cdc_id: true, cdc_dec_id: true },
            orderBy: { cdc_id: "asc" },
        });

        if (cartDeviceChilds.length === 0) {
            return [];
        }

        const results = await Promise.all(
            cartDeviceChilds.map(async (cdc) => {
                const [ticketDevice, availability] = await Promise.all([
                    tx.ticket_devices.create({
                        data: {
                            td_brt_id: borrowTicket.brt_id,
                            td_dec_id: cdc.cdc_dec_id,
                            td_origin_cti_id: cartItemId,
                            created_at: new Date(),
                        },
                        select: {
                            td_id: true,
                            td_brt_id: true,
                            td_dec_id: true,
                            td_origin_cti_id: true,
                            created_at: true,
                        },
                    }),

                    tx.device_availabilities.create({
                        data: {
                            da_dec_id: cdc.cdc_dec_id,
                            da_brt_id: borrowTicket.brt_id,
                            da_start: cart_item.cti_start_date ?? "",
                            da_end: cart_item.cti_end_date ?? "",
                            da_status: "ACTIVE",
                            created_at: new Date(),
                        },
                        select: {
                            da_id: true,
                            da_dec_id: true,
                            da_brt_id: true,
                            da_start: true,
                            da_end: true,
                            da_status: true,
                            created_at: true,
                        },
                    }),
                ]);

                return { ticketDevice, availability };
            })
        );

        return results;
    });

}

/**
 * Description: ฟังก์ชันสร้าง stages ของ Borrow Ticket ตาม approval flow steps และเพิ่ม stage STAFF Distribution ปิดท้าย
 * ทำงานภายใต้ transaction เพื่อให้สร้าง stage ได้ครบชุดหรือ rollback ทั้งหมด
 * Input : params (CreateBorrowTicketStagePayload) = { cartItemId: number, borrowTicketId: number }
 * Output : Promise<any[]> = stages ที่สร้างจาก approval_flow_steps (ไม่รวม stage STAFF Distribution ที่สร้างเพิ่มท้าย)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
async function createBorrowTicketStages(params: CreateBorrowTicketStagePayload) {
    const { cartItemId, borrowTicketId } = params;

    //ครอบทั้งฟังก์ชันด้วย transaction
    return prisma.$transaction(async (tx) => {

        //ใช้ tx แทน prisma
        const borrowTicket = await tx.borrow_return_tickets.findUnique({
            where: { brt_id: borrowTicketId },
            select: { brt_id: true, brt_af_id: true },
        });

        if (!borrowTicket) throw new Error("Ticket not found");

        //ดึงข้อมูลทั้งหมดภายใต้ transaction เดียว
        const [
            approval_flows,
            sections,
            departments,
            cart_items,
            device_childs,
            devices,
        ] = await Promise.all([
            tx.approval_flows.findMany({
                select: {
                    af_id: true,
                    af_name: true,
                    af_is_active: true,
                    af_us_id: true,
                },
            }),
            tx.sections.findMany({
                select: {
                    sec_id: true,
                    sec_name: true,
                    sec_dept_id: true,
                },
            }),
            tx.departments.findMany({
                select: {
                    dept_id: true,
                    dept_name: true,
                },
            }),
            tx.cart_items.findMany({
                where: { cti_id: cartItemId },
                select: {
                    cti_id: true,
                    cti_de_id: true,
                },
            }),
            tx.device_childs.findMany({
                select: {
                    dec_id: true,
                    dec_de_id: true,
                },
            }),
            tx.devices.findMany({
                select: {
                    de_id: true,
                    de_sec_id: true,
                },
            }),
        ]);

        const approval_flow = approval_flows.find(
            (af) => af.af_id === borrowTicket.brt_af_id
        );

        if (!approval_flow) {
            throw new Error("Approval flow not found");
        }

        /**
        * Description: ดึงขั้นตอนการอนุมัติทั้งหมดของ approval flow และเรียงตามลำดับการอนุมัติ
        * Input : approval_flow.af_id
        * Output : approval_flow_steps (array)
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const approval_flow_steps = await tx.approval_flow_steps.findMany({
            where: { afs_af_id: approval_flow.af_id },
            orderBy: { afs_step_approve: "asc" },
        });

        //section / department ของอุปกรณ์ (ใช้ STAFF stage)
        const cart_item = cart_items[0];
        const device = devices.find(
            (de) => de.de_id === cart_item.cti_de_id
        );
        const device_child = device_childs.find(
            (dc) => dc.dec_de_id === device?.de_id
        );
        const section = sections.find(
            (sec) => sec.sec_id === device?.de_sec_id
        );
        const department = departments.find(
            (dept) => dept.dept_id === section?.sec_dept_id
        );

        /**
        * Description: helper สำหรับดึงชื่อแผนกจาก dept_id
        * Input : deptId (number | null | undefined)
        * Output : string | null
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const getDeptName = (deptId?: number | null) =>
            departments.find((dept) => dept.dept_id === deptId)?.dept_name ?? null;

        /**
        * Description: helper สำหรับดึงชื่อฝ่ายย่อยจาก sec_id
        * Input : secId (number | null | undefined)
        * Output : string | null
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const getSecName = (secId?: number | null) =>
            sections.find((sec) => sec.sec_id === secId)?.sec_name ?? null;

        /**
        * Description: สร้าง stages ตาม approval_flow_steps โดยตั้งค่าเริ่มต้นเป็น PENDING และเชื่อมกับ ticket
        * Input : approval_flow_steps, borrowTicketId
        * Output : Promise<any[]> = stages ที่สร้างจาก steps
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        const stages = await Promise.all(
            approval_flow_steps.map((step) => {
                return tx.borrow_return_ticket_stages.create({
                    data: {
                        brts_name: `${step.afs_role ?? ""} Approval`.trim(),
                        brts_step_approve: step.afs_step_approve,
                        brts_role: step.afs_role,
                        department: step.afs_dept_id
                            ? { connect: { dept_id: step.afs_dept_id } }
                            : undefined,
                        section: step.afs_sec_id
                            ? { connect: { sec_id: step.afs_sec_id } }
                            : undefined,
                        brts_dept_name: getDeptName(step.afs_dept_id),
                        brts_sec_name: getSecName(step.afs_sec_id),
                        brts_status: "PENDING",
                        ticket: {
                            connect: { brt_id: borrowTicketId },
                        },
                        created_at: new Date(),
                    },
                });
            })
        );

        /**
        * Description: สร้าง stage สุดท้ายสำหรับ STAFF Distribution ตามแผนก/ฝ่ายย่อยของอุปกรณ์
        * Input : department, section, borrowTicketId
        * Output : Promise<any>
        * Author : Nontapat Sinhum (Guitar) 66160104
        **/
        await tx.borrow_return_ticket_stages.create({
            data: {
                brts_name: "STAFF Distribution",
                brts_step_approve: approval_flow_steps.length + 1,
                brts_role: "STAFF",
                department: department?.dept_id
                    ? { connect: { dept_id: department.dept_id } }
                    : undefined,
                section: section?.sec_id
                    ? { connect: { sec_id: section.sec_id } }
                    : undefined,
                brts_dept_name: department?.dept_name ?? null,
                brts_sec_name: section?.sec_name ?? null,
                brts_status: "PENDING",
                created_at: new Date(),
                ticket: {
                    connect: { brt_id: borrowTicketId },
                },
            },
        });

        return stages;
    });

}
/** GET /borrow/cart/device/:id
 * Description: ดึงรายละเอียดอุปกรณ์ในรถเข็น (Cart Item) ตาม Cart Item ID
 * รวมข้อมูลความสัมพันธ์กับ Cart และ Device Child ที่ถูกเลือก
 *
 * Input  : ctiId (number) - รหัส Cart Item
 * Output : Promise<CartItem> - ข้อมูล Cart Item พร้อม cart และ cart_device_childs
 *
 * Logic :
 *   - ค้นหา cart_items ที่ยังไม่ถูกลบ (deleted_at = null)
 *   - include ข้อมูล cart
 *   - include cart_device_childs และ device_child ที่เกี่ยวข้อง
 *   - ถ้าไม่พบข้อมูล ให้ throw error
 *
 * Author : Rachata Jitjeankhan (Tang) 66160369
 */
async function getCartDeviceDetail(
  ctiId: number
): Promise<CartDeviceDetailSchema> {
  const cartItem = await prisma.cart_items.findFirst({
    where: {
      cti_id: ctiId,
      deleted_at: null,
    },
    include: {
      cart: true,
      cart_device_childs: {
        include: {
          device_child: true,
        },
      },
    },
  });

  if (!cartItem) {
    throw new Error("ไม่พบข้อมูลอุปกรณ์ในรถเข็น");
  }

  return cartItem;
}
/** PATCH /borrow/cart/device/:id
 * Description: ดึงรายละเอียดอุปกรณ์ในรถเข็น (Cart Item) ตาม Cart Item ID
 * รวมข้อมูลความสัมพันธ์กับ Cart และ Device Child ที่ถูกเลือก
 *
 * Input  : ctiId (number) - รหัส Cart Item
 * Output : Promise<CartItem> - ข้อมูล Cart Item พร้อม cart และ cart_device_childs
 *
 * Logic :
 *   - ค้นหา cart_items ที่ยังไม่ถูกลบ (deleted_at = null)
 *   - include ข้อมูล cart
 *   - include cart_device_childs และ device_child ที่เกี่ยวข้อง
 *   - ถ้าไม่พบข้อมูล ให้ throw error
 *
 * Author : Rachata Jitjeankhan (Tang) 66160369
 */

async function updateCartDeviceDetail(
  ctiId: number,
  payload: UpdateCartDeviceDetailBodyDto
): Promise<UpdateCartDeviceDetailDataSchema> {
  const exists = await prisma.cart_items.findFirst({
    where: { cti_id: ctiId, deleted_at: null },
  });

  if (!exists) {
    throw new Error("ไม่พบข้อมูลอุปกรณ์ในรถเข็น");
  }

  const updated = await prisma.cart_items.update({
    where: { cti_id: ctiId },
    data: payload,
    include: {
      cart: true,
      cart_device_childs: {
        include: { device_child: true },
      },
    },
  });

  return updated;
}

export const cartsService = {
  getCartItem,
  deleteCartItemById,
  createBorrowTicket,
  getCartDeviceDetail,
  updateCartDeviceDetail,
};
    getCartItem, deleteCartItemById, createBorrowTicket, createTicketDevice, createBorrowTicketStages,
};
