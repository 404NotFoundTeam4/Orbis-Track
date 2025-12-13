import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { DevicesController } from "./inventorys.controller.js";
import { createDevicePayload,createDeviceSchema } from "./inventorys.schema.js";

const devicesController = new DevicesController();
const router = new Router(undefined, '/inventorys');

router.postDoc("/devices", { tag: "inventorys", body: createDevicePayload, res: createDeviceSchema, auth: true }, upload.single("us_images"), devicesController.create);
router.getDoc("/add-device", { tag: "inventorys", body: createDevicePayload, res: createDeviceSchema, auth: true }, upload.single("us_images"), devicesController.create);


export default router.instance;