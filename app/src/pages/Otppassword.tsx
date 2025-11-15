/**
 * Page: OtpPassword.
 * Features:
 *  - UI หน้าขอ OTP สำหรับผู้ใช้งาน
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
import { useState } from "react";
import { Icon } from "@iconify/react";
import { verifyEmail } from "../hooks/verifyEmail.js"
export function Otppassword() {
  const {GetOtp, SetOtp } = verifyEmail();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorOtp, setErrorOtp] = useState(false)
  const [errorEmail, setErrorEmail] = useState(false)
  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const HandleGetOtp = async () => {
    // เคลียร์ error ก่อน
    setErrorEmail(false);
    setErrorOtp(false);

    // validate email
    if (!email.trim()) {
      setErrorEmail(true);
      return;
    }

    try {
      const res = await GetOtp(email)
      setTimer(60);
      setIsCounting(true);

      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setIsCounting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorEmail(true);
    }
  };
  const Sumbit_Otp = async () => {
    setErrorEmail(false)
    setErrorOtp(false)
    let FindError = false
    if (!email.trim()) {
      setErrorEmail(true)
      FindError = true;
    }
    if (!otp.trim() || otp.trim().length != 6) {
      setErrorOtp(true)
      FindError = true
    }
    if (FindError) return;

    try {
      const res = await SetOtp(email, otp)
      setErrorOtp(!res)
    }
    catch {
      setErrorOtp(true)
    }
  }

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
      <div className="flex flex-1 justify-center items-center">
        <div
          className="z-10 backdrop-blur-lg bg-opacity-40 border-white/30 
          shadow-[inset_-8px_0_15px_rgba(0,0,0,0.04)] rounded-[100px]
          p-10 w-[844px] h-auto flex flex-col items-center justify-center border-2"
        >
          <Icon
            icon="tabler:circle-key-filled"
            width="114"
            height="114"
            className="text-[#40A9FF] pb-4"
          />
          <h2 className="text-2xl font-bold text-[64px] text-sky-500 pb-4">
            ลืมรหัสผ่าน ?
          </h2>
          <p className="text-[#8C8C8C] text-[32px] font-normal mt-2 mb-[42px]">
            กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </p>

          <form>
            {/* ช่องกรอกอีเมล */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-regular text-[32px] mb-[12px]">
                อีเมล
              </label>
              <div className="flex gap-2.5">
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className={`text-[32px] rounded-full border ${errorEmail?"border-[#F74E57]": "border-gray-300"} bg-white/60 backdrop-blur-sm 
                    px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 
                    w-[413px] h-[76px]`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isCounting}
                  onClick={() => HandleGetOtp()}
                  className={`${isCounting ? "bg-gray-400 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600"} text-white text-[32px] font-medium px-5 
                    rounded-full transition w-[173px] h-[76px]`}
                >
                  {isCounting ? `${timer}s` : "ขอ OTP"}
                </button>
              </div>
              {(errorEmail) &&
                <span className="text-[#F74E57] text-[32px] pt-4" >
                  กรุณากรอกอีเมล
                </span>}
            </div>

            {/* ช่องกรอก OTP */}
            <div className="mb-4">
              <label className="block text-gray-700 font-regular text-[32px] mb-3">
                กรอก OTP
              </label>
              <input
                type="text"
                placeholder="OTP"
                className={`w-full border ${errorOtp ?"border-[#F74E57]": "border-gray-300"} rounded-full px-4 py-2 bg-white/60 backdrop-blur-sm 
                  focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-800 placeholder-gray-400 
                  h-[76px] text-[32px]`}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {(errorOtp) &&
                <span className="text-[#F74E57] text-[32px] pt-4" >
                  OTP ไม่ถูกต้อง
                </span>}
            </div>

            {/* ปุ่มยืนยัน */}
            <button
              type="button"
              onClick={() => Sumbit_Otp()}
              className="text-[32px] bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-full 
                my-[42px] w-[596px] h-[76px]"
            >
              ยืนยัน
            </button>

            {/* ปุ่มกลับ */}
            <a
              href="/login"
              className="mt-4 text-gray-500 hover:text-sky-500 transition flex items-center justify-center 
                gap-1 mx-auto text-[32px] py-[15px] w-[596px] h-[76px]"
            >
              <span>←</span> กลับไปหน้าเข้าสู่ระบบ
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Otppassword;
