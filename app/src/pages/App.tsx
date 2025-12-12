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
import Requests from "./Requests";
import { ToastProvider } from "../components/Toast";
import ForgotPassword from "./ForgotPassword"
import Requests from "./Requests";
import { Cart } from "./Cart";
import EditCart from "./EditCart";
import RoleRoute from "../middlewares/RoleRoute";

function App() {
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

              {/* แอดมิน */}
              <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                <Route
                  path="/administrator/account-management"
                  element={<Users />}
                />
                <Route path="/users" element={<Users />} />
                <Route
                  path="/administrator/departments-management"
                  element={<Departments />}
                />
              </Route>

              {/* แอดมิน, หัวหน้า, เจ้าหน้าที่คลัง */}
              <Route element={<RoleRoute allowedRoles={["ADMIN", "HOD", "HOS", "STAFF"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* ผู้ใช้งานทั้งหมด */}
              <Route element={<RoleRoute allowedRoles={["ADMIN", "HOD", "HOS", "TECHNICAL", "STAFF", "EMPLOYEE"]} />}>
                <Route path="/home" element={<Home />} />
                <Route path="/requests" element={<Request />} />
                <Route path="/list-devices/cart" element={<Cart />} />
                <Route path="/list-devices/cart/edit" element={<EditCart />} />
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
