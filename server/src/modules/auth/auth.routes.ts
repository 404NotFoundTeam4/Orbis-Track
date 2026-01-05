import { Router } from "../../core/router.js";
import { RateLimitMiddleware } from "../../middlewares/rate-limit.middleware.js";
import { AuthController } from './auth.controller.js';
import { sendOtpPayload, loginPayload, meDto, tokenDto, verifyOtpPayload, forgotPasswordPayload, resetPasswordPayload } from "./auth.schema.js";

const authController = new AuthController();
const router = new Router();

router.postDoc("/login", {
    tag: "Auth",
    summary: "เข้าสู่ระบบ",
    description: "เข้าสู่ระบบด้วย username และ password เพื่อรับ JWT Access Token สำหรับใช้งาน API ที่ต้องการ authentication",
    body: loginPayload,
    res: tokenDto
}, authController.login);

router.postDoc("/logout", {
    tag: "Auth",
    summary: "ออกจากระบบ",
    description: "ออกจากระบบและยกเลิก token ปัจจุบัน",
    auth: true
}, authController.logout);

router.postDoc("/send-otp", {
    tag: "Auth",
    summary: "ส่ง OTP ไปยังอีเมล",
    description: "ส่งรหัส OTP 6 หลักไปยังอีเมลที่ระบุเพื่อยืนยันตัวตน",
    body: sendOtpPayload
}, RateLimitMiddleware.getOtpLimit, authController.sendOtp);

router.postDoc("/verify-otp", {
    tag: "Auth",
    summary: "ยืนยัน OTP",
    description: "ตรวจสอบรหัส OTP ที่ได้รับทางอีเมล",
    body: verifyOtpPayload
}, RateLimitMiddleware.verifyOtpLimit, authController.verifyOtp);

router.postDoc("/forgot-password", {
    tag: "Auth",
    summary: "ลืมรหัสผ่าน",
    description: "ส่งคำขอรีเซ็ตรหัสผ่าน จะได้รับลิงก์รีเซ็ตทางอีเมล",
    body: forgotPasswordPayload
}, authController.forgotPassword);

router.postDoc("/reset-password", {
    tag: "Auth",
    summary: "รีเซ็ตรหัสผ่าน",
    description: "รีเซ็ตรหัสผ่านโดยใช้ token ที่ได้รับจากอีเมล",
    body: resetPasswordPayload
}, authController.resetPassword);

const fetchMe = new Router(undefined, "/auth");
fetchMe.getDoc("/fetch-me", {
    tag: "Auth",
    summary: "ดึงข้อมูลผู้ใช้ปัจจุบัน",
    description: "ดึงข้อมูลรายละเอียดของผู้ใช้ที่เข้าสู่ระบบอยู่ (จาก JWT token)",
    auth: true,
    res: meDto
}, authController.fetchMe);

export const fetchMeRouter = fetchMe.instance;
export default router.instance;