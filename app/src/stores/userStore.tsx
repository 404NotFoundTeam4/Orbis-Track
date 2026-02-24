import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserData } from "../services/AccountService.js";
import { socketService } from "../services/SocketService.js";

export type Role = "ADMIN" | "HOD" | "HOS" | "TECHNICAL" | "STAFF" | "EMPLOYEE";

interface User {
  us_id?: number;
  us_emp_code?: string;
  us_username?: string;
  us_firstname?: string;
  us_lastname?: string;
  us_phone?: string;
  us_role?: string;
  us_images?: string | null;
}

interface UserStore {
  user: User | null;
  isLoggedIn: boolean;

  setUser: (user: User) => void;
  fetchUserFromServer: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      setUser: (user) =>
        set({
          user,
          isLoggedIn: true,
        }),

      /**
       * โหลดข้อมูลผู้ใช้จาก backend โดยใช้ token
       */
      fetchUserFromServer: async () => {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        try {
          const user = await UserData(token);
          set({
            user,
            isLoggedIn: true,
          });
        } catch (error) {
          console.error("fetchUserFromServer error:", error);
          set({ user: null, isLoggedIn: false });
        }
      },

      /**
       * ใช้เช็คสิทธิ์ตาม role (Reusable)
       */
      hasRole: (roles: string[]) => {
        const userRole = get().user?.us_role;
        if (!userRole) return false;
        return roles.includes(userRole);
      },

      /**
       * logout - เคลียร์ข้อมูลการ login ทั้งหมด
       * Note: การเรียก API logout ต้องทำก่อนเรียก function นี้
       */
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberUser");
        localStorage.removeItem("User"); // เพิ่ม: ลบ User ด้วย
        sessionStorage.removeItem("token");
        socketService.disconnect();
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: "User",
    },
  ),
);
