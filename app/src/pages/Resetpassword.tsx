import React, { useState } from "react";

export function Resetpassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-white flex justify-center items-center p-8">
      <div className="w-[500px]">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sky-500 text-2xl">🔧</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Obis Track</h1>
            <p className="text-sm text-gray-500">
              ระบบบริหารการยืม - คืน และแจ้งซ่อมอุปกรณ์ภายในองค์กร
            </p>
          </div>
        </div>

        {/* Back link */}
        <button className="text-sky-500 text-sm mb-5 hover:underline">
          ← กลับไปหน้าเข้าสู่ระบบ
        </button>

        {/* Info box */}
        <div className="border border-gray-300 bg-white/60 rounded-lg p-4 mb-6">
          <p className="font-semibold text-gray-700 mb-1">คำอธิบาย</p>
          <p className="text-sm text-gray-600">
            เพื่อความปลอดภัยของบัญชี กรุณาตั้งรหัสผ่านใหม่ที่แตกต่างจากรหัสผ่านเดิม
          </p>
          <p className="mt-3 text-sm text-gray-500">คำแนะนำเพิ่มเติม (Optional):</p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น วันเกิด หรือเบอร์โทรศัพท์</li>
            <li>ใช้รหัสผ่านที่ไม่ซ้ำกับระบบอื่น</li>
            <li>จดรหัสผ่านไว้เป็นความลับ และไม่บอกผู้อื่น</li>
          </ul>
        </div>

        {/* Input password */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm mb-1">รหัสผ่านใหม่</label>
          <div className="relative">
            <input
              type="password"
              placeholder=" "
              className="w-full border border-gray-300 rounded-full px-4 py-2 pl-10 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="absolute left-4 top-2.5 text-gray-400">🔒</span>
          </div>
        </div>

        {/* Validation rules */}
        <div className="text-sm text-gray-600 mb-5">
          <p className="text-red-500 font-medium mb-2">
            กรุณาเพิ่มอักขระที่จำเป็นทั้งหมดเพื่อสร้างรหัสผ่านที่ปลอดภัย
          </p>
          <ul className="space-y-1">
            <li className={validations.length ? "text-gray-400" : "text-red-500"}>
              • อักษรขั้นต่ำ 12 – 16 ตัวอักษร
            </li>
            <li className={validations.upper ? "text-gray-400" : "text-red-500"}>
              • อักษรตัวใหญ่อย่างน้อย 1 ตัว
            </li>
            <li className={validations.lower ? "text-gray-400" : "text-red-500"}>
              • อักษรตัวเล็กอย่างน้อย 1 ตัว
            </li>
            <li className={validations.special ? "text-gray-400" : "text-red-500"}>
              • อักษรพิเศษอย่างน้อย 1 ตัว เช่น *()_-=+{}
            </li>
            <li className={validations.number ? "text-gray-400" : "text-red-500"}>
              • ตัวเลขอย่างน้อย 1 ตัว
            </li>
            <li className={validations.noThai ? "text-green-500" : "text-red-500"}>
              • ห้ามมีการเว้นวรรค
            </li>
          </ul>
        </div>

        {/* Confirm password */}
        <div className="mb-8">
          <label className="block text-gray-700 text-sm mb-1">
            ยืนยันรหัสผ่านใหม่
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder=" "
              className="w-full border border-gray-300 rounded-full px-4 py-2 pl-10 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <span className="absolute left-4 top-2.5 text-gray-400">🔒</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          className={`w-full py-2 rounded-full text-white font-semibold transition ${
            allValid && match
              ? "bg-sky-500 hover:bg-sky-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!allValid || !match}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}
export default Resetpassword;
