import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface Option {
  id: number | string;
  label: string;
  value: string;
}

interface Props {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Option[];
}


export default function Dropdown({
  value,
  onChange,
  placeholder = "เลือกค่า",
  options,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedTime, setSelectedTime] = useState<Option>();
  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* ===== Input ===== */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex w-full items-center justify-between
          rounded-2xl border border-[#D8D8D8]
          px-4 py-3 text-left
        "
      >
        <span className={selectedTime ? "text-gray-900" : "text-gray-400"}>
          {selectedTime?.label || placeholder}
        </span>

        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-3 h-3 text-[#000000] transition-transform duration-200 ${
            open ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* ===== Dropdown (แสดงด้านบน) ===== */}
      {open && (
        <div
          className="
            absolute z-50 bottom-full mb-2 w-full
            rounded-2xl border bg-white shadow-lg
          "
        >
          <div className="max-h-[260px] overflow-y-auto py-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedTime(opt);
                  onChange(opt.value); 
                  setOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left
                  hover:bg-gray-100
                  ${opt.value === value ? "bg-gray-100 font-medium" : ""}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
