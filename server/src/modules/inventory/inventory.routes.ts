import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { InventoryController } from "./inventory.controller.js";
import {
    createDevicePayload,
    createDeviceResponseSchema,
    createApprovalFlowsPayload,
    createApprovalFlowResponseSchema,    
    createDeviceChildPayload,
    createDeviceChildSchema,
    deleteDeviceChildPayload,
    getDeviceWithChildsSchema,
    idParamSchema,
    uploadFileDeviceChildSchema,
    getDeviceWithSchema,
    getApprovalFlowSchema
} from "./inventory.schema.js";

const inventoryController = new InventoryController();
const router = new Router(undefined, '/inventory');
router.postDoc("/add", { tag: "Inventory", body: createDevicePayload, res: createDeviceResponseSchema, auth: true }, upload.single("us_images"), inventoryController.createDevice);
router.getDoc("/add", { tag: "Inventory", res: getDeviceWithSchema, auth: true }, inventoryController.getDevices);

router.postDoc("/approval", { tag: "Inventory", body:createApprovalFlowsPayload   , res: createApprovalFlowResponseSchema, auth: true }, inventoryController.createFlows);
router.getDoc("/add-approval", { tag: "Inventory", res: getApprovalFlowSchema, auth: true }, inventoryController.getFlows);

router.getDoc("/devices/:id", { tag: "Inventory", params: idParamSchema,res: getDeviceWithChildsSchema, auth: true }, inventoryController.getDeviceWithChilds);
router.postDoc("/devices-childs", { tag: "Inventory", body: createDeviceChildPayload, res: createDeviceChildSchema.array(), auth: true }, inventoryController.create);
router.postDoc("/devices/:id/upload-childs", { tag: "Inventory", params: idParamSchema, res: uploadFileDeviceChildSchema, auth: true }, upload.single("file"), inventoryController.uploadFileDeviceChild);
router.deleteDoc("/devices-childs", { tag: "Inventory", body: deleteDeviceChildPayload, auth: true }, inventoryController.delete);

export default router.instance;