import type { Request, Response, NextFunction } from "express";
import { sendOtpPayload, loginPayload, TokenDto, verifyOtpPayload, forgotPasswordPayload, AuthRequest, accessTokenPayload, MeDto, resetPasswordPayload, sessionResponse, SessionResponse } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";
import { setJwtCookie, clearJwtCookie } from "../../utils/jwt.js";

/**
 * Description: คอนโทรลเลอร์ Auth ดูแล login/logout ให้ตอบแบบ BaseResponse ตามมาตรฐานโปรเจกต์
 * Input : req/res/next ของ Express
 * Output : login -> BaseResponse<TokenDto>, logout -> BaseResponse<void>
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export class AuthController extends BaseController {
    constructor() {
        super()
    }

    /**
     * Description: รับ body ตาม schema แล้วเช็กล็อกอิน ถ้าถูกก็ส่ง accessToken กลับ
     * Input : req.body ที่ผ่าน zod (loginPayload)
     * Output : { message: "Login successful", data: { accessToken } }
     * Author : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async login(req: Request, res: Response, _next: NextFunction): Promise<BaseResponse<TokenDto>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = loginPayload.parse(req.body);
        const result = await authService.checkLogin(payload);

        // ตั้ง HttpOnly cookie สำหรับ SSO กับ Chatbot ด้วย
        setJwtCookie(res, result);

        return { message: "Login successful", data: { accessToken: result } };
    }

    /**
     * Description: เอา Bearer token มา logout (ใส่ blacklist) แล้วตอบสำเร็จ
     * Input : Authorization: Bearer <token>
     * Output : { message: "Logout successful" }
     * Author : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async logout(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // ต้องมี Authorization: Bearer <token> มา ไม่งั้นไม่รับ
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new HttpError(HttpStatus.BAD_REQUEST, 'Missing token')
        }

        // แกะเอา token แล้วไปทำ blacklist/revoke ใน service
        const token = authHeader.slice(7).trim();
        await authService.logout(token);

        return { message: "Logout successful" };
    }

    /**
     * Description: ดึงข้อมูลผู้ใช้ปัจจุบันจาก token
     * Input : req.user จาก auth middleware
     * Output : { message: "Fetch me successful", data: meDto }
     * Author : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async fetchMe(req: AuthRequest, _res: Response, _next: NextFunction): Promise<BaseResponse<MeDto>> {
        const user = accessTokenPayload.parse(req.user);
        const result = await authService.fetchMe(user);
        return { message: "Fetch me successful", data: result };
    }

    /**
    * Description: Controller สำหรับส่ง OTP ไปยังอีเมลของผู้ใช้ เพื่อใช้ในการรีเซ็ตรหัสผ่าน
    * Input     : req.body (email) - อีเมลของผู้ใช้ที่ต้องการขอ OTP
    * Output    : { message: string } - ข้อความแจ้งผลการส่ง OTP
    * Author    : Pakkapon Chomchoey (Tonnam) 66160080
    */
    async sendOtp(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = sendOtpPayload.parse(req.body);
        const { message } = await authService.sendOtp(payload);
        return { message };
    }

    /**
     * Description: Controller สำหรับยืนยัน OTP ที่ผู้ใช้กรอกเข้ามา เพื่อตรวจสอบความถูกต้อง
     * Input     : req.body (email, otp) - อีเมลและรหัส OTP ที่ผู้ใช้กรอก
     * Output    : { success: boolean, message: string } - ผลการยืนยันและข้อความ
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async verifyOtp(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = verifyOtpPayload.parse(req.body);
        const { success, message } = await authService.verifyOtp(payload);
        return { success, message };
    }

    /**
     * Description: Controller สำหรับคนที่ลืมรหัสผ่าน และต้องการรีเซ็ตรหัสผ่าน
     * Input     : req.body (email) - อีเมลของผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน เพราะลืมรหัสผ่าน
     * Output    : { message: string } - ข้อความแจ้งผลการส่งลิงก์รีเซ็ตรหัสผ่าน
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async forgotPassword(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = forgotPasswordPayload.parse(req.body);
        const { message } = await authService.forgotPassword(payload);
        return { message };
    }

    /**
     * Description: Controller สำหรับตั้งรหัสผ่านใหม่ผ่าน token ที่ได้รับจากอีเมล หลังจากสร้าง account ใหม่
     * Input     : req.body (token, newPassword) - token จากอีเมลและรหัสผ่านใหม่ที่ต้องการตั้ง
     * Output    : { message: string } - ข้อความแจ้งผลการรีเซ็ตรหัสผ่าน
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async resetPassword(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = resetPasswordPayload.parse(req.body);
        const { message } = await authService.resetPassword(payload);
        return { message };
    }

    /**
     * Description: Session endpoint สำหรับ Chatbot SSO - คืนข้อมูล user, roles, exp
     * Input     : req.user จาก auth middleware (ผ่าน cookie หรือ Bearer token)
     * Output    : { user: { sub, role, dept, sec }, roles: string[], exp: number }
     * Note      : ใช้โดย Chatbot เพื่อตรวจสอบสถานะการเข้าสู่ระบบ
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async getSession(req: AuthRequest, _res: Response, _next: NextFunction): Promise<BaseResponse<SessionResponse>> {
        const user = req.user;
        if (!user) {
            throw new HttpError(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        return {
            message: "Session valid",
            data: {
                user: {
                    sub: user.sub,
                    role: user.role,
                    dept: user.dept,
                    sec: user.sec,
                },
                roles: [user.role],
                exp: user.exp ?? 0,
            }
        };
    }

    /**
     * Description: Login with cookie-based authentication (for SSO with Chatbot)
     * Input     : req.body (username, passwords, isRemember)
     * Output    : { message: "Login successful" } + Set-Cookie header
     * Note      : คล้าย login ปกติแต่ตั้งค่า HttpOnly cookie แทนการส่ง token กลับ
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async loginWithCookie(req: Request, res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        const payload = loginPayload.parse(req.body);
        const { token, maxAge } = await authService.checkLoginWithCookie(payload);

        // Set HttpOnly cookie for SSO
        setJwtCookie(res, token, maxAge);

        return { message: "Login successful" };
    }

    /**
     * Description: Logout with cookie clearing (for SSO with Chatbot)
     * Input     : req.token (จาก auth middleware)
     * Output    : { message: "Logout successful" } + Clear-Cookie header
     * Note      : ลบทั้ง token จาก blacklist และ clear cookie
     * Author    : Pakkapon Chomchoey (Tonnam) 66160080
     */
    async logoutWithCookie(req: AuthRequest, res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        const token = req.token;

        if (token) {
            await authService.logout(token);
        }

        // Clear the cookie
        clearJwtCookie(res);

        return { message: "Logout successful" };
    }
}