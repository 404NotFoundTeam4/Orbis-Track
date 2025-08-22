import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/css/icon.css"
function Navbar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
<>
      
    <div className="w-full bg-gray-800 text-white px-4 py-2 h-0.65 flex justify-between items-center fixed top-0 left-0 ">
     </div>
     <div className="w-64 bg-gray-800 text-white p-4 fixed  left-0 h-full">
      <h2 className="text-xl font-bold text-left">Sidebar</h2>
      <ul className="text-left">
        <li className=" flex  items-center">
          <span className="fa7-solid--home"></span>
          <Link to="/home" className="block py-2 px-4 hover:bg-gray-700">
            หน้าหลัก
          </Link>
        </li>
        <li>
          <div
            className="flex items-center justify-between py-2 px-4 cursor-pointer hover:bg-gray-700" onClick={toggleDropdown}>
            <span>การจัดการ</span>
            <span className={`transform transition-all ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          {isDropdownOpen && (
            <ul className="pl-4">
              <li>
                <Link to="/manage/equipment" className="block py-2 px-4 hover:bg-gray-700">
                  คลังอุปกรณ์
                </Link>
              </li>
              <li>
                <Link to="/users" className="block py-2 px-4 hover:bg-gray-700">
                  บัญชีผู้ใช้
                </Link>
              </li>
              <li>
                <Link to="/manage/chatbot" className="block py-2 px-4 hover:bg-gray-700">
                  แชทบอท
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link to="/reports/equipment" className="block py-2 px-4 hover:bg-gray-700">
            รายการอุปกรณ์
          </Link>
        </li>
        <li>
          <Link to="/reports/requests" className="block py-2 px-4 hover:bg-gray-700">
            รายการยืม
          </Link>
        </li>
        <li>
          <Link to="/support" className="block py-2 px-4 hover:bg-gray-700">
            แจ้งปัญหา
          </Link>
        </li>
        <li>
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700">
            แดชบอร์ด
          </Link>
        </li>
        <li>
          <Link to="/settings" className="block py-2 px-4 hover:bg-gray-700">
            การตั้งค่า
          </Link>
        </li>
      </ul>
    </div>
    </>
  );
}

export default Navbar;
