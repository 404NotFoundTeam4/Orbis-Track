import { Router } from "../../core/router.js";
import { AuthController } from './auth.controller.js';

const authController = new AuthController();
const router = new Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);

export default router.instance;