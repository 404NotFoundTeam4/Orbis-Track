import { Link, useNavigate } from "react-router-dom";
import { useState ,useEffect} from "react";
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
import { UserRole, UserRoleTH } from "../utils/role.enum"
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
  const [User, setUser] = useState(() => {
  const data =
    localStorage.getItem("User") || sessionStorage.getItem("User");
  return data ? JSON.parse(data) : null;
});

useEffect(() => {
  let reloadTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleStorageChange = () => {
    const data =
      localStorage.getItem("User") || sessionStorage.getItem("User");

    const parsed = data ? JSON.parse(data) : null;

   
    if (JSON.stringify(parsed) !== JSON.stringify(User)) {
      reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 2000); 
    }

    setUser(parsed);
  };

  window.addEventListener("user-updated", handleStorageChange);

  return () => {
    window.removeEventListener("user-updated", handleStorageChange);
    if (reloadTimeout) clearTimeout(reloadTimeout);
  };
}, [User]);


  const closeDropdown = () => {
    setDropdownOpen(false);
    setActiveSubMenu("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const handleSubMenuClick = (menu: string) => {
    setActiveSubMenu(menu);
  };

  return (
    <div className="flex flex-col background w-full min-h-screen ">
      {/* Navbar */}
      <div className="fixed  w-full bg-[linear-gradient(to_right,#ffffff_0%,#ffffff_75%,#e7f7ff_90%,#dcf3ff_100%)] text-white px-4  h-[100px] flex justify-between items-center  top-0 left-0 z-50">
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
            className={`h-full px-6.5 ${active === "bell" ? "bg-[#40A9FF]" : "hover:bg-[#F0F0F0]"
              } flex justify-center items-center relative`}
          >
            {active !== "bell" && (
              <div className="w-2 h-2 bg-[#FF4D4F] rounded-full border-white border absolute -mt-2 ml-3"></div>
            )}
            <FontAwesomeIcon
              icon={faBell}
              className={`text-[23px] ${active === "bell" ? "text-white" : "text-[#595959]"
                }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setActive(active === "cart" ? null : "cart")}
            className={`h-full px-6.5 ${active === "cart" ? "bg-[#40A9FF]" : "hover:bg-[#F0F0F0]"
              } flex justify-center items-center relative`}
          >
            {active !== "cart" && (
              <div className="w-2 h-2 bg-[#FF4D4F] rounded-full border-white border absolute -mt-4 ml-5"></div>
            )}
            <FontAwesomeIcon
              icon={faCartShopping}
              className={`text-[23px] ${active === "cart" ? "text-white" : "text-[#595959]"
                }`}
            />
          </button>

          <div className="flex gap-5 items-centerx border-l border-l-[#D9D9D9] ml-[21px] pl-11  pr-1 ">
            <div className="p-2.5 border border-[#40A9FF] flex gap-5 rounded-xl">
              <img
                src={getImageUrl(User.us_images)}
                alt=""
                className="w-9 h-9 rounded-full"
              />
              <div className=" text-left text-black pr-8">
                <div className="text-[16px] font-semibold">
                  {User.us_firstname}
                </div>
                <div className="text-[13px] font-normal">{UserRoleTH[User.us_role as UserRole]}</div>
              </div>
            </div>


          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="flex  ">
        <div className="fixed  mt-[100px] w-[213px] bg-white text-black shadow-xl z-40">
          <div className="flex flex-col justify-between h-[calc(100vh-100px)] px-2 py-4 text-lg whitespace-nowrap">
            <div className="text-left">
              <Link
                to="/home"
                onClick={() => {
                  closeDropdown();
                  handleMenuClick("home");
                }}
                className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === "home" ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
              >
                <FontAwesomeIcon icon={faHome} />
                <span>หน้าแรก</span>
              </Link>

              <li>
                <div
                  onClick={() => {
                    toggleDropdown();
                    handleMenuClick("managements");
                  }}
                  className={`px-7.5 flex items-center w-full cursor-pointer gap-2  py-[11px] text-lg  rounded-[9px] select-none transition-colors duration-200 ${isDropdownOpen
                      ? "bg-[#40A9FF] text-white"
                      : "hover:bg-[#F0F0F0]"
                    }`}
                >
                  <FontAwesomeIcon icon={faServer} />
                  <span>การจัดการ</span>
                  <FontAwesomeIcon
                    icon={faChevronUp}
                    className={`mt-1 ml-auto transform transition-all duration-800 ease-in-out ${isDropdownOpen ? "rotate-0" : "rotate-180"
                      }`}
                  />
                </div>

                <ul
                  className={`overflow-hidden transition-all duration-800 ease-in-out flex flex-col gap-1 ${isDropdownOpen
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                    }`}
                >
                  <li>
                    <Link
                      to="/requests"
                      onClick={() => handleSubMenuClick("requests")}
                      className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap ${activeSubMenu === "requests" ? "bg-[#EBF3FE] text-[#40A9FF]" : "hover:bg-[#F0F0F0]"}`}
                    >
                      คำร้อง
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/users"
                      onClick={() => handleSubMenuClick("storages")}
                      className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap ${activeSubMenu === "storages" ? "bg-[#EBF3FE] text-[#40A9FF]" : "hover:bg-[#F0F0F0]"}`}
                    >
                      คลังอุปกรณ์
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/users"
                      onClick={() => handleSubMenuClick("users")}
                      className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap ${activeSubMenu === "users" ? "bg-[#EBF3FE] text-[#40A9FF]" : "hover:bg-[#F0F0F0]"}`}
                    >
                      บัญชีผู้ใช้
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/users"
                      onClick={() => handleSubMenuClick("chatbots")}
                      className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap ${activeSubMenu === "chatbots" ? "bg-[#EBF3FE] text-[#40A9FF]" : "hover:bg-[#F0F0F0]"}`}
                    >
                      แชทบอท
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/administrator/departments-management"
                      onClick={() => handleSubMenuClick("departments")}
                      className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap ${activeSubMenu === "departments" ? "bg-[#EBF3FE] text-[#40A9FF]" : "hover:bg-[#F0F0F0]"}`}
                    >
                      แผนกและฝ่ายย่อย
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/users"
                      onClick={() => handleSubMenuClick("categories")}
                      className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap ${activeSubMenu === "categories" ? "bg-[#EBF3FE] text-[#40A9FF]" : "hover:bg-[#F0F0F0]"}`}
                    >
                      หมวดหมู่อุปกรณ์
                    </Link>
                  </li>
                </ul>

                <Link
                  to="/users"
                  onClick={() => {
                    closeDropdown();
                    handleMenuClick("device-lists");
                  }}
                  className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === "device-lists" ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
                >
                  <FontAwesomeIcon icon={faBoxArchive} />
                  <span>รายการอุปกรณ์</span>
                </Link>

                <Link
                  to="/users"
                  onClick={() => {
                    closeDropdown();
                    handleMenuClick("reports");
                  }}
                  className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === "reports" ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
                >
                  <FontAwesomeIcon icon={faWrench} />
                  <span>แจ้งซ่อม</span>
                </Link>

                <Link
                  to="/users"
                  onClick={() => {
                    closeDropdown();
                    handleMenuClick("dashboards");
                  }}
                  className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === "dashboards" ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
                >
                  <FontAwesomeIcon icon={faChartLine} flip="horizontal" />
                  <span>แดชบอร์ด</span>
                </Link>

                <Link
                  to="/users"
                  onClick={() => {
                    closeDropdown();
                    handleMenuClick("histories");
                  }}
                  className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === "histories" ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
                >
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                  <span>ดูประวัติ</span>
                </Link>

                <Link
                  to="/users"
                  onClick={() => {
                    closeDropdown();
                    handleMenuClick("setting");
                  }}
                  className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === "setting" ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
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

        <main className="flex-1 bg-[#FAFAFA] pl-[213px] pt-[100px]">
          <div className=" w-full min-h-[calc(100vh-150px)]  ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navbar;