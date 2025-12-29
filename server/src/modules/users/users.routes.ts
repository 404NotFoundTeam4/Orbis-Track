import { Router } from "../../core/router.js";
import { UsersController } from "./users.controller.js";
import { upload } from "../../middlewares/multer.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { changePasswordSchema } from "./users.schema.js";
import { AccountsController } from "../accounts/accounts.controller.js";
import { editAccountSchema } from "../accounts/accounts.schema.js";


const usersController = new UsersController();
const accountsController = new AccountsController();
const router = new Router(undefined, "/user");

// GET profile
router.getDoc(
  "/",
  { tag: "Users", auth: true },
  authMiddleware as any,
  usersController.getMyProfile as any
);

//  UPDATE profile + upload image

router.postDoc("/:id", 
  { 
    tag: "Accounts", 
    body: editAccountSchema, 
    auth: true, 
    contentType: "multipart/form-data" 
  },
  upload.single("us_images"), 
  accountsController.update as any 
);
router.patchDoc(
  "/update-password",
  { 
    tag: "Users", 
    auth: true,
    body: changePasswordSchema 
  },
  authMiddleware as any,
  usersController.updatePassword as any
);

export default router.instance;
