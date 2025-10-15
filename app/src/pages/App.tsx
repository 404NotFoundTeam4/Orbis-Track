import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";   // ✅ import ได้ปกติ
import "../styles/css/App.css";
import { Users } from "./Users";

import Home from "./Home";
import Dashboard from "./Dashboard";
import '../styles/css/index.css'
import  {Resetpassword } from "./Resetpassword"
import {Otppassword} from "./Otppassword"
import Navbar from "../components/Navbar";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<Otppassword/>} />
         <Route path="/resetpassword" element={<Resetpassword/>} />
        <Route path="/" element={<Login />} />

        {/* Protected Routes ที่มี Navbar และถูกครอบด้วย Layout */}
        <Route element={<Navbar />}>
          <Route path="/users" element={<Users />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
