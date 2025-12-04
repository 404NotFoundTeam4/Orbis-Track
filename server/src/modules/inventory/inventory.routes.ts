import { Router } from "../../core/router.js";
import { InventoryController } from "./inventory.controller.js";
import { 
    inventorySchema, 
    idParamSchema, 
    softDeleteResponseSchema 
} from "./inventory.schema.js";

const inventoryController = new InventoryController();
// กำหนด prefix path เป็น /inventory
const router = new Router(undefined, '/inventory');

// Get All Devices
router.getDoc("/", { 
    tag: "Inventory", 
    res: inventorySchema, // หมายเหตุ: ระบบ Router อาจต้องการ z.array(inventorySchema) หากรองรับ
    auth: true 
}, inventoryController.getAll);

// Get Device By ID
router.getDoc("/:id", { 
    tag: "Inventory", 
    res: inventorySchema, 
    auth: true, 
    params: idParamSchema 
}, inventoryController.get);

// Soft Delete Device
router.deleteDoc("/:id", { 
    tag: "Inventory", 
    auth: true, 
    params: idParamSchema, 
    res: softDeleteResponseSchema 
}, inventoryController.softDelete);

export default router.instance;