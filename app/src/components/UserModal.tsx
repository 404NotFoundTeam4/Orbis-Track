import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import api from "../api/axios.js";

type UserApiData = {
  us_id: number;
  us_emp_code: string;
  us_firstname: string;
  us_lastname: string;
  us_username: string;
  us_email: string;
  us_phone: string;
  us_images: string | null;
  us_role: string;
  us_dept_id: number;
  us_sec_id: number;
  us_is_active: boolean;
  us_dept_name: string;
  us_sec_name: string;
};

type UserModalProps = {
  typeform?: "add" | "edit" | "delete";
  user?: UserApiData | null;
  onClose?: () => void;
  onSubmit?: (data: Partial<UserApiData>) => void;

   keyvalue: (keyof UserApiData)[] | "all";
};

export default function UserModal({
  typeform = "add",
  user,
  onClose,
  onSubmit,
  keyvalue,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserApiData>({
    us_id: 0,
    us_emp_code: "",
    us_firstname: "",
    us_lastname: "",
    us_username: "",
    us_email: "",
    us_phone: "",
    us_images: null,
    us_role: "",
    us_dept_id: 0,
    us_sec_id: 0,
    us_is_active: true,
    us_dept_name: "",
    us_sec_name: "",
  });

  const [formOutput, setFormOutput] = useState<Partial<UserApiData>>({});

  //  preload user data เมื่อแก้ไข / ลบ
  useEffect(() => {
    if (user && (typeform === "edit" || typeform === "delete")) {
      setFormData({ ...user });
    }
  }, [user, typeform]);

  //  filter key ตามที่ส่งมาจาก props (keyvalue)
   useEffect(() => {
    let filtered: Partial<UserApiData> = {};

    if (keyvalue === "all") {
      //  ถ้าเป็น all → เอาทั้ง formData เลย
      filtered = { ...formData };
    } else {
      //  ถ้ามี key เฉพาะ → ดึงเฉพาะ key ที่กำหนด
      keyvalue.forEach((key) => {
        filtered[key] = formData[key];
      });
    }

    setFormOutput(filtered);
    onSubmit?.(filtered);
  }, [formData, keyvalue]);


  //  handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, us_images: url }));
    }
  };

  //  handle main API call
  const handle = async () => {
    try {
      let res;

      //  เตรียม payload ตาม keyvalue
     const payload = keyvalue === "all" ? formData : formOutput;

      //  เรียก API ตาม typeform
      // if (typeform === "add") {
      //   res = await api.post("/accounts", payload);
      // } else if (typeform === "edit") {
      //   res = await api.put(`/accounts/${payload.us_id}`, payload);
      // } else if (typeform === "delete") {
      //   res = await api.delete(`/users/${payload}`);
      // }

    //   console.log(" API Response:", res?.data);
    console.log(formOutput)
      if (onSubmit) onSubmit(payload);
      if (onClose) onClose();
    } catch (err) {
      console.error("❌ Error:", err);
    }
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

        {/* หัวข้อ */}
        <h2 className="text-center mb-6 text-[32px] font-bold font-roboto">
          {typeform === "edit" ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้"}
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border flex items-center justify-center overflow-hidden bg-gray-50">
            {formData.us_images ? (
              <img
                src={formData.us_images}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon
                icon="ion:image-outline"
                width="37.19"
                height="20"
                className="text-gray-300"
              />
            )}
          </div>
          <label className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm text-gray-600 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <span className="text-base">+ เพิ่มรูปภาพ</span>
          </label>
        </div>

        {/* ฟอร์ม */}
        <form
          className="space-y-8 text-sm"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* โปรไฟล์ */}
          <div>
            <h3 className="text-gray-700 font-medium">โปรไฟล์</h3>
            <div className="text-sm text-gray-400 mb-3">
              รายละเอียดโปรไฟล์ผู้ใช้
            </div>
            <div className="grid grid-cols-3 gap-y-4">
              <input
                name="us_firstname"
                placeholder="ชื่อจริง"
                value={formData.us_firstname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="us_lastname"
                placeholder="นามสกุล"
                value={formData.us_lastname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="us_emp_code"
                placeholder="รหัสพนักงาน"
                value={formData.us_emp_code}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="us_email"
                placeholder="อีเมล"
                value={formData.us_email}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="us_phone"
                placeholder="เบอร์โทรศัพท์"
                value={formData.us_phone}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
            </div>
          </div>

          {/* ตำแหน่งงาน */}
          <div>
            <h3 className="text-gray-700 font-medium">ตำแหน่งงาน</h3>
            <div className="text-sm text-gray-400 mb-3">
              รายละเอียดตำแหน่งงานของผู้ใช้
            </div>
            <div className="grid grid-cols-3 gap-y-4">
              <select
                name="us_role"
                value={formData.us_role}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              >
                <option value="">เลือกตำแหน่ง</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Staff">Staff</option>
              </select>
              <input
                name="us_dept_name"
                placeholder="ชื่อแผนก"
                value={formData.us_dept_name}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
              <input
                name="us_sec_name"
                placeholder="ฝ่ายย่อย"
                value={formData.us_sec_name}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 text-sm"
              />
            </div>
          </div>

          {/* บัญชี */}
          <div>
            <h3 className="text-gray-700 font-medium">บัญชี</h3>
            <div className="text-sm text-gray-400 mb-3">
              รายละเอียดบัญชีของผู้ใช้
            </div>
            <div className="w-[221px] h-[46px] border rounded-[16px] px-4 flex items-center gap-2">
              <span className="text-gray-500">👤</span>
              <input
                name="us_username"
                placeholder="ชื่อผู้ใช้"
                value={formData.us_username}
                onChange={handleChange}
                className="flex-1 border-0 outline-none text-sm"
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handle}
              className={`px-8 py-3 rounded-full shadow text-white ${
                typeform === "delete"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-400 hover:bg-blue-500"
              }`}
            >
              {typeform === "delete" ? "ปิดการใช้งาน" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
