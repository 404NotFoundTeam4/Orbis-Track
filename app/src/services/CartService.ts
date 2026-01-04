/**
 * Description: Service สำหรับเรียก API ตะกร้าจาก Backend (Cart / Borrow)
 * Output : CartService (object) สำหรับเรียกใช้งาน API
 * Author : Nontapat Sinthum (Guitar) 66160104
 */

import api from "../api/axios.js"; // ต้องมี axios.d.ts สำหรับ TS

/**
 * Description: โครงสร้าง Envelope มาตรฐานที่ Backend ส่งกลับมา (ใช้ครอบข้อมูล response จริง)
 * Input : T (Generic type ของข้อมูลใน field data)
 * Output : ApiEnvelope<T>
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

/**
 * Description: Payload สำหรับสร้าง Borrow Ticket จากรายการในตะกร้า
 * Input : cartItemId (number) = id ของ cart item ที่ต้องการสร้างคำร้อง
 * Output : CreateBorrowTicketPayload
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type CreateBorrowTicketPayload = {
    cartItemId: number;
};

export type DeleteCartItemPayload = {
    cartItemId: number;
};

/**
 * Description: โครงสร้างข้อมูล Cart Item ที่ frontend ใช้หลังดึงจาก backend
 * Output : CartItem (type)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type CartItem = {
  ctiId: number;
  cti_us_name: string;
  cti_phone: string;
  cti_note: string;
  cti_usage_location: string;
  cti_quantity: number;
  cti_start_date: string | null; // backend ส่ง ISO string
  cti_end_date: string | null;
  cti_ct_id: number | null;
  cti_dec_id: number | null;
};

/**
 * Description: โครงสร้างผลลัพธ์จาก API GET /borrow/cart/:id
 * Output : CartItemListResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type CartItemListResponse = {
  itemData: CartItem[];
};

/**
 * Description: โครงสร้างผลลัพธ์จาก API DELETE /borrow/cart/:cti_id
 * Output : DeleteCartItemResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type DeleteCartItemResponse = {
  message: string;
};

// 3) Type ของ Update Cart
export interface UpdateCartItemPayload {
  borrower: string;
  phone: string;
  reason: string;
  placeOfUse: string;
  quantity: number;
  borrowDate: Date | null;
  returnDate: Date | null;
}

// -------------------------
// SERVICE
// -------------------------

export const CartService = {
  /**
   * GET: ดึงรายการ cart ทั้งหมดของ ct_id
   */
  async getCartItems(
    ct_id: number
  ): Promise<ApiEnvelope<CartItemListResponse>> {
    try {
      const res = await api.get<ApiEnvelope<CartItemListResponse>>(
        `/borrow/cart/${ct_id}`
      );

      return res.data.data;
    } catch (error) {
      console.error("API GET /borrow/cart error:", error);
      return { itemData: [] }; // fallback
    }
  },

  /**
   * DELETE: ลบ cart item ตาม ctiid
   */
  async deleteCartItem(ctiId: number): Promise<string> {
    try {
      const res = await api.delete<ApiEnvelope<DeleteCartItemResponse>>(
        `/borrow/cart/${ctiId}`
      );
      return res.data.message ?? "Delete successfully";
    } catch (error) {
      console.error("API DELETE /borrow/cart error:", error);
      return "Delete failed";
    }
  },
  /**
   * UPDATE: แก้ไข cart item ตาม ctiId
   */
  /**
   * Description: แก้ไขรายละเอียดอุปกรณ์ในรถเข็น (Edit Cart)
   *
   * Note:
   * - ใช้ในหน้า Edit Cart
   * - รองรับการแก้ไขจำนวน, วันที่ยืม–คืน, ผู้ยืม, เหตุผล และสถานที่ใช้งาน
   *
   * Flow การทำงาน:
   * 1. รับ ctiId และข้อมูลที่แก้ไขจากฟอร์ม
   * 2. แปลง Date → ISO string ก่อนส่งไป Backend
   * 3. เรียก API PUT /borrow/cart/:ctiId
   * 4. Backend อัปเดตข้อมูลในระบบ
   *
   * Result:
   * - สำเร็จ → return message
   * - ไม่สำเร็จ → throw error ให้หน้า Edit Cart จัดการ
   *
   * Author: Salsabeela Sa-e (San) 66160349
   */
  async updateCartItem(
    ctiId: number,
    payload: UpdateCartItemPayload
  ): Promise<string> {
    try {
      const res = await api.put<ApiEnvelope<null>>(`/borrow/cart/${ctiId}`, {
        cti_us_name: payload.borrower,
        cti_phone: payload.phone,
        cti_note: payload.reason,
        cti_usage_location: payload.placeOfUse,
        cti_quantity: payload.quantity,
        cti_start_date: payload.borrowDate
          ? new Date(payload.borrowDate).toISOString()
          : null,
        cti_end_date: payload.returnDate
          ? new Date(payload.returnDate).toISOString()
          : null,
      });

      return res.data.message ?? "Update successfully";
    } catch (error) {
      console.error("API UPDATE /borrow/cart error:", error);
      throw error;
    }
  },
/**
    * Description: สร้าง Borrow Ticket จากรายการในตะกร้า
    * Input : payload: { cartItemId: number }
    * Output : Promise<any> = ข้อมูลผลลัพธ์ที่ backend ส่งกลับ (ตามที่ backend กำหนด)
    * Author : Nontapat Sinhum (Guitar) 66160104
    **/
    async createBorrowTicket(
        payload: CreateBorrowTicketPayload
    ): Promise<any> {
        const res = await api.post<ApiEnvelope<any>>(
            `/borrow/cart/`,
            payload
        );
        return res.data.data;
    },
};

export default CartService;
