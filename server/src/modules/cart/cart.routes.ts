import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { CartController } from "./cart.controller.js";
import { idParamSchema, cartItemSchema, cartItemListResponseSchema, createBorrowTicketPayload, deleteCartItemPayload } from "./cart.schema.js";

const cartsController = new CartController();
const router = new Router(undefined, '/borrow/cart');

router.getDoc("/", { tag: "Carts", res: cartItemListResponseSchema, auth: true }, cartsController.getCartItemList);
router.deleteDoc("/", { tag: "Carts", res: cartItemSchema, body: deleteCartItemPayload, auth: true }, cartsController.deleteCartItem);
router.postDoc("/", { tag: "Carts", body: createBorrowTicketPayload, auth: true }, cartsController.createTicket);

export default router.instance;