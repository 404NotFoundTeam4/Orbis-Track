import { Router } from "../../core/router.js";
import { RateLimitMiddleware } from "../../middlewares/rate-limit.middleware.js";
import { AuthController } from './auth.controller.js';
import { sendOtpPayload, loginPayload, tokenDto, verifyOtpPayload, forgotPasswordPayload } from "./auth.schema.js";

const authController = new AuthController();
const router = new Router();

router.postDoc("/login", { tag: "Auth", body: loginPayload, res: tokenDto }, authController.login);
router.postDoc("/logout", { tag: "Auth", auth: true }, authController.logout);
router.postDoc("/send-otp", { tag: "Auth", body: sendOtpPayload }, RateLimitMiddleware.getOtpLimit, authController.sendOtp)
router.postDoc("/verify-otp", { tag: "Auth", body: verifyOtpPayload }, RateLimitMiddleware.verifyOtpLimit, authController.verifyOtp);
router.postDoc("/forgot-password", { tag: "Auth", body: forgotPasswordPayload }, authController.forgotPassword);

export default router.instance;