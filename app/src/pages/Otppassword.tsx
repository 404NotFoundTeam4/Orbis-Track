// ถ้า Login.tsx อยู่ใน pages/
import { useState } from "react";
/** หน้าเข้าสู่ระบบตามภาพตัวอย่าง */
export function Otppassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden flex items-center justify-center">
      <div className=" absolute -top-[220px] -left-[200px] ">
        <svg
          width="1183"
          height="1162"
          viewBox="0 0 1183 1162"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
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
              <stop stop-color="#91D5FF" />
              <stop offset="0.225" stop-color="#C8EAFF" />
              <stop offset="0.538462" stop-color="white" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute top-[221px] left-[144px] w-[663px] h-[543px] bg-sky-300/50 rounded-full blur-[200px]"></div>
      <div className="absolute top-[402px] left-[612px] w-[532px] h-[435px] bg-[#D7ABFF]/50 rounded-full blur-[200px]"></div>
      <div className="absolute bottom-20 right-2 w-[450px] h-[450px] bg-[#5292FF]/40 rounded-full blur-[200px]"></div>

      <div
        className="backdrop-blur-lg bg-opacity-40 border-white/30 
shadow-[inset_-8px_0_15px_rgba(0,0,0,0.04)] rounded-[100px] p-10 w-[844px] h-auto flex flex-col items-center justify-center border-2 "
      >
        <h2 className="text-2xl font-bold text-[64px] text-sky-500">ลืมรหัสผ่าน ?</h2>
        <p className="text-[#8C8C8C] text-[32px] font-normal mt-2 ">
          กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
        </p>
      
      <form action="">
        {/* ช่องกรอกอีเมล */}
        <div className="mb-4">
          <label className="text-gray-700 text-sm font-regular text-[32px]">อีเมล</label>
          <div className="flex mt-1">
            <input
              type="email"
              placeholder="example@gmail.com"
              className="flex-1 rounded-full border border-gray-300 bg-white/60 backdrop-blur-sm 
              px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="bg-sky-500 hover:bg-sky-600 text-white  font-medium px-5 rounded-full transition">
              ขอ OTP
            </button>
          </div>
        </div>

        {/* ช่องกรอก OTP */}
        <div className="mb-6">
          <label className="text-gray-700  font-regular text-[32px]">กรอก OTP</label>
          <input
            type="text"
            placeholder="OTP"
            className="w-full border border-gray-300 rounded-full px-4 py-2 bg-white/60 backdrop-blur-sm 
            focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-800 placeholder-gray-400 mt-1"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {/* ปุ่มยืนยัน */}
        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-full transition">
          ยืนยัน
        </button>

        {/* ปุ่มกลับ */}
        <button className="mt-4 text-gray-500 text-sm hover:text-sky-500 transition flex items-center justify-center gap-1 mx-auto">
          <span>←</span> กลับไปหน้าเข้าสู่ระบบ
        </button>
      </form>
      </div>
    </div>
  );
}

export default Otppassword;
