import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login"; // ✅ import ได้ปกติ
import "../styles/css/App.css";
import { Users } from "./Users";
import { Layout } from "../layout/Layout";
import Home from "./Home";
import Dashboard from "./Dashboard";
import "../styles/css/index.css";
import TestDropDown from "./ExampleComponent";
import Departments from "./Departments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Protected Routes ที่มี Navbar และถูกครอบด้วย Layout */}
        <Route element={<Layout />}>
          <Route path="/administrator/account-management" element={<Users />} />
          <Route path="/users" element={<Users />} />
          <Route path="/administrator/departments-management"element={<Departments/>}/>
          <Route path="/example-component" element={<TestDropDown />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
