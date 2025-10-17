import { Router } from "../../core/router.js";
import { DepartmentController } from "./departments.controller.js"
import { getAllDepartmentSchema, getAllSectionSchema, idParamSchema } from "./departments.schema.js";

const departmentController = new DepartmentController();
const router = new Router(undefined, '/departments');

router.getDoc("/", { tag: "Departments", res: getAllDepartmentSchema, auth: true}, departmentController.getAllDepartment)
router.getDoc("/:id/section", { tag: "Departments", res: getAllSectionSchema, auth: true, params: idParamSchema}, departmentController.getSection)

export default router.instance;