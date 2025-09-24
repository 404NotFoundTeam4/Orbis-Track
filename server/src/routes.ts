import { Router, type Express } from "express";

import { registry } from "./docs/swagger.js";
import userRouter from "./modules/user/index.js";
import authRouter from "./modules/auth/auth.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

export function routes(app: Express) {
    const api = Router();

    api.get("/", (_req, res) => res.json({ status: 'ok', message: 'Hello World' }));

    api.use("/", authRouter);

    api.get("/health", (_req, res) => res.json({ ok: true }));

    api.use("/users", userRouter);

    app.use("/api/v1", api);
}
