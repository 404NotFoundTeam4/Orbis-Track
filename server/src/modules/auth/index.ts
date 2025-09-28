// รวม export ของ module auth ในที่เดียว
import { default as authRouter } from "./auth.routes.js";
import { authService } from "./auth.service.js";
import * as authSchema from "./auth.schema.js";

export { authService, authSchema };
export default authRouter;