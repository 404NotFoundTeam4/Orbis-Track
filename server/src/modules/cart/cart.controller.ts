import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  CartItemSchema,
  idParamSchema,
  CartItemListResponse,
  createBorrowTicketPayload,
} from "./cart.schema.js";
import { cartsService } from "./cart.service.js";

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
   * Description : แก้ไขรายละเอียดอุปกรณ์ในรถเข็นตาม Cart Item ID
   * Trigger     : เมื่อเรียก PUT /borrow/cart/:id
   * Flow        :
   *   1. รับ cti_id จาก params และข้อมูลที่แก้ไขจาก body
   *   2. ส่งข้อมูลไปอัปเดตที่ cartsService
   *   3. ส่งผลลัพธ์การอัปเดตกลับไปยัง Client
   * Author      : Salsabeela Sa-e (San) 66160349
   */
  async updateCartItem(ctx: any) {
    const { params, body } = ctx;

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
    // เรียกใช้งาน service เพื่อบันทึกข้อมูลลงฐานข้อมูล
    const result = await cartsService.createBorrowTecket(params);

    // คืนค่าบัญชีผู้ใช้ใหม่
    return { data: result };
  }
}
