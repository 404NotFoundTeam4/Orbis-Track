import { Outlet } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import type { Role } from "../stores/userStore";
import Forbidden from "../pages/Forbidden";

interface RoleRouteProps {
    allowedRoles: Role[]; // role ที่อนุญาต
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const user = useUserStore((state) => state.user); // ดึงข้อมูล user จาก store

    // ถ้า user ยังไม่โหลด แสดง loading (หรือรอ ProtectedRoute จัดการ)
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">กำลังโหลด...</div>
            </div>
        );
    }

    // ตรวจสอบว่า user มี role ไหม หรือ role ของ user อยู่ในรายการ role ที่อนุญาตไหม
    if (!user.us_role || !allowedRoles.includes(user.us_role)) {
        return <Forbidden />;
    }

    return <Outlet />; // แสดง route ด้านใน
}