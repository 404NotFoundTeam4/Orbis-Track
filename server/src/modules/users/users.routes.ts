import { Router } from "../../core/router.js";
import { UsersController } from "./users.controller.js";
import { updateMyProfilePayload } from "./users.schema.js";
import { upload } from "../../middlewares/multer.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { changePasswordSchema } from "./users.schema.js";

const usersController = new UsersController();
const router = new Router(undefined, "/user");

// GET profile
router.getDoc(
  "/",
  { tag: "Users", auth: true },
  authMiddleware as any,
  usersController.getMyProfile as any
);

//  UPDATE profile + upload image
router.putDoc(
  "/",
  { tag: "Users", body: updateMyProfilePayload, auth: true },
  authMiddleware as any,
  upload.single("images"),
  usersController.updateMyProfile as any
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
