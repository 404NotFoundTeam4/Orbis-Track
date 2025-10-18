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
    | "addSection";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
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
}) => {
  // สไตล์พื้นฐานที่ใช้ร่วมกันทุกสถานะของปุ่ม
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // โทนสีและพฤติกรรม hover/active แยกตามชนิดปุ่ม
  const variantStyles = {
    primary: "bg-[#40A9FF] text-[#FFFFFF] hover:bg-blue-500 active:bg-blue-600",
    secondary:
      "bg-[#D8D8D8] text-[#000000] hover:bg-gray-300 active:bg-gray-400",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100",
    ghost: "bg-[#D9D9D9] text-[#F1F1F1]",
    danger: "bg-[#FF4D4F] text-[#FFFFFF] hover:bg-red-500 active:bg-red-600",
    dangerIcon:
      "bg-[#DF203B] text-[#FFFFFF] hover:bg-red-700 active:bg-red-800",
    addSection:
      "bg-[#FFFFFF] text-[#008CFF] hover:bg-[#F5F5F5] border border-[#008CFF]"
    
  };

  // ขนาดปุ่ม (ระยะห่างและขนาดตัวอักษร) แยกเป็น sm / md / lg
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  // กำหนดความกว้างเต็มบรรทัดเมื่อ fullWidth = true
  const widthStyle = fullWidth ? "w-full" : "";
  // รวมคลาสทั้งหมดเพื่อเรนเดอร์บนปุ่ม โดยเรียงจากฐาน -> โทน -> ขนาด -> ความกว้าง -> คลาสเพิ่มเติม
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled}>
      {/* แสดงไอคอน (ถ้ามี) เว้นระยะด้วย gap ที่กำหนดใน sizeStyles */}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
