import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { Logout } from "../services/AccountService.js";
import { GetValidToken } from "../services/Remember.js";

/**
 * Hook: useLogout
 * Features:
 *   - ฟังก์ชั่น HandleLogout สำหรับออกจากระบบอย่างสมบูรณ์
 *   - เรียก API logout เพื่อ blacklist token ที่ฝั่ง server
 *   - เคลียร์ token และ user data จากทุก storage (localStorage, sessionStorage)
 *   - เคลียร์ user จาก Zustand store
 *   - Disconnect WebSocket
 *   - Redirect ไปหน้า login
 *
 * Author: Pakkapon Chomchoe (Tonnam) 66160080
 */
export const useLogout = () => {
    const logout = useUserStore((s) => s.logout);
    const navigate = useNavigate();

    /**
     * Function: HandleLogout
     * Features:
     *   - ทำการ logout อย่างสมบูรณ์ทั้ง frontend และ backend
     *   - แม้ว่า API call จะ fail ก็ยังเคลียร์ข้อมูล local ทิ้งเพื่อความปลอดภัย
     */
    const HandleLogout = async () => {
        try {
            // ดึง token ก่อน clear
            const token = GetValidToken();

            // เรียก API logout เพื่อ blacklist token ที่ฝั่ง server (ถ้ามี token)
            if (token) {
                try {
                    await Logout(token);
                } catch (error) {
                    // ถ้า API error ก็ไม่ต้อง throw ให้ user เห็น
                    // ยังคงต้อง clear local data ต่อไป
                    console.error("Logout API error:", error);
                }
            }
        } finally {
            // เคลียร์ข้อมูลทั้งหมดไม่ว่า API จะสำเร็จหรือไม่
            // รวมถึง: token, user, rememberUser, และ disconnect socket
            logout();

            // Redirect ไปหน้า login
            navigate("/login", { replace: true });
        }
    };

    return { HandleLogout };
};
