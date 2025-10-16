import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service.js";
import { BaseController } from "../../core/base.controller.js";
import { BaseResponse } from "../../core/base.response.js";
import { HttpError, ValidationError } from "../../errors/errors.js";
import { HttpStatus } from "../../core/http-status.enum.js";
import { GetAllUsersResponseSchema } from "./user.schema.js";

export class UserController extends BaseController {
    constructor() {
        super()
    }

    async get(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("Invalid id");
        const user = await userService.getUserById(id);
        if (!user) throw new HttpError(HttpStatus.NOT_FOUND, "User not found");
        return { data: user };
    }

    // ดึงพนักงานทั้งหมด
    async getAll(req: Request, res: Response, next: NextFunction): Promise<BaseResponse<GetAllUsersResponseSchema>> {
        const user = await userService.getAllUsers();
        return { data: user };
    }

    async softDelete(req: Request , res : Response , next : NextFunction) : Promise<BaseResponse>{
        const id = Number(req.params.id); //อ่านตัว ID
        if(!Number.isInteger(id) || id <= 0) throw new ValidationError("Invalid id"); //เช็คค่า ID
        const result = await userService.SoftDeleteUser(id); //เรียกตัว Service SoftDeleteUser
        return { data: { us_id: result.userID, deletedAt: result.deleteAt }, message: "User soft-deleted" };
    }

    // async create(req: Request, res: Response, next: NextFunction): Promise<BaseResponse> {
    //     const {
    //         emp_code,
    //         firstname,
    //         lastname,
    //         username,
    //         password,
    //         email,
    //         phone,
    //         images,
    //         role_id,
    //         dept_id,
    //         sec_id,
    //     } = req.body;

    //     if (!firstname || !lastname || !username || !password || !role_id) {
    //         throw new ValidationError("Missing required fields");
    //     }

    //     // hash password
    //     const hashedPassword = password;

    //     const newUser = await userService.createUser({
    //         emp_code,
    //         firstname,
    //         lastname,
    //         username,
    //         password: hashedPassword,
    //         email,
    //         phone,
    //         images,
    //         role_id,
    //         dept_id,
    //         sec_id,
    //     });

    //     return { message: "User created successfully" }
    // }
};