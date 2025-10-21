import { Router } from "../../core/router.js";
import { DepartmentController } from "./departments.controller.js"
import { editDepartmentPayload, addSectionPayload, editSectionPayload, getAllDepartmentSchema, getAllSectionSchema, idParamSchema, paramEditSecSchema } from "./departments.schema.js";

const departmentController = new DepartmentController();
const router = new Router(undefined, '/departments');

router.getDoc("/", { tag: "Departments", res: getAllDepartmentSchema, auth: true }, departmentController.getAllDepartment)
router.getDoc("/:id/section", { tag: "Departments", params: idParamSchema, res: getAllSectionSchema, auth: true }, departmentController.getSection)
router.putDoc("/:id", {tag: "Departments", params: idParamSchema, body: editDepartmentPayload, auth: true }, departmentController.editDepartment)
router.putDoc("/:deptId/section/:secId", { tag: "Departments", params: paramEditSecSchema, body: editSectionPayload, auth: true }, departmentController.editSection)
router.postDoc("/:id/section", { tag: "Departments", params: idParamSchema,  body: addSectionPayload, auth: true }, departmentController.addSection);


export default router.instance;