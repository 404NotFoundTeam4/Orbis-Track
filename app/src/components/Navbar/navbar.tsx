/**
 * Component: Navbar
 * Features:
 *  - แสดง Topbar + Sidebar
 *  - แสดงเมนูตาม Role ของผู้ใช้งาน
 *  - รองรับเมนูแบบมี Submenu (Dropdown)
 *  - แสดงข้อมูลผู้ใช้จาก localStorage / sessionStorage
 *  - รองรับ Notification และ Cart icon
 *  - จัดการ Logout และ redirect ไปหน้า Login
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */

import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Icon } from "@iconify/react";
import { useUserStore } from "../../stores/userStore";
import { UserRole, UserRoleTH } from "../../utils/RoleEnum";
import { MENU_CONFIG, filterMenuByRole } from "./MenuConfig";
import getImageUrl from "../../services/GetImage";
import { type MenuItem, Images, Icons } from "./MenuConfig";


const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const user = JSON.parse(
    localStorage.getItem("User") ||
    sessionStorage.getItem("User") ||
    "null"
  );

  const role = user?.us_role as UserRole;
  const menus = filterMenuByRole(MENU_CONFIG, role);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [active, setActive] = useState<"bell" | "cart" | null>(null);
  const [User, setUser] = useState(() => {
    const data = localStorage.getItem("User") || sessionStorage.getItem("User");
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setActiveSubMenu("");
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleSubMenuClick = (menu: string) => {
    setActiveSubMenu(menu);
  };


  const renderMenu = (menu: MenuItem) => {
    if (menu.children?.length) {
      return (
        <div key={menu.key}>
          <div
            onClick={() => {
              setOpenMenu(
                openMenu === menu.key ? null : menu.key
              )
              toggleDropdown();
              handleMenuClick(menu.key);
            }
            }
            className={`px-7.5 flex items-center w-full cursor-pointer gap-[11px]  py-[11px] text-lg  rounded-[9px] select-none transition-colors duration-200 ${isDropdownOpen
              ? "bg-[#40A9FF] text-white"
              : "hover:bg-[#F0F0F0]"
              }`}
          >
            {menu.icon && (
              <FontAwesomeIcon icon={menu.icon} />
            )}
            {menu.label}
            {menu.iconRight && (
              <FontAwesomeIcon icon={menu.iconRight} className={`mt-1 transform transition-all duration-500 ease-in-out ${isDropdownOpen ? "rotate-0" : "rotate-180"
                }`} />
            )}
          </div>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out flex flex-col  gap-1
    ${openMenu === menu.key
                ? "max-h-[500px] opacity-100 py-2.5"
                : "max-h-0 opacity-0"
              }`}
          >
            {menu.children?.map((child) => (
              <Link
                key={child.key}
                to={child.path!}
                onClick={() => handleSubMenuClick(child.label)}
                className={`px-15 rounded-[9px] py-[11px] flex items-center w-full whitespace-nowrap
        ${activeSubMenu === child.label
                    ? "bg-[#EBF3FE] text-[#40A9FF]"
                    : "hover:bg-[#F0F0F0]"
                  }`}
              >
                {child.label}
              </Link>
            ))}
          </div>

        </div>
      );
    }

    return (
      <Link
        key={menu.key}
        to={menu.path!}
        onClick={() => {
          closeDropdown();
          handleMenuClick(menu.key);
        }}
        className={`px-7.5 rounded-[9px] py-[11px] flex items-center w-full gap-2 ${activeMenu === menu.key ? "bg-[#40A9FF] text-white" : "hover:bg-[#F0F0F0]"}`}
      >
        {menu.icon && (
          <FontAwesomeIcon icon={menu.icon} />
        )}
        {menu.label}
      </Link>
    );
  };

  return (
    <div className="flex flex-col background w-full min-h-screen">
      <div className="fixed  w-full bg-[linear-gradient(to_right,#ffffff_0%,#ffffff_75%,#e7f7ff_90%,#dcf3ff_100%)] text-white px-4  h-[100px] flex justify-between items-center  top-0 left-0 z-50">
        <div className="flex gap-15 justify-center z-51">
          <div className="px-7.5">
            <img src={Images["LOGO"]} alt="" className=" w-[264px] h-[67px]" />
          </div>
          <div className="flex border gap-[15px] px-5 text-[#40A9FF] items-center rounded-[12px]">
            <img src={Images["LOGO_GIGA"]} alt="" className="w-[26px] h-[30px]" />
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
              icon={Icons["FABELL"]}
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
              icon={Icons["FASHOPPING"]}
              className={`text-[23px] ${active === "cart" ? "text-white" : "text-[#595959]"
                }`}
            />
          </button>

          <div className="flex gap-5 items-centerx border-l border-l-[#D9D9D9] ml-[21px] pl-11  pr-1 ">
            <div className="p-2.5 border border-[#40A9FF] flex gap-5 rounded-xl">
              <img
                src={getImageUrl(user.us_images)}
                alt=""
                className="w-9 h-9 rounded-full"
              />
              <div className=" text-left text-black pr-8">
                <div className="text-[16px] font-semibold">
                  {user.us_firstname}
                </div>
                <div className="text-[13px] font-normal">
                  {UserRoleTH[user.us_role as UserRole]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        <aside className="fixed  mt-[100px] w-[213px] bg-white text-black shadow-xl z-40">
          <div className="flex flex-col justify-between h-[calc(100vh-100px)] px-2 py-4 text-lg whitespace-nowrap">
            <nav className="text-left">
              {menus.map(renderMenu)}
            </nav>


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
        </aside>

        {/* Content */}
        <main className="flex-1 bg-[#FAFAFA] ml-[213px] mt-[100px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Navbar;
