/**
 * Page: Profile
 * Features:
 *  - UI หน้าโปรไฟล์ผู้ใช้
 *
 * Author: Niyada Butchan (Da) 66160361
 */
import React, { useState, useEffect, useRef } from "react";
import { AlertDialog } from "../components/AlertDialog";
import { useToast } from "../components/Toast";
import { usersService } from "../services/ProfileService";
import getImageUrl from "../services/GetImage.js";
import { Icon } from "@iconify/react";
import { getAccount } from "../hooks/useAccount.js";

/**
 * InputField Component
 * Description: คอมโพเนนต์อินพุตฟิลด์ที่ปรับแต่งได้ พร้อมรองรับการแสดงไอคอนและข้อความแสดงข้อผิดพลาด
 * Input      : label, name, value, onChange, disabled, type, width, icon, error, placeholder
 * Output     : อินพุตฟิลด์ที่มีการจัดรูปแบบและฟีเจอร์ตามที่กำหนด
 * Author     : Niyada Butchan (Da) 66160361
 */
const InputField = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  type = "text",
  width = "w-[221px]",
  icon,
  error = "",
  placeholder,
}: any) => (
  <div className="flex flex-col gap-1.5 relative">
    {" "}
    {/* เพิ่ม relative ที่นี่ */}
    <label className="text-[16px] font-regular text-black">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      )}
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || label}
        className={`${width} h-[46px] ${icon ? "pl-11 pr-4" : "px-4"} rounded-[16px] border transition-all focus:outline-none focus:ring-2 
          ${
            disabled
              ? "bg-white border-[#A2A2A2] text-[#CDCDCD] cursor-not-allowed"
              : error
                ? "border-red-500 focus:ring-red-100 text-black"
                : "border-[#A2A2A2] focus:ring-blue-100 text-black"
          }`}
      />
    </div>
    {/* ปรับให้ข้อความ Error ลอยอยู่ด้านล่าง เพื่อไม่ให้ไปขยับ Layout ส่วนอื่น */}
    {error && (
      <span className="text-red-500 text-[12px] font-regular ml-2 absolute -bottom-5 left-0 whitespace-nowrap">
        {error}
      </span>
    )}
  </div>
);

// ปรับปรุงให้รับค่า isValid เพื่อเปลี่ยนสี
const ValidationItem = ({
  text,
  isValid,
}: {
  text: string;
  isValid: boolean;
}) => (
  <div className="flex items-center gap-3 mb-2 transition-colors duration-300">
    <div
      className={`w-2.5 h-2.5 rounded-full ${isValid ? "bg-[#52C41A]" : "bg-[#CDCDCD]"}`}
    />
    <span
      className={`text-[14px] ${isValid ? "text-[#52C41A]" : "text-[#CDCDCD]"}`}
    >
      {text}
    </span>
  </div>
);

// --- Main Component ---

const Profile: React.FC = () => {
  const [phoneError, setPhoneError] = useState("");
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [profileData, setProfileData] = useState<any>({
    us_firstname: "",
    us_lastname: "",
    us_phone: "",
    us_emp_code: "",
    us_email: "",
    us_dept_name: "",
    us_sec_name: "",
    us_role: "",
    us_images: "",
    us_username: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "", // ผู้ใช้พิมพ์รหัสปัจจุบันที่นี่
    new_password: "", // ผู้ใช้พิมพ์รหัสใหม่ที่นี่
    confirm_password: "", // ยืนยันรหัสใหม่
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log(previewUrl);
  // --- Password Validation Logic (Real-time) ---
  const validations = {
    length:
      passwordForm.new_password.length >= 12 &&
      passwordForm.new_password.length <= 16,
    upper: /[A-Z]/.test(passwordForm.new_password),
    lower: /[a-z]/.test(passwordForm.new_password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      passwordForm.new_password,
    ),
    number: /[0-9]/.test(passwordForm.new_password),
    noSpace:
      !/\s/.test(passwordForm.new_password) &&
      passwordForm.new_password.length > 0,
  };

  const allValid = Object.values(validations).every(Boolean);

  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   *  handleChange
   * Description: จัดการการเปลี่ยนแปลงในฟิลด์อินพุตต่างๆ ของโปรไฟล์
   * Input      : e (React.ChangeEvent<HTMLInputElement>)
   * Output     : อัปเดตสถานะ profileData และ phoneError ตามการเปลี่ยนแปลง
   * Author     : Niyada Butchan (Da) 66160361

   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "us_phone") {
      // กรองเอาเฉพาะตัวเลข
      const numericValue = value.replace(/\D/g, "").slice(0, 10);

      // ตรวจสอบความยาวเพื่อแสดง Error (ตาม Figma)
      if (numericValue.length > 0 && numericValue.length < 10) {
        setPhoneError("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      } else {
        setPhoneError(""); // ครบ 10 หรือว่างเปล่า ให้ล้าง error
      }

      setProfileData((prev: any) => ({ ...prev, [name]: numericValue }));
    } else {
      setProfileData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * handlePasswordChange
   * Description : จัดการการเปลี่ยนแปลงค่าฟิลด์รหัสผ่าน
   * Input       : e (React.ChangeEvent<HTMLInputElement>)
   * Output      : อัปเดตสถานะ passwordForm ตามชื่อฟิลด์และค่าที่ผู้ใช้กรอก
   * Author      : Niyada Butchan (Da) 66160361
   */
  const [passwordError, setPasswordError] = useState({
  old_password: "",
  confirm_password: "",
});
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;


  setPasswordForm((prev) => ({ ...prev, [name]: value }));

  // ลบ error ของช่องที่กำลังพิมพ์
  setPasswordError((prev) => ({
    ...prev,
    [name]: "",
  }));
};

  /**
   * handleFileChange
   * Description : จัดการการเลือกไฟล์รูปภาพจาก input type="file" สำหรับรูปโปรไฟล์
   * Input       : e (React.ChangeEvent<HTMLInputElement>)
   * Output      : อัปเดตสถานะ selectedFile และ previewUrl เพื่อแสดงตัวอย่างรูปภาพ
   * Author      : Niyada Butchan (Da) 66160361
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /**
   * fetchProfile
   * Description: ดึงข้อมูลโปรไฟล์ของผู้ใช้งานจาก API
   * Input      : ไม่มี
   * Output     : ข้อมูลโปรไฟล์ของผู้ใช้งาน (us_firstname, us_lastname, us_phone, us_email, us_images)
   * Author     : Niyada Butchan (Da) 66160361
   */
  const fetchProfile = async () => {
    try {
      const userData = await usersService.getProfile();
      const data = userData.data || userData;

      const processedData = {
        ...data,

        // แปลงตำแหน่ง
        us_role: data.us_role ? data.us_role.toLowerCase() : "",
        us_dept_name: data.us_dept_name
          ? data.us_dept_name.replace(/.*แผนก\s*/g, " ")
          : "",

        // ฝ่ายย่อย
        us_sec_name: data.us_sec_name
          ? data.us_sec_name.replace(/.*ฝ่ายย่อย\s*/g, "")
          : "",
      };

      setProfileData(processedData);
      setProfile(processedData);

      await getAccount();

      setPreviewUrl(userData.data.us_images);

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  /**
   * handleSaveProfile
   * Description: รวบรวมข้อมูลจากฟอร์มเพื่อส่งไปอัปเดตโปรไฟล์ผู้ใช้งาน
   * Input      : us_phone
   * Output     : การแจ้งเตือนบนหน้าจอ (Toast/Push Notification)
   * Author     : Niyada Butchan (Da) 66160361
   */
  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("us_phone", profileData.us_phone);

      if (selectedFile) {
        formData.append("us_images", selectedFile);
      }

      await usersService.updateProfile(profileData.us_id, formData);

      push({ tone: "success", message: "บันทึกข้อมูลสำเร็จ!" });
      await fetchProfile();
    } catch (error) {
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการบันทึก" });
    }
  };

  /**
   * handleUpdatePassword
   * Description: รวบรวมข้อมูลจากฟอร์มเพื่อส่งไปอัปเดตรหัสผ่านใหม่
   * Input      : old_password, new_password, confirm_password
   * Output     : การแจ้งเตือนบนหน้าจอ (Toast/Push Notification)
   * Author     : Niyada Butchan (Da) 66160361
   */
 const handleUpdatePassword = async () => {
  try {
    // reset error ก่อนยิง API
    setPasswordError({
      old_password: "",
      confirm_password: "",
    });

    const payload = {
      oldPassword: passwordForm.old_password,
      newPassword: passwordForm.new_password,
      confirmPassword: passwordForm.confirm_password,
    };

    await usersService.updatePassword(payload);

    push({ tone: "success", message: "เปลี่ยนรหัสผ่านสำเร็จ!" });

    setPasswordForm({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });

  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "";

    // 🎯 รหัสผ่านเดิมผิด
    if (message.includes("รหัสผ่านเดิม")) {
      setPasswordError((prev) => ({
        ...prev,
        old_password: "รหัสผ่านเดิมไม่ถูกต้อง",
      }));
      return;
    }

    // 🎯 ยืนยันรหัสไม่ตรง
    if (message.includes("ยืนยันรหัสผ่าน")) {
      setPasswordError((prev) => ({
        ...prev,
        confirm_password: "รหัสผ่านใหม่และยืนยันไม่ตรงกัน",
      }));
      return;
    }

    // กรณีอื่น
    push({
      tone: "danger",
      message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
    });
  }
};

  const isProfileChanged =
    profile &&
    (profileData.us_phone !== profile.us_phone || selectedFile !== null);

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] p-8 flex flex-col items-center">
      <div className="w-full max-w-[1663px]">
        {/* Header Section */}
        <div className="mb-[18px]">
          <span className="text-sm text-black">การตั้งค่าโปรไฟล์</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-[21px]">
            การตั้งค่าโปรไฟล์
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-[19px]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-[120px] h-[46px] rounded-full font-medium transition-all ${
              activeTab === "profile"
                ? "bg-[#1890FF] text-white"
                : "bg-white border border-black text-black"
            }`}
          >
            โปรไฟล์
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`w-[120px] h-[46px] rounded-full font-medium transition-all ${
              activeTab === "password"
                ? "bg-[#1890FF] text-white"
                : "bg-white border border-black text-black"
            }`}
          >
            รหัสผ่าน
          </button>
        </div>

        {/* Content Card */}
        <div className="w-full min-h-[501px] bg-white rounded-[16px] p-12 shadow-sm border border-gray-100 flex flex-col items-center">
          {activeTab === "profile" ? (
            /* --- Tab Profile --- */
            <>
              <div className="w-full flex flex-col lg:flex-row gap-16 items-start justify-center">
                {/* ส่วนซ้าย: รูปภาพ */}
                <div className="flex flex-col items-center gap-5 shrink-0">
                  <div className="w-[184px] h-[184px] rounded-full overflow-hidden bg-[#F3F4F6] border border-black flex items-center justify-center">
                    {(previewUrl || profileData.us_images) && (
                      <img
                        src={getImageUrl(previewUrl || profileData.us_images)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 flex items-center justify-center gap-2 text-[14px] border border-[#A2A2A2] rounded-full hover:bg-gray-50"
                  >
                    <Icon icon="ic:baseline-plus" width={24} height={24} />
                    {profileData.us_images ? "เปลี่ยนรูปภาพ" : "เพิ่มรูปภาพ"}
                  </button>
                </div>

                {/* ส่วนขวา: ข้อมูลโปรไฟล์ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-[23px] max-w-[720px]">
                  <InputField
                    label="ชื่อ"
                    name="us_firstname"
                    value={profileData.us_firstname}
                    disabled={true}
                  />
                  <InputField
                    label="นามสกุล"
                    name="us_lastname"
                    value={profileData.us_lastname}
                    disabled={true}
                  />
                  <InputField
                    label="เบอร์โทรศัพท์"
                    name="us_phone"
                    value={profileData.us_phone}
                    onChange={handleChange}
                    error={phoneError}
                  />
                  <InputField
                    label="รหัสพนักงาน"
                    name="us_emp_code"
                    value={profileData.us_emp_code}
                    disabled={true}
                  />
                  <InputField
                    label="อีเมล"
                    name="us_email"
                    value={profileData.us_email}
                    disabled={true}
                  />
                  <div className="hidden lg:block"></div>
                  <InputField
                    label="ตำแหน่ง"
                    name="us_role"
                    value={profileData.us_role}
                    disabled={true}
                  />
                  <InputField
                    label="แผนก"
                    name="us_dept_name"
                    value={profileData.us_dept_name}
                    disabled={true}
                  />
                  <InputField
                    label="ฝ่ายย่อย"
                    name="us_sec_name"
                    value={profileData.us_sec_name}
                    disabled={true}
                  />
                </div>
              </div>

              <div className="mt-16 flex justify-center w-full">
                <button
                  onClick={() => setIsSaveDialogOpen(true)}
                  disabled={
                    profileData.us_phone.length < 10 || !isProfileChanged
                  }
                  className={`w-[105px] h-[50px] rounded-full font-bold text-[18px] transition-all text-white
                  ${
                    profileData.us_phone.length < 10 || !isProfileChanged
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#40A9FF] hover:bg-[#1890FF] active:scale-95"
                  }`}
                >
                  บันทึก
                </button>
              </div>
            </>
          ) : (
            /* --- Tab Password --- */
            /* ปรับโครงสร้างให้เหมือนหน้า Profile เพื่อล็อคตำแหน่ง */
            <div className="w-full flex flex-col lg:flex-row gap-16 items-start justify-center">
              {/* ส่วนขวา: ฟอร์มรหัสผ่าน */}
              <div className="flex flex-col items-start w-full max-w-[533px] font-regular text-black">
                <div className="w-full bg-white border border-black rounded-[16px] p-4 mb-8 text-[16px]">
                  <p>คำอธิบาย</p>
                  <p>
                    เพื่อความปลอดภัยของบัญชี
                    กรุณาตั้งรหัสผ่านใหม่ที่แตกต่างจากรหัสผ่านเดิม
                  </p>
                  <p className="mt-4 ">คำแนะนำเพิ่มเติม (Optional):</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1 ">
                    <li>
                      หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น วันเกิด
                      หรือเบอร์โทรศัพท์
                    </li>
                    <li>ใช้รหัสผ่านที่ไม่ซ้ำกับระบบอื่น</li>
                    <li>จดจำรหัสผ่านไว้เป็นความลับ และไม่บอกผู้อื่น</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-6 w-full">
                  <InputField
                    label="ชื่อผู้ใช้"
                    name="us_username"
                    value={profileData.us_username}
                    disabled={true}
                    width="w-full lg:w-[533px]"
                    icon={
                      <Icon icon="mynaui:user-solid" width={24} height={24} />
                    }
                  />

                  <InputField
                    label="รหัสผ่านเดิม"
                    name="old_password"
                    type="text"
                    onChange={handlePasswordChange}
                    value={passwordForm.old_password}
                    error={passwordError.old_password}
                    width="w-full lg:w-[533px]"
                    icon={<Icon icon="solar:key-bold" width={24} height={24} />}
                  />

                  <div className="flex flex-col">
                    <InputField
                      label="รหัสผ่านใหม่"
                      name="new_password"
                      type="text"
                      onChange={handlePasswordChange}
                      value={passwordForm.new_password}
                      width="w-full lg:w-[533px]"
                      icon={
                        <Icon icon="solar:key-bold" width={24} height={24} />
                      }
                    />

                    <div className="mt-4">
                      <p className="text-[#F74E57] text-[14px] font-medium mb-3">
                        กรุณาเพิ่มอักขระที่จำเป็นทั้งหมดเพื่อสร้างรหัสผ่านที่ปลอดภัย
                      </p>
                      <div className="flex flex-col pl-1">
                        <ValidationItem
                          text="อักขระขั้นต่ำ 12 - 16 ตัวอักษร"
                          isValid={validations.length}
                        />
                        <ValidationItem
                          text="อักขระตัวใหญ่อย่างน้อย 1 ตัว"
                          isValid={validations.upper}
                        />
                        <ValidationItem
                          text="อักขระตัวเล็กอย่างน้อย 1 ตัว"
                          isValid={validations.lower}
                        />
                        <ValidationItem
                          text="อักขระพิเศษอย่างน้อย 1 ตัว  & * ( ) - _ = + { } ;"
                          isValid={validations.special}
                        />
                        <ValidationItem
                          text="ตัวเลขอย่างน้อย 1 ตัว"
                          isValid={validations.number}
                        />
                        <ValidationItem
                          text="ห้ามมีการเว้นวรรค"
                          isValid={validations.noSpace}
                        />
                      </div>
                    </div>

                    <InputField
                      label="ยืนยันรหัสผ่านใหม่"
                      name="confirm_password"
                      type="text"
                      onChange={handlePasswordChange}
                      value={passwordForm.confirm_password}
                      width="w-full lg:w-[533px]"
                      icon={
                        <Icon icon="solar:key-bold" width={24} height={24} />
                      }
                    />
                  </div>
                </div>

                {/* ปุ่มบันทึกย้ายมาอยู่ในคอลัมน์ขวา */}
                <div className="mt-12 flex justify-center w-full lg:w-[533px]">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={
                      !passwordForm.new_password ||
                      !passwordForm.confirm_password ||
                      !allValid
                    }
                    className={`w-[105px] h-[44px] rounded-full font-bold text-[18px] transition-all 
                      ${
                        !passwordForm.new_password ||
                        !passwordForm.confirm_password ||
                        !allValid
                          ? "bg-[#D9D9D9] text-white cursor-not-allowed"
                          : "bg-[#1890FF] text-white hover:bg-[#1070cc] active:scale-95"
                      }`}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Profile Confirmation */}
      {isSaveDialogOpen && (
        <AlertDialog
          open={true}
          onConfirm={async () => {
            await handleSaveProfile();
            setIsSaveDialogOpen(false);
          }}
          title="คุณแน่ใจหรือไม่ว่าต้องการแก้ไขโปรไฟล์?"
        />
      )}
    </div>
  );
};

export default Profile;