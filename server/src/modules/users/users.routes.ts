import { Router } from "../../core/router.js";
import { UsersController } from "./users.controller.js";
import { upload } from "../upload/upload.service.js";
import { changePasswordSchema, getMyProfileResponseSchema, updateMyProfilePayload,} from "./users.schema.js";
import z from "zod";


const usersController = new UsersController();
const router = new Router(undefined, "/user");


// GET profile
router.getDoc(
  "/",
  { tag: "Users", res: getMyProfileResponseSchema, auth: true }, 
  usersController.getMyProfile
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

// users.route.ts

router.patchDoc("/:id", {
    tag: "Users",
    auth: true,
    params: z.object({
      id: z.string().describe("User ID"), 
    }),
    
    body: updateMyProfilePayload,
    contentType: "multipart/form-data",
  }, 
  upload.single("us_images"), 
  usersController.updateMyProfile
);
export default router.instance;
