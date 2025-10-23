import { useState } from "react";
import UserModal from "../components/UserModal";

export const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const mockUser = {
    us_id: 5,
    us_emp_code: "EMP005",
    us_firstname: "พัชรี",
    us_lastname: "จิตรมงคล",
    us_username: "patcharee",
    us_email: "patcharee@example.com",
    us_phone: "0912223333",
    us_images: "https://i.pravatar.cc/150?img=5",
    us_role: "HR",
    us_dept_id: 105,
    us_sec_id: 205,
    us_is_active: true,
    created_at: "2025-10-23",
    us_dept_name: "ฝ่ายทรัพยากรบุคคล",
    us_sec_name: "ฝึกอบรมและพัฒนา",
  };
  
  return (
    <div className="p-10">
      <button
        onClick={() => {
          setSelectedUser(mockUser);
          setShowModal(true);
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full"
      >
        แก้ไขผู้ใช้
      </button>

      {showModal && (
        <UserModal
          typeform="edit"
          keyvalue="all"
          user={mockUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
