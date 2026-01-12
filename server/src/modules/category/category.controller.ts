import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../core/base.controller.js";
import { categoryService } from "./category.service.js";
import { BaseResponse } from "../../core/base.response.js";
import {
  idParamSchema,
  getCategoriesQuerySchema,
  categorySchema,
  softDeleteCategoryResponseSchema,
  CategorySchema,
  GetCategoriesResponseSchema,
  SoftDeleteResponseSchema,
  addCategoryPayload,
  AddCategoryPayload,
  AddCategoryResponseSchema,
} from "./category.schema.js";
import { ValidationError } from "../../errors/errors.js";
import type { z } from "zod";

export class CategoryController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Description: ดึงรายการหมวดหมู่อุปกรณ์ (Categories) โดยรองรับค้นหา, เรียงลำดับ และแบ่งหน้า
   * Input     : req.query (q, page, limit, sortBy, sortOrder, includeDeleted)
   *             - q             : คำค้นหาจากชื่อหมวดหมู่ (ca_name)
   *             - page          : หน้าปัจจุบัน (เริ่มที่ 1)
   *             - limit         : จำนวนรายการต่อหน้า (1–100)
   *             - sortBy        : ฟิลด์ที่ใช้เรียงลำดับ (ca_id | ca_name | created_at | updated_at)
   *             - sortOrder     : ทิศทางการเรียงลำดับ (asc | desc)
   *             - includeDeleted: รวมรายการที่ถูก soft-delete หรือไม่
   * Output    : BaseResponse<{ data: Category[], meta: PaginationMeta }> - รายการหมวดหมู่พร้อมข้อมูล meta สำหรับ pagination
   * Author    : Chanwit Muangma (Boom) 66160224
   */
  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<GetCategoriesResponseSchema>>  {
    const query = getCategoriesQuerySchema.parse(req.query);
    const result = await categoryService.getCategories(query);
    return { data: result };
  }

  /**
   * Description: ดึงข้อมูลหมวดหมู่อุปกรณ์ตามรหัส (Category By ID) เฉพาะรายการที่ยังไม่ถูกลบ (deleted_at = null)
   * Input     : req.params (id) - รหัสหมวดหมู่อุปกรณ์ (ca_id)
   * Output    : BaseResponse<Category> - ข้อมูลหมวดหมู่ที่พบ หากไม่พบจะ throw ValidationError
   * Author    : Chanwit Muangma (Boom) 66160224
   */
  async getCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<CategorySchema>>  {
    const { id } = idParamSchema.parse(req.params);
    const category = await categoryService.getCategoryById(id);

    if (!category) throw new ValidationError("Category not found"); // หรือ NotFoundError ถ้ามี

    return { data: category };
  }


  /**
 * Description: ลบหมวดหมู่อุปกรณ์แบบ Soft Delete (ตั้งค่า deleted_at)
 * Input     : req.params (id) - รหัสหมวดหมู่อุปกรณ์ (ca_id)
 * Output    : BaseResponse<{ ca_id, deleted_at }> - ผลการลบพร้อมเวลาที่ลบ
 * Author    : Chanwit Muangma (Boom) 66160224
 */

  async softDeleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<BaseResponse<SoftDeleteResponseSchema>> {
    const { id } = idParamSchema.parse(req.params);
    const result = await categoryService.softDeleteCategory(id);
    return { data: result, message: "Category soft-deleted successfully" };
  }

  /**
   * Description: เพิ่มหมวดหมู่อุปกรณ์ (Category) ใหม่
   * Input     : req.body (ca_name) - ชื่อหมวดหมู่ที่ต้องการเพิ่ม
   * Output    : BaseResponse<Category> - ข้อมูลหมวดหมู่ที่เพิ่มเข้ามา
   * Author    : Rachata Jitjeankhan (Tang) 66160369
   */
  async addCategory(
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<BaseResponse<AddCategoryResponseSchema>> {
  const payload = addCategoryPayload.parse(req.body);
  const newCategory = await categoryService.addCategory(payload);
  
  return {
    success: true,
    data: newCategory,
    message: "เพิ่มสำเร็จ",
  };
}
}