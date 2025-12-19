import { Outlet } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import type { Role } from "../stores/userStore";

interface RoleRouteProps {
    allowedRoles: Role[]; // role ที่อนุญาต
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const user = useUserStore((state) => state.user); // ดึงข้อมูล user จาก store

    if (!user) {
        return null;
    }

    // ตรวจสอบว่า user มี role ไหม หรือ role ของ user อยู่ในรายการ role ที่อนุญาตไหม
    if (!user.us_role || !allowedRoles.includes(user.us_role)) {
        return (
            <div className="fixed inset-0 pl-[213px] pt-[110px] bg-[#FAFAFA]">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col gap-[5px] text-center">
                        <h1 className="text-[18px] font-semibold text-gray-700">
                            ขออภัย
                        </h1>
                        <p className="text-gray-500 text-[16px]">
                            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return <Outlet />; // แสดง route ด้านใน
}