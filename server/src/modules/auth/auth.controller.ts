import type { Request, Response, NextFunction } from "express";
import { loginPayload, TokenDto } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";

export class AuthController extends BaseController {
    constructor() {
        super()
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<TokenDto>> {
        const payload = loginPayload.parse(req.body);
        const result = await authService.checkLogin(payload);
        return { message: "Login successful", data: { token: result } };
    }
}