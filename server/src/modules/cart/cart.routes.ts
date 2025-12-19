import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { CartController } from "./cart.controller.js";
import { idParamSchema, cartItemSchema, cartItemListResponseSchema } from "./cart.schema.js";

const cartsController = new CartController();
const router = new Router(undefined, '/borrow/cart');

router.getDoc("/:id", { tag: "Carts", res: cartItemListResponseSchema, auth: true, params: idParamSchema }, cartsController.getCartItemList);
router.deleteDoc("/:id", { tag: "Carts", res: cartItemSchema, auth: true, params: idParamSchema }, cartsController.deleteCartItem);

export default router.instance;