import { useEffect, useRef, useState } from "react";

import { Icon } from "@iconify/react";

interface Props {
  onChange?: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
  width?:string;
}


export default function DateValue({  onChange,
  placeholder = "เลือกช่วงเวลายืม",
  width = "w-full"
}: Props) {
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  // 🔹 ปิด popup เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  // จันทร์เป็นวันแรก
  const startWeekDay = (startOfMonth.getDay() + 6) % 7;

  const daysInMonth = endOfMonth.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // เดือนก่อน
  for (let i = startWeekDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // เดือนปัจจุบัน
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // เดือนถัดไป
  let nextDay = 1;
  while (days.length < 42) {
    days.push({
      date: new Date(year, month + 1, nextDay++),
      isCurrentMonth: false,
    });
  }

  const isSameDay = (a: Date | null, b: Date | null) =>
    a && b && a.toDateString() === b.toDateString();

  const isInRange = (date: Date) =>
    startDate && endDate && date > startDate && date < endDate;

  const handleSelect = (date: Date) => {
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      onChange?.(date, null);
    } else if (date < startDate) {
      setStartDate(date);
      onChange?.(date, endDate);
    } else {
      setEndDate(date);
      onChange?.(startDate, date);
    }
  };

  const displayValue =
    startDate && endDate
      ? `${startDate.toLocaleDateString("th-TH")} - ${endDate.toLocaleDateString(
          "th-TH"
        )}`
      : "";

  function formatThaiMonth(date: Date) {
    return new Intl.DateTimeFormat("th-TH", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <div ref={ref} className={`relative ${width}`}>
      {/* ===== Input ===== */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          flex w-full items-center justify-between
          rounded-2xl border border-gray-300
          px-4 py-2.5 text-left
          text-gray-400
        "
      >
        <span className={displayValue ? "text-gray-900" : ""}>
          {displayValue || placeholder}
        </span>

        {/* calendar icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* ===== Calendar ===== */}
      {open && (
        <div className="absolute left-0 -top-113 z-50 w-full">
          <div className={`${width} rounded-2xl bg-white  shadow-lg border  border-[#D9D9D9] `}>
            {/* Header */}
            <div className="border-b border-b-[#D9D9D9] p-4">
              <div className="mb-3 flex items-center justify-between ">
                <div className="space-x-2.5">
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(year - 1, month, 1))
                    }
                  >
                    ‹‹
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(year, month - 1, 1))
                    }
                  >
                    ‹
                  </button>
                </div>

                <div className="font-semibold">
                  {formatThaiMonth(currentMonth)}
                </div>
                <div className="space-x-2.5">
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(year, month + 1, 1))
                    }
                  >
                    ›
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(year + 1, month, 1))
                    }
                  >
                    ››
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 text-center text-sm text-gray-500">
                {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="mt-2 grid grid-cols-7 ">
                {days.map(({ date, isCurrentMonth }, idx) => {
                  const isStart = isSameDay(date, startDate);
                  const isEnd = isSameDay(date, endDate);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(date)}
                      className={`
                      h-10 flex items-center justify-center text-sm
                      ${
                        isStart || isEnd
                          ? "bg-blue-500 text-white rounded-full"
                          : isInRange(date)
                            ? "bg-blue-200 text-blue-900"
                            : "hover:bg-gray-100"
                      }
                      ${!isCurrentMonth ? "text-gray-400" : ""}
                    `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className=" px-[15px] py-2.5">
              <div className="flex flex-col gap-3 items-center justify-center">
                <div className=" flex items-center justify-center gap-3  ">
                  <div className="w-30 h-10  rounded-lg  border-[#D8D8D8] border flex items-center justify-center">
                    {startDate
                      ? startDate.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </div>
                  <Icon
                    icon="ic:baseline-minus"
                    width="10"
                    height="15"
                    className="text-[#CDCDCD]"
                  />

                  <div className="w-30 h-10 rounded-lg border-[#D8D8D8] border flex items-center justify-center">
                    {endDate
                      ? endDate.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onChange?.(startDate, endDate);
                  }}
                  className="h-10 w-full bg-[#40A9FF] rounded-lg font-bold text-[16px] text-white"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
