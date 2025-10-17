// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const location = useLocation();
  const storeUser = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  // 1) Prefer user in zustand store
  if (storeUser) {
    return <Outlet />;
  }

  // 2) Try to recover user from localStorage (rememberUser)
  useEffect(() => {
    try {
      const remembered = localStorage.getItem("rememberUser");
      if (remembered) {
        const parsed = JSON.parse(remembered);
        setUser(parsed);
      }
    } catch (e) {
      // ignore JSON errors
      console.warn("ProtectedRoute: failed to parse rememberUser", e);
    }
  }, [setUser]);

  // 3) If there's a token in localStorage we assume user can be fetched by app logic
  const token = localStorage.getItem("token");
  if (!token) {
    // redirect to /login and save attempted path in state
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If there's a token but no user yet, still allow Outlet so components can fetch user
  return <Outlet />;
}
