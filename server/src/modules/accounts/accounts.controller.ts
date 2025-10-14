import type { Request, Response, NextFunction } from "express";
import { accountsService } from "./accounts.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { createAccountsPayload, CreateAccountsSchema, GetAllAccountsResponseSchema } from "./accounts.schema.js";

// Extend Request type to include multer file
interface MulterRequest extends Request {
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
    };
}

export class AccountsController extends BaseController {
    constructor() {
        super()
    }

    async get(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("Invalid id");
        const user = await accountsService.getAccountsById(id);
        if (!user) throw new HttpError(HttpStatus.NOT_FOUND, "User not found");
        return { data: user };
    }

    // ดึงพนักงานทั้งหมด
    async getAll(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<GetAllAccountsResponseSchema>> {
        const user = await accountsService.getAllAccounts();
        return { data: user };
    }

    // เพิ่มพนักงาน
    async create(req: MulterRequest, res: Response, next: NextFunction): Promise<BaseResponse<CreateAccountsSchema>> {
        // ถ้ามีไฟล์ที่อัปโหลดเข้ามาให้เก็บชื่อไฟล์
        const images = req.file ? req.file.path : undefined;
        const payload = createAccountsPayload.parse((req.body));
        const result = await accountsService.createAccounts(payload, images);

        // คืนค่าบัญชีผู้ใช้ใหม่
        return { data: result };
    }
};