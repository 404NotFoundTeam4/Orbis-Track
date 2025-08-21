import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Login from "./Login";   // ✅ import ได้ปกติ
import "../common/styles/css/App.css"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ public route */}
        <Route path="/login" element={<Login />} />
         <Route path="/" element={<Login />} />




         {/* ✅ protected routes ครอบทีเดียว */}
        <Route path="/about" element={<About />} />
        <Route path="/Home" element={<Home />} />   {/* ✅ ใช้งาน */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
