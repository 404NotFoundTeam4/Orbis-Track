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

  // อัปเดตข้อมูลโปรไฟล์
   /**
   * updateProfile
   * Description: อัปเดตข้อมูลโปรไฟล์ของผู้ใช้งาน
   * Method     : PUT
   * Endpoint   : /user
   * Input      : FormData (รองรับข้อมูลทั่วไปและไฟล์ เช่น รูปโปรไฟล์)
   * Logic      :
   *   - ตรวจสอบ token จาก localStorage
   *   - ส่งข้อมูลในรูปแบบ multipart/form-data
   *   - ใช้ Authorization header สำหรับยืนยันตัวตน
   * Output     : ข้อมูลผลลัพธ์หลังจากอัปเดตโปรไฟล์สำเร็จ
   * Author     : Niyada Butchan (Da) 66160361
   */
  updateProfile: async (formData: FormData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
    }

    const { data } = await api.put("/user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  },

  // เปลี่ยนรหัสผ่าน
    /**
   * updatePassword
   * Description: เปลี่ยนรหัสผ่านของผู้ใช้งาน
   * Method     : PATCH
   * Endpoint   : /user/update-password
   * Input      : {
   *   oldPassword: string,
   *   newPassword: string,
   *   confirmPassword: string
   * }
   * Logic      :
   *   - ตรวจสอบ token จาก localStorage
   *   - ส่งข้อมูลรหัสผ่านไปยัง backend เพื่อทำการตรวจสอบและอัปเดต
   *   - ใช้ Authorization header สำหรับยืนยันตัวตน
   * Output     : ข้อมูลผลลัพธ์หลังจากเปลี่ยนรหัสผ่านสำเร็จ
   * Author     : Niyada Butchan (Da) 66160361
   */
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
