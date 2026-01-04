import { Router } from "../../core/router.js";
import { CartController } from "./cart.controller.js";
import {
  idParamSchema,
  cartItemSchema,
  cartItemListResponseSchema,
  updateCartItemSchema, 
  createBorrowTicketPayload, 
} from "./cart.schema.js";

const cartsController = new CartController();
const router = new Router(undefined, "/borrow/cart");

router.getDoc("/:id", { tag: "Carts", res: cartItemListResponseSchema, auth: true, params: idParamSchema }, cartsController.getCartItemList);
router.deleteDoc("/:id", { tag: "Carts", res: cartItemSchema, auth: true, params: idParamSchema }, cartsController.deleteCartItem);
router.postDoc("/:id", { tag: "Carts", params: idParamSchema, body: createBorrowTicketPayload, auth: true }, cartsController.create);

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
