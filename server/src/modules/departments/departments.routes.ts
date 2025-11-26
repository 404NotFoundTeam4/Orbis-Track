import { Router } from "../../core/router.js";
import { DepartmentController } from "./departments.controller.js"
import { addDepartmentsPayload, addDepartmentsSchema, editDepartmentPayload, editSectionPayload, getAllDepartmentSchema, getAllSectionSchema, deptSectionSchema, idParamSchema, paramEditSecSchema, addSectionPayload, deleteSectionSchema } from "./departments.schema.js";

const departmentController = new DepartmentController();
const router = new Router(undefined, '/departments');

router.getDoc("/", { tag: "Departments", res: getAllDepartmentSchema, auth: true }, departmentController.getAllDepartment)
router.getDoc("/:id/section", { tag: "Departments", params: idParamSchema, res: getAllSectionSchema, auth: true }, departmentController.getSection)
router.putDoc("/:id", { tag: "Departments", params: idParamSchema, body: editDepartmentPayload, auth: true }, departmentController.editDepartment)
router.putDoc("/:deptId/section/:secId", { tag: "Departments", params: paramEditSecSchema, body: editSectionPayload, auth: true }, departmentController.editSection)
// Api เพิ่มฝ่ายย่อย Salsabeela Sa-e (San) 66160349 เพิ่มตรงนี้
router.postDoc("/:id/section", { tag: "Departments", params: idParamSchema, body: addSectionPayload, auth: true }, departmentController.addSection);
router.getDoc("/section", { tag: "Departments", res: deptSectionSchema, auth: true }, departmentController.getdeptsection)

// router.deleteDoc("/section/:secId", { tag: "Departments", params: idParamSchema, auth: true }, departmentController.deleteDepartment)
// router.deleteDoc("/:id", { tag: "Departments", params: deleteSectionSchema, auth: true }, departmentController.deleteSection)
// ลบฝ่ายย่อย
router.deleteDoc("/section/:secId",{ tag: "Departments", params: deleteSectionSchema, auth: true },departmentController.deleteSection);
// ลบแผนก
router.deleteDoc("/:id",{ tag: "Departments", params: idParamSchema, auth: true },departmentController.deleteDepartment);
router.postDoc("/", { tag: "Departments", body: addDepartmentsPayload, res: addDepartmentsSchema, auth: true }, departmentController.addDepartments)
export default router.instance;