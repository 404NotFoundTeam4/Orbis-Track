import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/css/icon.css";
import "../styles/css/Navbar.css";
import { Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserStore } from "../stores/userStore";
import {
  faHome,
  faBell,
  faChevronUp,
  faCartShopping,
  faServer,
  faBoxArchive,
  faBoxesStacked,
  faWrench,
  faChartLine,
  faClockRotateLeft,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

export const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const closeDropdown = () => setDropdownOpen(false);
  const handleLogout = () => {
    logout(); // ❌ ล้าง token + user
    navigate("/login"); // 🔄 กลับหน้า login
  };
  return (
    <div className="flex flex-col background w-full min-h-screen ">
      {/* Navbar */}
      <div className=" w-full bg-[linear-gradient(to_right,#ffffff_0%,#ffffff_75%,#e7f7ff_90%,#dcf3ff_100%)] text-white px-4 py-2 h-[110px] flex justify-between items-center  top-0 left-0 z-50">
        <div className="flex text-white ml-3 w-[149px] h-[44px] rounded-full bg-[#40A9FF] items-center justify-center">
          <span className="font-bold text-2xl">Orbis Track</span>
        </div>

        <div className="flex items-center gap-[20px]">
          <div className="w-[174px] h-[46px] bg-black flex  items-center rounded-full border-2 border-black">
            <div className="w-[46px] h-[46px] bg-[#2E2E2E] rounded-full"></div>
            <div className="font-semibold p-3.5">คุยกับ GiGa</div>
          </div>
          <div className="w-[40px] h-[40px] bg-white flex justify-center items-center rounded-full mr-1 border-2 border-black">
            <FontAwesomeIcon icon={faBell} className="text-[22px] text-black" />
          </div>
          <Link
            to="/list-devices/cart"
            className="w-[40px] h-[40px] bg-white flex justify-center items-center rounded-full border-2 border-black cursor-pointer"
          >
            <FontAwesomeIcon
              icon={faCartShopping}
              className="text-[22px] text-black"
            />
          </Link>

          <div className="flex gap-1 items-center bg-white rounded-full border-2 border-black w-auto h-[46px] p-4 ">
            <div className=" text-left text-black pr-8">
              <div className="text-[16px] font-semibold">นายอภิทัชชา</div>
              <div className="text-[13px] font-normal">พนักงานทั่วไป</div>
            </div>
            <img src="" alt="" className="w-9 h-9 rounded-full" />
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="flex">
        <div className="w-[213px] bg-white text-black px-2 shadow-xl min-h-screen z-40">
          <div className="text-left">
            {/* 🏠 หน้าหลัก */}
            <Link
              to="/home"
              onClick={closeDropdown}
              className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faHome} />
              <span>หน้าหลัก</span>
            </Link>

            {/* ⚙️ เมนูการจัดการ */}
            <li>
              <div
                onClick={toggleDropdown}
                className={`px-7.5 flex items-center w-full cursor-pointer gap-2 h-[50px] rounded-[9px] select-none transition-colors duration-200 ${
                  isDropdownOpen
                    ? "bg-[#40A9FF] text-white"
                    : "hover:bg-[#F0F0F0]"
                }`}
              >
                <FontAwesomeIcon icon={faServer} />
                <span>การจัดการ</span>
                <FontAwesomeIcon
                  icon={faChevronUp}
                  className={`mt-1 ml-auto transform transition-all duration-800 ease-in-out ${
                    isDropdownOpen ? "rotate-0" : "rotate-180"
                  }`}
                />
              </div>

              <ul
                className={`overflow-hidden transition-all duration-800 ease-in-out ${
                  isDropdownOpen
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  to="/users"
                  className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                >
                  คำร้อง
                </Link>

                <Link
                  to="/users"
                  className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                >
                  คลังอุปกรณ์
                </Link>

                <Link
                  to="/users"
                  className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                >
                  บัญชีผู้ใช้
                </Link>

                <Link
                  to="/users"
                  className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                >
                  แชทบอท
                </Link>

                <Link
                  to="/administrator/departments-management"
                  className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                >
                  แผนกและฝ่ายย่อย
                </Link>

                <Link
                  to="/users"
                  className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                >
                  หมวดหมู่อุปกรณ์
                </Link>
              </ul>

              {/* 📦 เมนูอื่น ๆ */}

              <Link
                to="/users"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faBoxArchive} />
                <span>รายการอุปกรณ์</span>
              </Link>

              <Link
                to="/users"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faBoxesStacked} />
                <span>รายการยืม</span>
              </Link>

              <Link
                to="/users"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faWrench} />
                <span>แจ้งปัญหา</span>
              </Link>

              <Link
                to="/users"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faChartLine} flip="horizontal" />
                <span>แดชบอร์ด</span>
              </Link>

              <Link
                to="/users"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faClockRotateLeft} />
                <span>ดูประวัติ</span>
              </Link>

              <Link
                to="/users"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faGear} />
                <span>การตั้งค่า</span>
              </Link>
            </li>
            <button
              onClick={handleLogout}
              className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] h-[50px] flex items-center w-full gap-2 transition-colors duration-200"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        <main className="flex-1 bg-[#FAFAFA] ">
          <div className=" w-full min-h-[calc(100vh-150px)]  ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navbar;
