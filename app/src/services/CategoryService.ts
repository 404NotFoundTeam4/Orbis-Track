import api from "../api/axios.js";

export type Category = {
  ca_id: number;
  ca_name: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type CategoriesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetCategoriesQuery = {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: "ca_id" | "ca_name" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GetCategoriesResult = {
  data: Category[];
  meta: CategoriesMeta;
};

/**
 * Description: เรียก API เพื่อดึงรายการหมวดหมู่อุปกรณ์ (Categories) จาก Backend
 *              รองรับค้นหา (q), แบ่งหน้า (page/limit), เรียงลำดับ (sortBy/sortOrder)
 *              และเลือกแสดงข้อมูลที่ถูกลบแบบ soft-delete (includeDeleted)
 * Input     : query (GetCategoriesQuery)
 *             - q: คำค้นหาชื่อหมวดหมู่ (optional)
 *             - page: หน้าที่ต้องการ (default 1)
 *             - limit: จำนวนรายการต่อหน้า (default 10)
 *             - sortBy: ฟิลด์ที่ใช้เรียง (default "ca_id")
 *             - sortOrder: ทิศทางการเรียง "asc" | "desc" (default "asc")
 *             - includeDeleted: รวมรายการที่ถูกลบ (default false)
 * Output    : GetCategoriesResult - ผลลัพธ์รายการหมวดหมู่และข้อมูล meta สำหรับ pagination
 * Author    : Chanwit Muangma (Boom) 66160224
 */

async function getCategories(query: GetCategoriesQuery): Promise<GetCategoriesResult> {
  const res = await api.get<ApiResponse<GetCategoriesResult>>("/category", {
    params: {
      q: query.q || undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy ?? "ca_id",
      sortOrder: query.sortOrder ?? "asc",
      includeDeleted: query.includeDeleted ?? false,
    },
  });
  return res.data.data;
}

/**
 * Description: เรียก API เพื่อลบหมวดหมู่อุปกรณ์ตามรหัสหมวดหมู่ (ca_id)
 *              โดย Backend มักจะทำเป็น Soft Delete (ตั้งค่า deleted_at) หรือ Delete จริงตามที่ระบบกำหนด
 * Input     : id (number) - รหัสหมวดหมู่ที่ต้องการลบ
 * Output    : Promise - ผลลัพธ์จากการเรียก API (response ของ axios)
 * Author    : Chanwit Muangma (Boom) 66160224
 */


export async function deleteCategory(id: number) {
  return api.delete(`/category/${id}`);
}

/**
 * Description: เรียก API เพื่อเพิ่มหมวดหมู่อุปกรณ์ใหม่
 * Input     : ca_name (string) - ชื่อหมวดหมู่ที่ต้องการเพิ่ม
 * Output    : Promise - ผลลัพธ์จากการเรียก API (response ของ axios)
 * Author    : Category Team
 */
export async function addCategory(payload: { ca_name: string }): Promise<Category> {
  // ส่งเป็น Object ที่มี key ชื่อ ca_name ให้ตรงกับที่ Backend รับ
  const res = await api.post("/category",
    payload
  );
  return res.data.data;
}

export const categoryService = { 
  getCategories, 
  deleteCategory, 
  addCategory, 
};