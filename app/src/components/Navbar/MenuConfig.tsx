import {
  faHome,
  faServer,
  faBoxArchive,
  faWrench,
  faChartLine,
  faClockRotateLeft,
  faGear,
  faCartShopping,
  faBell,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { UserRole } from "./RoleEnum";
import Logo from "../../assets/images/navbar/Logo.png";
import LogoGiga from "../../assets/images/navbar/logo-giga.png";

export const Icons: { [key: string]: IconDefinition } = {
  FASHOPPING: faCartShopping,
  FABELL: faBell,
};

export const Images: { [key: string]: string } = {
  LOGO: Logo,
  LOGO_GIGA: LogoGiga,
};

export type MenuItem = {
  key: string;
  label: string;
  path?: string;
  icon?: IconDefinition; // icon ด้านซ้าย
  iconRight?: IconDefinition; // icon ด้านขวา
  roles: UserRole[];
  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "home",
    label: "หน้าแรก",
    path: "/home",
    icon: faHome,
    roles: [
      UserRole.ADMIN,
      UserRole.USER,
      UserRole.STAFF,
      UserRole.HOD,
      UserRole.HOS,
    ],
  },
  {
    key: "management",
    label: "จัดการคำร้อง",
    path: "/home",
    icon: faServer,
    roles: [UserRole.HOD, UserRole.HOS],
  },
  {
    key: "management",
    label: "จัดการ",
    icon: faServer,
    iconRight: faChevronUp,
    roles: [UserRole.ADMIN],
    children: [
      {
        key: "requests",
        label: "คำร้อง",
        path: "/requests",
        roles: [UserRole.ADMIN],
      },
      {
        key: "departments",
        label: "บัญชีผู้ใช้",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN],
      },
      {
        key: "categories",
        label: "คลังอุปกรณ์",
        path: "/categories",
        roles: [UserRole.ADMIN],
      },
      {
        key: "departments",
        label: "แชทบอท",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN],
      },
      {
        key: "departments",
        label: "แผนกและฝ่ายย่อย",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN],
      },
      {
        key: "departments",
        label: "หมวดหมู่อุปกรณ์",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    key: "devices",
    label: "รายการอุปกรณ์",
    path: "/devices",
    icon: faBoxArchive,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.HOD, UserRole.HOS],
  },
  {
    key: "repair",
    label: "แจ้งซ่อม",
    path: "/repair",
    icon: faWrench,
    roles: [
      UserRole.USER,
      UserRole.STAFF,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.HOS,
    ],
  },
  {
    key: "dashboard",
    label: "แดชบอร์ด",
    path: "/dashboard",
    icon: faChartLine,
    roles: [UserRole.ADMIN, UserRole.HOD, UserRole.HOS],
  },
  {
    key: "history",
    label: "ดูประวัติ",
    path: "/history",
    icon: faClockRotateLeft,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.HOD, UserRole.HOS],
  },
  {
    key: "setting",
    label: "การตั้งค่า",
    path: "/setting",
    icon: faGear,
    roles: [UserRole.ADMIN, UserRole.HOD, UserRole.HOS],
  },
];

/**
 * ฟังก์ชันกรองเมนูตาม role (Reusable)
 */
export const filterMenuByRole = (
  menus: MenuItem[],
  role: UserRole
): MenuItem[] =>
  menus
    .filter((menu) => menu.roles.includes(role))
    .map((menu) => ({
      ...menu,
      children: menu.children
        ? menu.children.filter((child) => child.roles.includes(role))
        : undefined,
    }));
