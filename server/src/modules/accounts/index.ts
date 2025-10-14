import { default as accountsRouter } from "./accounts.routes.js";
import { accountsService } from "./accounts.service.js";
import * as accountsSchema from "./accounts.schema.js";

export { accountsService, accountsSchema };
export default accountsRouter;