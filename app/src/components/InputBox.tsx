import { useState } from "react";
import { Icon } from "@iconify/react"; // ใช้ไอคอนจาก iconify-react

interface InputBoxProps {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: string;
}

export function InputBox({
  label,
  placeholder = "",
  type = "text",
  icon,
}: InputBoxProps) {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-md flex flex-col">
      <label className="text-gray-700 font-medium mb-2">{label}</label>
      <div
        className={`relative flex items-center rounded-2xl px-4 py-2 
        shadow-[inset_0_0_15px_rgba(0,0,0,0.08)]
        bg-white/80 backdrop-blur-sm border transition-all
        `}
      >
        {icon && (
          <Icon
            icon={icon}
            className="text-gray-400 mr-2 w-5 h-5"
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

    </div>
  );
}
