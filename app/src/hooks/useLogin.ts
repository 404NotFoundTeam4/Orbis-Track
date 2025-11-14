// hooks/useLogin.ts
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { login, user_data } from "../services/AccountService.js";
import { saveToken, getValidToken, clearToken } from "../services/remember";

export const useLogin = () => {
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleLogin = async (
    username: string,
    password: string,
    isRemember: boolean
  ) => {
    try {
      const res = await login(username, password, isRemember);

      if (res?.success && res?.data?.accessToken) {
        const token = res.data.accessToken;


        saveToken(token, isRemember);

        // ถ้า token หมดอายุ saveToken จะเคลียร์ให้ เราเช็คอีกรอบ
        const validToken = getValidToken();
        if (!validToken) {
          return;
        }
        const users = await user_data(validToken);
        if (isRemember) {
          localStorage.setItem("rememberUser", JSON.stringify(users));
        } else {
          localStorage.removeItem("rememberUser");
        }

        navigate("/users", { state: { user: users } });
        return res?.success
      }
    }
    catch  {
     return false;
    }
  };

  const reloaduser = async () => {
    const token = getValidToken(); // เช็คทั้ง sessionStorage/localStorage + exp
    if (!token) {
      clearToken();
      navigate("/login");

      return;
    }

  };


  return { handleLogin, reloaduser };
};
