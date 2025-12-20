import { Router } from "../../core/router.js";
import { BorrowController } from "./borrows.controller.js";
import { createBorrowTicketPayload, createBorrowTicketSchema, getDeviceForBorrowSchema, getInventorySchema, idParamSchema } from "./borrows.schema.js";

const borrowController = new BorrowController();
const router = new Router(undefined, '/inventory');

router.getDoc('/devices', { tag: "Borrow", res: getInventorySchema, auth: true }, borrowController.getInventory);

router.getDoc('/devices/:id', { tag: "Borrow", params: idParamSchema, res: getDeviceForBorrowSchema, auth: true }, borrowController.getDeviceForBorrow);

router.postDoc('/send-ticket', { tag: "Borrow", body: createBorrowTicketPayload, res: createBorrowTicketSchema, auth: true  }, borrowController.createBorrowTicket);

export default router.instance;