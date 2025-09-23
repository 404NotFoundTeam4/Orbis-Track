import { default as userRouter } from "./user.routes.js";
import { userService } from "./user.service.js";
import * as userSchema from "./user.schema.js";

export { userService, userSchema };
export default userRouter;


/**
* คําอธิบาย : ฟTงกRชันสําหรับดึงข^อมูลผู^ใช^
* Input : user_id
* Output : ข^อมูลผู^ใช^ทั้งหมด
* Author : Pakkapon Chomchoey
**/