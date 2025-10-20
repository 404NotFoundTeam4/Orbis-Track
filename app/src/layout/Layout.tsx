import { Outlet } from "react-router-dom";
import Navbar from "../components/Sidebar";  // นำเข้า Navbar ที่ต้องการใช้

export const Layout = () => {
  return (
    <div className="flex">
      {/* Navbar จะปรากฏในทุกหน้า */}
      <div className="w-[250px]  text-white h-full fixed top-0 left-0 p-4 z-50">
        {/* เพิ่มเนื้อหาของ Sidebar ที่นี่ */}
      <Navbar />
        </div>

      {/* Main Content */}
       <div className="flex-1 ml-[215px]  mt-[75px]">
        {/* ให้เนื้อหาหลักขยายเต็มขอบขวา */}
        <Outlet />
      </div>
    </div>
  );
};
