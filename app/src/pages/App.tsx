import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";   // ✅ import ได้ปกติ
import "../common/styles/css/App.css";
import { Users } from "./Users";
import { Layout } from "../common/components/Layout";
import Home from "./Home";
import Dashboard from "./Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Protected Routes ที่มี Navbar และถูกครอบด้วย Layout */}
        <Route element={<Layout />}>
          <Route path="/users" element={<Users />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
