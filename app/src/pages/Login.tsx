// ถ้า Login.tsx อยู่ใน pages/
import AvatarLogin from "../components/AvatarLogin";
import "../styles/css/Login.css";
// import { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faKey,
//   faEye,
//   faEyeSlash,
// } from "@fortawesome/free-solid-svg-icons";

/** หน้าเข้าสู่ระบบตามภาพตัวอย่าง */
export function Login() {
  // const [showPass, setShowPass] = useState(false);


  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
 <AvatarLogin/>
 <AvatarLogin/>
 <AvatarLogin/>
  <AvatarLogin/>
 <AvatarLogin/>
 <AvatarLogin/>
  <AvatarLogin/>
 <AvatarLogin/>
 <AvatarLogin/>
<div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/40 rounded-full blur-[100px]"></div>
  <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-400/40 rounded-full blur-[100px]"></div>
  
</div>

   
  );
}

export default Login;
