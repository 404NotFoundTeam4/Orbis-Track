import { useEffect  } from "react";
import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { useLogin } from "../hooks/useLogin";
export default function ProtectedRoute(): ReactElement {
  const { reloaduser } = useLogin();          // ✅ ตรงนี้อยู่ใต้ <BrowserRouter> แล้ว
  useEffect(() => {
    reloaduser();                            // โหลด user + เช็ค token / exp
  }, []); 
  const location = useLocation();
  // Check token in localStorage. If absent -> redirect to login.
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Token exists -> allow child routes to render. Components can fetch user info as needed.
  return <Outlet />;
}
