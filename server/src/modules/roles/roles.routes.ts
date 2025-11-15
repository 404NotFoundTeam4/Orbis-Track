import { Router } from "../../core/router.js";
import { RoleController } from "./roles.controller.js";
import { getAllUsersRole } from "./roles.schema.js";

const roleController = new RoleController();
const router = new Router(undefined, '/roles');

router.getDoc("/", { tag: "Roles", res: getAllUsersRole, auth: true }, roleController.getAll);

export default router.instance;