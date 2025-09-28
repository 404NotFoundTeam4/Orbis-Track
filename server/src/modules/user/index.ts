import { default as userRouter } from "./user.routes.js";
import { userService } from "./user.service.js";
import * as userSchema from "./user.schema.js";

export { userService, userSchema };
export default userRouter;