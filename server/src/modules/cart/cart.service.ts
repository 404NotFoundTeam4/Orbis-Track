import { prisma } from "../../infrastructure/database/client.js";
import { UpdateCartDeviceDetailBodySchema } from "./cart.schema.js";

export class CartService {
   /* =========================
   * GET
   * ========================= */
  /**
   * Description: ดึงข้อมูลรายละเอียดอุปกรณ์ในรถเข็น
   * Input     : ctiId (number) - id ของ cart item
   * Output    : Object ของ cart item รวมข้อมูล relation cart และ device_child
   * Logic     :
   *   - ตรวจสอบว่ามี cart item ที่ตรงกับ ctiId และยังไม่ถูกลบ
   *   - ใช้ prisma.findFirst เพื่อดึงข้อมูลจาก database
   *   - หากไม่พบข้อมูลให้ throw error
   * Author    : Rachata Jitjeankhan (Tang) 66160369
   */
  async getCartDeviceDetail(ctiId: number) {
    const cartItem = await prisma.cart_items.findFirst({
      where: {
        cti_id: ctiId,
        deleted_at: null,
      },
      include: {
        cart: true,
        device_child: true,
      },
    });

    if (!cartItem) {
      throw new Error("ไม่พบข้อมูลอุปกรณ์ในรถเข็น");
    }

    return cartItem;
  }

  /* =========================
   * PATCH
   * ========================= */
  /**
   * Description: แก้ไขรายละเอียดอุปกรณ์ในรถเข็น
   * Input     :
   *   - ctiId (number) - id ของ cart item
   *   - payload (UpdateCartDeviceDetailBodySchema) - ข้อมูลที่ต้องการแก้ไข
   * Output    : Object ของ cart item หลัง update รวม relation cart และ device_child
   * Logic     :
   *   - ตรวจสอบว่ามี cart item ที่ตรงกับ ctiId และยังไม่ถูกลบ
   *   - ใช้ prisma.update เพื่อแก้ไขข้อมูลใน database
   *   - หากไม่พบข้อมูลให้ throw error
   * Author    : Rachata Jitjeankhan (Tang) 66160369
   */
  async updateCartDeviceDetail(
    ctiId: number,
    payload: UpdateCartDeviceDetailBodySchema,
  ) {
    const exists = await prisma.cart_items.findFirst({
      where: { cti_id: ctiId, deleted_at: null },
    });

    if (!exists) throw new Error("ไม่พบข้อมูลอุปกรณ์ในรถเข็น");

    return prisma.cart_items.update({
      where: { cti_id: ctiId },
      data: payload,
      include: {
        cart: true,
        device_child: true,
      },
   });
  }
}

export const cartService = {
  getCartDeviceDetail: (id: number) =>
    new CartService().getCartDeviceDetail(id),
};
