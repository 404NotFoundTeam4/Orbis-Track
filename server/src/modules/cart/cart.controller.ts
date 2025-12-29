import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { cartsService } from "./cart.service.js";
import {
  idParamSchema,
  CartItemListResponse,
  createBorrowTicketPayload,
  getCartDeviceDetailParamSchema,
  CartDeviceDetailSchema,
  UpdateCartDeviceDetailDataSchema,
  UpdateCartDeviceDetailBodySchema,
  updateCartDeviceDetailBodySchema,
  updateCartDeviceDetailParamSchema,
} from "./cart.schema.js";


/**
 * Description : Controller สำหรับจัดการ Cart และการส่งคำร้องขอยืมอุปกรณ์
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
export class CartController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description : ดึงรายการอุปกรณ์ทั้งหมดในรถเข็นตาม Cart ID
   * Trigger : เมื่อเรียก GET /borrow/cart/:id
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  async getCartItemList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CartItemListResponse>> {
    const id = idParamSchema.parse(req.params);
    const cartItems = await cartsService.getCartItem(id);
    return { data: cartItems };
  }

  /**
   * Description : ลบอุปกรณ์ออกจากรถเข็นตาม Cart Item ID
   * Trigger : เมื่อเรียก DELETE /borrow/cart/:id
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  async deleteCartItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = idParamSchema.parse(req.params);
    const result = await cartsService.deleteCartItemById(id);
    return { message: result.message };
  }

  /**
  * Description : สร้าง Borrow Return Ticket จากรายการอุปกรณ์ที่เลือกในรถเข็น
  * Trigger : เมื่อเรียก POST /borrow/cart/:id
  * Author : Nontapat Sinhum (Guitar) 66160104
  */
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const params = createBorrowTicketPayload.parse(req.body);
    const result = await cartsService.createBorrowTicket(params);

    return {
      message: "สร้าง Borrow Return Ticket สำเร็จ",
      data: result,
    };
  }
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
  async getCartDeviceDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CartDeviceDetailSchema>> {
    // .parse จะดึง id ออกมาเป็น number ตาม schema ที่เราตั้งไว้
    const { id } = getCartDeviceDetailParamSchema.parse(req.params);

    // เรียกใช้ service (เช็คให้ชัวร์ว่า import cartsService มาแล้ว)
    const cartItem = await cartsService.getCartDeviceDetail(id);

    // คืนค่ารูปแบบ Object เพื่อให้ BaseController เอาไปส่ง res.json() ต่อเอง
    return {
      message: "ดึงข้อมูลรายละเอียดอุปกรณ์ในรถเข็นสำเร็จ",
      data: cartItem,
    };
  }

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
 async updateCartDeviceDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<BaseResponse<UpdateCartDeviceDetailDataSchema>> {
  const { id } = updateCartDeviceDetailParamSchema.parse(req.params);
  const payload = updateCartDeviceDetailBodySchema.parse(req.body);
  const updatedDevice = await cartsService.updateCartDeviceDetail(id, payload);

  return {  
    message: "แก้ไขรายละเอียดอุปกรณ์ในรถเข็นสำเร็จ",
    data: updatedDevice,
  };
}
}