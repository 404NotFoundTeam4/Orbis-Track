/**
 * Page: Login
 * Features:
 *  - UI หน้า Login สำหรับผู้ใช้งาน
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
import { useState } from "react";
import "../styles/css/Login.css";
import { Icon } from "@iconify/react";
import male from "../assets/images/login/male.png";
import female from "../assets/images/login/female.png";
import { useLogin } from "../hooks/useLogin.ts"
import LogoLogin from "../assets/images/login/LogoLogin.png"

/** หน้าเข้าสู่ระบบตามภาพตัวอย่าง */
export function Login() {

  const { HandleLogin } = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorUS, setErrorUS] = useState(false)
  const [errorPS, setErrorPS] = useState(false)
  const onSubmit = async (a) => {
    setErrorUS(false)
    setErrorPS(false)
    a.preventDefault();
    let FindError = false
    if (!username) {
      setErrorUS(true)
      FindError = true
    }
    if (!password) {
      setErrorPS(true)
      FindError = true
    }
    if (FindError) return;
    const res = await HandleLogin(username, password, isRemember);
    setErrorUS(!res)
    setErrorPS(!res)  
  };
  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
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
      <div className="z-2 top-[286.88px] left-[95px] absolute w-[447px] h-[288px] rounded-2xl skew-x-6 overflow-hidden shadow-[0px_9px_16.7px_0px_#CDE0FF] rotate-[-5deg]">
        <img
          src={female}
          alt=""
          className="absolute w-[159px] h-[150px]  translate-x-1/3 translate-y-1/4 z-10 rotate-[-5deg]"
        />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#FFFFFF]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#F6F6F6]"></div>
      </div>
      <div className="z-3 top-[477px] left-[395px] absolute w-[447px] h-[288px] rounded-2xl -skew-x-6 overflow-hidden shadow-[0px_9px_16.7px_0px_#CDE0FF] rotate-[5deg]">
        <img
          src={male}
          alt=""
          className="absolute w-[159px] h-[150px]  translate-x-1/3 translate-y-1/4 z-10 rotate-[5deg]"
        />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#FFFFFF]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#F6F6F6]"></div>
      </div>

      <div className="top-[723px] left-[182px] absolute opacity-10">
        <Icon icon="pepicons-print:wrench-circle" width="82" height="82" />
      </div>
      <div className="top-[749px] left-[915px] absolute opacity-10">
        <Icon icon="pepicons-print:wrench-circle" width="82" height="82" />
      </div>
      <div className="top-[245px] left-[499px] absolute opacity-5">
        <Icon icon="pepicons-print:wrench-circle" width="82" height="82" />
      </div>
      <div className="top-[215px] left-[175px] absolute opacity-10">
        <Icon icon="fluent:box-checkmark-24-filled" width="82" height="82" />
      </div>
      <div className="top-[352px] left-[672px] absolute opacity-10">
        <Icon icon="fluent:box-checkmark-24-filled" width="82" height="82" />
      </div>
      <div className="top-[867px] left-[499px] absolute opacity-10">
        <Icon icon="fluent:box-search-24-filled" width="82" height="82" />
      </div>

      <div className="z-10 ml-[66px] mt-[67px] relative flex gap-[29px] items-center">
        <div>
          <img src={LogoLogin} alt="" className="w-[88.14px] h-[114.03px]" />
        </div>
        <div>
          <h1 className="font-roboto font-semibold text-[64px]">Orbis Track</h1>
          <p className="font-roboto font-regular text-[32px]">
            ระบบบริหารการยืม - คืน และแจ้งซ่อมอุปกรณ์ภายในองค์กร
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end mr-[70px]">
        <div
          className="relative w-[821px] rounded-[100px] p-10
              backdrop-blur-2xl
               shadow-[inset_-15px_0_25px_rgba(0,0,0,0.08)]
               border border-white/70 
               flex flex-col justify-center items-center"
        >
          {/* เพิ่มเงาสะท้อนขาวด้านขวา */}
          <div
            className="absolute inset-y-0 right-0 w-[2px] 
                    bg-gradient-to-r from-white/80 to-transparent
                    pointer-events-none rounded-[100px]"
          ></div>

          {/* Header Section */}
          <div className="z-10 relative flex gap-[15px] items-center mb-[48px]">
            <img src={LogoLogin} alt="" className="w-[88.14px] h-[114.03px]" />
            <div>
              <h1 className="font-roboto font-extrabold text-[64px] text-[#40A9FF]">
                สวัสดี !
              </h1>
              <p className="font-roboto font-regular text-[32px]">
                ยินดีต้อนรับเข้าสู่ระบบ Orbis Track
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div className="space-y-[27px] mb-12">
              {/* Username */}
              <div className="space-y-2.5">
                <label className="block font-roboto text-[32px]">
                  ชื่อผู้ใช้
                </label>
               <div
  className={`autofill-wrapper flex items-center w-[557px] h-[76px] rounded-full border ${
    errorUS ? "border-[#F74E57]" : "border-[#40A9FF]"
  } shadow-sm px-6 space-x-4`}
>
  <Icon
    icon="icon-park-solid:people"
    width="25"
    height="25"
    className={`${errorUS ? "text-[#F74E57]" : "text-sky-500"}`}
  />

  <input
    type="text"
    placeholder="ชื่อผู้ใช้"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="autofill-target flex-1 bg-transparent outline-none font-roboto text-[20px] text-gray-700 placeholder:text-gray-400"
  />
</div>

                {
                  (errorUS) &&
                  <span className="pt-3 text-[#F74E57] text-[32px]">
                    กรุณากรอกชื่อผู้ใช้งาน
                  </span>
                }
              </div>

              {/* Password */}
              <div className="space-y-[10px]">
                <label className="block font-roboto text-[32px]">
                  รหัสผ่าน
                </label>
                <div className={`autofill-wrapper flex items-center w-[557px] h-[76px] rounded-full border ${errorPS ? " border-[#F74E57]" : "border-[#40A9FF]"} shadow-sm px-6 space-x-4 `}>
                  <Icon
                    icon="ph:key-duotone"
                    width="25"
                    height="25"

                    className={`${errorPS ? "text-[#F74E57]" : "text-sky-500"}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="autofill-target flex-1 bg-transparent outline-none font-roboto text-[20px] text-gray-700 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-sky-500 transition-colors"
                  >
                    <Icon
                      icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                      width="32"
                      height="32"
                    />
                  </button>
                </div>
                {
                  (errorPS) &&
                  <span className="pt-3 text-[#F74E57] text-[32px]">
                    กรุณากรอกรหัสผ่านให้ถูกต้อง
                  </span>
                }
              </div>
              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center mb-4 gap-[15px]">
                  <input id="default-checkbox" type="checkbox" value=""
                    checked={isRemember}
                    onChange={(e) => setIsRemember(e.target.checked)}
                    className="w-[29px] h-[29px] accent-[#BFBFBF] " />
                  <span className="font-roboto text-[32px]">จำรหัสผ่าน</span>
                </div>
                <a
                  href="/otp"
                  className="text-sky-500 hover:underline font-roboto text-[32px]"
                >
                  ลืมรหัสผ่าน
                </a>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-[196px] h-[61px] bg-sky-500 hover:bg-sky-600 text-white rounded-full font-roboto text-[32px] shadow-lg transition-all"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
