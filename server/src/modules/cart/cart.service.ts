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
  const deviceChildCountByDeviceId = device_childs.reduce<Record<number, number>>(
    (acc, dc) => {
      if (dc.dec_de_id == null) return acc;
      acc[dc.dec_de_id] = (acc[dc.dec_de_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // นับจำนวน device_child ที่ READY ต่อ de_id
  const deviceChildReadyCountByDeviceId = device_childs.reduce<Record<number, number>>(
    (acc, dc) => {
      if (dc.dec_de_id == null) return acc;
      if (dc.dec_status === "READY") {
        acc[dc.dec_de_id] = (acc[dc.dec_de_id] ?? 0) + 1;
      }
      return acc;
    },
    {}
  );

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
      deId != null ? deviceChildCountByDeviceId[deId] ?? 0 : 0;
    const dec_ready_count =
      deId != null ? deviceChildReadyCountByDeviceId[deId] ?? 0 : 0;
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
 * ลบ cart item ตาม cti_id
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

export const cartsService = {
  getCartItem,
  deleteCartItemById,
  updateCartItemById,
};
