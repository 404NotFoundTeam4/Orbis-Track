import { prisma } from "../../infrastructure/database/client.js";
import {
  AccessoriesSchema,
  CartItemSchema,
  CategoriesSchema,
  DeviceChildSchema,
  DeviceSchema,
  IdParamDto,
} from "./cart.schema.js";
import {
  DepartmentSchema,
  SectionSchema,
} from "../departments/departments.schema.js";

/**
 * ดึงรายการ cart ตาม ct_id
import { AccessoriesSchema, CartItemSchema, CartSchema, CategoriesSchema, CreateBorrowTicketPayload, DeviceChildSchema, DeviceSchema, IdParamDto, TicketDevicesSchema } from "./cart.schema.js";
import { DepartmentSchema, SectionSchema } from "../departments/departments.schema.js";

/**
 * Description : ดึงข้อมูลรายการอุปกรณ์ทั้งหมดในรถเข็นตาม Cart ID
 * รวมข้อมูลอุปกรณ์, หมวดหมู่, แผนก, ฝ่ายย่อย และสถานะความพร้อมใช้งาน
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
async function getCartItem(params: IdParamDto) {
  const ctId = Number(params.id);

  if (isNaN(ctId)) {
    throw new Error("Invalid ct_id");
  }

  const [
    cart_items,
    device_childs,
    devices,
    accessories,
    categories,
    departments,
    sections,
  ] = await Promise.all([
    prisma.cart_items.findMany({
      where: { cti_ct_id: ctId },
    }) as Promise<CartItemSchema[]>,

    prisma.device_childs.findMany() as Promise<DeviceChildSchema[]>,
    prisma.devices.findMany() as Promise<DeviceSchema[]>,
    prisma.accessories.findMany() as Promise<AccessoriesSchema[]>,
    prisma.categories.findMany() as Promise<CategoriesSchema[]>,
    prisma.departments.findMany() as Promise<DepartmentSchema[]>,
    prisma.sections.findMany() as Promise<SectionSchema[]>,
  ]);

  if (!cart_items.length) {
    return { itemData: [] };
  }

  // นับจำนวน device_child ทั้งหมด ต่อ de_id
  const deviceChildCountByDeviceId = device_childs.reduce<
    Record<number, number>
  >((acc, dc) => {
    if (dc.dec_de_id == null) return acc;
    acc[dc.dec_de_id] = (acc[dc.dec_de_id] ?? 0) + 1;
    return acc;
  }, {});

  // นับจำนวน device_child ที่ READY ต่อ de_id
  const deviceChildReadyCountByDeviceId = device_childs.reduce<
    Record<number, number>
  >((acc, dc) => {
    if (dc.dec_de_id == null) return acc;
    if (dc.dec_status === "READY") {
      acc[dc.dec_de_id] = (acc[dc.dec_de_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  const itemData = cart_items.map((cartItem) => {
    const device = devices.find((d) => d.de_id === cartItem.cti_de_id);
    const category = categories.find((c) => c.ca_id === device?.de_ca_id);
    const accessory = accessories.find((a) => a.acc_de_id === device?.de_id);
    const section = sections.find((s) => s.sec_id === device?.de_sec_id);
    const department = departments.find(
      (d) => d.dept_id === section?.sec_dept_id
    );

    const deId = device?.de_id ?? null;
    const dec_count =
      deId != null ? (deviceChildCountByDeviceId[deId] ?? 0) : 0;
    const dec_ready_count =
      deId != null ? (deviceChildReadyCountByDeviceId[deId] ?? 0) : 0;
    const dec_availability =
      dec_ready_count > 0 ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน";

    return {
      cti_id: cartItem.cti_id,
      cti_us_name: cartItem.cti_us_name,
      cti_phone: cartItem.cti_phone,
      cti_note: cartItem.cti_note,
      cti_usage_location: cartItem.cti_usage_location,
      cti_quantity: cartItem.cti_quantity,
      cti_start_date: cartItem.cti_start_date,
      cti_end_date: cartItem.cti_end_date,
      cti_ct_id: cartItem.cti_ct_id,
      cti_de_id: cartItem.cti_de_id,
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
  const ctiId = Number(params.id);

  if (isNaN(ctiId)) {
    throw new Error("Invalid cti_id");
  }

  const cartItem = await prisma.cart_items.findUnique({
    where: { cti_id: ctiId },
  });

  if (!cartItem) {
    return { message: "CartItem not found" };
  }

  await prisma.cart_items.delete({
    where: { cti_id: ctiId },
  });

  return { message: "Delete Cart Item successfully" };
}

/**
 * แก้ไข cart item ตาม cti_id
 */
async function updateCartItemById(
  params: IdParamDto,
  body: {
    cti_quantity?: number;
    cti_start_date?: string | null;
    cti_end_date?: string | null;
    cti_us_name?: string | null;
    cti_phone?: string | null;
    cti_note?: string | null;
    cti_usage_location?: string | null;
  }
) {
  const ctiId = Number(params.id);

  if (isNaN(ctiId)) {
    throw new Error("Invalid cti_id");
  }

  const cartItem = await prisma.cart_items.findUnique({
    where: { cti_id: ctiId },
  });

  if (!cartItem) {
    return { message: "CartItem not found" };
  }

  const updated = await prisma.cart_items.update({
    where: { cti_id: ctiId },
    data: {
      cti_quantity: body.cti_quantity,
      cti_start_date: body.cti_start_date,
      cti_end_date: body.cti_end_date,
      cti_us_name: body.cti_us_name,
      cti_phone: body.cti_phone,
      cti_note: body.cti_note,
      cti_usage_location: body.cti_usage_location,
    },
  });

  return {
    message: "Update Cart Item successfully",
    data: updated,
  };
}

/**
 * Description : สร้าง Borrow Return Ticket จาก Cart Item ที่เลือก
 * ใช้ข้อมูลอุปกรณ์และผู้ใช้จากรถเข็นในการสร้างคำร้อง
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
async function createBorrowTecket(params: CreateBorrowTicketPayload) {
  const { cartItemId } = params;

  const cartItem = await prisma.cart_items.findMany({
    where: { cti_id: cartItemId },
  });
  if (!cartItem) throw new Error("Cart not found");
  const [cart_items, device_childs, devices, ticket_devices, carts] =
    await Promise.all([
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
  const device_child = device_childs.find(
    (dec) => dec.dec_id === cart_item?.cti_dec_id
  );
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
    },
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
  getCartItem,
  deleteCartItemById,
  createBorrowTecket,
};
