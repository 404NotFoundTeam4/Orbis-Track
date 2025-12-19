import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserStore } from "../../stores/userStore";
import { UserRole, UserRoleTH } from "./role.enum";
import { MENU_CONFIG, filterMenuByRole } from "./menu.config";
import type { MenuItem } from "./menu.config";


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

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderMenu = (menu: MenuItem) => {
    if (menu.children?.length) {
      return (
        <div key={menu.key}>
          <div
            onClick={() =>
              setOpenMenu(
                openMenu === menu.key ? null : menu.key
              )
            }
            className="px-6 py-3 cursor-pointer hover:bg-[#F0F0F0] flex gap-2"
          >
            {menu.icon && (
              <FontAwesomeIcon icon={menu.icon} />
            )}
            {menu.label}
          </div>

          {openMenu === menu.key && (
            <div className="ml-6">
              {menu.children.map((child) => (
                <Link
                  key={child.key}
                  to={child.path!}
                  className="block px-6 py-2 hover:bg-[#EBF3FE]"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={menu.key}
        to={menu.path!}
        className="px-6 py-3 hover:bg-[#F0F0F0] flex gap-2"
      >
        {menu.icon && (
          <FontAwesomeIcon icon={menu.icon} />
        )}
        {menu.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="font-bold">
            {user?.us_firstname}
          </div>
          <div className="text-sm text-gray-500">
            {UserRoleTH[role]}
          </div>
        </div>

        <nav className="flex flex-col">
          {menus.map(renderMenu)}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 p-2 bg-red-500 text-white rounded"
        >
          ออกจากระบบ
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-[#FAFAFA]">
        <Outlet />
      </main>
    </div>
  );
};

export default Navbar;
