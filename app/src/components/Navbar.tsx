import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/css/icon.css";
import "../styles/css/Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBell,faChevronUp, faCartShopping, faCircleUser, faServer, faBoxArchive, faBoxesStacked, faWrench, faChartLine, faClockRotateLeft, faGear } from '@fortawesome/free-solid-svg-icons';
import logo from "../assets/images/logoblue.png";
import CircleDropdown from "./CircleDropdown";
export const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [lang] = useState("EN");
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex background ">
      {/* Navbar */}
      <div className="w-full bg-[#343434] text-white px-4 py-2 h-[65px] flex justify-between items-center fixed top-0 left-0 z-50">
        <div className="flex ">
          <img src={logo} alt="" className="w-7 h-7 rounded-lg mr-3" />
          <span className="font-bold text-lg">Orbis Track</span>
        </div>

        <div className="flex items-center gap-[23px]">
          <div className="w-[40px] h-[40px] bg-white flex justify-center items-center rounded-full">

          </div>
          <div className="w-[40px] h-[40px] bg-white flex justify-center items-center rounded-full">
            <FontAwesomeIcon icon={faCartShopping} className="text-[22px] text-[#005BAC]" />
          </div>
          <div className="w-[40px] h-[40px] bg-white flex justify-center items-center rounded-full mr-1">
            <FontAwesomeIcon icon={faBell} className="text-[22px] text-[#FFC107]" />
          </div>
          <div className="flex gap-1 items-center">
            <FontAwesomeIcon icon={faCircleUser} className="text-[40px]" />
            <div className=" text-left ">
              <div className="text-sm">นายอภิทัชชา</div>
              <div className="text-[11px] text-white/70">(ตำแหน่ง พนักงานทั่วไป)</div>
            </div>
          </div>
          <CircleDropdown
            value={lang}
            items={[
              { label: "TH - ไทย", value: "TH" },
              { label: "EN - English", value: "EN" },
            
            ]}
          />
        </div>
      </div>
      {/* Sidebar */}
      <div className="w-[207px] bg-white text-black p-2 shadow-xl fixed left-0 top-[65px]  h-[calc(100%-65px)] z-40">
        <ul className="px-4 text-left space-y-6">
          <li className="">
            <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
              <FontAwesomeIcon icon={faHome} className="" />
              <Link to="/home" className="block py-2  "> หน้าหลัก </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center w-full cursor-pointer menu-item gap-2 " onClick={toggleDropdown}>
              <FontAwesomeIcon icon={faServer} className="" />
              <span>การจัดการ</span>
              <FontAwesomeIcon icon={faChevronUp} className={`ml-1 mt-1 transform transition-transform duration-300  rotate-180 ${isDropdownOpen ? "rotate-360" : ""}`} />
             
            </div>
            <ul className={`pl-4 overflow-hidden dropdown-menu ${isDropdownOpen ? "open" : ""}`}>
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

          <li>
            <div className="flex items-center w-full cursor-pointer menu-item gap-2 ">
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
    </div>
  );
}

export default Navbar;
