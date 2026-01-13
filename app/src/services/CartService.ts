/**
 * Description: Service เรียก API ตะกร้าจาก Backend
 * Author: Nontapat Sinthum (Guitar) 66160104
 */

import api from "../api/axios.js";

// Envelope ตาม Backend
type ApiEnvelope<T> = {
    success?: boolean;
    message?: string;
    data: T;
};

// -------------------------
// TYPE RESULT FROM BACKEND
// -------------------------

// 1) Type ของ Cart Item แต่ละชิ้น
export type CartItem = {
    cti_id: number;
    cti_us_name: string;
    cti_phone: string;
    cti_note: string;
    cti_usage_location: string;
    cti_quantity: number;
    cti_start_date: string | null; // backend ส่ง ISO string
    cti_end_date: string | null;
    cti_ct_id: number | null;
    cti_dec_id: number | null;

    device: any | null;
    de_ca_name: string | null;
    de_acc_name: string | null;
    de_dept_name: string | null;
    de_sec_name: string | null;

    dec_count: number;
    dec_ready_count: number;
    dec_availability: string; // "พร้อมใช้งาน" / "ไม่พร้อมใช้งาน"
};

// 2) Type ของผลลัพธ์จาก GET /borrow/cart/:id
export type CartItemListResponse = {
    itemData: CartItem[];
};

// 3) Type ของ DELETE response
export type DeleteCartItemResponse = {
    message: string;
};

// -------------------------
// SERVICE
// -------------------------

export const CartService = {
    /**
     * GET: ดึงรายการ cart ทั้งหมดของ ct_id
     */
    async getCartItems(ct_id: number): Promise<CartItemListResponse> {
        const res = await api.get<ApiEnvelope<CartItemListResponse>>(
            `/borrow/cart/${ct_id}`
        );
        return res.data.data; // คืน { itemData: [...] }
    },

    /**
     * DELETE: ลบ cart item ตาม cti_id
     */
    async deleteCartItem(cti_id: number): Promise<string> {
        const res = await api.delete<ApiEnvelope<DeleteCartItemResponse>>(
            `/borrow/cart/${cti_id}`
        );
        return res.data.message ?? "Delete successfully";
    },
};

export default CartService;
