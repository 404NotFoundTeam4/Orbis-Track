import { Router } from "../../core/router.js";
import { UserController } from "./user.controller.js";
import { getAllUsersResponseSchema, editUserSchema, idParamSchema } from "./user.schema.js";

const userController = new UserController();
const router = new Router(undefined, '/users');

router.getDoc("/:id", {tag: "Users", res: getAllUsersResponseSchema, auth: true, params: idParamSchema} , userController.get);
router.getDoc("/", { tag: "Users", res: getAllUsersResponseSchema, auth: true }, userController.getAll);
router.patchDoc("/:id", { tag: "Users", auth: true, params: idParamSchema, body: editUserSchema }, userController.update);

export default router.instance;