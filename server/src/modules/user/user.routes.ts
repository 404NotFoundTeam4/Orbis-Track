import { Router } from "express";
import { userController } from "./user.controller.js";


const router = Router();
router.get("/:id", userController.get);


export default router;