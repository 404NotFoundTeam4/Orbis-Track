// ถ้า Login.tsx อยู่ใน pages/

import "../styles/css/Login.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faKey,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

/** หน้าเข้าสู่ระบบตามภาพตัวอย่าง */
export function Login() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[linear-gradient(110deg,_#2D62FF_0%,_#6FAEFF_50%,_#CBD2FF_100%)]">
      {/* Card */}
      <div className="relative w-full max-w-7xl  rounded-2xl shadow-2xl bg-white/0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: purple/indigo panel */}
          <div className="relative p-10 min-h-[560px] md:min-h-[640px] md:p-12 bg-[linear-gradient(180deg,_#7E2FFF_0%,_#2D62FF_100%)]">
            <div className="mx-auto max-w-xs"></div>

            {/* indicators (กลางล่าง) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
              <span className="h-1.5 w-12 rounded-full bg-white/50" />
              <span className="h-1.5 w-12 rounded-full bg-white" />
              <span className="h-1.5 w-12 rounded-full bg-white/50" />
            </div>
          </div>

          {/* Divider line in the middle (desktop) */}
          <div className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-black/10 pointer-events-none " />

          {/* Right: form */}
          <div className="bg-white p-8 md:p-10  justify-center items-center">
            <div className="mx-auto max-w-sm ">
              {/* avatar + title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-neutral-200" />
                <div>
                  <h1 className="text-3xl font-semibold leading-tight">
                    Orbis Track
                  </h1>
                  <div className="text-neutral-500 -mt-1">เข้าสู่ระบบ</div>
                </div>
              </div>

              {/* Username */}
              <label className="block text-sm font-medium mb-1">
                ชื่อผู้ใช้
              </label>
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-3 grid place-items-center text-neutral-500">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  type="text"
                  className="w-full h-10 rounded-md border border-neutral-200 pl-9 pr-3 outline-none focus:ring-2 focus:ring-[#2D62FF]/30 focus:border-[#2D62FF]/50"
                  placeholder=""
                />
              </div>

              {/* Password */}
              <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
              <div className="relative mb-6">
                <span className="absolute inset-y-0 left-3 grid place-items-center text-neutral-500">
                  <FontAwesomeIcon icon={faKey} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full h-10 rounded-md border border-neutral-200 pl-9 pr-10 outline-none focus:ring-2 focus:ring-[#2D62FF]/30 focus:border-[#2D62FF]/50"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-2 px-2 text-neutral-500 hover:text-neutral-700"
                  aria-label={showPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>

              {/* Button */}
              <button
                type="button"
                className="w-full h-10 rounded-md bg-[#2E3135] text-white font-semibold shadow-sm hover:brightness-110 active:translate-y-[1px]"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
