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
  width?: number | string; //  ปรับความกว้างได้ (default 380px)
  height?: number | string; // ปรับความสูงได้ (default 170px)
  className?: string;
  onClick?: () => void;
};
// กำหนดสีและไอคอนตามประเภทของการ์ด
const CARD_CONFIG: Record<CardHomeType, { color: string; icon: string }> = {
  Borrowed: { color: "#40A9FF", icon: "solar:box-outline" },
  Returned: { color: "#FF884D", icon: "lucide:clock" },
  Waiting: { color: "#FFC53D", icon: "mi:user-check" },
  Report: { color: "#FF4D4F", icon: "mage:wrench" },
};
// CardHome Component
const CardHome: React.FC<CardHomeProps> = ({
  cardType,
  title,
  count,
  unit = "ชิ้น",
  height = 170,
  className = "",
  onClick,
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
  p-4 sm:p-5
  overflow-hidden select-none shadow-sm hover:shadow-md transition-shadow
  min-w-[200px]
        ${className}
      `}
      style={{
        borderColor: config.color,
        height: getSizeStyle(height),
      }}
    >
      {/* Corner Triangle */}
      <div
        className="absolute top-0 right-0 w-[30px] h-[30px]"
        style={{
          backgroundColor: config.color,
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />

      {/* Content */}
      <div className="flex items-center justify-center w-full">
        <div className="flex items-center gap-[clamp(12px,2vw,32px)]">
          {/* Icon */}
          <Icon
            icon={config.icon}
            className="shrink-0"
            style={{
              color: config.color,
              fontSize: "clamp(36px, 6vw, 120px)",
            }}
          />

          {/* Info Text */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-[clamp(6px,1vw,12px)]">
              <span
                className="font-medium leading-none text-[#221818]"
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                }}
              >
                {count}
              </span>

              <span
                className="text-[#595959] whitespace-nowrap"
                style={{
                  fontSize: "clamp(12px, 1.4vw, 16px)",
                }}
              >
                {unit}
              </span>
            </div>
            <span
              className="truncate mt-[clamp(8px,1.5vw,16px)]"
              style={{
                color: config.color,
                fontSize: "clamp(14px, 1.8vw, 20px)",
              }}
              title={title}
            >
              {title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardHome;
