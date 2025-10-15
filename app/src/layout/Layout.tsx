import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";  // นำเข้า Navbar ที่ต้องการใช้

export const Layout = () => {
  return (
    <div className="flex">
      {/* Navbar จะปรากฏในทุกหน้า */}
    
        {/* เพิ่มเนื้อหาของ Sidebar ที่นี่ */}
     
       

      {/* Main Content */}
       <div className="flex-1 ml-[237px]  mt-[134px] bg-[#FAFAFA]  ">
        {/* ให้เนื้อหาหลักขยายเต็มขอบขวา */}
        <Outlet />
      </div>
    </div>
  );
};
