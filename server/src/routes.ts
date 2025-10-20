import { Router, type Express } from "express";

import userRouter from "./modules/user/index.js";
import authRouter, { fetchMeRouter } from "./modules/auth/index.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

/**
 * Description: ลงทะเบียนเส้นทาง (routes) หลักของระบบบน prefix /api/v1
 * Input : app: Express //อินสแตนซ์แอปจาก App()
 * Output: void //ผูกเส้นทางเข้า app โดยไม่มีค่าคืน
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function routes(app: Express) {
    const api = Router();

    api.get("/", (_req, res) => res.json({ status: 'ok', message: 'Hello World' }));

    api.use("/", authRouter);

    api.use("/auth", authMiddleware, fetchMeRouter)

    //api.use("/departments", )

    api.get("/health", (_req, res) => res.json({ ok: true }));

    api.use("/users", userRouter);

    // ผูก router ทั้งหมดไว้ใต้ /api/v1
    app.use("/api/v1", api);
}
