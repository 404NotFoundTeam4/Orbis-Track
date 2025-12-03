import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { AccountsController } from "./accounts.controller.js";
import { createAccountsSchema, getAllAccountsResponseSchema, createAccountsPayload, idParamSchema, editAccountSchema, softDeleteResponseSchema, genCodeEmpSchema, genCodeEmpPayload } from "./accounts.schema.js";

const accountsController = new AccountsController();
const router = new Router(undefined, '/accounts');

router.getDoc("/:id", { tag: "Accounts", res: getAllAccountsResponseSchema, auth: true, params: idParamSchema }, accountsController.get);
router.postDoc("/next-employee-code", { tag: "Accounts", body: genCodeEmpSchema, res: genCodeEmpPayload, auth: true }, accountsController.getNextEmployeeCodeHandler);
router.getDoc("/", { tag: "Accounts", res: getAllAccountsResponseSchema, auth: true }, accountsController.getAll);
router.postDoc("/", { tag: "Accounts", body: createAccountsPayload, res: createAccountsSchema, auth: true, contentType: "multipart/form-data" }, upload.single("us_images"), accountsController.create);
router.patchDoc("/:id", { tag: "Accounts", auth: true, params: idParamSchema, body: editAccountSchema }, upload.single("us_images"), accountsController.update);
router.deleteDoc("/:id", { tag: "Accounts", auth: true, params: idParamSchema, res: softDeleteResponseSchema }, accountsController.softDelete);

export default router.instance;