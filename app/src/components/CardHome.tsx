/**
 * Description: Card สำหรับหน้า Home (Responsive & Resizable & Centered Content)
 * Author    : Worrawat Namwat (Wave) 66160372
 */
import React from "react";
import { Icon } from "@iconify/react";

export type CardHomeType = "Borrowed" | "Returned" | "Waiting" | "Report";

export type CardHomeProps = {
  cardType: CardHomeType;
  title: string;
  count: number;
  unit?: string;

  // Customization
  width?: number | string;  //  ปรับความกว้างได้ (default 380px)
  height?: number | string; // ปรับความสูงได้ (default 170px)
  className?: string;
  onClick?: () => void;
};
// กำหนดสีและไอคอนตามประเภทของการ์ด
const CARD_CONFIG: Record<CardHomeType, { color: string; icon: string }> = {
  Borrowed: { color: "#40A9FF", icon: "lucide:box" },
  Returned: { color: "#FF884D", icon: "lucide:clock" },
  Waiting:  { color: "#FFC53D", icon: "lucide:user-check" },
  Report:   { color: "#FF4D4F", icon: "lucide:wrench" },
};
// CardHome Component
const CardHome: React.FC<CardHomeProps> = ({
  cardType,
  title,
  count,
  unit = "ชิ้น",
  width = 380,     
  height = 170, 
  className = "",
  onClick
}) => {
  const config = CARD_CONFIG[cardType];

  const getSizeStyle = (size?: number | string) => {
    if (size === undefined) return undefined;
    return typeof size === "number" ? `${size}px` : size;
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center bg-white rounded-[12px] border 
        p-5 overflow-hidden select-none shadow-sm hover:shadow-md transition-shadow
        min-w-[200px]
        ${className}
      `}
      style={{
        borderColor: config.color,
        width: width ? getSizeStyle(width) : "100%",
        height: getSizeStyle(height),
      }}
    >
      {/* Corner Triangle */}
      <div
        className="absolute top-0 right-0 w-[40px] h-[40px]"
        style={{
          backgroundColor: config.color,
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />

        {/* Content */}
      <div className="flex items-center justify-center gap-4 w-full">
        
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon
            icon={config.icon}
            width="130" 
            height="130"
            style={{ color: config.color }}
          />
        </div>

        {/* Info Text */}
        <div className="flex flex-col min-w-0"> 
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-semibold text-[#1F1F1F] leading-none">
              {count}
            </span>
            <span className="text-[14px] text-[#595959] font-normal whitespace-nowrap">
              {unit}
            </span>
          </div>
          <span 
            className="text-[16px] truncate"
            style={{ color: config.color }}
            title={title}
          >
            {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardHome;