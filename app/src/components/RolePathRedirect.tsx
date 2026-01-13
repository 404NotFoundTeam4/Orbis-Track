import { Navigate, useLocation } from "react-router-dom";
import { getBasePath } from "../constants/rolePath";
import { useUserStore } from "../stores/userStore";

// ใช้สำหรับ gateway route
export default function RolePathRedirect() {
    const role = useUserStore((state) => state.user?.us_role); // ดึง role ของ user
    const location = useLocation(); // ดึง path ปัจจบุัน

    const roleBase = getBasePath(role); // แปลง role เป็น path นำหน้า (prefix)

    if (!roleBase) {
        return <Navigate to="/login" replace />
    }

    // ป้องกันการ redirect ซ้ำ เมื่อ path ปัจจุบันมี prefix อยู่แล้ว
    if (location.pathname.startsWith(roleBase)) {
        return null;
    }

    // สร้าง path ใหม่จาก role base และ path ปัจจุบัน
    const target = `${roleBase}${location.pathname}${location.search}${location.hash}`;

    // redirect ไปยัง path ใหม่
    return <Navigate to={target} replace />
}