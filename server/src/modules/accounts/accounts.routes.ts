import { Router } from "../../core/router.js";
import { upload } from "../upload/upload.service.js";
import { AccountsController } from "./accounts.controller.js";
import { createAccountsSchema, getAllAccountsResponseSchema } from "./accounts.schema.js";

const accountsController = new AccountsController();
const router = new Router(undefined, '/accounts');

router.get("/:id", accountsController.get);
router.getDoc("/", { tag: "accounts", res: getAllAccountsResponseSchema, auth: true }, accountsController.getAll);
router.postDoc("/", { tag: "accounts", res: createAccountsSchema, auth: true }, upload.single("us_images"), accountsController.create);

export default router.instance;