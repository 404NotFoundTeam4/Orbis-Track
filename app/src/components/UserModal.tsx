import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

type UserData = {
  id: string;
  firstname: string;
  lastname: string;
  empCode: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  section: string;
  username: string;
  avatar: string | null;
};

type UserModalProps = {
  onClose?: () => void;
  onSubmit?: (data: UserData) => void;
  typeform?: string;
  users?: UserData | null; // ✅ ต้องเป็น user เดียวหรือ null
};

export default function UserModal({ typeform = "create", users, onClose, onSubmit }: UserModalProps) {
  const [formData, setFormData] = useState<UserData>({
    id: "",
    firstname: "",
    lastname: "",
    empCode: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    section: "",
    username: "",
    avatar: null,
  });

  // ✅ เมื่อ users ถูกส่งเข้ามา (โหมด edit/delete) ให้เติมค่าลงใน form
  useEffect(() => {
    if (users && (typeform === "edit" || typeform === "delete")) {
      setFormData({ ...users });
    }
  }, [users, typeform]);
    console.log(users)
  // ✅ handle เปลี่ยน input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ handle อัปโหลด avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
    }
  };

  // ✅ handle submit
  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="relative bg-white rounded-[24px] p-8 w-[804px] max-w-[95%] shadow-2xl border flex flex-col">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl w-8 h-8 rounded-full flex items-center justify-center border"
        >
          ×
        </button>

        {/* หัวข้อเปลี่ยนตามโหมด */}
        <h2 className="text-center mb-6 text-[32px] font-bold font-roboto">
          {typeform === "edit" ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้"}
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border flex items-center justify-center overflow-hidden bg-gray-50">
            {formData.avatar ? (
              <img src={formData.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Icon icon="ion:image-outline" width="37.19" height="20" className="text-gray-300" />
            )}
          </div>
          <label className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm text-gray-600 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <span className="text-base">+ เพิ่มรูปภาพ</span>
          </label>
        </div>

        {/* ฟอร์ม */}
        <form className="space-y-8 text-sm" onSubmit={(e) => e.preventDefault()}>
          {/* โปรไฟล์ */}
          <div>
            <h3 className="text-gray-700 font-medium">โปรไฟล์</h3>
            <div className="text-sm text-gray-400 mb-3">รายละเอียดโปรไฟล์ผู้ใช้</div>
            <div className="grid grid-cols-3 gap-y-4">
              <input
                name="firstname"
                placeholder="ชื่อจริง"
                value={formData.firstname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="lastname"
                placeholder="นามสกุล"
                value={formData.lastname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="empCode"
                placeholder="รหัสพนักงาน"
                value={formData.empCode}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="email"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="phone"
                placeholder="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
            </div>
          </div>

          {/* ตำแหน่งงาน */}
          <div>
            <h3 className="text-gray-700 font-medium">ตำแหน่งงาน</h3>
            <div className="text-sm text-gray-400 mb-3">รายละเอียดตำแหน่งงานของผู้ใช้</div>
            <div className="grid grid-cols-3 gap-y-4">
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              >
                <option value="">เลือกตำแหน่ง</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              >
                <option value="">เลือกแผนก</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
              </select>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              >
                <option value="">เลือกฝ่ายย่อย</option>
                <option value="Development">Development</option>
                <option value="Support">Support</option>
                <option value="Accounting">Accounting</option>
              </select>
            </div>
          </div>

          {/* บัญชี */}
          <div>
            <h3 className="text-gray-700 font-medium">บัญชี</h3>
            <div className="text-sm text-gray-400 mb-3">รายละเอียดบัญชีของผู้ใช้</div>
            <div className="w-[221px] h-[46px] border rounded-[16px] px-4 flex items-center gap-2">
              <span className="text-gray-500">👤</span>
              <input
                name="username"
                placeholder="ชื่อผู้ใช้"
                value={formData.username}
                onChange={handleChange}
                className="flex-1 border-0 outline-none text-sm"
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-full shadow"
            >
              {typeform === "edit" ? "บันทึกการแก้ไข" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
