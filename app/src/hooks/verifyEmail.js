import {  useNavigate } from "react-router-dom";
import { SendOtp, VerifyOtp } from "../services/otpservices";
import { ResetPassword } from "../services/AccountService";

export const verifyEmail = () => {
  const navigate = useNavigate();
    /**
 * Class: GetOtp สำหรับส่ง Email เพื่อรับ OTP
 * Features:
 *   - ฟังก์ชั่น ส่ง Email ไปยัง Email ผู้ใช้งาน เพื่อรับ OTP
 * Author: Panyapon Phollert (Ton) 66160086
 */
  const GetOtp = async (email) => {
    const res = await SendOtp(email);
    return res;
  };
    /**
   * Function: SetOtp
   * Features:
   *  - ตรวจสอบความถูกต้องของรหัส OTP ที่ผู้ใช้กรอก
   *  - นำผู้ใช้ไปหน้า resetpassword พร้อมส่ง email ไปด้วยผ่าน state
   * Author: Panyapon Phollert (Ton) 66160086
   */
  const SetOtp = async (email, otp) => {
    const res = await VerifyOtp(email, otp);
    if (res.data.success) {
      navigate("/reset-password", { state: { email } });
    }
    return res.data.success;
  };
    /**
   * Function: ResetPW
   * Features:
   *  - รีเซ็ตรหัสผ่านใหม่หลังยืนยัน OTP ผ่านแล้ว
   *  - ถ้ารีเซ็ตสำเร็จ นำผู้ใช้กลับไปหน้า Login
   * Author: Panyapon Phollert (Ton) 66160086
   */
  const ResetPW = async (email, newPassword, confirmNewPassword) => {
    const res = await ResetPassword(email, newPassword, confirmNewPassword);
    if (res) {
      navigate("/login");
    }
    return res;
  };
  return { GetOtp, SetOtp, ResetPW };
};
