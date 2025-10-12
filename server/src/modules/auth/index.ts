// รวม export ของ module auth ในที่เดียว
import { default as authRouter, fetchMeRouter } from "./auth.routes.js";
import { authService } from "./auth.service.js";
import * as authSchema from "./auth.schema.js";

export { authService, authSchema, fetchMeRouter };

export default authRouter;