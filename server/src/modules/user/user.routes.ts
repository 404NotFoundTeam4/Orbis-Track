import { Router } from "../../core/router.js";
import { UserController } from "./user.controller.js";
import { getAllUsersResponseSchema, userSchema, editUserSchema, editUserResponseSchema, IdParamSchema } from "./user.schema.js";

const userController = new UserController();
const router = new Router(undefined, '/users');

router.get("/:id", userController.get);
router.getDoc("/", { tag: "Users", res: getAllUsersResponseSchema, auth: true }, userController.getAll);
// router.post("/", userController.create);
router.put("/:id", userController.update);
router.patchDoc("/:id", { tag: "Users", auth: true, params: IdParamSchema, res: editUserResponseSchema,body: editUserSchema,  },userController.update);

export default router.instance;