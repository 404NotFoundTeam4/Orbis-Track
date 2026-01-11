import { templateLiteral } from "zod";
import { Router } from "../../core/router.js";
import { CategoryController } from "./category.controller.js";
import {
  idParamSchema,
  getCategoriesQuerySchema,
  getCategoriesResponseSchema,
  categorySchema,
  softDeleteCategoryResponseSchema,
  editCategoryPayload,
} from "./category.schema.js";
const controller = new CategoryController();
const router = new Router(undefined, "/category");

// GET /categories
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

// GET /categories/:id
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

// DELETE /categories/:id (Soft Delete Category)
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

// PUT /category
router.putDoc("/", { tag: "Categories", body: editCategoryPayload, auth: true }, controller.editCategory);

export default router.instance;
