import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";  // นำเข้า Navbar ที่ต้องการใช้

export const Layout = () => {
  return (
    <div className="flex">
      {/* Navbar จะปรากฏในทุกหน้า */}
      <Navbar />

      {/* Main Content */}
      <main className=" ml-[85px] p-4 w-full mt-[65px] ">
        <Outlet /> {/* แสดง route child ที่ถูกกำหนด */}
      </main>
    </div>
  );
};
