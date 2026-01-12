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

export type EditCategoryPayload = {
  caId: number;
  caName: string;
}

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
 * Description: แก้ไขหมวดหมู่อุปกรณ์
 * Input     : payload (caId, caName) - รหัสหมวดหมู่และชื่อหมวดหมู่ใหม่
 * Output    : Promise<{ message: string }> - ข้อความอัปเดตเสร็จสิ้น
 * Endpoint  : PUT /api/category
 * Author    : Thakdanai Makmi (Ryu) 66160355
 */
export async function editCategory(payload: EditCategoryPayload): Promise<string> {
  return await api.put('/category', payload);
}

export const categoryService = { getCategories, deleteCategory, editCategory };
 * Description: เพิ่มหมวดหมู่อุปกรณ์ (Category) ใหม่เข้าสู่ระบบ
 *              - ส่งข้อมูลชื่อหมวดหมู่ไปยัง Backend ผ่าน API
 *              - ใช้สำหรับการเพิ่มหมวดหมู่จากหน้า Category Modal
 *              - Backend จะตรวจสอบความซ้ำของชื่อหมวดหมู่
 * Input     : payload.ca_name (string) : ชื่อหมวดหมู่อุปกรณ์ที่ต้องการเพิ่ม
 * Output    : Category : ข้อมูลหมวดหมู่ที่ถูกเพิ่มสำเร็จจาก Backend
 * Author    : Rachata Jitjeankhan (Tang) 66160369
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
