import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { login, user_data } from "../services/auth.account.service";
export const useLogin = () => {
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleLogin = async (username, password, isRemember) => {
    try {
      const res = await login(username, password, isRemember);

      // ✅ ตรวจว่า response มี accessToken
      if (res?.success && res?.data?.accessToken) {
        const token = res.data.accessToken;

        // ✅ ดึงข้อมูลผู้ใช้จาก token
        const users = await user_data(token);
        

        // ✅ เก็บ user ลงใน store
 
        setUser(users)
        localStorage.setItem("token", token);

        // ✅ เก็บข้อมูลผู้ใช้ถ้า remember
        if (isRemember) {
          localStorage.setItem("rememberUser", JSON.stringify(users));
        }

        // ✅ ไปหน้า users พร้อมข้อมูล
        navigate("/users", { state: { user: users } });
      } else {
        console.error("❌ Login response ผิด format:", res);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
    }
  };
   const reloaduser = async() =>{
      const token = localStorage.getItem("token");
    const users = await user_data(token);
    setUser(users)
    
  };

  return { handleLogin,reloaduser };
};
