import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { AlertDialog } from "../components/AlertDialog";
import { useToast } from "../components/Toast";
import { usersService } from '../services/ProfileService';

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
  placeholder
}: any) => (
  <div className="flex flex-col gap-1.5 relative"> {/* เพิ่ม relative ที่นี่ */}
    <label className="text-[16px] font-regular text-black">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      )}
      <input 
        name={name}
        type={type}
        value={value || ''} 
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || label}
        className={`${width} h-[46px] ${icon ? 'pl-11 pr-4' : 'px-4'} rounded-[16px] border transition-all focus:outline-none focus:ring-2 
          ${disabled 
            ? 'bg-white border-[#A2A2A2] text-[#CDCDCD] cursor-not-allowed' 
            : error 
              ? 'border-red-500 focus:ring-red-100 text-black' 
              : 'border-[#A2A2A2] focus:ring-blue-100 text-black'}`}
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
const ValidationItem = ({ text, isValid }: { text: string; isValid: boolean }) => (
  <div className="flex items-center gap-3 mb-2 transition-colors duration-300">
    <div className={`w-2.5 h-2.5 rounded-full ${isValid ? 'bg-[#52C41A]' : 'bg-[#CDCDCD]'}`} />
    <span className={`text-[14px] ${isValid ? 'text-[#52C41A]' : 'text-[#CDCDCD]'}`}>{text}</span>
  </div>
);


// --- Main Component ---

const Profile: React.FC = () => {
  const [phoneError, setPhoneError] = useState("");
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  const [profileData, setProfileData] = useState<any>({
    us_firstname: '', us_lastname: '', us_phone: '', us_emp_code: '',
    us_email: '', us_dept_name: '', us_sec_name: '', us_role: '', us_images: '', us_username: ''
  });

  const [passwordForm, setPasswordForm] = useState({
  old_password: '', // ผู้ใช้พิมพ์รหัสปัจจุบันที่นี่
  new_password: '',       // ผู้ใช้พิมพ์รหัสใหม่ที่นี่
  confirm_password: ''    // ยืนยันรหัสใหม่
});

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Password Validation Logic (Real-time) ---
  const validations = {
    length: passwordForm.new_password.length >= 12 && passwordForm.new_password.length <= 16,
    upper: /[A-Z]/.test(passwordForm.new_password),
    lower: /[a-z]/.test(passwordForm.new_password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordForm.new_password),
    number: /[0-9]/.test(passwordForm.new_password),
    noSpace: !/\s/.test(passwordForm.new_password) && passwordForm.new_password.length > 0
  };

  const allValid = Object.values(validations).every(Boolean);


  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

const fetchProfile = async () => {
  try {
    const userData = await usersService.getProfile();
    const data = userData.data || userData;

    setProfileData({
      ...data,

      // แปลงตำแหน่ง
      us_role: data.us_role ? data.us_role.toLowerCase() : '',
      us_dept_name: data.us_dept_name ? data.us_dept_name.replace(/.*แผนก\s*/g, ' ') : '',

      // ฝ่ายย่อย ใช้เดิม
      us_sec_name: data.us_sec_name
        ? data.us_sec_name.replace(/.*ฝ่ายย่อย\s*/g, '')
        : '',
    });

    setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
formData.append('us_phone', profileData.us_phone);
if (selectedFile) {
    // ต้องเป็น 'images' ให้ตรงกับที่ระบุใน Router
    formData.append('images', selectedFile); 
}
      
      await usersService.updateProfile(formData);
      
      push({ tone: "success", message: "บันทึกข้อมูลสำเร็จ!" });
      await fetchProfile(); 
    } catch (error) {
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการบันทึก" });
    }
};

const handleUpdatePassword = async () => {
    try {
      //  Map คีย์ให้ตรงกับ Backend (oldPassword, newPassword, confirmPassword)
      const payload = {
        oldPassword: passwordForm.old_password,     // ส่งค่าจาก old_password ไปยังคีย์ oldPassword
        newPassword: passwordForm.new_password,     // ส่งค่าจาก new_password ไปยังคีย์ newPassword
        confirmPassword: passwordForm.confirm_password,
      };
      
      await usersService.updatePassword(payload);
      push({ tone: "success", message: "เปลี่ยนรหัสผ่านสำเร็จ!" });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      push({ tone: "danger", message: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
    }
};
  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] p-8 flex flex-col items-center">
      <div className="w-full max-w-[1663px]">
        {/* Header Section */}
        <div className="mb-[18px]">
          <span className="text-sm text-black">การตั้งค่าโปรไฟล์</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-[21px]">การตั้งค่าโปรไฟล์</h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-[19px]">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-[120px] h-[46px] rounded-full font-medium transition-all ${
              activeTab === 'profile' ? 'bg-[#1890FF] text-white' : 'bg-white border border-black text-black'
            }`}
          >
            โปรไฟล์
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`w-[120px] h-[46px] rounded-full font-medium transition-all ${
              activeTab === 'password' ? 'bg-[#1890FF] text-white' : 'bg-white border border-black text-black'
            }`}
          >
            รหัสผ่าน
          </button>
        </div>

        {/* Content Card */}
        <div className="w-full min-h-[501px] bg-white rounded-[16px] p-12 shadow-sm border border-gray-100 flex flex-col items-center">
          
          {activeTab === 'profile' ? (
            /* --- Tab Profile --- */
            <>
              <div className="w-full flex flex-col lg:flex-row gap-16 items-start justify-center">
                {/* ส่วนซ้าย: รูปภาพ */}
                <div className="flex flex-col items-center gap-5 shrink-0">
                  <div className="w-[184px] h-[184px] rounded-full overflow-hidden bg-[#F3F4F6] border border-black flex items-center justify-center">
                    {previewUrl || profileData.us_images ? (
                      <img 
                        src={previewUrl || profileData.us_images} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-gray-400">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 flex items-center justify-center gap-2 text-[14px] border border-[#A2A2A2] rounded-full hover:bg-gray-50">
                    <Plus size={16} /> {profileData.us_images ? 'เปลี่ยนรูปภาพ' : 'เพิ่มรูปภาพ'}
                  </button>
                </div>

                {/* ส่วนขวา: ข้อมูลโปรไฟล์ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-[23px] max-w-[720px]">
                  <InputField label="ชื่อ" name="us_firstname" value={profileData.us_firstname} disabled={true} />
                  <InputField label="นามสกุล" name="us_lastname" value={profileData.us_lastname} disabled={true} />
                  <InputField label="เบอร์โทรศัพท์" name="us_phone" value={profileData.us_phone} onChange={handleChange} error={phoneError}/>
                  <InputField label="รหัสพนักงาน" name="us_emp_code" value={profileData.us_emp_code} disabled={true} />
                  <InputField label="อีเมล" name="us_email" value={profileData.us_email} disabled={true} />
                  <div className="hidden lg:block"></div>
                  <InputField label="ตำแหน่ง" name="us_role" value={profileData.us_role} disabled={true} />
                  <InputField label="แผนก" name="us_dept_name" value={profileData.us_dept_name} disabled={true} />
                  <InputField label="ฝ่ายย่อย" name="us_sec_name" value={profileData.us_sec_name} disabled={true} />
                </div>
              </div>

              <div className="mt-16 flex justify-center w-full">
            <button 
              onClick={() => setIsSaveDialogOpen(true)} 
              disabled={profileData.us_phone.length < 10} // ✅ กดไม่ได้ถ้าไม่ครบ 10
              className={`w-[105px] h-[50px] rounded-full font-bold text-[18px] transition-all text-white
                ${profileData.us_phone.length < 10 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#40A9FF] hover:bg-[#1890FF] active:scale-95'}`}
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
                  <p >คำอธิบาย</p>
                  <p >เพื่อความปลอดภัยของบัญชี กรุณาตั้งรหัสผ่านใหม่ที่แตกต่างจากรหัสผ่านเดิม</p>
                  <p className="mt-4 ">คำแนะนำเพิ่มเติม (Optional):</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1 ">
                    <li>หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น วันเกิด หรือเบอร์โทรศัพท์</li>
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
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C9.06087 0 10.0783 0.421427 10.8284 1.17157C11.5786 1.92172 12 2.93913 12 4C12 5.06087 11.5786 6.07828 10.8284 6.82843C10.0783 7.57857 9.06087 8 8 8C6.93913 8 5.92172 7.57857 5.17157 6.82843C4.42143 6.07828 4 5.06087 4 4C4 2.93913 4.42143 1.92172 5.17157 1.17157C5.92172 0.421427 6.93913 0 8 0ZM8 10C12.42 10 16 11.79 16 14V16H0V14C0 11.79 3.58 10 8 10Z" fill="black"/>
                      </svg>
                    }
                  />
                  
                  <InputField 
                    label="รหัสผ่านเดิม" 
                    name="old_password" 
                    type="text"
                    onChange={handlePasswordChange} 
                    value={passwordForm.old_password}
                    width="w-full lg:w-[533px]" 
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M22.0004 8.293C22.0004 11.769 19.1704 14.587 15.6804 14.587C15.0444 14.587 13.5944 14.441 12.8894 13.855L12.0074 14.733C11.4884 15.25 11.6284 15.402 11.8594 15.652C11.9554 15.757 12.0674 15.878 12.1544 16.051C12.1544 16.051 12.8894 17.075 12.1544 18.1C11.7134 18.685 10.4784 19.504 9.06845 18.1L8.77445 18.392C8.77445 18.392 9.65545 19.417 8.92144 20.442C8.48044 21.027 7.30445 21.612 6.27545 20.588L5.24745 21.612C4.54145 22.315 3.67945 21.905 3.33745 21.612L2.45445 20.734C1.63145 19.914 2.11145 19.026 2.45445 18.684L10.0964 11.074C10.0964 11.074 9.36145 9.904 9.36145 8.294C9.36145 4.818 12.1914 2 15.6814 2C19.1714 2 22.0004 4.818 22.0004 8.293ZM15.6814 10.489C16.2647 10.4901 16.8246 10.2594 17.2379 9.84782C17.6512 9.4362 17.8841 8.8773 17.8854 8.294C17.8849 8.00509 17.8275 7.71912 17.7165 7.4524C17.6054 7.18568 17.4429 6.94345 17.2383 6.73954C17.0336 6.53562 16.7908 6.37401 16.5237 6.26393C16.2565 6.15386 15.9704 6.09747 15.6814 6.098C15.3925 6.09747 15.1064 6.15386 14.8392 6.26393C14.5721 6.37401 14.3293 6.53562 14.1246 6.73954C13.92 6.94345 13.7575 7.18568 13.6464 7.4524C13.5354 7.71912 13.478 8.00509 13.4774 8.294C13.4788 8.8773 13.7117 9.4362 14.125 9.84782C14.5383 10.2594 15.0981 10.4901 15.6814 10.489Z" fill="black"/>
                        </svg>
                        }
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M22.0004 8.293C22.0004 11.769 19.1704 14.587 15.6804 14.587C15.0444 14.587 13.5944 14.441 12.8894 13.855L12.0074 14.733C11.4884 15.25 11.6284 15.402 11.8594 15.652C11.9554 15.757 12.0674 15.878 12.1544 16.051C12.1544 16.051 12.8894 17.075 12.1544 18.1C11.7134 18.685 10.4784 19.504 9.06845 18.1L8.77445 18.392C8.77445 18.392 9.65545 19.417 8.92144 20.442C8.48044 21.027 7.30445 21.612 6.27545 20.588L5.24745 21.612C4.54145 22.315 3.67945 21.905 3.33745 21.612L2.45445 20.734C1.63145 19.914 2.11145 19.026 2.45445 18.684L10.0964 11.074C10.0964 11.074 9.36145 9.904 9.36145 8.294C9.36145 4.818 12.1914 2 15.6814 2C19.1714 2 22.0004 4.818 22.0004 8.293ZM15.6814 10.489C16.2647 10.4901 16.8246 10.2594 17.2379 9.84782C17.6512 9.4362 17.8841 8.8773 17.8854 8.294C17.8849 8.00509 17.8275 7.71912 17.7165 7.4524C17.6054 7.18568 17.4429 6.94345 17.2383 6.73954C17.0336 6.53562 16.7908 6.37401 16.5237 6.26393C16.2565 6.15386 15.9704 6.09747 15.6814 6.098C15.3925 6.09747 15.1064 6.15386 14.8392 6.26393C14.5721 6.37401 14.3293 6.53562 14.1246 6.73954C13.92 6.94345 13.7575 7.18568 13.6464 7.4524C13.5354 7.71912 13.478 8.00509 13.4774 8.294C13.4788 8.8773 13.7117 9.4362 14.125 9.84782C14.5383 10.2594 15.0981 10.4901 15.6814 10.489Z" fill="black"/>
                        </svg>
                        }
                    />
                                
                    <div className="mt-4">
                      <p className='text-[#F74E57] text-[14px] font-medium mb-3'>
                        กรุณาเพิ่มอักขระที่จำเป็นทั้งหมดเพื่อสร้างรหัสผ่านที่ปลอดภัย
                      </p>
                      <div className="flex flex-col pl-1">
                        <ValidationItem text="อักขระขั้นต่ำ 12 - 16 ตัวอักษร" isValid={validations.length} />
                        <ValidationItem text="อักขระตัวใหญ่อย่างน้อย 1 ตัว" isValid={validations.upper} />
                        <ValidationItem text="อักขระตัวเล็กอย่างน้อย 1 ตัว" isValid={validations.lower} />
                        <ValidationItem text="อักขระพิเศษอย่างน้อย 1 ตัว  & * ( ) - _ = + { } ;" isValid={validations.special} />
                        <ValidationItem text="ตัวเลขอย่างน้อย 1 ตัว" isValid={validations.number} />
                        <ValidationItem text="ห้ามมีการเว้นวรรค" isValid={validations.noSpace} />
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M22.0004 8.293C22.0004 11.769 19.1704 14.587 15.6804 14.587C15.0444 14.587 13.5944 14.441 12.8894 13.855L12.0074 14.733C11.4884 15.25 11.6284 15.402 11.8594 15.652C11.9554 15.757 12.0674 15.878 12.1544 16.051C12.1544 16.051 12.8894 17.075 12.1544 18.1C11.7134 18.685 10.4784 19.504 9.06845 18.1L8.77445 18.392C8.77445 18.392 9.65545 19.417 8.92144 20.442C8.48044 21.027 7.30445 21.612 6.27545 20.588L5.24745 21.612C4.54145 22.315 3.67945 21.905 3.33745 21.612L2.45445 20.734C1.63145 19.914 2.11145 19.026 2.45445 18.684L10.0964 11.074C10.0964 11.074 9.36145 9.904 9.36145 8.294C9.36145 4.818 12.1914 2 15.6814 2C19.1714 2 22.0004 4.818 22.0004 8.293ZM15.6814 10.489C16.2647 10.4901 16.8246 10.2594 17.2379 9.84782C17.6512 9.4362 17.8841 8.8773 17.8854 8.294C17.8849 8.00509 17.8275 7.71912 17.7165 7.4524C17.6054 7.18568 17.4429 6.94345 17.2383 6.73954C17.0336 6.53562 16.7908 6.37401 16.5237 6.26393C16.2565 6.15386 15.9704 6.09747 15.6814 6.098C15.3925 6.09747 15.1064 6.15386 14.8392 6.26393C14.5721 6.37401 14.3293 6.53562 14.1246 6.73954C13.92 6.94345 13.7575 7.18568 13.6464 7.4524C13.5354 7.71912 13.478 8.00509 13.4774 8.294C13.4788 8.8773 13.7117 9.4362 14.125 9.84782C14.5383 10.2594 15.0981 10.4901 15.6814 10.489Z" fill="black"/>
                        </svg>
                        }
                    />
                  </div>
                </div>

                {/* ปุ่มบันทึกย้ายมาอยู่ในคอลัมน์ขวา */}
                <div className="mt-12 flex justify-center w-full lg:w-[533px]">
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={!passwordForm.new_password || !passwordForm.confirm_password || !allValid}
                    className={`w-[105px] h-[44px] rounded-full font-bold text-[18px] transition-all 
                      ${(!passwordForm.new_password || !passwordForm.confirm_password || !allValid)
                        ? 'bg-[#D9D9D9] text-white cursor-not-allowed' 
                        : 'bg-[#1890FF] text-white hover:bg-[#1070cc] active:scale-95'}`}
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
        onOpenChange={(open) => { if (!open) setIsSaveDialogOpen(false); }}
        className="border-[1px] border-[#858585] rounded-[42px] h-[392px]"
        width={728}
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