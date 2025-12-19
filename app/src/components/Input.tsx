/**
 * Description: Reusable Input Component พร้อม label, error message และ size variants
 * Note      : รองรับ forwardRef สำหรับใช้กับ form libraries, รองรับ disabled state
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import React from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  size?: InputSize;
  fullWidth?: boolean;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      size = "md",
      fullWidth = false,
      containerClassName = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    // Size variants
    const sizeClasses = {
      sm: "h-[38px] text-[14px] px-3",
      md: "h-[46px] text-[16px] pl-[15px] pr-[8px]",
      lg: "h-[54px] text-[18px] px-5",
    };

    // Width classes
    const widthClass = fullWidth ? "w-full" : "w-[333px]";

    return (
      <div className={`flex flex-col gap-[10px] ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label className="block text-[16px] font-medium text-[#000000]">
            {label}
            {props.required && <span className="text-[#F5222D] ml-1">*</span>}
          </label>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          className={`
            ${widthClass}
            ${sizeClasses[size]}
            py-3
            border
            border-[#D8D8D8]
            rounded-[16px]
            text-[#000000]
            placeholder:text-[#CDCDCD]
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-transparent
            transition-all
            disabled:bg-gray-100
            disabled:text-gray-600
            disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />

        {/* Error Message */}
        {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
