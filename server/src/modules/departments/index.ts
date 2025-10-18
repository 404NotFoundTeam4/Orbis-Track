import { default as departmentRouter } from "./departments.routes.js";
import { departmentService } from "./departments.service.js";
import * as departmentSchema from "./departments.schema.js";

export { departmentService, departmentSchema };
export default departmentRouter;