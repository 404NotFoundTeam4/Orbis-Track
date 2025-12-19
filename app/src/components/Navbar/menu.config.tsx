import {
  faHome,
  faServer,
  faBoxArchive,
  faWrench,
  faChartLine,
  faClockRotateLeft,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { UserRole } from "./role.enum";

export type MenuItem = {
  key: string;
  label: string;
  path?: string;
  icon?: any;
  roles: UserRole[];
  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "home",
    label: "หน้าแรก",
    path: "/home",
    icon: faHome,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.STAFF],
  },
  {
    key: "management",
    label: "การจัดการ",
    icon: faServer,
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
        label: "แผนกและฝ่ายย่อย",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN],
      },
      {
        key: "categories",
        label: "หมวดหมู่อุปกรณ์",
        path: "/categories",
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    key: "devices",
    label: "รายการอุปกรณ์",
    path: "/devices",
    icon: faBoxArchive,
    roles: [UserRole.ADMIN, UserRole.USER],
  },
  {
    key: "repair",
    label: "แจ้งซ่อม",
    path: "/repair",
    icon: faWrench,
    roles: [UserRole.USER, UserRole.STAFF],
  },
  {
    key: "dashboard",
    label: "แดชบอร์ด",
    path: "/dashboard",
    icon: faChartLine,
    roles: [UserRole.ADMIN],
  },
  {
    key: "history",
    label: "ดูประวัติ",
    path: "/history",
    icon: faClockRotateLeft,
    roles: [UserRole.ADMIN, UserRole.USER],
  },
  {
    key: "setting",
    label: "การตั้งค่า",
    path: "/setting",
    icon: faGear,
    roles: [UserRole.ADMIN],
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
        ? menu.children.filter((child) =>
            child.roles.includes(role)
          )
        : undefined,
    }));
