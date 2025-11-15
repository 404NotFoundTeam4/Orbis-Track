import api from "../api/axios";

/**
 * Function: Login
 * Features:
 *  - ส่งข้อมูล username และ password ไป backend เพื่อตรวจสอบสิทธิ์เข้าสู่ระบบ
 *  - และรับ accessToken กลับมาหากเข้าสู่ระบบสำเร็จ
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const Login = async (username, passwords,isRemember) => {
  const res = await api.post("/login", {username, passwords,isRemember});
  return res.data;
};
/**
 * Function: UserData
 * Features:
 *  - ใช้ accessToken ที่ได้จาก login เพื่อดึงข้อมูล user จาก backend
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const UserData = async (token) => {
   const res = await api.get("/auth/fetch-me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data
};
/**
 * Function: UserData
 * Features:
 *  - ส่งคำขอรีเซ็ตรหัสผ่านไปยัง backend หลังผู้ใช้ผ่าน OTP แล้ว
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const ResetPassword = async (email, newPassword, confirmNewPassword) => {
  const  data  = await api.post("/forgot-password", {email, newPassword, confirmNewPassword});
  
  return data;
} 