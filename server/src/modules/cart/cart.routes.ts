import { Router } from "../../core/router.js";
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
  borrowReturnTicketsSchema,
  updateCartDeviceDetailDataSchema,
  deleteCartItemPayload,
  deviceAvailabilitiesSchema,
} from "./cart.schema.js";

const cartsController = new CartController();
const router = new Router(undefined, '/borrow/cart');

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
    res: updateCartDeviceDetailDataSchema,
  },
  cartsController.updateCartDeviceDetail
);
router.getDoc("/", { tag: "Carts", res: cartItemListResponseSchema, auth: true }, cartsController.getCartItemList);
router.deleteDoc("/", { tag: "Carts", res: cartItemSchema, body: deleteCartItemPayload, auth: true }, cartsController.deleteCartItem);
router.postDoc("/", { tag: "Carts", body: createBorrowTicketPayload, auth: true }, cartsController.createTicket);

export default router.instance;