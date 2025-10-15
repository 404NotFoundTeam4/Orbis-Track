import { Router } from "../../core/router.js";
import { RoleController } from "./role.controller.js";
import { getAllUsersRole } from "./role.schema.js";

const roleController = new RoleController();
const router = new Router(undefined, '/roles');

router.getDoc("/", { tag: "Roles", res: getAllUsersRole, auth: true }, roleController.getAll);
// router.post("/", userController.create);

export default router.instance;