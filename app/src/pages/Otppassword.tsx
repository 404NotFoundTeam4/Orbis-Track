/**
 * Page: OtpPassword.
 * Features:
 *  - UI หน้าขอ OTP สำหรับผู้ใช้งาน
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
import { useState } from "react";
import { Icon } from "@iconify/react";
import { verifyEmail } from "../hooks/verifyEmail.js";
import LogoLogin from "../assets/images/login/LogoLogin.png";

export function Otppassword() {
  const { GetOtp, SetOtp } = verifyEmail();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorOtp, setErrorOtp] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const HandleGetOtp = async () => {
    // เคลียร์ error
    setErrorEmail(false);
    setErrorOtp(false);

    // validate email
    if (!email.trim()) {
      setErrorEmail(true);
      return;
    }

    setIsLoading(true); // ⬅ เริ่มโหลด
    console.log("กำลังไป");
    try {
      const res = await GetOtp(email);
      console.log("ส่งแล้ว");
      // หลังส่งสำเร็จ
      setTimer(60);
      setIsCounting(true);

      // เริ่มนับถอยหลัง
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setIsCounting(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.log(error);
      setErrorOtp(true);
    } finally {
      console.log("มาทำไม");
      setIsLoading(false); // ⬅ ปิดโหลดหลัง API เสร็จ ไม่ว่า success หรือ error
    }
  };

  const Submit_Otp = async () => {
    setErrorEmail(false);
    setErrorOtp(false);
    let FindError = false;
    if (!email.trim()) {
      setErrorEmail(true);
      FindError = true;
    }
    if (!otp.trim() || otp.trim().length != 6) {
      setErrorOtp(true);
      FindError = true;
    }
    if (FindError) return;

    try {
      const res = await SetOtp(email, otp);
      setErrorOtp(!res);
    } catch {
      setErrorOtp(true);
    }
  };

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
        <img src={LogoLogin} alt="" className="w-[88.14px] h-[114.03px]" />
        <div>
          <h1 className="font-roboto font-semibold text-[32px]">Orbis Track</h1>
          <p className="font-roboto font-regular text-[24px]">
            ระบบบริหารการยืม - คืน และแจ้งซ่อมอุปกรณ์ภายในองค์กร
          </p>
        </div>
      </div>

      {/* ==== กล่องฟอร์มอยู่กลางจอ ==== */}
      <div className="flex flex-1 justify-center items-center">
        <div
          className="z-10 bg-white backdrop-blur-lg bg-opacity-40 border-gray-200
          shadow-[inset_-8px_0_15px_rgba(0,0,0,0.04)] rounded-[40px]
          py-10 pt-14 px-31 w-auto h-auto flex flex-col border-2 text-[32px] gap-1"
        >
          <div className="flex flex-col  px-6 items-center justify-center">
            <Icon
              icon="tabler:circle-key-filled"
              width="114"
              height="114"
              className="text-[#40A9FF]"
            />
            <h2 className=" font-bold text-[64px] text-sky-500">
              ลืมรหัสผ่าน ?
            </h2>
            <p className="text-[#8C8C8C] font-normal">
              กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>
          </div>
          <div>
            <div className="flex flex-col  gap-2.5">
              <div className="flex flex-col gap-2 mb-2.5">
                {/* Label */}
                <label className="text-[32px]">อีเมล</label>

                {/* Input + Button row */}
                <div className="flex items-center gap-5">
                  {/* Email Input */}
                  <input
                    type="text"
                    className="flex-1 border text-[32px] px-7.5 py-[13px] rounded-full border-[#8C8C8C]"
                    placeholder="example@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {/* OTP Button */}
                  <button
                    type="button"
                    disabled={isCounting || isLoading}
                    onClick={() => HandleGetOtp()}
                    className={`${
                      isCounting || isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-sky-500 hover:bg-sky-600"
                    }
    text-white text-[32px] font-medium px-8 rounded-full transition py-2.5`}
                  >
                    {isLoading
                      ? "กำลังส่ง" // ขณะรอ API
                      : isCounting
                        ? `${timer}s` // ขณะนับถอยหลัง
                        : "ขอ OTP"}
                  </button>
                </div>
                <div className={`${errorEmail ? "text-[#F74E57]" : ""}`}>
                    {errorEmail && "กรุณากรอกข้อมูล"}
                  </div>
              </div>
              <div className="">
                {/* Label */}
                <label className="text-[32px]">กรอก OTP</label>
                {/* Input + Button row */}
                <div className="">
                  {/* Email Input */}
                  <input
                    type="text"
                    className={`flex-1 w-full border text-[32px] px-7.5 py-[14px] rounded-full ${errorOtp ? "border-[#F74E57]" : "border-[#8C8C8C]"}`}
                    placeholder="OTP"
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <div className={`${errorOtp ? "text-[#F74E57]" : "mb-2"}`}>
                    {errorOtp && "OTP ไม่ถูกต้อง"}
                  </div>
                </div>
              </div>
              {/* ปุ่มยืนยัน */}
              <button
                type="button"
                onClick={() => Submit_Otp()}
                className="text-[32px] bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-full
                w-full "
              >
                ยืนยัน
              </button>
              {/* ปุ่มกลับ */}
              <div>
                <a
                  href="/login"
                  className="  text-gray-500 hover:text-sky-500 transition flex items-center justify-center gap-1
                 text-[32px]"
                >
                  <Icon
                    icon="tabler:chevron-left"
                    width="24"
                    height="48"
                    className="mt-2.5"
                  />
                  <p>กลับไปหน้าเข้าสู่ระบบ</p>
                </a>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default Otppassword;
