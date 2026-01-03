import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserData } from "../services/AccountService.js";
import { socketService } from "../services/SocketService.js";

export type Role =
  | "ADMIN"
  | "HOD"
  | "HOS"
  | "TECHNICAL"
  | "STAFF"
  | "EMPLOYEE"

interface User {
  us_id?: number;
  us_emp_code?: string;
  us_username?: string;
  us_firstname?: string;
  us_lastname?: string;
  us_phone?: string;
  us_role?: Role;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      /**
       * Function: fetchUserFromServer
       * Features:
       *  - โหลดข้อมูลผู้ใช้จาก backend โดยใช้ token
       *
       * Author: Panyapon Phollert (Ton) 66160086
       */
      fetchUserFromServer: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const users = await UserData(token);
        set({ user: users });
      },
      /**
       * Function: logout
       * Features:
       *  - ลบ token และข้อมูลผู้ใช้ทั้งหมด
       *  - ออกจาก localStorage และ Zustand
       *
       * Author: Panyapon Phollert (Ton) 66160086
       */
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberUser");
        sessionStorage.removeItem("token");
        socketService.disconnect()
        set({ user: null });
      },
    }),

    {
      name: "user-storage", //
    },
  ),
);
