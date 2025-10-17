
import { useUserStore } from "../stores/userStore";
import { useEffect } from "react";
import { useLogin } from "../hooks/useLogin.js"

export const Users = () => {
 const { reloaduser } = useLogin();
  const { user } = useUserStore();

  useEffect(() => {
      reloaduser()
  }, []);

  if (!user) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="bg-[#FAFAFA]">
      <h2>👤 ข้อมูลผู้ใช้</h2>
      <p>ชื่อผู้ใช้: {user.us_username}</p>
      <p>ชื่อ-นามสกุล: {user.us_firstname} {user.us_lastname}</p>
      <p>อีเมล: {user.us_email}</p>
      <p>แผนก: {user.us_dept_id}</p>
      <p>ตำแหน่ง: {user.us_role}</p>
    </div>
  );
};
