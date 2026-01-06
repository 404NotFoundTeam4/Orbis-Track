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
                <LangCard
                active={lang === "th"}
                label="Thai"
                flagIcon="circle-flags:th"
                onClick={() => handleSelect("th")}
                />

                <LangCard
                active={lang === "en"}
                label="English"
                flagIcon="circle-flags:gb"
                onClick={() => handleSelect("en")}
                />
            </div>
            </div>
        </div>
        </div>
    );
};

function LangCard(props: {
  active: boolean;
  label: string;
  flagIcon: string;
  onClick: () => void;
}) {
  const { active, label, flagIcon, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-[220px] h-[56px] rounded-[10px] border",
        "grid grid-cols-[30px_1fr_22px] items-center",
        "px-[18px] gap-[12px]",
        "transition-colors duration-150",
        active
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
        className={active ? "opacity-100" : "opacity-0"}
      />
    </button>
  );
}
