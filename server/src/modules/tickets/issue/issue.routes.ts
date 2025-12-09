import { Router } from "../../../core/router.js";
import { IssueController } from "./issue.controller.js";

const issueController = new IssueController();
const router = new Router();

export default router.instance;
