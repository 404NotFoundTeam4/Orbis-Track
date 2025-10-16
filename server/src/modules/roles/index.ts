import { default as roleRouter } from "./roles.routes.js";
import { roleService } from "./roles.service.js";
import * as roleSchema from "./roles.schema.js";

export { roleService, roleSchema };
export default roleRouter;