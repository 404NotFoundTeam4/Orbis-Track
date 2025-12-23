import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { InventoryController } from "./inventory.controller.js";
import {
    createDeviceChildPayload,
    createDeviceChildSchema,
    deleteDeviceChildPayload,
    getDeviceWithChildsSchema,
    idParamSchema,
    uploadFileDeviceChildSchema,
    inventorySchema,
    softDeleteResponseSchema,
    updateDevicePayload
} from "./inventory.schema.js";

const inventoryController = new InventoryController();
const router = new Router(undefined, '/inventory');

router.getDoc("/departments", { tag: "Inventory", auth: true }, inventoryController.getDepartments);
router.getDoc("/categories", { tag: "Inventory", auth: true }, inventoryController.getCategories);
router.getDoc("/sub-sections", { tag: "Inventory", auth: true }, inventoryController.getSubSections);
router.getDoc("/approval-flows", { tag: "Inventory", auth: true }, inventoryController.getApprovalFlows);

router.getDoc("/devices/:id", { tag: "Inventory", params: idParamSchema,res: getDeviceWithChildsSchema, auth: true }, inventoryController.getDeviceWithChilds);
router.postDoc("/devices-childs", { tag: "Inventory", body: createDeviceChildPayload, res: createDeviceChildSchema.array(), auth: true }, inventoryController.create);
router.postDoc("/devices/:id/upload-childs", { tag: "Inventory", params: idParamSchema, res: uploadFileDeviceChildSchema, auth: true }, upload.single("file"), inventoryController.uploadFileDeviceChild);
router.deleteDoc("/devices-childs", { tag: "Inventory", body: deleteDeviceChildPayload, auth: true }, inventoryController.delete);
// Get All Devices
router.getDoc("/", { 
    tag: "Inventory", 
    res: inventorySchema, 
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

// update Device
router.patchDoc("/devices/:id", { 
    tag: "Inventory",
    params: idParamSchema,    
    body: updateDevicePayload, 
    res: inventorySchema,  
    auth: true 
}, inventoryController.update);

export default router.instance;