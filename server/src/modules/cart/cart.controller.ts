import type { RequestHandler } from "../../core/router.js";
import {
  getCartDeviceDetailParamSchema,
  updateCartDeviceDetailParamSchema,
  updateCartDeviceDetailBodySchema,
} from "./cart.schema.js";
import { CartService } from "./cart.service.js";

export class CartController {
  private readonly service = new CartService();

    /* =========================
   * GET /borrow/cart/device/:id
   * ========================= */
  /**
   * Description: Controller สำหรับดึงข้อมูลรายละเอียดอุปกรณ์ในรถเข็น
   * Input     : req.params.id - id ของ cart item
   * Output    : Object ของ cart item รวม relation cart และ device_child
   * Logic     :
   *   - ตรวจสอบพารามิเตอร์ id ผ่าน getCartDeviceDetailParamSchema
   *   - เรียก CartService.getCartDeviceDetail เพื่อนำข้อมูลจาก database
   *   - คืนค่า response พร้อม message และ data
   * Author    : Rachata Jitjeankhan (Tang) 66160369
   */
  getCartDeviceDetail: RequestHandler = async (req) => {
    const { id } = getCartDeviceDetailParamSchema.parse(req.params);

    const data = await this.service.getCartDeviceDetail(id);

    return {
      message: "ดึงข้อมูลรายละเอียดอุปกรณ์ในรถเข็นสำเร็จ",
      data,
    };
  };

  /* =========================
   * PATCH /borrow/cart/device/:id
   * ========================= */
  /**
   * Description: Controller สำหรับแก้ไขรายละเอียดอุปกรณ์ในรถเข็น
   * Input     : 
   *   - req.params.id - id ของ cart item
   *   - req.body - payload สำหรับแก้ไข เช่น ชื่อผู้ใช้, เบอร์โทร, จำนวน, โน้ต, สถานที่ใช้งาน, วันที่เริ่ม-สิ้นสุด
   * Output    : Object ของ cart item หลัง update พร้อม relation cart และ device_child
   * Logic     :
   *   - ตรวจสอบพารามิเตอร์ id ผ่าน updateCartDeviceDetailParamSchema
   *   - ตรวจสอบ body payload ผ่าน updateCartDeviceDetailBodySchema
   *   - เรียก CartService.updateCartDeviceDetail เพื่อนำข้อมูลไป update database
   *   - คืนค่า response พร้อม message และ data
   * Author    : Rachata Jitjeankhan (Tang) 66160369
   */
  updateCartDeviceDetail: RequestHandler = async (req) => {
    const { id } = updateCartDeviceDetailParamSchema.parse(req.params);
    const payload = updateCartDeviceDetailBodySchema.parse(req.body);

    const data = await this.service.updateCartDeviceDetail(id, payload);

    return {
      message: "แก้ไขรายละเอียดอุปกรณ์ในรถเข็นสำเร็จ",
      data,
    };
  };
}
