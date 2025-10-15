import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../styles/css/icon.css";
import "../styles/css/Navbar.css";
import { Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBell,
  faChevronUp,
  faCartShopping,
  faCircleUser,
  faServer,
  faBoxArchive,
  faBoxesStacked,
  faWrench,
  faChartLine,
  faClockRotateLeft,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/images/logoblue.png";

export const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  const location = useLocation();
  const user = location.state?.user;
  const logged = useRef(false);

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
          <div className="w-[40px] h-[40px] bg-white flex justify-center items-center rounded-full border-2 border-black">
            <FontAwesomeIcon
              icon={faCartShopping}
              className="text-[22px] text-black"
            />
          </div>

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
      <div className="flex ">
        <div className="  w-[213px] bg-white text-black p-2 shadow-xl  min-h-screen  z-40">
          <ul className="px-4 text-left space-y-6">
            <li className="">
              <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faHome} className="" />
                <Link to="/home" className="block py-2  ">
                  {" "}
                  หน้าหลัก{" "}
                </Link>
              </div>
            </li>
            {(user.us_role === "HOD" || user.us_role === "admin") && (
              <li>
                <div
                  className="flex items-center w-full cursor-pointer menu-item gap-2 "
                  onClick={toggleDropdown}
                >
                  <FontAwesomeIcon icon={faServer} className="" />
                  <span>การจัดการ</span>
                  <FontAwesomeIcon
                    icon={faChevronUp}
                    className={`ml-1 mt-1 transform transition-transform duration-300  rotate-180 ${isDropdownOpen ? "rotate-360" : ""}`}
                  />
                </div>

                <ul
                  className={`pl-4 overflow-hidden dropdown-menu ${isDropdownOpen ? "open" : ""}`}
                >
                  <li className="dropdown-item ">
                    <Link to="/manage/equipment" className="block py-2 px-6">
                      คำร้อง
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="/manage/equipment" className="block py-2 px-6">
                      คลังอุปกรณ์
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="/users" className="block py-2  px-6">
                      บัญชีผู้ใช้
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="/manage/chatbot" className="block py-2 px-6">
                      แชทบอท
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            <li>
              <div className="flex items-center w-full h-12 cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faBoxArchive} />
                <Link to="/reports/equipment" className="block">
                  รายการอุปกรณ์
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faBoxesStacked} />
                <Link to="/reports/requests" className="block ">
                  รายการยืม
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faWrench} />
                <Link to="/support" className="block hover:bg-gray-200">
                  แจ้งปัญหา
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faChartLine} flip="horizontal" />
                <Link to="/dashboard" className="block  hover:bg-gray-200">
                  แดชบอร์ด
                </Link>
              </div>
            </li>

            <li>
              <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faClockRotateLeft} />
                <Link to="/settings" className="block  hover:bg-gray-200">
                  ดูประวัติ
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
                <FontAwesomeIcon icon={faGear} />
                <Link to="/settings" className="block  hover:bg-gray-200">
                  การตั้งค่า
                </Link>
              </div>
            </li>
          </ul>
        </div>
        <main className="flex-1 m-6 ">
          <div className=" w-full min-h-[calc(100vh-150px)]  ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navbar;
