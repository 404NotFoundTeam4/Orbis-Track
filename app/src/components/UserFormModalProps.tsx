/**
 * Description: UserFormModal Component สำหรับแสดงหน้าฟอร์มผู้ใช้งาน
 * Note      : แสดงข้อมูลผู้ใช้เดิม สามารถแก้ไขแล้วกด "บันทึก" เพื่อส่งข้อมูลกลับไปยัง parent component  (Users.tsx)
 * Author    : Worrawat Namwat (Wave) 66160372
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import DropDown from "./DropDown";
import { AlertDialog } from "./AlertDialog";
import { useToast } from "./Toast";

// Type สำหรับ Dropdown Options ที่รับเข้ามาใน Props
type Option = {
  value: string | number;
  label: string;
};

// Interface สำหรับ DropdownItem ที่ DropDown Component ใช้งาน
interface DropdownItem {
  id: string | number; // รหัสประจำตัวของรายการ (ใช้เป็น key)
  label: string; // ข้อความที่แสดงหลัก
  value: any; // ค่าจริงของรายการ
  icon?: React.ReactNode;
  subtitle?: string;
  disabled?: boolean;
  textColor?: string;
}

// *** Type สำหรับ User ***
type User = {
  us_id: number;
  us_emp_code: string;
  us_firstname: string;
  us_lastname: string;
  us_username: string;
  us_email: string;
  us_phone: string;
  us_images: string;
  us_role: string;
  us_dept_id: number;
  us_sec_id: number;
  us_is_active: boolean;
  us_dept_name: string;
  us_sec_name: string;
  created_at: Date;
};

// *** Type สำหรับ Props ของ Modal (ใช้ Option และ DropdownItem ที่กำหนดไว้ด้านบน) ***
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User;
  onSave: (data: Partial<User>, newImageFile: File | null) => void;

  // Prop สำหรับ Dropdown Options
  roleOptions: Option[];
  departmentOptions: Option[];
  sectionOptions: Option[];
}

const noSectionRoles = ["HOD", "Admin"];

// ฟังก์ชันสำหรับแปลง Option[] เป็น DropdownItem[]
const convertOptionsToDropdownItems = (options: Option[]): DropdownItem[] => {
  return options.map((opt) => ({
    id: String(opt.value),
    label: opt.label,
    value: opt.value,
  }));
};

// เปลี่ยนชื่อฟังก์ชันและรับ Props ใหม่ทั้งหมด
export default function UserModal({
  isOpen,
  onClose,
  userToEdit,
  onSave,
  roleOptions,
  departmentOptions,
  sectionOptions,
}: UserFormModalProps) {
  // State สำหรับเก็บข้อมูลที่แก้ไข
  const [formData, setFormData] = useState<Partial<User>>({});
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  // *** State สำหรับควบคุม AlertDialog ***
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const {push} = useToast();

  // อ้างอิงถึง input file สำหรับการคลิกแบบโปรแกรม
  const fileInputRef = useRef<HTMLInputElement>(null);

  // อัปเดต formData เมื่อ userToEdit เปลี่ยน (เช่น Modal เปิด/ปิด)
  useEffect(() => {
    if (isOpen && userToEdit) {
      // คัดลอกเฉพาะฟิลด์ที่ต้องการแก้ไข
      setFormData({
        us_emp_code: userToEdit.us_emp_code,
        us_firstname: userToEdit.us_firstname,
        us_lastname: userToEdit.us_lastname,
        us_username: userToEdit.us_username,
        us_email: userToEdit.us_email,
        us_phone: userToEdit.us_phone,
        us_role: userToEdit.us_role,
        us_dept_id: userToEdit.us_dept_id,
        us_sec_id: userToEdit.us_sec_id,
      });
      // ตั้งค่าภาพตัวอย่างเริ่มต้น
      setImagePreviewUrl(userToEdit.us_images || null);
      setNewImageFile(null); 
    }
  }, [isOpen, userToEdit]);

  // แปลง options ให้เป็น DropdownItem[]
  const ddRoleOptions = useMemo(
    () => convertOptionsToDropdownItems(roleOptions),
    [roleOptions]
  );
  const ddDepartmentOptions = useMemo(
    () => convertOptionsToDropdownItems(departmentOptions),
    [departmentOptions]
  );

  // กรอง Section Options ตาม Department ที่เลือก
  const filteredSectionOptions = useMemo(() => {
    const currentDeptId = formData.us_dept_id ?? userToEdit.us_dept_id;

    if (!currentDeptId) {
      return [];
    }

    const sectionsForDept = sectionOptions.filter(
      (sec) => true // ให้แสดงทั้งหมดจนกว่าจะมี logic การกรองที่ชัดเจน
    );

    return convertOptionsToDropdownItems(sectionsForDept);
  }, [formData.us_dept_id, userToEdit.us_dept_id, sectionOptions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ฟังก์ชันนี้รับ DropdownItem ที่มี Type ชัดเจน
  const handleDropdownChange = (name: keyof User, item: DropdownItem) => {
    // DropdownItem.value ถูกใช้เป็นค่าที่แท้จริง
    setFormData((prev) => ({
      ...prev,
      [name]: item.value,
    }));

    // ถ้าเปลี่ยนแผนก (us_dept_id) ให้รีเซ็ตส่วนงาน (us_sec_id)
    if (name === "us_dept_id") {
      setFormData((prev) => ({
        ...prev,
        us_sec_id: undefined, // ล้างค่าส่วนงาน
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      // สร้าง URL สำหรับแสดงตัวอย่าง
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setIsAlertOpen(true);
  };

  const handleConfirmSave = () => {
    const dataToSave: Partial<User> = {
      ...userToEdit, // ใช้ข้อมูลเดิมเพื่อรับประกัน us_id
      ...formData, // ผสานกับข้อมูลที่แก้ไขใหม่
    };

    // ลบ property ที่ไม่ควรส่งไป เช่น ชื่อแผนก/ฝ่ายย่อย
    delete dataToSave.us_sec_name;
    delete dataToSave.us_dept_name;
    delete dataToSave.created_at;

    onSave(dataToSave, newImageFile);
    push({
      tone: "confirm", // ใช้ tone "confirm" สำหรับความสำเร็จ
      message: "แก้ไขบัญชีผู้ใช้เสร็จสิ้น!",
      duration: 3000,
    });
  };

  // ค้นหา DropdownItem ที่ถูกเลือกจากรายการ
  const renderSelectedDropdownItem = (
    items: DropdownItem[],
    key: keyof User
  ): DropdownItem | null => {
    const selectedValue = formData[key];
    if (selectedValue === undefined || selectedValue === null) return null;

    // DropdownItem.value คือค่าที่เก็บใน formData
    return items.find((item) => item.value === selectedValue) || null;
  };

  if (!isOpen) return null;

  // Class สำหรับ Input ทั่วไป
  const inputClass =
    "w-full h-10 border border-gray-300 text-sm p-3 rounded-xl " +
    "outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white shadow-sm transition-all";

  // Class สำหรับ 3 ช่องใน 1 บรรทัด 
  const formFieldClass = "col-span-12 sm:col-span-4";

  // Class สำหรับหัวข้อกลุ่ม
  const groupHeaderClass = "col-span-12 mt-4 mb-2";
  const groupTitleClass = "text-xl font-bold text-gray-800";
  const groupSubtitleClass = "text-sm text-gray-500";

  // Custom class สำหรับ Modal Content เพื่อให้มี Padding/Margin น้อยลงด้านบน
  const modalContentClass =
    "bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto relative";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Overlay สำหรับปิด Modal เมื่อคลิกด้านนอก */}
      <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className={modalContentClass}>
        {/* Header (จัดให้อยู่กึ่งกลางตามรูป) */}
        <div className="relative flex items-center justify-center pb-4 mb-0">
          <h2 className="text-xl font-semibold text-gray-800">
            แก้ไขบัญชีผู้ใช้
          </h2>
          {/* ปุ่มปิด - ตำแหน่งด้านบนขวา */}
          <button
            onClick={onClose}
            className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition"
          >
            <Icon icon="ic:round-close" width="24" height="24" />
          </button>
        </div>

        {/* Image Upload/Preview Section */}
        <div className="col-span-12 flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-[1.21px] border-#a2a2a2 shadow-md mb-2 bg-gray-100 flex items-center justify-center">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="User Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    `https://placehold.co/112x112/E0E7FF/3B82F6?text=${userToEdit.us_firstname.charAt(0)}`;
                }}
              />
            ) : (
              <span className="text-4xl text-#a2a2a2 font-semibold">
                {userToEdit.us_firstname.charAt(0)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-[114px] h-[32px] flex items-center space-x-1 px-3 py-1 
            border border-gray-300 text-#a2a2a2 
            text-xs font-medium rounded-full 
            hover:bg-gray-100 transition"
          >
            <Icon icon="ic:round-add" width="16" height="16" />
            <span>เพิ่มรูปภาพ</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Form Sections */}
        <form>
          {/* ======================= 1. โปรไฟล์ ======================= */}
          <div className={groupHeaderClass}>
            <p className={groupTitleClass}>โปรไฟล์</p>
            <p className={groupSubtitleClass}>รายละเอียดโปรไฟล์ผู้ใช้</p>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-6">
            {/* ชื่อจริง */}
            <div className={formFieldClass}>
              <label
                htmlFor="us_firstname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อ
              </label>
              <input
                id="us_firstname"
                type="text"
                name="us_firstname"
                value={formData.us_firstname || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* นามสกุล */}
            <div className={formFieldClass}>
              <label
                htmlFor="us_lastname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                นามสกุล
              </label>
              <input
                id="us_lastname"
                type="text"
                name="us_lastname"
                value={formData.us_lastname || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* รหัสพนักงาน */}
            <div className={formFieldClass}>
              <label
                htmlFor="us_emp_code"
                className="block text-sm font-Regular text-gray-700 mb-1"
              >
                รหัสพนักงาน
              </label>
              <input
                id="us_emp_code"
                type="text"
                name="us_emp_code"
                value={formData.us_emp_code || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* อีเมล */}
            <div className={formFieldClass}>
              <label
                htmlFor="us_email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                อีเมล
              </label>
              <input
                id="us_email"
                type="email"
                name="us_email"
                value={formData.us_email || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div className={formFieldClass}>
              <label
                htmlFor="us_phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เบอร์โทรศัพท์
              </label>
              <input
                id="us_phone"
                type="text"
                name="us_phone"
                value={formData.us_phone || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* ======================= ตำแหน่งงาน ======================= */}
          <div className={groupHeaderClass}>
            <p className={groupTitleClass}>ตำแหน่งงาน</p>
            <p className={groupSubtitleClass}>รายละเอียดตำแหน่งงานของผู้ใช้</p>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* ตำแหน่ง (Role) */}
            <div className={formFieldClass}>
              <DropDown
                label="ตำแหน่ง"
                items={ddRoleOptions}
                value={renderSelectedDropdownItem(ddRoleOptions, "us_role")}
                onChange={(item: DropdownItem) =>
                  handleDropdownChange("us_role", item)
                }
                placeholder="เลือกตำแหน่ง"
                onClear={() =>
                  handleDropdownChange("us_role", {
                    id: "",
                    label: "",
                    value: "",
                  } as DropdownItem)
                }
              />
            </div>

            {/*. แผนก (Department) */}
            <div className={formFieldClass}>
              <DropDown
                label="แผนก"
                items={ddDepartmentOptions}
                value={renderSelectedDropdownItem(
                  ddDepartmentOptions,
                  "us_dept_id"
                )}
                onChange={(item: DropdownItem) =>
                  handleDropdownChange("us_dept_id", item)
                }
                placeholder="เลือกแผนก"
                onClear={() =>
                  handleDropdownChange("us_dept_id", {
                    id: 0,
                    label: "",
                    value: 0,
                  } as DropdownItem)
                }
              />
            </div>

            {/* ฝ่ายย่อย (Section) */}
            <div className={formFieldClass}>
              {formData.us_role &&
              !noSectionRoles.includes(formData.us_role) ? (
                <>
                  <DropDown
                    label="ฝ่ายย่อย"
                    items={filteredSectionOptions}
                    value={renderSelectedDropdownItem(
                      filteredSectionOptions,
                      "us_sec_id"
                    )}
                    onChange={(item: DropdownItem) =>
                      handleDropdownChange("us_sec_id", item)
                    }
                    placeholder="เลือกส่วนงาน"
                    onClear={() =>
                      handleDropdownChange("us_sec_id", {
                        id: 0,
                        label: "",
                        value: 0,
                      } as DropdownItem)
                    }
                    disabled={!formData.us_dept_id}
                  />
                  {!formData.us_dept_id && (
                    <p className="mt-1 text-xs text-gray-500">
                      กรุณาเลือกแผนกก่อน
                    </p>
                  )}
                </>
              ) : (
                <DropDown
                  label="ฝ่ายย่อย"
                  items={filteredSectionOptions}
                  value={renderSelectedDropdownItem(
                    filteredSectionOptions,
                    "us_sec_id"
                  )}
                  onChange={(item: DropdownItem) =>
                    handleDropdownChange("us_sec_id", item)
                  }
                  placeholder="เลือกฝ่ายย่อย"
                  disabled={true}
                />
              )}
            </div>
          </div>

          {/* ======================= บัญชี ======================= */}
          <div className={groupHeaderClass}>
            <p className={groupTitleClass}>บัญชี</p>
            <p className={groupSubtitleClass}>รายละเอียดบัญชีของผู้ใช้</p>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* ชื่อผู้ใช้งาน */}
            <div className={formFieldClass}>
              <label
                htmlFor="us_username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อผู้ใช้ (เลือกอื่น)
              </label>
              <div className="relative">
                <Icon
                  icon="ph:user"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                />
                <input
                  id="us_username"
                  type="text"
                  name="us_username"
                  value={formData.us_username || ""}
                  onChange={handleChange}
                  // ปรับ inputClass ให้มี padding ด้านซ้ายมากขึ้นสำหรับ Icon
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Footer / Action Buttons */}
          <div className="pt-6  flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-2 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition shadow-md"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        tone="warning"
        icon={<Icon icon="ci:warning" className="h-20 w-20"/>}
        title="ยืนยันการแก้ไขบัญชีผู้ใช้"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}