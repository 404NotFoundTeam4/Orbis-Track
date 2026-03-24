import React from "react";
import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/types";

export type CardDashboard = {
  icon: string | IconifyIcon;
  title: string;
  iconColor?: string;
  titleBorderColor: string;
  colorTheme: string;
  width?: number | string;
  height?: number | string;
  count: number;
  bgColor?: string[];
  borderColor?: string[];
  iconSize?: number | string; 
  className?: string;
  onClick?: () => void;
};

const CardHome: React.FC<CardDashboard> = ({
  colorTheme = "#40A9FF",
  icon,
  title = "",
  iconColor = "white",
  titleBorderColor = "#1890FF",
  count = 0,
  width = 340,
  height = 166,
  bgColor = ["#ffffff", "#ffffff"],
  borderColor = ["#000000", "#000000"],
  iconSize = 50,
  className = "",
  onClick,
}) => {
  const size = (size: number | string) => (typeof size === "number" ? `${size}px` : size);

  // background → ไล่สีจากล่างขึ้นบน
  const bgGradient = `linear-gradient(to top, ${bgColor.join(",")})`;

  // border → ไล่สีจากบนลงล่าง
  const borderGradient = `linear-gradient(to bottom, ${borderColor.join(",")})`;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-[42px] p-[1px] transition hover:scale-[1.02] ${className}`}
      style={{
        width: size(width),
        height: size(height),
        background: borderGradient,
      }}
    >
      <div
        className="w-full h-full rounded-[42px] flex items-center  select-none py-4.5 px-6.5 gap-3.5"
        style={{ background: bgGradient }}
        title={title}
      >
        <div
          className="w-25.5 h-25.5 rounded-full shrink-0 flex items-center justify-center"
          style={{ background: colorTheme }}
        >
          <Icon
            icon={icon}
            style={{ fontSize: size(iconSize), color: iconColor }}
          />
        </div>
        <div className="w-full h-full flex justify-start text-right flex-col gap-3.5">
          <span
            className="font-semibold text-5xl"
            style={{ color: colorTheme }}
          >
            {count}
          </span>

          <span className={`  text-black text-5xl text-[16px] `}>
            จำนวน {count} รายการ
          </span>
          <div
            className="inline-flex w-fit shrink-0 self-end items-center justify-center px-[22px] py-[8px] border rounded-full text-white"
            style={{
              background: colorTheme,
              borderColor: titleBorderColor,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardHome;
