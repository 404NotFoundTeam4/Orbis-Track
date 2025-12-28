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
import ForgotPassword from "./ForgotPassword";
import { Cart } from "./Cart";
import EditCart from "./EditCart";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<Otppassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Navbar />}>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route
                path="/administrator/account-management"
                element={<Users />}
              />
              <Route
                path="/administrator/departments-management"
                element={<Departments />}
              />
              <Route path="/requests" element={<Requests />} />
              <Route path="/example-component" element={<TestDropDown />} />
              {/*
               * Route: หน้ารถเข็น (Cart)
               * Description:
               * - ผู้ใช้สามารถตรวจสอบรายการ แก้ไข หรือยืนยันการยืมได้จากหน้านี้
               * - หน้าหลักก่อนเข้าสู่การแก้ไขรายละเอียดตะกร้า
               * Author: Salsabeela Sa-e (San) 66160349
               */}
              <Route path="/list-devices/cart" element={<Cart />} />

              {/* Route: แก้ไขรายละเอียดตะกร้า (Edit Cart)
               * Description:
               * - ใช้สำหรับแก้ไขข้อมูลของอุปกรณ์ที่อยู่ในตะกร้าแล้ว
               * - รับค่า cti_id ผ่าน navigation state จากหน้ารถเข็น
               * - แสดงรายละเอียดเดิมของรายการ เช่น จำนวน วันที่ยืม – คืน และข้อมูลผู้ยืม เมื่อบันทึกสำเร็จ จะอัปเดตข้อมูลในระบบและนำผู้ใช้กลับไปยังหน้ารถเข็น
               * - หากไม่มี cti_id จะ redirect กลับหน้ารถเข็นทันที
               * Author: Salsabeela Sa-e (San) 66160349
               */}
              <Route path="/list-devices/cart/edit" element={<EditCart />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
