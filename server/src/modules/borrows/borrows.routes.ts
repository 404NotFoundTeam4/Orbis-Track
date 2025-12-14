import { Router } from "../../core/router.js";
import { BorrowController } from "./borrows.controller.js";
import { getInventorySchema } from "./borrows.schema.js";

const borrowController = new BorrowController();
const router = new Router(undefined, '/inventory');

router.getDoc('/devices', { tag: "Borrow", res: getInventorySchema, auth: true }, borrowController.getInventory);

export default router.instance;