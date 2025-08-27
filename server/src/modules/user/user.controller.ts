import type { Request, Response, NextFunction } from "express";
import { createUser, getUserById } from "./user.service.js";

export const userController = {
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
            const user = await getUserById(id);
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json(user);
        } catch (err) {
            next(err);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                emp_code,
                firstname,
                lastname,
                username,
                password,
                email,
                phone,
                images,
                role_id,
                dept_id,
                sec_id,
            } = req.body;

            if (!firstname || !lastname || !username || !password || !role_id) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // hash password
            const hashedPassword = password;

            const newUser = await createUser({
                emp_code,
                firstname,
                lastname,
                username,
                password: hashedPassword,
                email,
                phone,
                images,
                role_id,
                dept_id,
                sec_id,
            });

            res.status(201).json(newUser);
        } catch (err) {
            next(err);
        }
    },
};