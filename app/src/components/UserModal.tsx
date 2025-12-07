/**
 * Description: UserModal Component สำหรับแสดงฟอร์ม เพิ่ม/แก้ไข/ลบ ผู้ใช้ในระบบ
 * Author    : Worrawat Namwat (Wave) 66160372, Chanwit Muangma (Boom) 66160224
 */
import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import api from "../api/axios.js";
import DropDown from "./DropDown.js";
import { AlertDialog } from "./AlertDialog.js";
import { useToast } from "./Toast";
import UsersService from "../services/UsersService.js";
import getImageUrl from "../services/GetImage.js";

type IDepartment = {
  dept_id: number;
  dept_name: string;
};

type ISection = {
  sec_id: number;
  sec_name: string;
  sec_dept_id: number;
};

type IDropDownItemType = {
  id: string | number;
  label: string;
  value: any;
};

type IUserApiData = {
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
  us_sec_id: number | null;
  us_is_active: boolean;
  us_dept_name: string;
  us_sec_name: string;
};

type IUserModalProps = {
  typeform?: "add" | "edit" | "delete";
  user?: IUserApiData | null;
  onClose?: () => void;
  onSubmit?: (data: Partial<IUserApiData>) => void;
  keyvalue: (keyof IUserApiData)[] | "all";
  departmentsList: IDepartment[];
  sectionsList: ISection[];
  rolesList: IDropDownItemType[];
};

const defaultFormDataObject: IUserApiData = {
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
  us_sec_id: null,
  us_is_active: true,
  us_dept_name: "",
  us_sec_name: "",
};

export default function UserModal({
  typeform = "add",
  user,
  onClose,
  onSubmit,
  keyvalue,
  departmentsList,
  sectionsList,
  rolesList,
}: IUserModalProps) {
  const [formDataObject, setFormDataObject] = useState<IUserApiData>(
    user ? { ...defaultFormDataObject, ...user } : defaultFormDataObject
  );

  //  State สำหรับเก็บ Error Message
  const [errors, setErrors] = useState<Partial<Record<keyof IUserApiData, string>>>({});

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="w-[221px] block text-[16px] font-medium text-[#000000] mb-2">
      {children}
    </label>
  );

  const DISABLED_CLS = ["disabled:opacity-50", "cursor-not-allowed"].join(" ");
  const isDelete = typeform === "delete";

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [formOutput, setFormOutput] = useState<Partial<IUserApiData>>({});
  const toast = useToast();
  const [isEditAlertOpen, setIsEditAlertOpen] = useState(false);
  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function generatePassword(length: number = 12): string {
    if (length < 12) throw new Error("ความยาวต้องอย่างน้อย 12 ตัวขึ้นไป");
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

/**
 * Description: Validate Form Function สำหรับตรวจสอบความถูกต้องของข้อมูลในฟอร์ม
 * Author    : Worrawat Namwat (Wave) 66160372
 */
  const validateForm = () => {
    const newErrors: Partial<Record<keyof IUserApiData, string>> = {};
    let isValid = true;

    if (!formDataObject.us_firstname?.trim()) {
      newErrors.us_firstname = "กรุณากรอกชื่อจริง";
      isValid = false;
    }
    if (!formDataObject.us_lastname?.trim()) {
      newErrors.us_lastname = "กรุณากรอกนามสกุล";
      isValid = false;
    }
    if (!formDataObject.us_emp_code?.trim()) {
      newErrors.us_emp_code = "กรุณากรอกรหัสพนักงาน";
      isValid = false;
    }

    if (!formDataObject.us_email?.trim()) {
      newErrors.us_email = "กรุณากรอกอีเมล";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formDataObject.us_email)) {
      newErrors.us_email = "รูปแบบอีเมลไม่ถูกต้อง";
      isValid = false;
    }

    if (!formDataObject.us_phone?.trim()) {
      newErrors.us_phone = "กรุณากรอกเบอร์โทรศัพท์";
      isValid = false;
    } else if (!/^\d+$/.test(formDataObject.us_phone)) {
      newErrors.us_phone = "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
      isValid = false;
    } else if (formDataObject.us_phone.length !== 10) {
      newErrors.us_phone = "กรุณากรอกเบอร์โทรศัพท์ให้ครบถ้วน";
      isValid = false;
    }

    if (!formDataObject.us_role) {
      newErrors.us_role = "กรุณาเลือกตำแหน่ง";
      isValid = false;
    }
    if (!formDataObject.us_dept_id) {
      newErrors.us_dept_id = "กรุณาเลือกแผนก";
      isValid = false;
    }

    if (!formDataObject.us_sec_id) {
      newErrors.us_sec_id = "กรุณาเลือกฝ่ายย่อย";
      isValid = false;
    }

    if (!formDataObject.us_username?.trim()) {
      newErrors.us_username = "กรุณากรอกชื่อผู้ใช้";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const handleCodeChange = async () => {
      if (!formDataObject.us_role) return;

      if (typeform === "edit" && user) {
        if (formDataObject.us_role === user.us_role) {
          setFormDataObject((prev) => ({
            ...prev,
            us_emp_code: user.us_emp_code,
          }));
          return;
        }
      }
    };

    handleCodeChange();
  }, [formDataObject.us_role, typeform, user]);

  // Handle Change และเคลียร์ Error เมื่อพิมพ์
  const handleChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = changeEvent.target;

    // เคลียร์ Error ทันทีที่พิมพ์
    if (errors[name as keyof IUserApiData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "us_dept_id") {
      setFormDataObject((prev) => ({
        ...prev,
        us_dept_id: parseInt(value, 10) || 0,
        us_sec_id: null,
      }));
    } else if (name === "us_sec_id") {
      setFormDataObject((prev) => ({
        ...prev,
        us_sec_id: parseInt(value, 10) || null,
      }));
    } else {
      setFormDataObject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormDataObject((prev) => ({ ...prev, us_images: previewUrl }));
      setNewImageFile(file);
    }
  };

  // Handle ปุ่มกดหลัก
  const handle = async () => {
    if (typeform === "delete") {
      setIsDeleteAlertOpen(true);
      return;
    }

    // เรียกใช้ Validation
    if (!validateForm()) {
      return;
    }

    if (typeform === "edit") {
      setIsEditAlertOpen(true);
    } else if (typeform === "add") {
      setIsAddAlertOpen(true);
    }
  };

  const handleConfirmEdit = async () => {
    const payload: any = { ...formDataObject };
    if (newImageFile) {
      payload.us_images = newImageFile;
    }
    if (onSubmit) onSubmit(payload);
    setIsEditAlertOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!user?.us_id) return;
    try {
      setDeleting(true);
      await UsersService.softDelete(user.us_id);
      toast.push({ tone: "confirm", message: `ปิดการใช้งานบัญชีสำเร็จ` });
      onSubmit?.({ us_id: user.us_id });
      onClose?.();
    } catch (err) {
      toast.push({ tone: "danger", message: "ล้มเหลว: ไม่สามารถปิดการใช้งานผู้ใช้ได้" });
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmAdd = async () => {
    const raw = keyvalue === "all" ? formDataObject : formOutput;
    const payload: any = { ...raw };
    delete payload.us_id;
    payload.us_password = generatePassword(12);
    if (newImageFile) {
      payload.us_images = newImageFile;
    } else {
      payload.us_images = null;
    }
    setIsAddAlertOpen(false);
    if (onClose) onClose();
    if (onSubmit) onSubmit(payload);
  };

  useEffect(() => {
    if (user && (typeform === "edit" || typeform === "delete")) {
      setFormDataObject({ ...user });
    } else if (typeform === "add") {
      setFormDataObject({ ...defaultFormDataObject });
    }
  }, [user, typeform]);

  useEffect(() => {
    let filtered: Partial<IUserApiData> = {};
    if (keyvalue === "all") filtered = { ...formDataObject };
    else keyvalue.forEach((k) => { (filtered as any)[k] = formDataObject[k]; });
    setFormOutput(filtered);
  }, [formDataObject, keyvalue]);

  // Handle DropDowns with Error Clearing
  const handleRoleChange = (selectedItem: IDropDownItemType) => {
    setFormDataObject((prev) => ({ ...prev, us_role: selectedItem.value }));
    if (errors.us_role) setErrors((prev) => ({ ...prev, us_role: undefined }));
  };

  const handleDepartmentChange = (selectedItem: IDropDownItemType) => {
    setFormDataObject((prev) => ({
      ...prev,
      us_dept_id: selectedItem.value,
      us_sec_id: null,
    }));
    if (errors.us_dept_id) setErrors((prev) => ({ ...prev, us_dept_id: undefined }));
  };

  const handleSectionChange = (selectedItem: IDropDownItemType) => {
    setFormDataObject((prev) => ({ ...prev, us_sec_id: selectedItem.value }));
    if (errors.us_sec_id) setErrors((prev) => ({ ...prev, us_sec_id: undefined }));
  };

  const roleOptions: IDropDownItemType[] = [
    { id: "ADMIN", label: "ADMIN", value: "ADMIN" },
    { id: "HOD", label: "HOD", value: "HOD" },
    { id: "HOS", label: "HOS", value: "HOS" },
    { id: "TECHNICAL", label: "TECHNICAL", value: "TECHNICAL" },
    { id: "STAFF", label: "STAFF", value: "STAFF" },
    { id: "EMPLOYEE", label: "EMPLOYEE", value: "EMPLOYEE" },
  ];

  const departmentOptions = useMemo(() =>
    departmentsList?.map((dept) => ({
      id: dept.dept_id,
      label: dept.dept_name,
      value: dept.dept_id,
    })), [departmentsList]);

  const filteredSections = useMemo(() => {
    if (!formDataObject.us_dept_id) return [];
    return sectionsList?.filter((sec) => sec.sec_dept_id === formDataObject.us_dept_id);
  }, [formDataObject.us_dept_id, sectionsList]);

  const sectionOptions = useMemo(() =>
    filteredSections.map((sec) => ({
      id: sec.sec_id,
      label: sec.sec_name,
      value: sec.sec_id,
    })), [filteredSections]);

  const selectedRole = rolesList?.find((op) => op.value === formDataObject.us_role);
  const selectedDepartment = departmentOptions?.find((op) => op.id === formDataObject.us_dept_id);
  const selectedSection = sectionOptions?.find((op) => op.id === formDataObject.us_sec_id);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="relative bg-white rounded-[24px] p-8 w-[804px] max-w-[95%] shadow-2xl border border-[#858585] flex flex-col">
        {/* Header */}
        <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center">
          <div aria-hidden />
          <h2 className="justify-self-center text-[32px] font-bold font-roboto text-black">
            {typeform === "delete" ? "ปิดการใช้งานบัญชีผู้ใช้" : typeform === "edit" ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้"}
          </h2>
          <button
            onClick={onClose}
            className="justify-self-end grid place-items-center w-8 h-8 rounded-full bg-white border-2 border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" className="text-inherit">
              <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M18 6 L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border border-[#a2a2a2] flex items-center justify-center overflow-hidden bg-gray-50">
            {formDataObject.us_images ? (
              <img src={getImageUrl(formDataObject.us_images)} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Icon icon="ion:image-outline" width="37.19" height="20" className="text-gray-300" />
            )}
          </div>
          {!isDelete && (
            <label className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a2a2a2] text-[16px] font-normal text-gray-600 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <span>+ เพิ่มรูปภาพ</span>
            </label>
          )}
        </div>

        {/* Form */}
        <form className="space-y-8 text-sm" onSubmit={(e) => e.preventDefault()}>
          <fieldset disabled={isDelete} aria-readonly={isDelete}>
            {/* Profile Section */}
            <div className="mb-[30px]">
              <h3 className="text-[000000] font-medium text-[18px]">โปรไฟล์</h3>
              <div className="font-medium text-[#858585] mb-3 text-[16px]">รายละเอียดโปรไฟล์ผู้ใช้</div>

              <div className="grid grid-cols-3 gap-y-4 gap-x-4 mb-3">
                {/* ชื่อ */}
                <div>
                  <FieldLabel>ชื่อ</FieldLabel>
                  <input
                    name="us_firstname"
                    placeholder="ชื่อจริงของผู้ใช้งาน"
                    value={formDataObject.us_firstname}
                    onChange={handleChange}
                    readOnly={isDelete}
                    className={`w-[221px] h-[46px] border rounded-[16px] px-4 text-[16px] font-normal text-black placeholder:text-[#CDCDCD] 
                      ${errors.us_firstname ? "border-red-500" : "border-[#a2a2a2]"} 
                      ${isDelete ? DISABLED_CLS : ""}`}
                  />
                  {errors.us_firstname && <div className="text-red-500 text-xs mt-1">{errors.us_firstname}</div>}
                </div>

                {/* นามสกุล */}
                <div>
                  <FieldLabel>นามสกุล</FieldLabel>
                  <input
                    name="us_lastname"
                    placeholder="นามสกุลของผู้ใช้งาน"
                    value={formDataObject.us_lastname}
                    onChange={handleChange}
                    readOnly={isDelete}
                    className={`w-[221px] h-[46px] border rounded-[16px] px-4 text-[16px] font-normal text-black placeholder:text-[#CDCDCD] 
                      ${errors.us_lastname ? "border-red-500" : "border-[#a2a2a2]"} 
                      ${isDelete ? DISABLED_CLS : ""}`}
                  />
                  {errors.us_lastname && <div className="text-red-500 text-xs mt-1">{errors.us_lastname}</div>}
                </div>

                {/* รหัสพนักงาน */}
                <div>
                  <FieldLabel>รหัสพนักงาน</FieldLabel>
                  <input
                    name="us_emp_code"
                    placeholder="รหัสพนักงาน"
                    value={formDataObject.us_emp_code}
                    onChange={handleChange}
                    readOnly={isDelete}
                    disabled={isDelete} 
                    className={`w-[221px] h-[46px] border rounded-[16px] px-4 text-[16px] font-normal text-black placeholder:text-[#CDCDCD] 
                      ${errors.us_emp_code ? "border-red-500" : "border-[#a2a2a2]"}  
                      ${isDelete ? DISABLED_CLS : ""}`}
                  />
                  {errors.us_emp_code && <div className="text-red-500 text-xs mt-1">{errors.us_emp_code}</div>}
                </div>

                {/* อีเมล */}
                <div>
                  <FieldLabel>อีเมล</FieldLabel>
                  <input
                    name="us_email"
                    placeholder="อีเมลของผู้ใช้งาน"
                    value={formDataObject.us_email}
                    onChange={handleChange}
                    readOnly={isDelete}
                    className={`w-[221px] h-[46px] border rounded-[16px] px-4 text-[16px] font-normal text-black placeholder:text-[#CDCDCD] 
                      ${errors.us_email ? "border-red-500" : "border-[#a2a2a2]"} 
                      ${isDelete ? DISABLED_CLS : ""}`}
                  />
                  {errors.us_email && <div className="text-red-500 text-xs mt-1">{errors.us_email}</div>}
                </div>

                {/* เบอร์โทรศัพท์ */}
                <div>
                  <FieldLabel>เบอร์โทรศัพท์</FieldLabel>
                  <input
                    name="us_phone"
                    placeholder="เบอร์โทรศัพท์"
                    value={formDataObject.us_phone}
                    onChange={handleChange}
                    readOnly={isDelete}
                    maxLength={10}
                    className={`w-[221px] h-[46px] border rounded-[16px] px-4 text-[16px] font-normal text-black placeholder:text-[#CDCDCD] 
                      ${errors.us_phone ? "border-red-500" : "border-[#a2a2a2]"} 
                      ${isDelete ? DISABLED_CLS : ""}`}
                  />
                  {errors.us_phone && <div className="text-red-500 text-xs mt-1">{errors.us_phone}</div>}
                </div>
              </div>
            </div>

            {/* Position Section */}
            <div className="mb-[30px]">
              <h3 className="text-[000000] font-medium text-[18px]">ตำแหน่งงาน</h3>
              <div className="font-medium text-[#858585] mb-3 text-[16px]">รายละเอียดตำแหน่งงานของผู้ใช้</div>
              <div className="grid grid-cols-3 gap-y-4 gap-x-4">
                {/* ตำแหน่ง */}
                <div>
                  <DropDown
                    label="ตำแหน่ง"
                    items={rolesList || []}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    placeholder="ประเภทตำแหน่ง"
                    disabled={isDelete}
                    className={"!w-[221px]"}
                    triggerClassName={errors.us_role ? "!border-red-500" : "!border-[#a2a2a2]"}
                    searchable={true}
                  />
                  {errors.us_role && <div className="text-red-500 text-xs mt-1">{errors.us_role}</div>}
                </div>

                {/* แผนก */}
                <div>
                  <DropDown
                    label="แผนก"
                    items={departmentOptions || []}
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    placeholder="ประเภทแผนก"
                    disabled={isDelete}
                    className="!w-[221px]"
                    triggerClassName={errors.us_dept_id ? "!border-red-500" : "!border-[#a2a2a2]"}
                    searchable={true}
                  />
                  {errors.us_dept_id && <div className="text-red-500 text-xs mt-1">{errors.us_dept_id}</div>}
                </div>

                {/* ฝ่ายย่อย */}
                <div>
                  <DropDown
                    label="ฝ่ายย่อย"
                    items={sectionOptions || []}
                    value={selectedSection}
                    onChange={handleSectionChange}
                    placeholder="ประเภทฝ่ายย่อย"
                    className="!w-[221px]"
                    triggerClassName={errors.us_sec_id ? "!border-red-500" : "!border-[#a2a2a2]"}
                    searchable={true}
                    disabled={filteredSections.length === 0 || isDelete}
                  />
                  {errors.us_sec_id && <div className="text-red-500 text-xs mt-1">{errors.us_sec_id}</div>}
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div>
              <h3 className="text-[000000] font-medium text-[18px]">บัญชี</h3>
              <div className="font-medium text-[#858585] mb-3 text-[16px]">รายละเอียดบัญชีของผู้ใช้</div>
              <div className="font-medium text-[000000] mb-2 text-[16px]">ชื่อผู้ใช้ (ล็อกอิน)</div>
              <div>
                <div className={`w-[221px] h-[46px] border rounded-[16px] px-2 flex items-center gap-2 
                  ${errors.us_username ? "border-red-500" : "border-[#a2a2a2]"} 
                  ${isDelete ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <span className="text-black"><Icon icon="mdi:user" width="28" height="28" /></span>
                  <input
                    name="us_username"
                    placeholder="ชื่อผู้ใช้"
                    value={formDataObject.us_username}
                    onChange={handleChange}
                    readOnly={isDelete}
                    className="flex-1 min-w-0 text-[16px] font-normal text-black placeholder:text-[#CDCDCD] bg-transparent outline-none"
                  />
                </div>
                {errors.us_username && <div className="text-red-500 text-xs mt-1">{errors.us_username}</div>}
              </div>
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handle}
              disabled={deleting}
              className={`px-8 py-3 rounded-full shadow text-white cursor-pointer ${typeform === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-blue-400 hover:bg-blue-500"
                }`}
            >
              {typeform === "delete" ? "ปิดการใช้งาน" : typeform === "add" ? "เพิ่มบัญชีผู้ใช้" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>

      <AlertDialog open={isEditAlertOpen} onOpenChange={setIsEditAlertOpen} title="ยืนยันการแก้ไข" description="คุณแน่ใจหรือไม่ว่าต้องการบันทึกการเปลี่ยนแปลงนี้" tone="warning" onConfirm={handleConfirmEdit} confirmText="ยืนยัน" cancelText="ยกเลิก" />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen} title="ยืนยันการปิดการใช้งาน" description="คุณแน่ใจหรือไม่ว่าต้องการปิดใช้งานบัญชีผู้ใช้นี้" tone="danger" onConfirm={handleConfirmDelete} confirmText="ยืนยัน" cancelText="ยกเลิก" />
      <AlertDialog open={isAddAlertOpen} onOpenChange={setIsAddAlertOpen} title="ยืนยันการเพิ่มบัญชีผู้ใช้" description="คุณแน่ใจหรือไม่ว่าต้องการเพิ่มบัญชีผู้ใช้ใหม่" tone="warning" onConfirm={handleConfirmAdd} confirmText="ยืนยัน" cancelText="ยกเลิก" />
    </div>
  );
}