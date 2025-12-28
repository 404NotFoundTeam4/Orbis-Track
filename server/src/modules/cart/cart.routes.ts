import { Router } from "../../core/router.js";
import { CartController } from "./cart.controller.js";
import {
  idParamSchema,
  cartItemSchema,
  cartItemListResponseSchema,
  updateCartItemSchema, // 👈 เพิ่ม
} from "./cart.schema.js";

const cartsController = new CartController();
const router = new Router(undefined, "/borrow/cart");

/**
 * GET: ดึงรายการ cart ตาม ct_id
 */
router.getDoc(
  "/:id",
  {
    tag: "Carts",
    res: cartItemListResponseSchema,
    auth: true,
    params: idParamSchema,
  },
  cartsController.getCartItemList
);

/**
 * PATCH: แก้ไข cart item ตาม cti_id
 */
router.patchDoc(
  "/:id",
  {
    tag: "Carts",
    auth: true,
    params: idParamSchema,
    body: updateCartItemSchema, // 👈 body สำหรับ update
  },
  cartsController.updateCartItem
);

router.putDoc(
  "/:id",
  {
    tag: "Carts",
    auth: true,
    params: idParamSchema,
    body: cartItemSchema.partial(),
  },
  cartsController.updateCartItem
);


/**
 * DELETE: ลบ cart item ตาม cti_id
 */
router.deleteDoc(
  "/:id",
  {
    tag: "Carts",
    res: cartItemSchema,
    auth: true,
    params: idParamSchema,
  },
  cartsController.deleteCartItem
);

export default router.instance;
