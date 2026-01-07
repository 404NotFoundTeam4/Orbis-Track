import api from "../api/axios";

export const usersService = {
/**
   * getProfile
   * Description : ดึงข้อมูลโปรไฟล์ของผู้ใช้งานปัจจุบันจากระบบ
   * Method      : GET
   * Endpoint    : /user
   * Logic       :
   * - ตรวจสอบความถูกต้องของสิทธิ์ (Token) จาก LocalStorage หรือ SessionStorage
   * - หากไม่พบสิทธิ์การใช้งาน จะทำการโยนข้อผิดพลาด (Throw Error)
   * - แนบ Timestamp (`t=${Date.now()}`) และ Cache-Control เพื่อป้องกัน Browser จำค่ารูปภาพเก่า (Cache)
   * - ดึงข้อมูลโปรไฟล์ล่าสุดที่ประกอบด้วย ชื่อ, นามสกุล, เบอร์โทร, และรูปภาพ
   * Output      : วัตถุข้อมูลโปรไฟล์ของผู้ใช้งาน (User Profile Object)
   * Author      : Niyada Butchan (Da) 66160361
   */

getProfile: async () => {
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    if (!token) throw new Error("Token not found");

    const { data } = await api.get(`/user?t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    return data;
},

 /**
   * updateProfile
   * Description: อัปเดตข้อมูลโปรไฟล์ส่วนตัว (รองรับการแก้ไขข้อมูลทั่วไปและรูปภาพ)
   * Method     : PATCH
   * Endpoint   : /user/:id
   * Input      : id (number), formData (FormData: us_phone, us_images ฯลฯ)
   * Logic      :
   * - ตรวจสอบ token จาก localStorage หรือ sessionStorage (ให้ความสำคัญกับ localStorage ก่อน)
   * - ตรวจสอบว่ามี token หรือไม่ ถ้าไม่มีให้ Throw Error
   * - ส่งข้อมูลแบบ multipart/form-data ไปยังบัญชีเป้าหมายตาม ID
   * - ใช้ Authorization header สำหรับยืนยันสิทธิ์การแก้ไข
   * Output     : ข้อมูลผลลัพธ์การอัปเดตบัญชีผู้ใช้
   * Author     : Niyada Butchan (Da) 66160361
   */
updateProfile: async (id: number, formData: FormData) => {
  // ลองหาใน localStorage ก่อน ถ้าไม่มี (null) ให้ไปหาใน sessionStorage
  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");

  // Optional: ถ้ายังไม่มี Token อีก อาจจะ throw error หรือ handle ตาม logic หน้าบ้าน
  if (!token) {
     throw new Error("No authentication token found");
  }

  const { data } = await api.patch(`/user/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
},

/**
   * updatePassword
   * Description: แก้ไขรหัสผ่านเดิมเป็นรหัสผ่านใหม่
   * Method     : PATCH
   * Endpoint   : /user/update-password
   * Input      : payload { oldPassword, newPassword, confirmPassword }
   * Logic      :
   * - ตรวจสอบ token จาก localStorage หรือ sessionStorage
   * - ตรวจสอบรหัสผ่านเดิมผ่านระบบ argon2 ใน Backend
   * - อัปเดตรหัสผ่านใหม่ลงฐานข้อมูล
   * Output     : ข้อความยืนยันการเปลี่ยนรหัสผ่านสำเร็จ
   * Author     : Niyada Butchan (Da) 66160361
   */
  updatePassword: async (payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // เช็ค Token จาก Local หรือ Session Storage
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");

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
