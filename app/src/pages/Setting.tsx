import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  getLanguage,
  setLanguage,
  type AppLanguage,
} from "../services/SettingService";
import { useToast } from "../components/Toast";

export const Settings = () => {
    const toast = useToast();
    const [lang, setLang] = useState<AppLanguage>("th");

    useEffect(() => {
        setLang(getLanguage());
    }, []);

    const handleSelect = (next: AppLanguage) => {
        if (next === lang) return;

        setLang(next);
        setLanguage(next);

        toast.push({
            message: next === "th" ? "เปลี่ยนภาษาเป็นภาษาไทยแล้ว" : "Language set to English",
            tone: "confirm",
        });
    };

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col p-[18px]">
        <div className="flex-1 overflow-hidden">
            {/* Breadcrumb */}
            <div className="mb-[8px] space-x-[9px]">
            <span className="text-[#858585]">การตั้งค่า</span>
            </div>

            {/* Title */}
            <div className="mb-[18px]">
            <h1 className="text-[24px] font-semibold text-black">การตั้งค่า</h1>
            </div>

            {/* Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-[20px]">
            <div className="text-[16px] font-semibold mb-[12px]">ภาษา</div>

            <div className="flex items-center gap-[18px]">
                {langCard({
                  isActive:lang === "th",
                  label:"Thai",
                  flagIcon:"circle-flags:th",
                  onClick:() => handleSelect("th"),
                })}

                {langCard({
                  isActive: lang === "en",
                  label: "English",
                  flagIcon: "circle-flags:gb",
                  onClick: () => handleSelect("en"),
                })}
            </div>
            </div>
        </div>
        </div>
    );
};
/**
 * Description: การ์ดเลือกภาษา (Language option card) สำหรับหน้า Settings
 *              - แสดงไอคอนธง (flagIcon) แบบวงกลม
 *              - แสดงชื่อภาษา (label)
 *              - แสดงเครื่องหมายถูกเมื่อถูกเลือก (isActive)
 *              - เมื่อกดจะเรียก callback onClick เพื่อเปลี่ยนภาษา
 * Input     : props
 *             - isActive: boolean        สถานะว่าภาษานี้ถูกเลือกอยู่หรือไม่
 *             - label: string            ชื่อภาษาที่จะแสดงบนการ์ด
 *             - flagIcon: string         ชื่อไอคอนจาก Iconify สำหรับธงประเทศ
 *             - onClick: () => void      ฟังก์ชันที่ทำงานเมื่อผู้ใช้กดเลือกการ์ด
 * Output    : JSX.Element (ปุ่มการ์ดสำหรับเลือกภาษา)
 * Author    : Chanwit Muangma (Boom) 66160224
 */

function langCard(props: {
  isActive: boolean;
  label: string;
  flagIcon: string;
  onClick: () => void;
}) {
  const { isActive, label, flagIcon, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-[220px] h-[56px] rounded-[10px] border",
        "grid grid-cols-[30px_1fr_22px] items-center",
        "px-[18px] gap-[12px]",
        "transition-colors duration-150",
        isActive
          ? "bg-[#1890FF] border-[#1890FF] text-white"
          : "bg-white border-[#E5E5E5] text-black hover:bg-[#F5F5F5]",
      ].join(" ")}
    >
      {/* Flag */}
      <Icon icon={flagIcon} width="30" height="30" className="shrink-0" />

      {/* Label  */}
      <span className="text-[18px] font-semibold leading-none text-center">
        {label}
      </span>

      {/* Check icon */}
      <Icon
        icon="cuida:check-outline"
        width="22"
        height="22"
        className={isActive ? "opacity-100" : "opacity-0"}
      />
    </button>
  );
}
