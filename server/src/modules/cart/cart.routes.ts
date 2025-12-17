import { Router } from "../../core/router.js";
import { CartController } from "./cart.controller.js";
import {
  getCartDeviceDetailParamSchema,
  cartDeviceDetailSchema,
  updateCartDeviceDetailParamSchema,
  updateCartDeviceDetailBodySchema,
  updateCartDeviceDetailResponseSchema,
} from "./cart.schema.js";

const router = new Router(undefined, '/borrow/cart');
const controller = new CartController();

/* =========================
 * GET /borrow/cart/device/:id
 * ========================= */
/**
 * Description: Route สำหรับดึงข้อมูลรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : 
 *   - req.params.id - id ของ cart item
 * Output    : Object ของ cart item รวม relation cart และ device_child
 * Logic     :
 *   - ตรวจสอบพารามิเตอร์ id ผ่าน getCartDeviceDetailParamSchema
 *   - เรียก CartController.getCartDeviceDetail เพื่อดึงข้อมูล
 *   - ส่ง response ตาม schema cartDeviceDetailSchema
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
router.getDoc(
  "/device/:id",
  {
    tag: "Borrow Cart",
    auth: true,
    params: getCartDeviceDetailParamSchema,
    res: cartDeviceDetailSchema,
  },
  controller.getCartDeviceDetail,
);

/* =========================
 * PATCH /borrow/cart/device/:id
 * ========================= */
/**
 * Description: Route สำหรับแก้ไขรายละเอียดอุปกรณ์ในรถเข็น
 * Input     : 
 *   - req.params.id - id ของ cart item
 *   - req.body - payload สำหรับแก้ไข เช่น ชื่อผู้ใช้, เบอร์โทร, จำนวน, โน้ต, สถานที่ใช้งาน, วันที่เริ่ม-สิ้นสุด
 * Output    : Object ของ cart item หลัง update รวม relation cart และ device_child
 * Logic     :
 *   - ตรวจสอบพารามิเตอร์ id ผ่าน updateCartDeviceDetailParamSchema
 *   - ตรวจสอบ body payload ผ่าน updateCartDeviceDetailBodySchema
 *   - เรียก CartController.updateCartDeviceDetail เพื่อ update ข้อมูล
 *   - ส่ง response ตาม schema updateCartDeviceDetailResponseSchema
 * Author    : Rachata Jitjeankhan (Tang) 66160369
 */
router.patchDoc(
  "/device/:id",
  {
    tag: "Borrow Cart",
    auth: true,
    params: updateCartDeviceDetailParamSchema,
    body: updateCartDeviceDetailBodySchema,
    res: updateCartDeviceDetailResponseSchema,
  },
  controller.updateCartDeviceDetail,
);

export default router.instance;
