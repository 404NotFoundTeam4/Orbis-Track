/**
 * Description: Card สำหรับหน้า Dashboard
 * - รองรับ Responsive / Resizable / Clickable
 * - สไตล์: การ์ดพื้นหลังไล่สี + ไอคอนวงกลม + ตัวเลขใหญ่ + pill label
 * Author    : Chanwit Muangma (Boom) 66160224
 */
import React from "react";
import { Icon } from "@iconify/react";

export type DashboardSummaryCardType = "Total" | "Borrowed" | "Returned";

export type DashboardSummaryCardProps = {
  cardType: DashboardSummaryCardType;

  // Content
  count: number | string;
  subtitle?: string; // เช่น "จำนวน 1000 รายการ"
  badgeLabel: string; // เช่น "จำนวนอุปกรณ์"

  // Customization
  width?: number | string; // ปรับความกว้างได้
  height?: number | string; // ปรับความสูงได้
  className?: string;
  onClick?: () => void;
};

/**
 * Description: config สี/ไอคอนของแต่ละการ์ด (แก้ให้ตรงดีไซน์จริงได้)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
const CARD_CONFIG: Record<
  DashboardSummaryCardType,
  {
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    iconBg: string; // background วงกลมไอคอน (โปร่ง/ขาว)
    badgeBg: string;
    textColor: string;
  }
> = {
  Total: {
    icon: "solar:calendar-bold",
    gradientFrom: "#B37CFF",
    gradientTo: "#E6D6FF",
    iconBg: "rgba(255,255,255,0.35)",
    badgeBg: "#9B63FF",
    textColor: "#FFFFFF",
  },
  Borrowed: {
    icon: "solar:case-bold",
    gradientFrom: "#4DB7FF",
    gradientTo: "#D6F0FF",
    iconBg: "rgba(255,255,255,0.35)",
    badgeBg: "#1890FF",
    textColor: "#FFFFFF",
  },
  Returned: {
    icon: "solar:refresh-bold",
    gradientFrom: "#79D84C",
    gradientTo: "#DFF7D0",
    iconBg: "rgba(255,255,255,0.35)",
    badgeBg: "#52C41A",
    textColor: "#FFFFFF",
  },
};

/**
 * Description: helper แปลง number/string -> css size
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
const toCssSize = (size?: number | string) => {
  if (size === undefined) return undefined;
  return typeof size === "number" ? `${size}px` : size;
};

const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({
  cardType,
  count,
  subtitle = "",
  badgeLabel,
  width,
  height = 120,
  className = "",
  onClick,
}) => {
  const config = CARD_CONFIG[cardType];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={`
        relative overflow-hidden rounded-[18px] border border-[#D9D9D9]
        p-5 shadow-sm hover:shadow-md transition-shadow select-none
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 75%)`,
      }}
    >
      {/* content row */}
      <div className="flex h-full items-center gap-4">
        {/* icon bubble */}
        <div
          className="flex shrink-0 items-center justify-center rounded-2xl"
          style={{
            width: "clamp(44px, 4.2vw, 56px)",
            height: "clamp(44px, 4.2vw, 56px)",
            background: config.iconBg,
          }}
        >
          <Icon
            icon={config.icon}
            style={{
              color: config.textColor,
              fontSize: "clamp(22px, 2.2vw, 30px)",
            }}
          />
        </div>

        {/* text */}
        <div className="min-w-0">
          <div
            className="font-extrabold leading-none"
            style={{
              color: config.textColor,
              fontSize: "clamp(26px, 2.6vw, 36px)",
            }}
          >
            {count}
          </div>

          <div
            className="mt-1 text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {subtitle}
          </div>
        </div>

        {/* badge pill */}
        <div className="ml-auto">
          <span
            className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white"
            style={{ background: config.badgeBg }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummaryCard;
