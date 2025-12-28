/**
 * Description: Reusable Button Component พร้อม variants, sizes และ icon support
 * Note      : รองรับ 9 variants และ 3 sizes, fullWidth option, disabled state
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import React from "react";

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
    | "cancel";
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
  /* base style */
  const baseStyles =
    "inline-flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  /* variant styles */
  const variantStyles = {
    primary:
      "bg-[#40A9FF] text-white hover:bg-blue-500 active:bg-blue-600",
    secondary:
      "bg-[#9F9F9F] text-white hover:bg-gray-300 active:bg-gray-400",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100",
    ghost: "bg-[#D9D9D9] text-[#F1F1F1]",
    danger:
      "bg-[#FF4D4F] text-white hover:bg-red-500 active:bg-red-600",
    dangerIcon:
      "bg-[#DF203B] text-white hover:bg-red-700 active:bg-red-800",
    addSection:
      "bg-white text-[#008CFF] hover:bg-[#F5F5F5] border border-[#008CFF]",
    confirm:
      "bg-[#52C41A] text-white hover:bg-green-700 active:bg-green-600",

    /* ✅ CANCEL VARIANT */
    cancel:
      "bg-[#E5E7EB] text-black hover:bg-[#D1D5DB] active:bg-[#9CA3AF]",
  };

  /* size styles */
  const sizeStyles = {
    sm: "px-3 py-1.5 gap-1.5",
    md: "w-[112px] h-[46px]",
    lg: "px-6 py-3 gap-2.5",
  };

  const resolvedType: "button" | "submit" | "reset" =
    type ?? (onClick ? "button" : "submit");

  const widthStyle = fullWidth ? "w-full" : "";

  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyle}
    ${className}
  `;

  return (
    <button
      type={resolvedType}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
