import { Router } from "../../core/router.js";
import { CategoryController } from "./category.controller.js";
import {
  idParamSchema,
  getCategoriesQuerySchema,
  getCategoriesResponseSchema,
  categorySchema,
  softDeleteCategoryResponseSchema,
  addCategoryPayload,
  editCategoryPayload,
  addCategoryResponseSchema,
  editCategoryResponseSchema,
} from "./category.schema.js";

const controller = new CategoryController();

// สร้าง router สำหรับ /api/v1/category (main path)
const router = new Router(undefined, "/");

// GET /category
router.getDoc(
  "/",
  {
    tag: "Categories",
    auth: true,
    query: getCategoriesQuerySchema,
    res: getCategoriesResponseSchema,
  },
  controller.getCategories
);

// GET /category/:id
router.getDoc(
  "/:id",
  {
    tag: "Categories",
    auth: true,
    params: idParamSchema,
    res: categorySchema,
  },
  controller.getCategory
);

// DELETE /category/:id (Soft Delete Category)
router.deleteDoc(
  "/:id",
  {
    tag: "Categories",
    auth: true,
    params: idParamSchema,
    res: softDeleteCategoryResponseSchema,
  },
  controller.softDeleteCategory
);

// POST /category - เพิ่มหมวดหมู่ใหม่
router.postDoc(
  "/",
  {
    tag: "Categories",
    auth: true,
    body: addCategoryPayload,
    res: addCategoryResponseSchema,
  },
  // cast to any to satisfy the router's handler typing
  controller.addCategory
);

// PUT /category/:id - แก้ไขหมวดหมู่
router.putDoc(
  "/:id",
  {
    tag: "Categories",
    auth: true,
    params: idParamSchema,
    body: editCategoryPayload,
    res: editCategoryResponseSchema,
  },
  controller.editCategory
);

export default router.instance;