import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { CartItemSchema, idParamSchema, CartItemListResponse, createBorrowTicketPayload, deleteCartItemPayload } from "./cart.schema.js";
import { cartsService } from "./cart.service.js";
import { AuthRequest } from "../auth/auth.schema.js";

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
    const id = idParamSchema.parse({ id: req.user.sub });
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
  * Description: ฟังก์ชันสร้าง Borrow/Return Ticket จากรายการอุปกรณ์ที่เลือกในรถเข็น
  * กระบวนการ: สร้าง ticket -> สร้าง ticket_devices + device_availabilities -> สร้าง stages ของการอนุมัติ
  * Trigger : เมื่อเรียก POST /borrow/cart/
  * Input : req.body (ผ่าน createBorrowTicketPayload) = { cartItemId: number }
  * Output : Promise<BaseResponse> = { data: borrowTicket }
  * Author : Nontapat Sinhum (Guitar) 66160104
  **/
  async createTicket(
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
}