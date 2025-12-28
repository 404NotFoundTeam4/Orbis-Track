import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";
import "../styles/css/App.css";
import { Users } from "./Users";

import Home from "./Home";
import Dashboard from "./Dashboard";
import "../styles/css/index.css";
import ResetPassword from "./ResetPassword";
import { Otppassword } from "./Otppassword";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../middlewares/ProtectedRoute";
import TestDropDown from "./ExampleComponent";
import Departments from "./Departments";
import { ToastProvider } from "../components/Toast";
import ForgotPassword from "./ForgotPassword";
import Requests from "./Requests";
import { Cart } from "./Cart";
import EditCart from "./EditCart";
import RoleRoute from "../middlewares/RoleRoute";
import { ROLE_BASE_PATH, type Role } from "../constants/rolePath";
import RolePathRedirect from "../components/RolePathRedirect";
import Profile from "./Profile";

function App() {
  const ADMIN_ONLY: Role[] = ["ADMIN"];

  const DASHBOARD_ROLE: Role[] = ["ADMIN", "HOD", "HOS", "STAFF"];

  // route ที่ทุก role สามารถใช้งานได้
  const commonRoutes = (
    <>
      <Route path="home" element={<Home />} />
      <Route path="requests" element={<Requests />} />
      <Route path="list-devices/cart" element={<Cart />} />
      <Route path="list-devices/cart/edit" element={<EditCart />} />
      <Route path="profile" element={<Profile />} />
    </>
  );

  // route เฉพาะแอดมิน
  const adminRoutes = (
    <>
      <Route path="account-management" element={<Users />} />
      <Route path="users" element={<Users />} />
      <Route path="departments-management" element={<Departments />} />
    </>
  );

  // route หน้า dashboard
  const dashboardRoutes = (
    <>
      <Route path="dashboard" element={<Dashboard />} />
    </>
  );

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<Otppassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Login />} />

          {/* Protected Routes ที่มี Navbar และถูกครอบด้วย Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Navbar />}>

              {
                // วนลูปสร้าง routes ของแต่ละ role
                Object.entries(ROLE_BASE_PATH).map(([role, base]) => (
                  // ป้องกันให้เข้าได้เฉพาะ role ที่อนุญาต
                  <Route key={role} element={<RoleRoute allowedRoles={[role as Role]} />}>
                    {/* กำหนด base path */}
                    <Route path={base ? `/${base}` : "/"}>
                      {commonRoutes}
                      {ADMIN_ONLY.includes(role as Role) && adminRoutes}
                      {DASHBOARD_ROLE.includes(role as Role) && dashboardRoutes}
                    </Route>
                  </Route>
                ))
              }

              {/* Gateway routes (เติม prefix ด้านหน้า) */}
              <Route
                element={
                  <RoleRoute
                    allowedRoles={[
                      "ADMIN",
                      "HOD",
                      "HOS",
                      "TECHNICAL",
                      "STAFF"
                    ]}
                  />
                }
              >
                <Route path="/home" element={<RolePathRedirect />} />
                <Route path="/requests" element={<RolePathRedirect />} />
                <Route path="/list-devices/cart" element={<RolePathRedirect />} />
                <Route path="/list-devices/cart/edit" element={<RolePathRedirect />} />
              </Route>

              <Route path="/example-component" element={<TestDropDown />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
