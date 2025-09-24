import type { Request, Response, NextFunction } from "express";
import { loginPayload, TokenDto } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { HttpError } from "../../errors/errors.js";

export class AuthController extends BaseController {
    constructor() {
        super()
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<TokenDto>> {
        const payload = loginPayload.parse(req.body);
        const result = await authService.checkLogin(payload);
        return { message: "Login successful", data: { accessToken: result } };
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new HttpError(HttpStatus.BAD_REQUEST, 'Missing token')
        }

        const token = authHeader.slice(7).trim();
        await authService.logout(token);

        return { message: "Logout successful" };
    }
}