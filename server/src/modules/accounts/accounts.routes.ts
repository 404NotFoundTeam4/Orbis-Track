import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { AccountsController } from "./accounts.controller.js";
import { createAccountsSchema, getAllAccountsResponseSchema, createAccountsPayload, idParamSchema, editAccountSchema } from "./accounts.schema.js";

const accountsController = new AccountsController();
const router = new Router(undefined, '/accounts');

router.getDoc("/:id", { tag: "Users", res: getAllAccountsResponseSchema, auth: true, params: idParamSchema }, accountsController.get);
router.getDoc("/", { tag: "accounts", res: getAllAccountsResponseSchema, auth: true }, accountsController.getAll);
router.postDoc("/", { tag: "accounts", body: createAccountsPayload, res: createAccountsSchema, auth: true }, upload.single("us_images"), accountsController.create);
router.patchDoc("/:id", { tag: "Users", auth: true, params: idParamSchema, body: editAccountSchema }, accountsController.update);

export default router.instance;