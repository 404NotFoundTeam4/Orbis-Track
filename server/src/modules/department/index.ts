import { default as departmentRouter } from "./department.routes.js";
import { departmentService } from "./department.service.js";
import * as departmentSchema from "./department.schema.js";

export { departmentService, departmentSchema };
export default departmentRouter;