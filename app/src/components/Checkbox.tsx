import React from "react";
import { Icon } from "@iconify/react";

interface CheckboxProps {
  isChecked?: boolean; // ถูกติ๊ก
  onClick?: () => void;
  size?: number; // ขนาด
  className?: string; // ตกแต่งแยก
}

const Checkbox: React.FC<CheckboxProps> = ({
  // Default
  isChecked = false,
  onClick,
  size = 29,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center
        rounded-[8px]
        ${isChecked ? "bg-black" : "bg-[#BFBFBF]"}
        ${className}
      `}
      style={{
        width: size,
        height: size,
      }}
    >
      {isChecked && (
        <Icon
          icon="mdi:check"
          color="white"
          width={size * 0.6}
          height={size * 0.6}
        />
      )}
    </button>
  );
};

export default Checkbox;
