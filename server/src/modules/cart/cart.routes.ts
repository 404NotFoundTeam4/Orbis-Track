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
  cartsController.createTicket
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
    res: updateCartDeviceDetailDataSchema,
  },
  cartsController.updateCartDeviceDetail
);
router.getDoc("/", { tag: "Carts", res: cartItemListResponseSchema, auth: true }, cartsController.getCartItemList);
router.deleteDoc("/", { tag: "Carts", res: cartItemSchema, body: deleteCartItemPayload, auth: true }, cartsController.deleteCartItem);
router.postDoc("/", { tag: "Carts", body: createBorrowTicketPayload, auth: true }, cartsController.createTicket);

export default router.instance;