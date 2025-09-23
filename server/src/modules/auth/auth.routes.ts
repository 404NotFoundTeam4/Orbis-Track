import { Router } from "../../core/router.js";
import { AuthController } from './auth.controller.js';

const authController = new AuthController();
const router = new Router();

router.post("/login", authController.login);

export default router.instance;