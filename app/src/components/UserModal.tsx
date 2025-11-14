/**
 * Description: UserModal Component สำหรับแสดงฟอร์ม เพิ่ม/แก้ไข/ลบ ผู้ใช้ในระบบ
 * Input     :
 *   - typeform: กำหนดประเภทฟอร์ม ("add" | "edit" | "delete")
 * Note      :  ประเภทฟอร์มแต่ละอันจะมีการแสดงข้อมูลหรือปุ่มที่ไม่เหมือนกัน
 * Author    : Worrawat Namwat (Wave) 66160372,บูม(ใส่ชื่อด้วย),ตัง(ใส่ชื่อด้วย)
 */
import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import api from "../api/axios.js";
import DropDown from "./DropDown.js";
import { AlertDialog } from "./AlertDialog.js";
import { useToast } from "./Toast";

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
  us_sec_id: number;
  us_is_active: boolean;
  us_dept_name: string;
  us_sec_name: string;
};

type IUserModalProps = {
  typeform?: "add" | "edit" | "delete";
  user?: IUserApiData | null; //ข้อมูล user (สำหรับโหมด edit) ที่รับมาจาก props
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
  us_role: "", // default
  us_dept_id: 0,
  us_sec_id: 0,
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
  // ถ้ามี 'user' (โหมด edit) ให้ใช้ข้อมูล 'user' นั้น
  // ในการกำหนดค่าเริ่มต้นของ formDataObject
  const [formDataObject, setFormDataObject] = useState<IUserApiData>(
    user ? { ...defaultFormDataObject, ...user } : defaultFormDataObject
  );

  const [newImageFile, setNewImageFile] = useState<File | null>(null); //State สำหรับเก็บ 'ไฟล์' รูปใหม่ กรณีมีการแก้ไขรูปภาพ
  const [formOutput, setFormOutput] = useState<Partial<IUserApiData>>({});
  const toast = useToast();
  const [isEditAlertOpen, setIsEditAlertOpen] = useState(false); // State สำหรับควบคุม Dialog ยืนยัน 'การแก้ไข'

  /**
   * Description: (Handler) ยืนยันการแก้ไขข้อมูล (โหมด 'edit') สร้าง FormData และส่ง API (PATCH)
   * Input: -
   * Output: - (void, async)
   * Author:Worrawat Namwat (Wave) 66160372
   */
  const handleConfirmEdit = async () => {
    // ฟังก์ชันที่ทำงานหลังจากกดยืนยัน 'แก้ไข' ใน Dialog
    const formDataPayload = new FormData();

    // เพิ่มข้อมูล Text fields ลงใน FormData
    formDataPayload.append("us_firstname", formDataObject.us_firstname);
    formDataPayload.append("us_lastname", formDataObject.us_lastname);
    formDataPayload.append("us_username", formDataObject.us_username);
    formDataPayload.append("us_email", formDataObject.us_email);
    formDataPayload.append("us_phone", formDataObject.us_phone);
    formDataPayload.append("us_role", formDataObject.us_role);
    formDataPayload.append("us_dept_id", String(formDataObject.us_dept_id));
    formDataPayload.append("us_sec_id", String(formDataObject.us_sec_id));
    formDataPayload.append("us_is_active", String(formDataObject.us_is_active));
    formDataPayload.append("us_emp_code", formDataObject.us_emp_code); // Author:Worrawat Namwat (Wave) 66160372
    // Logic การจัดการรูปภาพตอน 'แก้ไข' (ส่วนที่อาจทำให้สับสน)
    if (newImageFile) {
      //ถ้ามีไฟล์ใหม่ (อัปโหลดใหม่) ให้ใช้ไฟล์ใหม่
      formDataPayload.append("us_images", newImageFile);
    } else if (formDataObject.us_images && !newImageFile) {
      //ถ้าไม่มีไฟล์ใหม่ แต่มี URL รูปภาพ (คือไม่ได้เปลี่ยนรูป) ให้ส่ง URL เดิมไป (เพื่อให้ backend รู้ว่ายังใช้รูปเดิม)
      if (!formDataObject.us_images.startsWith("blob:")) {
        //เช็คว่าไม่ใช่ URL ชั่วคราว (blob:) ที่สร้างจากการ preview
        formDataPayload.append("us_images", formDataObject.us_images);
      }
    }

    try {
      //ส่ง Request (PATCH)
      const res = await api.patch(
        `/accounts/${formDataObject.us_id}`,
        formDataPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ PATCH Response:", res.data);
      // จัดการ Response
      if (res.data?.success) {
        toast.push({ message: "การแก้ไขสำเร็จ!", tone: "confirm" });

        // เรียก onSubmit เพื่ออัปเดต UI
        if (onSubmit) onSubmit(formDataObject);
        return;
      }

      toast.push({
        message: "เกิดข้อผิดพลาด ไม่สามารถบันทึกได้",
        tone: "danger",
      });
    } catch (err: any) {
      console.error("❌ Error (catch):", err);

      if (err.response?.data?.success) {
        toast.push({ message: "การแก้ไขสำเร็จ!", tone: "confirm" });

        if (onSubmit) onSubmit(formDataObject);
        return;
      }
      const apiErrorMessage =
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดที่ไม่รู้จัก";

      toast.push({
        message: `บันทึกไม่สำเร็จ: ${apiErrorMessage}`,
        tone: "danger",
      });
    }
  };
  /**
   * useEffect: กรองข้อมูลใน formDataObject ตาม 'keysToProcess' ที่ได้รับแล้วเก็บผลลัพธ์ไว้ใน 'formOutputData'
   * Author:Worrawat Namwat (Wave) 66160372
   */
  useEffect(() => {
    let filteredDataObject: Partial<IUserApiData> = {};

    if (keyvalue === "all") {
      filteredDataObject = { ...formDataObject };
    } else {
      // (เพิ่ม 'else' ที่หายไป)
      keyvalue.forEach((keyName) => {
        (filteredDataObject as any)[keyName] = formDataObject[keyName];
      });
    }
    setFormOutput(filteredDataObject);
  }, [formDataObject, keyvalue]);

  /**
   * Description: (Handler) จัดการการเปลี่ยนแปลงค่าใน <input> และ <select>(มี logic พิเศษสำหรับ reset 'us_sec_id' เมื่อ 'us_dept_id' เปลี่ยน)
   * Input: (changeEvent: React.ChangeEvent<...>) Event จากการเปลี่ยนแปลง
   * Output: - (void)
   * Author:Worrawat Namwat (Wave) 66160372
   */
  const handleChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = changeEvent.target;

    if (name === "us_dept_id") {
      setFormDataObject((prev) => ({
        ...prev,
        us_dept_id: parseInt(value, 10) || 0,
        us_sec_id: 0, // รีเซ็ตฝ่ายย่อย เมื่อแผนกเปลี่ยน
      }));
    } else if (name === "us_sec_id") {
      setFormDataObject((prev) => ({
        ...prev,
        us_sec_id: parseInt(value, 10) || 0,
      }));
    } else {
      setFormDataObject((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Description: (Handler) จัดการการอัปโหลดไฟล์รูปภาพ Avatar
   *             สร้าง URL (blob) สำหรับ Preview และเก็บ File object ไว้ใน state
   * Input: (fileChangeEvent: React.ChangeEvent<...>) Event จาก <input type="file">
   * Output: - (void)
   * Author:Worrawat Namwat (Wave) 66160372
   */
  const handleAvatarChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = changeEvent.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormDataObject((prev) => ({ ...prev, us_images: previewUrl }));

      setNewImageFile(file);
    }
  };

  /**
   * Description: (Handler) ฟังก์ชันหลักเมื่อคลิกปุ่ม "บันทึก" หรือ "ปิดการใช้งาน"
   *             - ถ้าเป็น 'edit' จะเปิด Dialog ยืนยัน (isEditAlertOpen)
   *             - ถ้าเป็น 'add'/'delete' จะเรียก onSubmit ทันที
   * Input: -
   * Output: - (void)
   * Author:Worrawat Namwat (Wave) 66160372
   */
  const handle = async () => {
    // ตรวจสอบ ถ้าเป็น 'edit' ให้เปิด Alert
    if (typeform === "edit") {
      setIsEditAlertOpen(true);
      return; // หยุดการทำงานตรงนี้
    }
    const payload = keyvalue === "all" ? formDataObject : formOutput;
    console.log(formOutput);
    if (onSubmit) onSubmit(payload);
  };

  /**
   * Description: (Handler) อัปเดต state เมื่อเลือก Role จาก DropDown
   * Input: (selectedItemData: IDropDownItemData)
   * Output: - (void)
   * Author:Worrawat Namwat (Wave) 66160372
   */
  const handleRoleChange = (selectedItem: IDropDownItemType) => {
    setFormDataObject((prev) => ({
      ...prev,
      us_role: selectedItem.value, // เก็บค่า string "Admin", "Staff" ฯลฯ
    }));
  };

  /**
   * Description: (Handler) อัปเดต state เมื่อเลือก Department (พร้อม reset Section)
   * Input: (selectedItemData: IDropDownItemData)
   * Output: - (void)
   * Author:Worrawat Namwat (Wave) 66160372
   */
  const handleDepartmentChange = (selectedItem: IDropDownItemType) => {
    setFormDataObject((prev) => ({
      ...prev,
      us_dept_id: selectedItem.value, // เก็บค่า ID (ตัวเลข)
      us_sec_id: 0, // รีเซ็ตฝ่ายย่อย
    }));
  };

  /**
   * Description: (Handler) อัปเดต state เมื่อเลือก Section
   * Input: (selectedItemData: IDropDownItemData)
   * Output: - (void)
   * Author:Worrawat Namwat (Wave) 661603720
   */
  const handleSectionChange = (selectedItem: IDropDownItemType) => {
    setFormDataObject((prev) => ({
      ...prev,
      us_sec_id: selectedItem.value, // เก็บค่า ID (ตัวเลข)
    }));
  }; // Author:Worrawat Namwat (Wave) 661603720

  // แปลง 'departmentsList' (array) ให้อยู่ในรูปแบบที่ DropDown ใช้ได้
  const departmentOptions = useMemo(() => {
    return departmentsList.map((dept) => ({
      id: dept.dept_id,
      label: dept.dept_name,
      value: dept.dept_id, // เราเก็บ ID ลงใน value
    }));
  }, [departmentsList]);

  // (Section Options) - กรองก่อนแล้วค่อยแปลง
  //  ใช้ useMemo กรอง 'sectionsList' ให้เหลือเฉพาะที่ตรงกับ 'us_dept_id' ที่เลือก
  const filteredSections = useMemo(() => {
    if (!formDataObject.us_dept_id) return [];
    return sectionsList.filter(
      (sec) => sec.sec_dept_id === formDataObject.us_dept_id
    );
  }, [formDataObject.us_dept_id, sectionsList]);

  //  ใช้ useMemo แปลง 'filteredSectionsList' ให้ DropDown ใช้ได้
  const sectionOptions = useMemo(() => {
    return filteredSections.map((sec) => ({
      id: sec.sec_id,
      label: sec.sec_name,
      value: sec.sec_id, // เราเก็บ ID ลงใน value
    }));
  }, [filteredSections]);

  const selectedRole =
    rolesList.find((option) => option.value === formDataObject.us_role) ||
    undefined;

  const selectedDepartment =
    departmentOptions.find(
      (option) => option.id === formDataObject.us_dept_id
    ) || undefined;

  const selectedSection =
    sectionOptions.find((option) => option.id === formDataObject.us_sec_id) ||
    undefined;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="relative bg-white rounded-[24px] p-8 w-[804px] max-w-[95%] shadow-2xl border border-[#858585] flex flex-col">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          <Icon
            icon="ph:x-circle"
            width="35px"
            height="35px"
            className="text-black hover:text-black"
          />
        </button>

        {/* หัวข้อ */}
        <h2 className="text-center mb-6 text-[32px] font-bold font-roboto">
          {typeform === "edit" ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้"}
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border border-[#a2a2a2] flex items-center justify-center overflow-hidden bg-gray-50">
            {formDataObject.us_images ? (
              <img
                src={formDataObject.us_images}
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
          onSubmit={(changeEvent) => changeEvent.preventDefault()}
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
                value={formDataObject.us_firstname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_lastname"
                placeholder="นามสกุล"
                value={formDataObject.us_lastname}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_emp_code"
                placeholder="รหัสพนักงาน"
                value={formDataObject.us_emp_code}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_email"
                placeholder="อีเมล"
                value={formDataObject.us_email}
                onChange={handleChange}
                className="w-[221px] h-[46px] border rounded-[16px] px-4 
               text-[16px] font-normal text-black 
               placeholder:text-[#CDCDCD] border-[#a2a2a2]"
              />
              <input
                name="us_phone"
                placeholder="เบอร์โทรศัพท์"
                value={formDataObject.us_phone}
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
                items={rolesList}
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
                value={formDataObject.us_username}
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
              className={`px-8 py-3 rounded-full shadow text-white cursor-pointer ${
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
      <AlertDialog //Dialog ยืนยัน (สำหรับโหมด 'edit' เท่านั้น)จะแสดงเมื่อ isEditAlertOpen เป็น true
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
