import { useState, useEffect } from "react";
import { useUserStore } from "../stores/userStore";

import UserModal from "../components/UserModal.js";

export const Users = () => {
    const [users, setUsers] = useState([
    {
      us_id: 1,
      us_emp_code: "EMP001",
      us_firstname: "ทศพล",
      us_lastname: "อนุชัย",
      us_username: "tosapon",
      us_email: "tosapon@example.com",
      us_phone: "0812345678",
      us_images: null,
      us_role: "Admin",
      us_dept_name: "ฝ่ายไอที",
      us_sec_name: "Support",
    }
  ]);
  
  const { user } = useUserStore();

  // ✅ state สำหรับเปิด-ปิด Modal
  const [showModal, setShowModal] = useState(false);

  // ✅ โหลดข้อมูลผู้ใช้


  // ✅ ฟังก์ชันตอนกด “บันทึก” ใน Modal
  const handleUserSubmit = (data) => {
    console.log("ข้อมูลที่ return ออกมาจาก UserModal:", data);

    // ตัวอย่าง: จะส่งไป backend ก็ทำได้ เช่น
    // await axios.post("/api/users", data);

    // ปิด Modal
    setShowModal(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">จัดการบัญชีผู้ใช้</h1>

      {/* ปุ่มเปิด Modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full"
      >
        + เพิ่มผู้ใช้ใหม่
      </button>

      {/* ✅ Modal */}
      {showModal && (
        <UserModal
        typeform="edit"
         users={users}
          onClose={() => setShowModal(false)}
          onSubmit={handleUserSubmit}
        />
      )}
    </div>
  );
};
