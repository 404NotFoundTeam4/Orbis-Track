import { useState } from "react";
import DeleteUser from "../components/DeleteUser.js";

export const Home = () => {
  // ✅ ตัวอย่างข้อมูลจำลองของผู้ใช้
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
    },
    {
      us_id: 2,
      us_emp_code: "EMP002",
      us_firstname: "สุภาวดี",
      us_lastname: "เพชรรัตน์",
      us_username: "supawadee",
      us_email: "supawadee@example.com",
      us_phone: "0899999999",
      us_images: null,
      us_role: "User",
      us_dept_name: "ฝ่ายบัญชี",
      us_sec_name: "Finance",
    },
  ]);

  // ✅ state สำหรับ modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // ✅ ฟังก์ชันเปิด modal
  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  // ✅ ฟังก์ชันหลังลบผู้ใช้สำเร็จ
  const handleDeleted = (id) => {
    console.log("ผู้ใช้ที่ถูกลบ:", id);
    setUsers((prev) => prev.filter((u) => u.us_id !== id));
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">รายชื่อผู้ใช้</h1>

      {/* ตารางแสดงผู้ใช้ */}
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">ชื่อ</th>
            <th className="p-3 border">อีเมล</th>
            <th className="p-3 border">ตำแหน่ง</th>
            <th className="p-3 border">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.us_id}>
              <td className="p-3 border">{u.us_firstname} {u.us_lastname}</td>
              <td className="p-3 border">{u.us_email}</td>
              <td className="p-3 border">{u.us_role}</td>
              <td className="p-3 border text-center">
                <button
                  onClick={() => handleOpenModal(u)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ เรียกใช้ DeleteUser modal */}
      {openModal && (
        <DeleteUser
          open={openModal}
          user={selectedUser}
          onClose={() => setOpenModal(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};
export default Home