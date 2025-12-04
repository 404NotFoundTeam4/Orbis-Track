// server/src/app.ts
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { routes } from "./routes.js";
import { swagger } from "./docs/swagger.js";
import { env } from "./config/env.js";
import { httpLogger } from "./infrastructure/logger.js";
import { globalErrorHandler } from "./middlewares/global-error-handler.js";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Description: สร้างและคอนฟิก Express แอป (Security, CORS, Logger, Limit, Routes, Swagger, Error Handler)
 * Input : -
 * Output: Express //อินสแตนซ์ที่พร้อมใช้งาน (นำไป .listen() ภายนอก)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function App(): Express {
  const app = express();
  const baseUrl = (env.API_URL ?? `http://localhost:${env.PORT}`) + "/api/v1";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.set("trust proxy", 1);
  app.use(httpLogger);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://static.cloudflareinsights.com",
          ],
          connectSrc: [
            "'self'",
            "http://localhost:4041",
            "http://localhost:4040",
            "http://localhost:4140",
            "http://localhost:4141",
            "http://seteam.bsospace.com:4140",
            "http://seteam.bsospace.com:4141",
            "https://404notfound-front.bsospace.com",
            "https://404notfound-back.bsospace.com",
            "https://orbistrack.bsospace.com",
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: [
        "http://seteam.bsospace.com:4140",
        "http://seteam.bsospace.com:4141",
        "http://localhost:4040",
        "http://localhost:4041",
        "http://localhost:4140",
        "https://404notfound-front.bsospace.com",
        "https://404notfound-back.bsospace.com",
        "https://orbistrack.bsospace.com",
      ],
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const uploadsPath = path.join(__dirname, "..", "uploads");
  // ให้บริการไฟล์ static จากโฟลเดอร์ 'public' ที่อยู่นอก 'src'
  app.use("/api/v1/uploads", express.static(uploadsPath));
  app.use(
    "/api/v1",
    rateLimit({
      windowMs: 60_000, // 1 นาที
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  routes(app);
  swagger(app, baseUrl);
  app.use(globalErrorHandler);
  return app;
}
