import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { CartItemSchema, idParamSchema, CartItemListResponse, createBorrowTicketPayload } from "./cart.schema.js";
import { cartsService } from "./cart.service.js";

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
  * Description: ฟังก์ชันดึงรายการอุปกรณ์ทั้งหมดในรถเข็นตาม Cart ID
  * Trigger : เมื่อเรียก GET /borrow/cart/:id
  * Input : req.params (ผ่าน idParamSchema) = { id: number }
  * Output : Promise<BaseResponse<CartItemListResponse>> = { data: { itemData: [...] } }
  * Author : Nontapat Sinhum (Guitar) 66160104
  **/
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
  * Description: ฟังก์ชันลบอุปกรณ์ออกจากรถเข็นตาม Cart Item ID
  * Trigger : เมื่อเรียก DELETE /borrow/cart/:id
  * Input : req.params (ผ่าน idParamSchema) = { id: number }
  * Output : Promise<BaseResponse> = { message: string }
  * Author : Nontapat Sinhum (Guitar) 66160104
  **/
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
  * Description: ฟังก์ชันสร้าง Borrow Return Ticket จากรายการอุปกรณ์ที่เลือกในรถเข็น
  * กระบวนการ: สร้าง ticket -> สร้าง ticket_devices + device_availabilities -> สร้าง stages ของการอนุมัติ
  * Trigger : เมื่อเรียก POST /borrow/cart/:id
  * Input : req.body (ผ่าน createBorrowTicketPayload) = { cartItemId: number }
  * Output : Promise<BaseResponse> = { data: borrowTicket }
  * Author : Nontapat Sinhum (Guitar) 66160104
  **/
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const params = createBorrowTicketPayload.parse(req.body);
    // สร้างคำร้อง (Borrow Ticket)    
    const borrowTicket = await cartsService.createBorrowTecket(params);

    // สร้างรายการอุปกรณ์ใน ticket + ตารางช่วงเวลา availability
    const ticketDevice = await cartsService.createTecketDevice({
      cartItemId: params.cartItemId,
      borrowTicketId: borrowTicket.brt_id,
    })

    // สร้างขั้นตอนการอนุมัติ (Stages)
    const borrowTicketStep = await cartsService.createBorrowTecketStages({
      cartItemId: params.cartItemId,
      borrowTicketId: borrowTicket.brt_id,
    })

    // คืนค่าข้อมูลคำร้อง
    return { data: borrowTicket };
  }
}