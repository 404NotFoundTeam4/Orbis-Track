import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login"; // ✅ import ได้ปกติ
import "../styles/css/App.css";
import { Users } from "./Users";

import Home from "./Home";
import Dashboard from "./Dashboard";
import "../styles/css/index.css";
import { Resetpassword } from "./ResetPassword";
import { Otppassword } from "./OtpPassword";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../middlewares/ProtectedRoute";
import TestDropDown from "./ExampleComponent";
import Departments from "./Departments";
import { ToastProvider } from "../components/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<Otppassword />} />
          <Route path="/resetpassword" element={<Resetpassword />} />
          <Route path="/" element={<Login />} />

          {/* Protected Routes ที่มี Navbar และถูกครอบด้วย Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Navbar />}>
              <Route
                path="/administrator/account-management"
                element={<Users />}
              />
              <Route path="/users" element={<Users />} />
              <Route
                path="/administrator/departments-management"
                element={<Departments />}
              />
              <Route path="/example-component" element={<TestDropDown />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
