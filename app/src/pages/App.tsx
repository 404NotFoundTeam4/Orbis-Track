import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";
import "../styles/css/App.css";
import { Users } from "./Users";

import Home from "./Home";
import Dashboard from "./Dashboard";
import "../styles/css/index.css";
import ResetPassword from "./ResetPassword";
import { Otppassword } from "./Otppassword";
import Navbar from "../components/Navbar/Navbar";
import ProtectedRoute from "../middlewares/ProtectedRoute";
import TestDropDown from "./ExampleComponent";
import Departments from "./Departments";
import { ToastProvider } from "../components/Toast";
import ForgotPassword from "./ForgotPassword";
import { Cart } from "./Cart";
import EditCart from "./EditCart";
import ListDevices from "./ListDevices";
import BorrowDevice from "./BorrowDevice";
import Requests from "./Requests";
import Inventory from "./Inventory";
import AddInventory from "./AddInventory";
import ModalToggleExample from "./ModalToggleExample";
import EditInventory from "./EditInventory";
import { Categories } from "./Categories";
import RoleRoute from "../middlewares/RoleRoute";
import { ROLE_BASE_PATH, type Role } from "../constants/rolePath";
import RolePathRedirect from "../components/RolePathRedirect";
import Profile from "./Profile";
import NotFound from "./NotFound";
import { Settings } from "./Setting";
import History from "./History";
import Repair from "./Repair";

function App() {
  const ADMIN_ONLY: Role[] = ["ADMIN"];

  const DASHBOARD_ROLE: Role[] = ["ADMIN", "HOD", "HOS", "STAFF"];

  const HOD_HOS_STAFF_ROLES: Role[] = ["HOD", "HOS", "STAFF", "ADMIN"];

  const TECHNICAL_ROLES: Role[] = ["TECHNICAL", "ADMIN"];

  const _HOD_HOS_ROLES: Role[] = ["HOD", "HOS", "ADMIN"];

  const STAFF_ROLES: Role[] = ["STAFF", "ADMIN"];

  // route ที่ทุก role สามารถใช้งานได้
  const commonRoutes = (
    <>
      <Route path="home" element={<Home />} />
      <Route path="home/:id?" element={<Home />} />
      <Route path="profile" element={<Profile />} />
      <Route path="setting" element={<Settings />} />
      <Route path="list-devices/cart" element={<Cart />} />
      <Route path="list-devices/cart/edit" element={<EditCart />} />
      <Route path="list-devices/cart/edit/:id?" element={<EditCart />} />
      <Route path="setting" element={<Settings />} />
      <Route path="history" element={<History />} />
      <Route path="history/:id?" element={<History />} />
      <Route path="list-devices" element={<ListDevices />} />
      <Route path="list-devices/borrow" element={<BorrowDevice />} />
      <Route path="list-devices/borrow/:id?" element={<BorrowDevice />} />
    </>
  );

  // route เฉพาะแอดมิน
  const adminRoutes = (
    <>
      <Route path="account-management" element={<Users />} />
      <Route path="departments-management" element={<Departments />} />
      <Route path="category" element={<Categories />} />
      <Route path="repair" element={<Repair />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/add" element={<AddInventory />} />
      <Route path="inventory/edit/:id" element={<EditInventory />} />
    </>
  );

  const hodHosStaffRoutes = (
    <>
      <Route path="request-borrow-ticket" element={<Requests />} />
      <Route path="request-borrow-ticket/:id?" element={<Requests />} />
    </>
  );

  const staffRoutes = (
    <>
      <Route path="departments-management" element={<Departments />} />
      <Route path="category" element={<Categories />} />
      <Route path="repair" element={<Repair />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/add" element={<AddInventory />} />
      <Route path="inventory/edit/:id" element={<EditInventory />} />
    </>
  );

  const technicalRoutes = (
    <>{/*<Route path="departments-management" element={<Departments />} />*/}</>
  );

  // route หน้า dashboard
  const dashboardRoutes = (
    <>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="example-component" element={<TestDropDown />} />
    </>
  );

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/date" element={<ModalToggleExample />} />
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
                  <Route
                    key={role}
                    element={<RoleRoute allowedRoles={[role as Role]} />}
                  >
                    {/* กำหนด base path */}
                    <Route path={base ? `/${base}` : "/"}>
                      {commonRoutes}
                      {ADMIN_ONLY.includes(role as Role) && adminRoutes}
                      {DASHBOARD_ROLE.includes(role as Role) && dashboardRoutes}
                      {HOD_HOS_STAFF_ROLES.includes(role as Role) &&
                        hodHosStaffRoutes}
                      {TECHNICAL_ROLES.includes(role as Role) &&
                        technicalRoutes}
                      {STAFF_ROLES.includes(role as Role) && staffRoutes}
                    </Route>
                  </Route>
                ))
              }

              {/* Gateway routes (เติม prefix ด้านหน้า) */}
              <Route
                element={
                  <RoleRoute
                    allowedRoles={["ADMIN", "HOD", "HOS", "TECHNICAL", "STAFF"]}
                  />
                }
              >
                <Route
                  path="/example-component"
                  element={<RolePathRedirect />}
                />
                <Route path="/home" element={<RolePathRedirect />} />
                <Route path="/home/:id?" element={<RolePathRedirect />} />

                <Route path="/dashboard" element={<RolePathRedirect />} />
                <Route path="/setting" element={<RolePathRedirect />} />
                <Route path="/profile" element={<RolePathRedirect />} />

                <Route path="/history" element={<RolePathRedirect />} />
                <Route path="/history/:id?" element={<RolePathRedirect />} />

                <Route
                  path="/request-borrow-ticket"
                  element={<RolePathRedirect />}
                />
                <Route
                  path="/request-borrow-ticket/:id?"
                  element={<RolePathRedirect />}
                />
                <Route
                  path="/list-devices/cart"
                  element={<RolePathRedirect />}
                />
                <Route
                  path="/list-devices/cart/edit"
                  element={<RolePathRedirect />}
                />
                <Route
                  path="/list-devices/cart/edit/:id?"
                  element={<RolePathRedirect />}
                />
                <Route path="/list-devices" element={<RolePathRedirect />} />
                <Route
                  path="/list-devices/borrow"
                  element={<RolePathRedirect />}
                />
                <Route
                  path="/list-devices/borrow/:id?"
                  element={<RolePathRedirect />}
                />
                <Route path="/category" element={<RolePathRedirect />} />
                <Route path="/repair" element={<RolePathRedirect />} />
                <Route path="/inventory" element={<RolePathRedirect />} />
                <Route path="/inventory/add" element={<RolePathRedirect />} />
                <Route
                  path="/inventory/edit/:id"
                  element={<RolePathRedirect />}
                />
              </Route>
            </Route>
            {/* 404 Not Found - สำหรับ routes ที่ไม่ match ใน protected area */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
