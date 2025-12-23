/**
 * Description: Service สำหรับเรียก API ตะกร้าจาก Backend (Cart / Borrow)
 * Input : -
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

/**
 * Description: โครงสร้างข้อมูล Cart Item ที่ frontend ใช้หลังดึงจาก backend
 * Input : -
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
 * Input : -
 * Output : CartItemListResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type CartItemListResponse = {
    itemData: CartItem[];
};

/**
 * Description: โครงสร้างผลลัพธ์จาก API DELETE /borrow/cart/:cti_id
 * Input : -
 * Output : DeleteCartItemResponse
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export type DeleteCartItemResponse = {
    message: string;
};

/**
 * Description: Service รวมฟังก์ชันเรียก API ที่เกี่ยวข้องกับ Cart (GET/DELETE/POST)
 * Input : -
 * Output : CartService (methods สำหรับเรียก backend)
 * Author : Nontapat Sinhum (Guitar) 66160104
 **/
export const CartService = {
    /**
    * Description: ดึงรายการ cart ทั้งหมดของผู้ใช้/ตะกร้า ตาม ct_id
    * Input : ct_id (number) = id ของ cart (หรือ id ที่ backend ใช้ผูกตะกร้า)
    * Output : Promise<CartItemListResponse> = { itemData: CartItem[] }
    * Author : Nontapat Sinhum (Guitar) 66160104
    **/
    async getCartItems(ct_id: number): Promise<CartItemListResponse> {
        const res = await api.get<ApiEnvelope<CartItemListResponse>>(
            `/borrow/cart/${ct_id}`
        );
        return res.data.data;
    },

    /**
    * Description: ลบ cart item ตาม cti_id
    * Input : cti_id (number) = id ของรายการในตะกร้าที่ต้องการลบ
    * Output : Promise<string> = message ผลการลบ (ถ้าไม่มี message จะคืนค่า default)
    * Author : Nontapat Sinhum (Guitar) 66160104
    **/
    async deleteCartItem(cti_id: number): Promise<string> {
        const res = await api.delete<ApiEnvelope<DeleteCartItemResponse>>(
            `/borrow/cart/${cti_id}`
        );
        return res.data.message ?? "Delete successfully";
    },

    /**
    * Description: สร้าง Borrow Ticket จาก cart ตาม ct_id และ payload (cartItemId)
    * Input : ct_id (number) = id ที่ backend ใช้ระบุเจ้าของตะกร้า/ตะกร้า, payload (CreateBorrowTicketPayload)
    * Output : Promise<any> = ข้อมูลผลลัพธ์ที่ backend ส่งกลับ (ตามที่ backend กำหนด)
    * Author : Nontapat Sinhum (Guitar) 66160104
    **/
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
