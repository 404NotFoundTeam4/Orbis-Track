import type { Request, Response, NextFunction } from "express";
import { getUserById } from "./user.service.js";

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
};