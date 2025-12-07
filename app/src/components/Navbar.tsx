import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/css/icon.css";
import "../styles/css/Navbar.css";
import { Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Icon } from "@iconify/react";
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
import Logo from "../assets/images/navbar/Logo.png";
import LogoGiag from "../assets/images/navbar/logo giga.png";
import getImageUrl from "../services/GetImage";

export const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [active, setActive] = useState<"bell" | "cart" | null>(null);
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const dataUser =
    localStorage.getItem("User") || sessionStorage.getItem("User");
  const User = dataUser ? JSON.parse(dataUser) : null;

  const closeDropdown = () => setDropdownOpen(false);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="flex flex-col background w-full min-h-screen ">
      {/* Navbar */}
      <div className="fixed  w-full bg-[linear-gradient(to_right,#ffffff_0%,#ffffff_75%,#e7f7ff_90%,#dcf3ff_100%)] text-white px-4  h-[110px] flex justify-between items-center  top-0 left-0 z-50">
        <div className="flex gap-15 justify-center z-51">
          <div className="px-7.5">
            <img src={Logo} alt="" className=" w-[264px] h-[67px]" />
          </div>
          <div className="flex border gap-[15px] px-5 text-[#40A9FF] items-center rounded-[12px]">
            <img src={LogoGiag} alt="" className="w-[26px] h-[30px]" />
            <span>คุยกับ GiGa</span>
          </div>
        </div>

        <div className="flex items-center  h-full">
          <button
            type="button"
            onClick={() => setActive(active === "bell" ? null : "bell")}
            className={`h-full px-6.5 ${
              active === "bell" ? "bg-[#40A9FF]" : "hover:bg-[#F0F0F0]"
            } flex justify-center items-center relative`}
          >
            {active !== "bell" && (
              <div className="w-2 h-2 bg-[#FF4D4F] rounded-full border-white border absolute -mt-2 ml-3"></div>
            )}
            <FontAwesomeIcon
              icon={faBell}
              className={`text-[23px] ${
                active === "bell" ? "text-white" : "text-[#595959]"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActive(active === "cart" ? null : "cart")}
            className={`h-full px-6.5 ${
              active === "cart" ? "bg-[#40A9FF]" : "hover:bg-[#F0F0F0]"
            } flex justify-center items-center relative`}
          >
            {active !== "cart" && (
              <div className="w-2 h-2 bg-[#FF4D4F] rounded-full border-white border absolute -mt-4 ml-5"></div>
            )}
            <FontAwesomeIcon
              icon={faCartShopping}
              className={`text-[23px] ${
                active === "cart" ? "text-white" : "text-[#595959]"
              }`}
            />
          </button>

          <div className="flex gap-2.5 items-centerx border-l border-l-[#D9D9D9] py-2.5 pl-7.5 pr-1 ">
            <img
              src={getImageUrl(User.us_images)}
              alt=""
              className="w-9 h-9 rounded-full"
            />
            <div className=" text-left text-black pr-8">
              <div className="text-[16px] font-semibold">
                {User.us_firstname}
              </div>
              <div className="text-[13px] font-normal">{User.us_role}</div>
            </div>
            <Icon
              icon="weui:arrow-outlined"
              width="38"
              height="38"
              className="text-black rotate-90 "
            />
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="flex  ">
        <div className="fixed  mt-[110px] w-[213px] bg-white text-black shadow-xl z-40">
          <div className="flex flex-col justify-between h-[calc(100vh-110px)] px-2 py-4 text-lg whitespace-nowrap">
            <div className="text-left">
              <Link
                to="/home"
                onClick={closeDropdown}
                className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px] py-[11px] flex items-center w-full gap-2 "
              >
                <FontAwesomeIcon icon={faHome} />
                <span>หน้าแรก</span>
              </Link>

              <li>
                <div
                  onClick={toggleDropdown}
                  className={`px-7.5 flex items-center w-full cursor-pointer gap-2  py-[11px] text-lg  rounded-[9px] select-none transition-colors duration-200 ${
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
                  className={`overflow-hidden transition-all duration-800 ease-in-out flex flex-col gap-1 ${
                    isDropdownOpen
                      ? "max-h-[500px] opacity-100 "
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <Link
                    to="/requests"
                    className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] h-[50px] flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                  >
                    <Link
                      to="/users"
                      className="mt-1 px-15 hover:bg-[#F0F0F0] rounded-[9px]  py-[11px]  flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                    >
                      คำร้อง
                    </Link>

                    <Link
                      to="/users"
                      className=" px-15 hover:bg-[#F0F0F0] rounded-[9px]  py-[11px]  flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                    >
                      คลังอุปกรณ์
                    </Link>

                    <Link
                      to="/users"
                      className=" px-15 hover:bg-[#F0F0F0] rounded-[9px] py-[11px]  flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                    >
                      บัญชีผู้ใช้
                    </Link>

                    <Link
                      to="/users"
                      className=" px-15 hover:bg-[#F0F0F0] rounded-[9px]  py-[11px]  flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                    >
                      แชทบอท
                    </Link>

                    <Link
                      to="/administrator/departments-management"
                      className=" px-15 hover:bg-[#F0F0F0] rounded-[9px]  py-[11px]  flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                    >
                      แผนกและฝ่ายย่อย
                    </Link>

                    <Link
                      to="/users"
                      className=" px-15 hover:bg-[#F0F0F0] rounded-[9px]  py-[11px]  flex items-center w-full whitespace-nowrap focus:bg-[#EBF3FE] focus:text-[#40A9FF]"
                    >
                      หมวดหมู่อุปกรณ์
                    </Link>
                  </Link>
                </ul>

                <Link
                  to="/users"
                  onClick={closeDropdown}
                  className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px]  py-[11px]  flex items-center w-full gap-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faBoxArchive} />
                  <span>รายการอุปกรณ์</span>
                </Link>

                <Link
                  to="/users"
                  onClick={closeDropdown}
                  className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px]  py-[11px]  flex items-center w-full gap-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faWrench} />
                  <span>แจ้งซ่อม</span>
                </Link>

                <Link
                  to="/users"
                  onClick={closeDropdown}
                  className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px]  py-[11px]  flex items-center w-full gap-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faChartLine} flip="horizontal" />
                  <span>แดชบอร์ด</span>
                </Link>

                <Link
                  to="/users"
                  onClick={closeDropdown}
                  className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px]  py-[11px]  flex items-center w-full gap-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                  <span>ดูประวัติ</span>
                </Link>

                <Link
                  to="/users"
                  onClick={closeDropdown}
                  className="px-7.5 hover:bg-[#F0F0F0] focus:bg-[#40A9FF] focus:text-white rounded-[9px]  py-[11px]  flex items-center w-full gap-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faGear} />
                  <span>การตั้งค่า</span>
                </Link>
              </li>
            </div>
            <div className="text-left">
              <button
                onClick={handleLogout}
                className="px-7.5  py-[11px]  flex  items-center gap-3   hover:text-black hover:bg-[#F7F7F7] rounded-md  w-full"
              >
                <Icon icon="ic:outline-logout" width="24" height="24" />
                <span className="">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-[#FAFAFA] pl-[213px] pt-[110px]">
          <div className=" w-full min-h-[calc(100vh-150px)]  ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navbar;
