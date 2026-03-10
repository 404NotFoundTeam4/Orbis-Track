/**
 * Description: Routes สำหรับ Repair Tickets API
 * - GET / : ดึงรายการงานซ่อมพร้อม pagination, filter, search, sort
 * Input : Express Request (auth required)
 * Output : PaginatedResult<RepairItemDto>
 * Author: Rachata Jitjeankhan (Tang) 66160369
 */
import { Router } from "../../../core/router.js";
import { RepairController } from "./repair.controller.js";
import { getRepairQuery, repairItemSchema } from "./repair.schema.js";

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

export default router.instance;
