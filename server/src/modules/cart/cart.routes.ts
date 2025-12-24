import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { CartController } from "./cart.controller.js";
import {
  idParamSchema,
  cartItemSchema,
  cartItemListResponseSchema,
  createBorrowTicketPayload,
  getCartDeviceDetailParamSchema,
  cartDeviceDetailSchema,
  updateCartDeviceDetailParamSchema,
  updateCartDeviceDetailBodySchema,
  updateCartDeviceDetailResponseSchema,
  borrowReturnTicketsSchema,
} from "./cart.schema.js";

const cartsController = new CartController();
const router = new Router(undefined, '/borrow/cart');

router.getDoc("/:id", { tag: "Carts", res: cartItemListResponseSchema, auth: true, params: idParamSchema }, cartsController.getCartItemList);
router.deleteDoc("/:id", { tag: "Carts", res: cartItemSchema, auth: true, params: idParamSchema }, cartsController.deleteCartItem);
router.postDoc(
  "/:id",
  {
    tag: "Carts",
    params: idParamSchema,
    body: createBorrowTicketPayload,
    res: borrowReturnTicketsSchema,
    auth: true,
  },
  cartsController.create
);

/* =========================
 * GET /borrow/cart/device/:id
 * ========================= */
router.getDoc(
  "/device/:id",
  {
    tag: "Borrow Cart",
    auth: true,
    params: getCartDeviceDetailParamSchema,
    res: cartDeviceDetailSchema,
  },
  cartsController.getCartDeviceDetail
);

/* =========================
 * PATCH /borrow/cart/device/:id
 * ========================= */
router.patchDoc(
  "/device/:id",
  {
    tag: "Borrow Cart",
    auth: true,
    params: updateCartDeviceDetailParamSchema,
    body: updateCartDeviceDetailBodySchema,
    res: updateCartDeviceDetailResponseSchema,
  },
  cartsController.updateCartDeviceDetail
);

export default router.instance;