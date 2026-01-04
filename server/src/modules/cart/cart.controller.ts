import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { ValidationError } from "../../errors/errors.js";
import {
  CartItemSchema,
  idParamSchema,
  CartItemListResponse,
  createBorrowTicketPayload,
  updateCartItemSchema,
} from "./cart.schema.js";
import { AuthRequest } from "../auth/auth.schema.js";
import { cartsService } from "./cart.service.js";
import {
  idParamSchema,
  CartItemListResponse,
  createBorrowTicketPayload,
  getCartDeviceDetailParamSchema,
  CartDeviceDetailSchema,
  UpdateCartDeviceDetailDataSchema,
  updateCartDeviceDetailBodySchema,
  updateCartDeviceDetailParamSchema,
  deleteCartItemPayload
} from "./cart.schema.js";


/**
* Description: Controller สำหรับจัดการ Cart และการส่งคำร้องขอยืมอุปกรณ์
* Input : -
* Output : CartController (class)
* Author : Nontapat Sinhum (Guitar) 66160104
**/
export class CartController extends BaseController {
  constructor() {
    super();
  }

  /**
  * Description: ฟังก์ชันดึงรายการอุปกรณ์ทั้งหมดในรถเข็นของผู้ใช้ตาม User ID (อ่านจาก token)
  * Trigger : เมื่อเรียก GET /borrow/cart/
  * Input : req.user.sub (ผ่าน idParamSchema) = { id: number }
  * Output : Promise<BaseResponse<CartItemListResponse>> = { data: { itemData: CartItem[] } }
  * Author : Nontapat Sinhum (Guitar) 66160104
  **/
  async getCartItemList(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CartItemListResponse>> {
    const id = idParamSchema.parse({ id: req.user?.sub });
    const cartItems = await cartsService.getCartItem(id);
    return { data: cartItems };
  }

  /**
  * Description: ฟังก์ชันลบอุปกรณ์ออกจากรถเข็นตาม Cart Item ID (ส่ง cartItemId ผ่าน body)
  * Trigger : เมื่อเรียก DELETE /borrow/cart/
  * Input : req.body (ผ่าน deleteCartItemPayload) = { cartItemId: number }
  * Output : Promise<BaseResponse> = { message: string }
  * Author : Nontapat Sinhum (Guitar) 66160104
  **/
  async deleteCartItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const { cartItemId } = deleteCartItemPayload.parse(req.body);

    const result = await cartsService.deleteCartItemById({ cartItemId });
    return { message: result.message };
  }

  /**
   * Description : แก้ไขรายละเอียดอุปกรณ์ในรถเข็นตาม Cart Item ID
   * Trigger     : เมื่อเรียก PUT /borrow/cart/:id
   * Flow        :
   *   1. รับ cti_id จาก params และข้อมูลที่แก้ไขจาก body
   *   2. ส่งข้อมูลไปอัปเดตที่ cartsService
   *   3. ส่งผลลัพธ์การอัปเดตกลับไปยัง Client
   * Author      : Salsabeela Sa-e (San) 66160349
   */
  async updateCartItem(data: any): Promise<BaseResponse> {
  const { params, body } = data;
  console.log("UpdateCartItem params:", params);
  console.log("UpdateCartItem body:", body);
  // params.id เป็น number แล้ว
  // body เป็น object ที่ผ่าน cartItemSchema.partial() แล้ว
  const updated = await cartsService.updateCartItemById(params, body);

  return {
    success: true,
    message: "Update cart item successfully",
    data: updated,
  };
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
    // สร้างคำร้อง (Borrow Ticket)    
    const borrowTicket = await cartsService.createBorrowTicket(params);

    // สร้างรายการอุปกรณ์ใน ticket + ตารางช่วงเวลา availability
    const ticketDevice = await cartsService.createTicketDevice({
      cartItemId: params.cartItemId,
      borrowTicketId: borrowTicket.brt_id,
    })

    // สร้างขั้นตอนการอนุมัติ (Stages)
    const borrowTicketStep = await cartsService.createBorrowTicketStages({
      cartItemId: params.cartItemId,
      borrowTicketId: borrowTicket.brt_id,
    })

    // คืนค่าข้อมูลคำร้อง
    return { data: borrowTicket };
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
