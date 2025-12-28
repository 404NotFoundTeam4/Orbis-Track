import api from "../api/axios";

export const usersService = {
  // ดึงข้อมูลโปรไฟล์
    /**
   * getProfile
   * Description: ดึงข้อมูลโปรไฟล์ของผู้ใช้งานที่เข้าสู่ระบบอยู่
   * Method     : GET
   * Endpoint   : /user
   * Logic      :
   *   - ดึง token จาก localStorage
   *   - หากไม่พบ token จะ throw error เพื่อให้ผู้ใช้เข้าสู่ระบบใหม่
   *   - ส่ง Authorization header ไปกับ request
   * Output     : ข้อมูลโปรไฟล์ผู้ใช้งาน
   * Author     : Niyada Butchan (Da) 66160361
   */
  getProfile: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token not found");
    }

    const { data } = await api.get("/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  },


updateProfile: async (id: number, formData: FormData) => {
  const token = localStorage.getItem("token");

  // ส่งไปที่ Endpoint ที่มี ID ต่อท้ายเพื่อให้ผ่าน idParamSchema.parse
  const { data } = await api.post(`/user/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
},


  updatePassword: async (payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
    }

    const { data } = await api.patch("/user/update-password", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  },
};

export default usersService;
