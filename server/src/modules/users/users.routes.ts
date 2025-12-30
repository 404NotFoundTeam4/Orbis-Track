import { Router } from "../../core/router.js";
import { UsersController } from "./users.controller.js";
import { upload } from "../upload/upload.service.js";
import { changePasswordSchema } from "./users.schema.js";
import { updateMyProfilePayload } from "./users.schema.js";
const usersController = new UsersController();

const router = new Router(undefined, "/user");


// GET profile
router.getDoc(
  "/",
  { tag: "Users", auth: true }, 
  usersController.getMyProfile 
);
// UPDATE profile
router.patchDoc(
  "/:id", 
  { 
    tag: "Users", 
    auth: true, 
    body: updateMyProfilePayload, 
    contentType: "multipart/form-data" 
  }, 
  upload.single("us_images"), 
  usersController.updateMyProfile
);

// UPDATE password
router.patchDoc(
  "/update-password",
  { 
    tag: "Users", 
    auth: true,
    body: changePasswordSchema 
  },
  usersController.updatePassword 
);

export default router.instance;
