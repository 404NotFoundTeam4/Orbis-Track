/**
 * Description: Routes สำหรับ Repair Tickets API
 * - GET / : ดึงรายการงานซ่อมพร้อม pagination, filter, search, sort
 * Input : Express Request (auth required)
 * Output : PaginatedResult<RepairItemDto>
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
import { Router } from "../../../core/router.js";
import { RepairController } from "./repair.controller.js";
import { upload } from "../../upload/upload.service.js";
import {
  createRepairRequestBody,
  createRepairRequestResponseSchema,
  getRepairQuery,
  repairIssueParamSchema,
  repairItemSchema,
  repairPrefillSchema,
} from "./repair.schema.js";

const repairController = new RepairController();
const router = new Router(undefined, "/repairs");

router.getDoc(
  "/",
  {
    tag: "Repairs",
    query: getRepairQuery,
    res: repairItemSchema,
    paginated: true,
    auth: true,
  },
  repairController.getRepairs,
);

router.getDoc(
  "/prefill/:issueId",
  {
    tag: "Repairs",
    params: repairIssueParamSchema,
    res: repairPrefillSchema,
    auth: true,
  },
  repairController.getRepairPrefill,
);

router.postDoc(
  "/request",
  {
    tag: "Repairs",
    body: createRepairRequestBody,
    res: createRepairRequestResponseSchema,
    auth: true,
    contentType: "multipart/form-data",
  },
  upload.array("images", 10),
  repairController.createRepairRequest,
);

export default router.instance;
