import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { Login, UserData } from "../services/AccountService.js";
import { SaveToken, GetValidToken, ClearToken } from "../services/Remember.js";

/**
 * Class: useLogin สำหรับนำไปเรียกใช้
 * Features:
 *   - ฟังก์ชั่น Login
 *   - ฟังก์ชั่น ReloadUser
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const useLogin = () => {
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();
  /**
   * Class: HandleLogin สำหรับตรวจสอบข้อมูล Login
   * Features:
   *   - ฟังก์ชั่น ตรวจสอบข้อมูลเมื่อมีการขอ Login
   * Author: Panyapon Phollert (Ton) 66160086
   */
  const HandleLogin = async (
    username: string,
    password: string,
    isRemember: boolean,
  ) => {
    try {
      const res = await Login(username, password, isRemember);

      if (res?.success && res?.data?.accessToken) {
        const token = res.data.accessToken;

        SaveToken(token, isRemember);

        // ถ้า token หมดอายุ saveToken จะเคลียร์ให้ เราเช็คอีกรอบ
        const validToken = GetValidToken();
        if (!validToken) {
          return;
        }
        const User = await UserData(validToken);
        setUser(User); // เก็บ user ลงใน store เพื่อให้หน้าอื่นใช้งานได้

        if (isRemember) {
          localStorage.setItem("User", JSON.stringify(User));
        } else {
          localStorage.removeItem("User");
          sessionStorage.setItem("User", JSON.stringify(User));
        }

        navigate("/users");
        return res?.success;
      }
    } catch {
      return false;
    }
  };
  /**
   * Class: ReloadUser สำหรับตรวจสอบ อายุของ Token ว่า หมดอายุหรือยัง
   * Features:
   *   - ฟังก์ชั่น ตรวจสอบข้อมูล Token ใน sessionStorage/localStorage ว่าหมดอายุไหม
   * Author: Panyapon Phollert (Ton) 66160086
   */
  const ReloadUser = async () => {
    const token = GetValidToken();
    if (!token) {
      ClearToken();
      navigate("/login");

      return;
    }
  };

  return { HandleLogin, ReloadUser };
};
