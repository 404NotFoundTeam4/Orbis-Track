/**
 * Description: Service เรียก API ตะกร้าจาก Backend
 * Author: Nontapat Sinthum (Guitar) 66160104
 */

import api from "../api/axios.js";

/**
 * Description : โครงสร้าง Envelope มาตรฐานที่ Backend ส่งกลับมา
 * ใช้ครอบข้อมูล response จริง
 * Author : Nontapat Sinhum (Guitar) 66160104
 */
type ApiEnvelope<T> = {
    success?: boolean;
    message?: string;
    data: T;
};

export type CreateBorrowTicketPayload = {
    cartItemId: number;
};

// Type ของ Cart Item แต่ละชิ้น
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

// Type ของผลลัพธ์จาก GET /borrow/cart/:id
export type CartItemListResponse = {
    itemData: CartItem[];
};

// Type ของ DELETE response
export type DeleteCartItemResponse = {
    message: string;
};

// -------------------------
// SERVICE
// -------------------------

export const CartService = {
    /**
     * GET: ดึงรายการ cart ทั้งหมดของ ct_id
     * Author : Nontapat Sinhum (Guitar) 66160104
     */
    async getCartItems(ct_id: number): Promise<CartItemListResponse> {
        const res = await api.get<ApiEnvelope<CartItemListResponse>>(
            `/borrow/cart/${ct_id}`
        );
        return res.data.data; // คืน { itemData: [...] }
    },

    /**
     * DELETE: ลบ cart item ตาม cti_id
     * Author : Nontapat Sinhum (Guitar) 66160104
     */
    async deleteCartItem(cti_id: number): Promise<string> {
        const res = await api.delete<ApiEnvelope<DeleteCartItemResponse>>(
            `/borrow/cart/${cti_id}`
        );
        return res.data.message ?? "Delete successfully";
    },

    /**
    * POST: สร้าง Borrow Ticket จาก cart
    * Author : Nontapat Sinthum (Guitar) 66160104
    */
    async createBorrowTicket(
        ct_id: number,
        payload: CreateBorrowTicketPayload
    ): Promise<any> {
        const res = await api.post<ApiEnvelope<any>>(
            `/borrow/cart/${ct_id}`,
            payload
        );
        return res.data.data;
    },
};

export default CartService;
