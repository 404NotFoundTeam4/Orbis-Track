import api from "../api/axios";
/**
 * Function: SendOtp
 * Features:
 *   ส่งคำขอเพื่อให้ backend ส่งรหัส OTP ไปยังอีเมลของผู้ใช้งาน
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const SendOtp = async (email) => {
    const res = await api.post("/send-otp", { email });
    return res
};
/**
 * Function: VerifyOtp
 * Features:
 *   ส่ง email และ otp ไปตรวจสอบกับ backend ว่า OTP ถูกต้องหรือยังไม่หมดอายุ
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const VerifyOtp = async (email, otp) => {
    const res = await api.post("/verify-otp", { email, otp })
    return res;
}

