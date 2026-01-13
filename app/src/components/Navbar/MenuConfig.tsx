/**
 * File: MenuConfig.ts
 * Description:
 *  - กำหนดโครงสร้างเมนู Sidebar / Navbar
 *  - จัดการ Icon, Image และ Role-based Menu
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */

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
import { UserRole } from "../../utils/RoleEnum";
import Logo from "../../assets/images/navbar/Logo.png";
import LogoGiga from "../../assets/images/navbar/logo-giga.png";

/**
 * Constant: Icons
 * Description:
 *  - Map key สำหรับเรียกใช้ FontAwesome Icon
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const Icons: { [key: string]: IconDefinition } = {
  FASHOPPING: faCartShopping,
  FABELL: faBell,
};

/**
 * Constant: Images
 * Description:
 *  - เก็บ path รูปภาพที่ใช้ใน Navbar
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const Images: { [key: string]: string } = {
  LOGO: Logo,
  LOGO_GIGA: LogoGiga,
};

/**
 * Type: MenuItem
 * Description:
 *  - โครงสร้างข้อมูลเมนู
 *  - รองรับเมนูหลักและ submenu
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export type menuItem = {
  key: string;                 // key สำหรับอ้างอิงเมนู
  label: string;               // ชื่อเมนูที่แสดง
  path?: string;               // path สำหรับ routing
  icon?: IconDefinition;       // icon ด้านซ้าย
  iconRight?: IconDefinition;  // icon ด้านขวา (dropdown)
  roles: UserRole[];           // role ที่สามารถเห็นเมนู
  children?: menuItem[];       // submenu (ถ้ามี)
};

/**
 * Constant: MenuConfig
 * Description:
 *  - กำหนดเมนูทั้งหมดของระบบ
 *  - ควบคุมการแสดงผลด้วย role
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const MenuConfig: menuItem[] = [
  {
    key: "home",
    label: "หน้าแรก",
    path: "/home",
    icon: faHome,
    roles: [
      UserRole.ADMIN,
      UserRole.EMPLOYEE,
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
    roles: [UserRole.ADMIN,UserRole.HOD, UserRole.HOS],
  },
  {
    key: "management",
    label: "จัดการ",
    icon: faServer,
    iconRight: faChevronUp,
    roles: [UserRole.ADMIN,UserRole.HOD, UserRole.HOS,UserRole.STAFF],
    children: [
      {
        key: "requests",
        label: "คำร้อง",
        path: "/requests",
        roles: [UserRole.ADMIN,UserRole.STAFF],
      },
      {
        key: "users",
        label: "บัญชีผู้ใช้",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN],
      },
      {
        key: "devices_admin",
        label: "คลังอุปกรณ์",
        path: "/categories",
        roles: [UserRole.ADMIN,UserRole.STAFF],
      },
      {
        key: "chatbot",
        label: "แชทบอท",
        path: "/administrator/departments-management",
        roles: [UserRole.ADMIN,UserRole.STAFF],
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
        path: "/category",
        roles: [UserRole.ADMIN,UserRole.STAFF],
      },
    ],
  },
  {
    key: "devices",
    label: "รายการอุปกรณ์",
    path: "/devices",
    icon: faBoxArchive,
    roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.HOD, UserRole.HOS,UserRole.STAFF],
  },
  {
    key: "repair",
    label: "แจ้งซ่อม",
    path: "/repair",
    icon: faWrench,
    roles: [
      UserRole.EMPLOYEE,
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
    roles: [UserRole.ADMIN, UserRole.HOD, UserRole.HOS,UserRole.STAFF],
  },
  {
    key: "history",
    label: "ดูประวัติ",
    path: "/history",
    icon: faClockRotateLeft,
    roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.HOD, UserRole.HOS,UserRole.STAFF],
  },
  {
    key: "setting",
    label: "การตั้งค่า",
    path: "/setting",
    icon: faGear,
    roles: [UserRole.ADMIN, UserRole.HOD, UserRole.HOS, UserRole.EMPLOYEE,UserRole.STAFF,],
  },
];

/**
 * Function: filterMenuByRole
 * Description:
 *  - กรองเมนูตาม role ของผู้ใช้งาน
 *  - กรอง submenu ตาม role เช่นเดียวกัน
 *  - ใช้งานซ้ำได้ (Reusable)
 * คืนเมนูที่ผ่านการกรองแล้ว
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const filterMenuByRole = (
  menus: menuItem[],
  role: UserRole
): menuItem[] =>
  menus
    .filter((menu) => menu.roles.includes(role))
    .map((menu) => ({
      ...menu,
      children: menu.children
        ? menu.children.filter((child) => child.roles.includes(role))
        : undefined,
    }));
