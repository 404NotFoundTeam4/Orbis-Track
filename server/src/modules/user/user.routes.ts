import { Router } from "../../core/router.js";
import { UserController } from "./user.controller.js";
import { getAllUsersResponseSchema, userSchema , softDeleteResponseSchema, IdParamSchema, } from "./user.schema.js";

const userController = new UserController();
const router = new Router(undefined, '/users');

router.get("/:id", userController.get);
router.getDoc("/", { tag: "Users", res: getAllUsersResponseSchema, auth: true } ,userController.getAll);

router.deleteDoc("/:id" , { tag : "Users" , auth : true , params : IdParamSchema , res : softDeleteResponseSchema } ,userController.softDelete);


// router.post("/", userController.create);

export default router.instance;