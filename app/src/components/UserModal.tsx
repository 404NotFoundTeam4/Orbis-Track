import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import api from "../api/axios.js";
import DropDown from "./DropDown.js";
import { AlertDialog, AlertTone } from "./AlertDialog"; 
import { useToast } from "./Toast";

type Department = {
  dept_id: number;
  dept_name: string;
};

type Section = {
  sec_id: number;
  sec_name: string;
  sec_dept_id: number;
};

type DropDownItemType = {
  id: string | number;
  label: string;
  value: any;
};

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
  departments: Department[];
  sections: Section[];
};

export default function UserModal({
 typeform = "add",
  user,
  onClose,
  onSubmit,
  keyvalue,
  departments,
  sections,
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

  const toast = useToast();
  const [isEditAlertOpen, setIsEditAlertOpen] = useState(false);

  const handleConfirmEdit = async () => {
    const payload = keyvalue === "all" ? formData : formOutput;
    try {
      // 3.1 เรียก API PUT
      await api.put(`/accounts/${payload.us_id}`, payload);
      
      // 3.2 แสดง Toast (ใช้ .push ตามไฟล์ Toast.tsx)
      toast.push({
        message: "การแก้ไขสำเร็จ!",
        tone: "confirm", 
      });

      // 3.3 แจ้ง Parent (Users.tsx)
      if (onSubmit) onSubmit(payload);

    } catch (err) {
      console.error("❌ Error:", err);
      // 3.4 แสดง Toast เมื่อล้มเหลว
      toast.push({
        message: "เกิดข้อผิดพลาด ไม่สามารถบันทึกได้",
        tone: "danger",
      });
    }
  };
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
    } 
    setFormOutput(filtered);
  }, [formData, keyvalue]);

  //  handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "us_dept_id") {
      setFormData((prev) => ({
        ...prev,
        us_dept_id: parseInt(value, 10) || 0,
        us_sec_id: 0, // รีเซ็ตฝ่ายย่อย เมื่อแผนกเปลี่ยน
      }));
    } else if (name === "us_sec_id") {
      setFormData((prev) => ({
        ...prev,
        us_sec_id: parseInt(value, 10) || 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    // ตรวจสอบ ถ้าเป็น 'edit' ให้เปิด Alert
    if (typeform === "edit") {
      setIsEditAlertOpen(true);
      return; // หยุดการทำงานตรงนี้
    }
    const payload = keyvalue === "all" ? formData : formOutput;
    console.log(formOutput);
    if (onSubmit) onSubmit(payload);
  };

  const handleRoleChange = (selectedItem: DropDownItemType) => {
    setFormData((prev) => ({
      ...prev,
      us_role: selectedItem.value, // เก็บค่า string "Admin", "Staff" ฯลฯ
    }));
  };

  const handleDepartmentChange = (selectedItem: DropDownItemType) => {
    setFormData((prev) => ({
      ...prev,
      us_dept_id: selectedItem.value, // เก็บค่า ID (ตัวเลข)
      us_sec_id: 0, // รีเซ็ตฝ่ายย่อย
    }));
  };

  const handleSectionChange = (selectedItem: DropDownItemType) => {
    setFormData((prev) => ({
      ...prev,
      us_sec_id: selectedItem.value, // เก็บค่า ID (ตัวเลข)
    }));
  };

  const roleOptions: DropDownItemType[] = [
    { id: "Admin", label: "Admin", value: "Admin" },
    { id: "Manager", label: "Manager", value: "Manager" },
    { id: "HR", label: "HR", value: "HR" },
    { id: "Staff", label: "Staff", value: "Staff" },
  ];

  // (Department Options)
  const departmentOptions = useMemo(() => {
    return departments.map((dept) => ({
      id: dept.dept_id,
      label: dept.dept_name,
      value: dept.dept_id, // เราเก็บ ID ลงใน value
    }));
  }, [departments]);

  // (Section Options) - กรองก่อนแล้วค่อยแปลง
  const filteredSections = useMemo(() => {
    if (!formData.us_dept_id) {
      return [];
    }
    return sections.filter((sec) => sec.sec_dept_id === formData.us_dept_id);
  }, [formData.us_dept_id, sections]);

  const sectionOptions = useMemo(() => {
    return filteredSections.map((sec) => ({
      id: sec.sec_id,
      label: sec.sec_name,
      value: sec.sec_id, // เราเก็บ ID ลงใน value
    }));
  }, [filteredSections]);

  const selectedRole =
    roleOptions.find((option) => option.value === formData.us_role) || undefined;

  const selectedDepartment =
    departmentOptions.find((option) => option.id === formData.us_dept_id) || undefined;

  const selectedSection =
    sectionOptions.find((option) => option.id === formData.us_sec_id) || undefined;

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
          <div className="w-28 h-28 rounded-full border border-[#a2a2a2] flex items-center justify-center overflow-hidden bg-gray-50">
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
          <label className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a2a2a2] text-[16px] font-normal text-gray-600 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <span>+ เพิ่มรูปภาพ</span>
          </label>
        </div>

        {/* ฟอร์ม */}
        <form
          className="space-y-8 text-sm"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* โปรไฟล์ */}
          <div>
            <h3 className="text-[000000] font-medium text-[18px]">โปรไฟล์</h3>
            <div className="font-medium text-[#858585] mb-3 text-[16px] ">
              รายละเอียดโปรไฟล์ผู้ใช้
            </div>
            <div className="grid grid-cols-3 gap-y-4">
              <input
                name="us_firstname"
                placeholder="ชื่อจริง"
                value={formData.us_firstname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_lastname"
                placeholder="นามสกุล"
                value={formData.us_lastname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_emp_code"
                placeholder="รหัสพนักงาน"
                value={formData.us_emp_code}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_email"
                placeholder="อีเมล"
                value={formData.us_email}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_phone"
                placeholder="เบอร์โทรศัพท์"
                value={formData.us_phone}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
            </div>
          </div>

          {/* ตำแหน่งงาน */}
          <div>
            <h3 className="text-[000000] font-medium text-[18px]">
              ตำแหน่งงาน
            </h3>
            <div className="font-medium text-[#858585] mb-3 text-[16px]">
              รายละเอียดตำแหน่งงานของผู้ใช้
            </div>
            <div className="grid grid-cols-3 gap-y-4 gap-x-4">
              {/* ตำแหน่ง (Role) */}
              <DropDown
                items={roleOptions}
                value={selectedRole}
                onChange={handleRoleChange}
                placeholder="เลือกตำแหน่ง"
                className="w-[221px]" // กำหนดขนาดให้เท่า input
                searchable={true} // ปิด search bar (เพราะมีแค่ 4 ตัวเลือก)
              />

              {/* แผนก (Department) */}
              <DropDown
                items={departmentOptions}
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                placeholder="เลือกแผนก"
                className="w-[221px]" // กำหนดขนาดให้เท่า input
                searchable={true} // เปิด search bar
              />

              {/* ฝ่ายย่อย (Section) */}
              <DropDown
                items={sectionOptions}
                value={selectedSection}
                onChange={handleSectionChange}
                placeholder="เลือกฝ่ายย่อย"
                className="w-[221px]" // กำหนดขนาดให้เท่า input
                searchable={true} // เปิด search bar
                disabled={filteredSections.length === 0}
              />
            </div>
          </div>

          {/* บัญชี */}
          <div>
            <h3 className="text-[000000] font-medium text-[18px]">บัญชี</h3>
            <div className="font-medium text-[#858585] mb-3 text-[16px]">
              รายละเอียดบัญชีของผู้ใช้
            </div>
            <div className="font-medium text-[000000] mb-2 text-[16px]">
              ชื่อผู้ใช้ (ล็อกอิน)
            </div>
            <div className="w-[221px] h-[46px] border rounded-[16px] px-4 flex items-center gap-2 border-[#a2a2a2] text-[16px]">
              <span className="text-gray-500">👤</span>
              <input
                name="us_username"
                placeholder="ชื่อผู้ใช้"
                value={formData.us_username}
                onChange={handleChange}
                className="flex-1 border-0 outline-none text-[16px]"
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
      <AlertDialog
      open={isEditAlertOpen}
      onOpenChange={setIsEditAlertOpen}
      title="ยืนยันการแก้ไข"
      description="คุณแน่ใจหรือไม่ว่าต้องการบันทึกการเปลี่ยนแปลงนี้"
      tone="warning"
      onConfirm={handleConfirmEdit}
      confirmText="ยืนยัน"
      cancelText="ยกเลิก"
    />
    </div>
  );
}
