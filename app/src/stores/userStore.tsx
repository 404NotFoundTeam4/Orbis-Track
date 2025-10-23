import { create } from "zustand";
import { persist } from "zustand/middleware";
import {  user_data } from "../service/auth.service";
interface User {
  us_id?: number;
  us_emp_code?: string;
  us_username?: string;
  us_firstname?: string;
  us_lastname?: string;
  us_role?: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

// ✅ ใช้ persist เพื่อให้ Zustand เก็บข้อมูลใน localStorage
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      fetchUserFromServer: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
         const users = await user_data(token);
            set({ user: users });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberUser");
        set({ user: null });
      },
    }),
    
    {
      name: "user-storage", // 🔑 key ที่จะใช้ใน localStorage
    }
  )
);
