import { Router, type Express } from "express";

import userRouter from "./modules/user/index.js";
import authRouter from "./modules/auth/auth.routes.js";
import departmentRouter from "./modules/departments/index.js";
import roleRouter from "./modules/roles/index.js";

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

    api.get("/health", (_req, res) => res.json({ ok: true }));

    api.use("/users", userRouter);

    api.use("/departments", departmentRouter);

    api.use("/roles", roleRouter);

    // ผูก router ทั้งหมดไว้ใต้ /api/v1
    app.use("/api/v1", api);
}
