import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { CartItemSchema, idParamSchema, CartItemListResponse } from "./cart.schema.js";
import { cartsService } from "./cart.service.js";

export class CartController extends BaseController {
  constructor() {
    super();
  }

  async getCartItemList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CartItemListResponse>> {
    const id = idParamSchema.parse(req.params);
    const cartItems = await cartsService.getCartItem(id);
    return { data: cartItems };
  }

  async deleteCartItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse> {
    const id = idParamSchema.parse(req.params);
    const result = await cartsService.deleteCartItemById(id);
    return { message: result.message };
  }
}