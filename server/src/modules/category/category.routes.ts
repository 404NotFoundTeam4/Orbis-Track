import { templateLiteral } from "zod";
import { Router } from "../../core/router.js";
import { CategoryController } from "./category.controller.js";
import {
  idParamSchema,
  getCategoriesQuerySchema,
  getCategoriesResponseSchema,
  categorySchema,
  softDeleteCategoryResponseSchema,
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
  controller.getCategories.bind(controller)
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
  controller.getCategory.bind(controller)
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
  controller.softDeleteCategory.bind(controller)
);

export default router.instance;
