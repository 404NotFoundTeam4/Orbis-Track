import { Router } from "../../core/router.js";
import { InventoryController } from "./inventory.controller.js";

const inventoryController = new InventoryController();
const router = new Router(undefined, '/inventory');

router.get('/devices', inventoryController.getInventory);

export default router.instance;