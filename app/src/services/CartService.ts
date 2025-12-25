/**
 * Description: Service สำหรับเรียก API ตะกร้าจาก Backend (Cart / Borrow)
 * Output : CartService (object) สำหรับเรียกใช้งาน API
 * Author : Nontapat Sinthum (Guitar) 66160104
 */

import api from "../api/axios.js";

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

export const CartService = {
    /**
    * Description: ดึงรายการอุปกรณ์ในตะกร้าของผู้ใช้ (backend จะ resolve ผู้ใช้จาก token/session)
    * Output : Promise<CartItemListResponse> = { itemData: CartItem[] }
    * Author : Nontapat Sinhum (Guitar) 66160104
    **/
    async getCartItems(): Promise<CartItemListResponse> {
        const res = await api.get<ApiEnvelope<CartItemListResponse>>(
            `/borrow/cart/`
        );
        return res.data.data;
    },

    /**
    * Description: ลบรายการในตะกร้าตาม cartItemId
    * Input : payload: { cartItemId: number }
    * Output : Promise<string> = message ผลการลบ (ถ้าไม่มี message จะคืนค่า default)
    * Author : Nontapat Sinhum (Guitar) 66160104
    **/
    async deleteCartItem(payload: DeleteCartItemPayload): Promise<string> {
        const res = await api.delete<ApiEnvelope<DeleteCartItemResponse>>(
            `/borrow/cart/`,
            { data: payload }
        );
        return res.data.message ?? "Delete successfully";
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
