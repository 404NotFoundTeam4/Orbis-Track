import { Router } from "express";
import { userController } from "./user.controller.js";

const router = Router();
router.get("/:id", userController.get);
router.post("/", userController.create);

export default router;