import  { useState } from "react";
import { Link ,useLocation } from "react-router-dom";
import {verify} from "../hooks/Verify.js"
import { Icon } from "@iconify/react";
export function Resetpassword() {
  const { ResetPassword} = verify();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfrimPassword, setConfrimPassword] = useState(false);
   const location = useLocation();
  const email = location.state?.email || ""; 
  // ตรวจเงื่อนไขความปลอดภัย
  const validations = {
    length: password.length >= 12 && password.length <= 16,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_\-+=<>?{}]/.test(password),
    noThai: !/[ก-๙]/.test(password),
  };

  const allValid = Object.values(validations).every(Boolean);
  const match = password && password === confirm;

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden flex flex-col">
      {/* ==== พื้นหลัง ==== */}
      <div className="absolute -top-[220px] -left-[200px]">
        <svg
          width="1183"
          height="1162"
          viewBox="0 0 1183 1162"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M417.274 75.2522C490.743 46.3708 557.552 -0.469721 637.901 0.819746C726.567 2.24268 812.512 38.7538 895.535 82.9275C998.757 137.848 1154.51 167.638 1180.17 289.338C1207.93 421.063 1014.06 479.614 1006.86 610.987C999.091 752.653 1180.77 888.308 1140.15 1019.48C1103.72 1137.1 950.249 1147.06 836.761 1160.18C735.418 1171.9 635.961 1118.73 533.93 1089.56C437.839 1062.09 340.469 1050.34 253.198 993.353C155.87 929.801 30.454 863.233 4.54279 743.892C-22.3482 620.038 88.2656 528.281 127.805 415.82C156.643 333.796 152.463 233.682 206.115 170.559C258.475 108.956 344.186 103.984 417.274 75.2522Z"
            fill="url(#paint0_linear_183342_133157)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_183342_133157"
              x1="417.897"
              y1="66.0808"
              x2="853.545"
              y2="1192.81"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#91D5FF" />
              <stop offset="0.225" stopColor="#C8EAFF" />
              <stop offset="0.538462" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* วงกลมพื้นหลังเบลอ */}
      <div className="absolute top-[221px] left-1/12 w-[663px] h-[543px] bg-sky-300/50 rounded-full blur-[200px]"></div>
      <div className="absolute top-[121px] left-[1244px] w-[663px] h-[543px] bg-sky-300/20 rounded-full blur-[200px]"></div>
      <div className="absolute top-[702px] left-[212px] w-[532px] h-[435px] bg-[#D7ABFF]/50 rounded-full blur-[200px]"></div>
      <div className="absolute top-[702px] left-3/5 w-[532px] h-[435px] bg-[#D7ABFF]/50 rounded-full blur-[200px]"></div>
      <div className="absolute bottom-20 left-3/5 top-5 w-[450px] h-[450px] bg-[#5292FF]/40 rounded-full blur-[200px]"></div>

      {/* ==== ส่วนหัวโลโก้ ==== */}
      <div className="z-10 ml-[66px] mt-[67px] relative flex gap-[29px] items-center">
        <Icon
          icon="streamline-plump-color:wrench-circle-flat"
          width="96"
          height="96"
        />
        <div>
          <h1 className="font-roboto font-semibold text-[64px]">Obis Track</h1>
          <p className="font-roboto font-regular text-[32px]">
            ระบบบริหารการยืม - คืน และแจ้งซ่อมอุปกรณ์ภายในองค์กร
          </p>
        </div>
      </div>

      {/* ==== กล่องฟอร์มอยู่กลางจอ ==== */}
      <div className="flex flex-1 justify-center items-center mt-16">
        <div className="">
        
          <Link
            to="/login"
            className="text-[#8C8C8C] text-sm mb-5 hover:underline flex gap-3 text-[24px] items-center cursor-pointer z-10"
          >
            <Icon
              icon="weui:arrow-outlined"
              width="20"
              height="44"
              className="rotate-180 mt-1"
            />
            <p className="text-[32px] ">กลับไปสู่หน้าเข้าสู่ระบบ</p>
          </Link>

          {/* Info box */}
          <div className="border border-gray-300 bg-white/60 rounded-lg p-4 mb-6">
            <p className="text-[32px] text-gray-700 mb-1">คำอธิบาย</p>
            <p className="text-[32px] text-gray-600">
              เพื่อความปลอดภัยของบัญชี
              กรุณาตั้งรหัสผ่านใหม่ที่แตกต่างจากรหัสผ่านเดิม
            </p>
            <p className="mt-3 text-[32px] text-gray-500">
              คำแนะนำเพิ่มเติม (Optional):
            </p>
            <ul className="text-[32px] text-gray-500 list-disc list-inside">
              <li>
                หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น วันเกิด หรือเบอร์โทรศัพท์
              </li>
              <li>ใช้รหัสผ่านที่ไม่ซ้ำกับระบบอื่น</li>
              <li>จดรหัสผ่านไว้เป็นความลับ และไม่บอกผู้อื่น</li>
            </ul>
          </div>

          {/* Input password */}
          <div className="mb-5">
            <label className="block text-gray-700 text-[32px] mb-1">
              รหัสผ่านใหม่
            </label>
            <div className="relative flex items-center w-full h-[76px] rounded-full bg-white border border-[#A2A2A2] px-6">
              <Icon
                icon="solar:key-bold"
                width="27"
                height="27"
                className="mr-3"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                className="w-full focus:ring-sky-400 focus:outline-none text-[32px] h-full pr-[50px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* 👁 ปุ่มแสดงรหัส */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 text-gray-500  z-10 cursor-pointer"
              >
                <Icon
                  icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                  width="32"
                  height="32"
                />
              </button>
            </div>
          </div>

          {/* Validation rules */}
          <div className="text-[32px] text-gray-600 mb-5">
            <p className={`${ allValid && match?"text-[#73D13D]":"text-[#40A9FF]"} font-medium mb-2`}>
              กรุณาเพิ่มอักขระที่จำเป็นทั้งหมดเพื่อสร้างรหัสผ่านที่ปลอดภัย
            </p>
            <ul className="space-y-1">
              <li
                className={
                  validations.length ? "text-[#73D13D]" : "text-[#CDCDCD]"
                }
              >
                • อักษรขั้นต่ำ 12 – 16 ตัวอักษร
              </li>
              <li
                className={
                  validations.upper ?"text-[#73D13D]" : "text-[#CDCDCD]"
                }
              >
                • อักษรตัวใหญ่อย่างน้อย 1 ตัว
              </li>
              <li
                className={
                  validations.lower ? "text-[#73D13D]" : "text-[#CDCDCD]"
                }
              >
                • อักษรตัวเล็กอย่างน้อย 1 ตัว
              </li>
              <li
                className={
                  validations.special ? "text-[#73D13D]" : "text-[#CDCDCD]"
                }
              >
                • อักษรพิเศษอย่างน้อย 1 ตัว เช่น *()_-=+{}
              </li>
              <li
                className={
                  validations.number ? "text-[#73D13D]" : "text-[#CDCDCD]"
                }
              >
                • ตัวเลขอย่างน้อย 1 ตัว
              </li>
              <li
                className={
                  validations.noThai ? "text-[#73D13D]" : "text-[#CDCDCD]"
                }
              >
                • ห้ามมีการเว้นวรรค
              </li>
            </ul>
          </div>

          {/* Confirm password */}
          <div className="mb-8">
            <label className="block text-gray-700 text-[32px] mb-1 ">
              ยืนยันรหัสผ่านใหม่
            </label>
             <div className="relative flex items-center w-full h-[76px] rounded-full bg-white border border-[#A2A2A2] px-6">
              <Icon
                icon="solar:key-bold"
                width="27"
                height="27"
                className="mr-3"
              />

              <input
                type={showConfrimPassword ? "text" : "password"}
                placeholder=" "
                className="w-full focus:ring-sky-400 focus:outline-none text-[32px] h-full pr-[50px]"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              {/* 👁 ปุ่มแสดงรหัส */}
              <button
                type="button"
                onClick={() => setConfrimPassword(!showConfrimPassword)}
                className="absolute right-6 text-gray-500  z-10 cursor-pointer"
              >
                <Icon
                  icon={showConfrimPassword ? "mdi:eye-off" : "mdi:eye"}
                  width="32"
                  height="32"
                />
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-center">
            <button
              className={`w-[225px] h-[76px] py-2 rounded-full text-white font-bold text-[32px]  transition ${
                allValid && match
                  ? "bg-sky-500 hover:bg-sky-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!allValid || !match}
              onClick={()=>ResetPassword(email,password,confirm )}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Resetpassword;
