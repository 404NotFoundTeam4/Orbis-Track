import { useEffect } from "react";
import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
export default function ProtectedRoute(): ReactElement {
  const { ReloadUser } = useLogin();
  useEffect(() => {
    ReloadUser(); // โหลด user + เช็ค token / exp
  }, []);
  const location = useLocation();
  // Check token in localStorage. If absent -> redirect to login.
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
