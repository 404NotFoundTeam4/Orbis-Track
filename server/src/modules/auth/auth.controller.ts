import type { Request, Response, NextFunction } from "express";
import { sendOtpPayload, loginPayload, TokenDto, verifyOtpPayload, forgotPasswordPayload, AuthRequest, accessTokenPayload, MeDto, resetPasswordPayload } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";

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
    async login(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<TokenDto>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = loginPayload.parse(req.body);
        const result = await authService.checkLogin(payload);
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

    async sendOtp(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = sendOtpPayload.parse(req.body);
        const { message } = await authService.sendOtp(payload);
        return { message };
    }

    async verifyOtp(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = verifyOtpPayload.parse(req.body);
        const { success, message } = await authService.verifyOtp(payload);
        return { success, message };
    }

    async forgotPassword(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = forgotPasswordPayload.parse(req.body);
        const { message } = await authService.forgotPassword(payload);
        return { message };
    }

    async resetPassword(req: Request, _res: Response, _next: NextFunction): Promise<BaseResponse<void>> {
        // validate body ด้วย zod ให้แน่ใจว่ารูปแบบ body ที่ client ถูก
        const payload = resetPasswordPayload.parse(req.body);
        const { message } = await authService.resetPassword(payload);
        return { message };
    }
}