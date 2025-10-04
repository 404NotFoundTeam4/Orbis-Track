import { Router } from "../../core/router.js";
import { UserController } from "./user.controller.js";

const userController = new UserController();
const router = new Router();

router.get("/:id", userController.get);
//ADD
router.get("/", userController.getAll);
router.post("/", userController.create);

export default router.instance;