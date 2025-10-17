import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute(): ReactElement {
  const location = useLocation();
    const user =location.state?.user || null
  // Check token in localStorage. If absent -> redirect to login.
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Token exists -> allow child routes to render. Components can fetch user info as needed.
  return <Outlet />;
}
