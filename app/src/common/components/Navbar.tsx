import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/css/icon.css";
import "../styles/css/Navbar.css";

function Navbar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex background ">
      {/* Navbar */}
      <div className="w-full bg-[#343434] text-white px-4 py-2 h-[65px] flex justify-between items-center fixed top-0 left-0 z-50">
        <span className="font-bold text-lg">Orbis Track</span>
        <span>Profile / Menu</span>
      </div>
      {/* Sidebar */}
      <div className="w-[207px] bg-white text-black p-2 shadow-xl fixed left-0 top-[65px]  h-[calc(100%-65px)] z-40">
        <h2 className="text-xl font-bold text-left mb-4">Sidebar</h2>
        <ul className="text-left ">
          <li className="flex items-center">
            <div className="flex items-center w-full cursor-pointer hover:bg-gray-200">
              <span className="fa7-solid--home mr-2 "></span>
              <Link to="/home" className="block py-2  "> หน้าหลัก </Link>
            </div>
          </li>
          <li>
            <div
              className="flex items-center justify-between py-2 px-4 cursor-pointer hover:bg-gray-200" onClick={toggleDropdown}>
              <span>การจัดการ</span>
              < i className={`arrow down transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}></i>
            </div>
            <ul className={`pl-4 overflow-hidden dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
              <li className="dropdown-item">
                <Link to="/manage/equipment" className="block py-2 px-4 hover:bg-gray-200">
                  คำร้อง
                </Link>
              </li>
               <li className="dropdown-item">
                <Link to="/manage/equipment" className="block py-2 px-4 hover:bg-gray-200">
                  คลังอุปกรณ์
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/users" className="block py-2 px-4 hover:bg-gray-200">
                  บัญชีผู้ใช้
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/manage/chatbot" className="block py-2 px-4 hover:bg-gray-200">
                  แชทบอท
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link to="/reports/equipment" className="block py-2 px-4 hover:bg-gray-200">
              รายการอุปกรณ์
            </Link>
          </li>
          <li>
            <Link to="/reports/requests" className="block py-2 px-4 hover:bg-gray-200">
              รายการยืม
            </Link>
          </li>
          <li>
            <Link to="/support" className="block py-2 px-4 hover:bg-gray-200">
              แจ้งปัญหา
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-200">
              แดชบอร์ด
            </Link>
          </li>
          <li>
            <Link to="/settings" className="block py-2 px-4 hover:bg-gray-200">
              การตั้งค่า
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
