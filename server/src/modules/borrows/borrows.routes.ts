import { Router } from "../../core/router.js";
import { BorrowController } from "./borrows.controller.js";
import {
    addToCartPayload,
    addToCartSchema,
    createBorrowTicketPayload,
    createBorrowTicketSchema,
    getAvailableSchema,
    getDeviceForBorrowSchema,
    getInventorySchema,
    idParamSchema
} from "./borrows.schema.js";

const borrowController = new BorrowController();
const router = new Router(undefined, '/borrow');

router.getDoc('/devices', { tag: "Borrow", res: getInventorySchema, auth: true }, borrowController.getInventory);
router.getDoc('/devices/:id', { tag: "Borrow", params: idParamSchema, res: getDeviceForBorrowSchema, auth: true }, borrowController.getDeviceForBorrow);
router.getDoc('/available/:id', { tag: "Borrow", params: idParamSchema, res: getAvailableSchema, auth: true }, borrowController.getAvailable);
router.postDoc('/send-ticket', { tag: "Borrow", body: createBorrowTicketPayload, res: createBorrowTicketSchema, auth: true  }, borrowController.createBorrowTicket);
router.postDoc('/add-cart', { tag: "Borrow", body: addToCartPayload, res: addToCartSchema }, borrowController.addToCart);

export default router.instance;