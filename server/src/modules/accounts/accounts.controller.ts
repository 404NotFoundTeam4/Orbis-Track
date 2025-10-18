import type { Request, Response, NextFunction } from "express";
import { accountsService } from "./accounts.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { createAccountsPayload, CreateAccountsSchema, GetAllAccountsResponseSchema } from "./accounts.schema.js";

export class AccountsController extends BaseController {
    constructor() {
        super()
    }

    async get(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) throw new ValidationError("Invalid id");
        const user = await accountsService.getAccountsById(id);
        if (!user) throw new HttpError(HttpStatus.NOT_FOUND, "User not found");
        return { data: user };
    }

    /**
     * Description: ดึงข้อมูลผู้ใช้ทั้งหมด
     * Input : -
     * Output : ข้อมูลบัญชีผู้ใช้ทั้งหมด รวมถึงแผนกและฝ่ายย่อย
     * Author : Thakdanai Makmi (Ryu) 66160355
     */
    async getAll(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<GetAllAccountsResponseSchema>> {
        // เรียกใช้งาน service เพื่อดึงข้อมูลผู้ใช้
        const user = await accountsService.getAllAccounts();
        return { data: user };
    }

    /**
     * Description: เพิ่มข้อมูลบัญชีผู้ใช้ใหม่
     * Input : req.body (ข้อมูลจากฟอร์ม และไฟล์รูปภาพ)
     * Output : ข้อมูลบัญชีผู้ใช้ที่ถูกเพิ่มใหม่
     * Author : Thakdanai Makmi (Ryu) 66160355
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<CreateAccountsSchema>> {
        // ถ้ามีไฟล์ที่อัปโหลดเข้ามาให้เก็บชื่อไฟล์
        const images = req.file ? req.file.path : undefined;
        // ตรวจสอบและ validate ข้อมูลที่ส่งมา
        const payload = createAccountsPayload.parse((req.body));
        // เรียกใช้งาน service เพื่อบันทึกข้อมูลลงฐานข้อมูล
        const result = await accountsService.createAccounts(payload, images);

        // คืนค่าบัญชีผู้ใช้ใหม่
        return { data: result };
    }
};