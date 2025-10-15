import { Router } from "../../core/router.js";
import { DepartmentController } from "./department.controller.js"
import { getAllDepartmentSchema, getAllSectionSchema } from "./department.schema.js";
import { z } from "zod";

const departmentController = new DepartmentController();
const router = new Router(undefined, '/departments');

router.getDoc("/", { tag: "Departments", res: getAllDepartmentSchema, auth: true}, departmentController.getAllDepartment)
router.getDoc("/:id/section", { tag: "Departments", res: getAllSectionSchema, auth: true, params: z.object({ id: z.coerce.number() })}, departmentController.getSection)

export default router.instance;