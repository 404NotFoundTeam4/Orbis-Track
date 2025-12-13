import { Router } from "../../core/router.js";
import { InventoryController } from "./inventory.controller.js";
import { getInventorySchema } from "./inventory.schema.js";

const inventoryController = new InventoryController();
const router = new Router(undefined, '/inventory');

router.getDoc('/devices', { tag: "Inventory", res: getInventorySchema, auth: true }, inventoryController.getInventory);

export default router.instance;