/**
 * Description: Reusable Button Component พร้อม variants, sizes และ icon support
 * Note      : รองรับ 8 variants และ 3 sizes, fullWidth option, disabled state
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import React from "react";

// TypeScript interfaces
interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "dangerIcon"
    | "addSection"
    | "confirm"
    | "accept"
    | "manage";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  icon,
  className = "",
  style,
  type,
}) => {
  // สไตล์พื้นฐานที่ใช้ร่วมกันทุกสถานะของปุ่ม
  const baseStyles =
    "inline-flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // โทนสีและพฤติกรรม hover/active แยกตามชนิดปุ่ม
  const variantStyles = {
    primary:
      "bg-[#40A9FF] text-[#FFFFFF] hover:bg-[#1890FF] active:bg-[#1890FF]",
    secondary:
      "bg-[#9F9F9F] text-[#FFFFFF] hover:bg-gray-300 active:bg-gray-400",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100",
    ghost: "bg-[#D9D9D9] text-[#F1F1F1]",
    danger:
      "bg-[#FF4D4F] text-[#FFFFFF] hover:bg-[#F5222D] active:bg-[#CF1322]",
    dangerIcon:
      "bg-[#DF203B] text-[#FFFFFF] hover:bg-red-700 active:bg-red-800",
    addSection:
      "bg-[#FFFFFF] text-[#008CFF] hover:bg-[#F5F5F5] border border-[#008CFF]",
    confirm:
      "bg-[#52C41A] text-[#FFFFFF] hover:bg-green-700 active:bg-green-600",
    accept:
      "bg-[#73D13D] text-[#FFFFFF] hover:bg-[#52C41A] active:bg-[#389E0D]",
    manage:
      "bg-[#DBEAFE] text-[#1D4ED8] hover:bg-[#BFDBFE] active:bg-[#93C5FD]",
  };

  // ขนาดปุ่ม (ระยะห่างและขนาดตัวอักษร) แยกเป็น sm / md / lg
  const sizeStyles = {
    sm: "px-3 py-1.5 gap-1.5",
    md: "w-[112px] h-[46px]",
    lg: "px-6 py-3 gap-2.5",
  };

  const resolvedType: "button" | "submit" | "reset" =
    type ?? (onClick ? "button" : "submit");

  // กำหนดความกว้างเต็มบรรทัดเมื่อ fullWidth = true
  const widthStyle = fullWidth ? "w-full" : "";
  // รวมคลาสทั้งหมดเพื่อเรนเดอร์บนปุ่ม โดยเรียงจากฐาน -> โทน -> ขนาด -> ความกว้าง -> คลาสเพิ่มเติม
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  return (
    <button
      type={resolvedType}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {/* แสดงไอคอน (ถ้ามี) เว้นระยะด้วย gap ที่กำหนดใน sizeStyles */}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
