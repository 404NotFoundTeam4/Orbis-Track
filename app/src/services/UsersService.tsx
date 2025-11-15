import api from "../api/axios.js"; 

type ApiEnvelope<T> = { success?: boolean; message?: string; data: T };


/**
   * Description: Service ดึง API จาก BackEnd
   * Author:Chanwit Muangma (Boom) 66160224
   */

// ชนิดผลลัพธ์ให้ตรงกับ Backend (deletedAt เป็น Date หรือ ISO string)
export type SoftDeleteResp = {
  us_id: number;
  deletedAt: string | Date;
};

export const UsersService = {
  async softDelete(us_id: number): Promise<SoftDeleteResp> {
    // ใส่ generic ให้ axios: ApiEnvelope<SoftDeleteResp>
    const res = await api.delete<ApiEnvelope<SoftDeleteResp>>(`/accounts/${us_id}`);
    return res.data.data; // <<< คืนเฉพาะ data ที่เป็น SoftDeleteResp
  },
}; // Author:Chanwit Muangma (Boom) 66160224

export default UsersService;