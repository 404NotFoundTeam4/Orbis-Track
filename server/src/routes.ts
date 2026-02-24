import { Router, type Express } from "express";

import { authRouter, fetchMeRouter } from "./modules/auth/index.js";
import { authMiddleware, optionalAuthMiddleware } from "./middlewares/auth.middleware.js";
import { prisma } from "./infrastructure/database/client.js";
import { accountsRouter } from "./modules/accounts/index.js";
import { departmentRouter } from "./modules/departments/index.js";
import { roleRouter } from "./modules/roles/index.js";
import { UserRole } from "./core/roles.enum.js";
import { requireRole } from "./middlewares/role.middleware.js";
import { notificationsRouter } from "./modules/notifications/index.js";
import { borrowReturnRouter } from "./modules/tickets/borrow-return/index.js";
import { inventoryRouter } from "./modules/inventory/index.js";
import { categoryRouter } from "./modules/category/index.js";
import { cartsRouter } from "./modules/cart/index.js";
import { historyBorrowRouter } from "./modules/history-borrow/index.js";
import { homeRouter } from "./modules/home/index.js";
import { borrowRouter } from "./modules/borrows/index.js";
import { usersRouter } from "./modules/users/index.js";
import { historyApprovalRouter } from "./modules/history-approval/index.js";
import { historyIssueRouter } from "./modules/history-issue/index.js";

/**
 * Description: ลงทะเบียนเส้นทาง (routes) หลักของระบบบน prefix /api/v1
 * Input : app: Express //อินสแตนซ์แอปจาก App()
 * Output: void //ผูกเส้นทางเข้า app โดยไม่มีค่าคืน
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export function routes(app: Express) {
  const api = Router();

  api.get("/", (_req, res) =>
    res.json({ status: "ok", message: "Hello World" }),
  );

  api.use("/", authRouter);

  api.use("/auth", authMiddleware, fetchMeRouter);

  api.use(
    "/departments",
    authMiddleware,
    requireRole([UserRole.ADMIN]),
    departmentRouter,
  );

  // Legacy health check (keep for backward compatibility)
  api.get("/health", (_req, res) => res.json({ ok: true }));

  // Kubernetes/Docker health endpoints
  // Liveness probe - check if app is running
  api.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Readiness probe - check if app is ready to serve (DB connection OK)
  api.get("/readyz", async (_req, res) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: "ready",
        checks: {
          database: "ok",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: "not_ready",
        checks: {
          database: "error",
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  api.use(
    "/accounts",
    authMiddleware,
    requireRole([UserRole.ADMIN]),
    accountsRouter,
  );

  api.use("/roles", authMiddleware, roleRouter);

  api.use("/notifications", authMiddleware, notificationsRouter);

  api.use(
    "/tickets/borrow-return",
    authMiddleware,
    requireRole([
      UserRole.ADMIN,
      UserRole.HEADDEPT,
      UserRole.HEADSEC,
      UserRole.STAFF,
    ]),
    borrowReturnRouter,
  );

  api.use("/inventory", authMiddleware, inventoryRouter);

  api.use(
    "/category",
    authMiddleware,
    requireRole([UserRole.ADMIN, UserRole.STAFF]),
    categoryRouter,
  );

  api.use("/borrow/cart", authMiddleware, cartsRouter);

  api.use("/user", authMiddleware, usersRouter);

  api.use("/borrow", authMiddleware, borrowRouter);

  api.use("/home", authMiddleware, homeRouter);

  api.use("/history-approval", authMiddleware, historyApprovalRouter);

  api.use("/history-issue", authMiddleware, historyIssueRouter);

  api.use("/history-borrow", authMiddleware, historyBorrowRouter);

  // ผูก router ทั้งหมดไว้ใต้ /api/v1
  app.use("/api/v1", api);
}
