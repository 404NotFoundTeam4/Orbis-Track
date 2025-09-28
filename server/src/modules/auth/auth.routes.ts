import { Router } from "../../core/router.js";
import { AuthController } from './auth.controller.js';
import { loginPayload, tokenDto } from "./auth.schema.js";

const authController = new AuthController();
const router = new Router();

router.postDoc("/login", { tag: "Auth", body: loginPayload, res: tokenDto }, authController.login);
router.postDoc("/logout", { tag: "Auth", auth: true }, authController.logout);

export default router.instance;