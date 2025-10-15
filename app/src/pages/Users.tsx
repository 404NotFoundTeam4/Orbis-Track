import { useLocation } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useEffect, useState } from "react";
import { user_data } from "../service/auth.service";

export const Users = () => {
  const location = useLocation();
  const storeUser = useUserStore((s) => s.user);
  const [user, setUser] = useState(location.state?.user || storeUser);

  useEffect(() => {
    // ถ้าไม่มี user ให้ลองโหลดจาก localStorage ด้วย token
    // if (!user) {
    //   const token = localStorage.getItem("token");
    //   if (token) {
    //     user_data(token).then((res) => setUser(res));
    //   }
    // }
  }, [user]);

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
