import { z } from "zod";
import { softDeleteAccount } from "../accounts/accounts.service.js";


export const idParamSchema = z.object({
    id: z.coerce.number().int().positive()
});

/**
 * Description: Schema หลักของ Category
 * Note: รวม Field จาก Database 
 * Author: Chanwit Muangma (Boom) 66160224
 */
// รูปแบบข้อมูลของหมวดหมู่อุปกรณ์
export const categorySchema = z.object({
  ca_id: z.number().int(),
  ca_name: z.string(),

  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable(),
  deleted_at: z.coerce.date().nullable()
})


const booleanFromQuery = z.preprocess((v) => {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return v; // ให้ default ทำงานเมื่อ undefined
}, z.boolean());

export const getCategoriesQuerySchema = z.object({
  // ค้นหา (ค้นจากชื่อหมวดหมู่)
  q: z.string().trim().min(1).optional(),


  // แบ่งหน้า
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  // เรียงลำดับ (คุม whitelist ให้ตรง field ใน DB)
  sortBy: z.enum(["ca_id" , "ca_name" , "created_at" , "updated_at"]).default("ca_id"),
  sortOrder: z.enum(["asc" , "desc"]).default("asc"),

  // จะเอารายการที่ soft-delete มาด้วยไหม
  includeDeleted: booleanFromQuery.default(false),


})

export const getCategoriesResponseSchema = z.object({
  data: z.array(categorySchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
})

export const softDeleteCategoryResponseSchema = z.object({
    ca_id: z.number().int(),
    deleted_at: z.coerce.date(),
});

export type CategorySchema = z.infer<typeof categorySchema>

export type GetCategoriesQuerySchema = z.infer<typeof getCategoriesQuerySchema>

export type GetCategoriesResponseSchema = z.infer<typeof getCategoriesResponseSchema>

export type SoftDeleteResponseSchema = z.infer<typeof softDeleteCategoryResponseSchema>
