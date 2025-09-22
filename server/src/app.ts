// server/src/app.ts
import express, { Express, Request } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import { routes } from "./routes.js";
import { swagger } from "./docs/swagger.js";
import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger.js";
import { globalErrorHanlder } from "./middlewares/global-error-handler.js";

export function App(): Express {
    const app = express();
    const baseUrl = (env.API_URL ?? `http://localhost:${env.PORT}`) + "/api/v1"
    app.set("trust proxy", 1);
    app.use((pinoHttp as unknown as (o?: any) => any)({ logger }));
    app.use(helmet());
    app.use(cors({ origin: true, credentials: true }));
    app.use(compression());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(
        "/api/v1",
        rateLimit({
            windowMs: 60_000, // 1 นาที
            max: 300,
            standardHeaders: true,
            legacyHeaders: false,
        })
    );
    app.use(globalErrorHanlder);
    routes(app);
    swagger(app, baseUrl);

    return app;
}
