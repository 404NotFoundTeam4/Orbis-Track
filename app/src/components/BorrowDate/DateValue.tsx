import { useEffect, useRef, useState } from "react";

import { Icon } from "@iconify/react";

interface Props {
  onClick?: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
  width?: string;
  value?: {
    start: Date | null;
    end: Date | null;
  };
  maxBorrow: number;
}

export default function DateValue({
  onClick,
  placeholder = "เลือกช่วงเวลายืม",
  width = "w-full",
  value,
  maxBorrow,
}: Props) {
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;

    if (value.start !== startDate || value.end !== endDate) {
      setStartDate(value.start);
      setEndDate(value.end);
    }
  }, [value]);

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
  const getDiffDays = (start: Date, end: Date) => {
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    return (
      Math.abs(
        Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)),
      ) + 1
    );
  };

  const isSameDay = (a: Date | null, b: Date | null) =>
    a && b && a.toDateString() === b.toDateString();

  const isInRange = (date: Date) =>
    startDate && endDate && date > startDate && date < endDate;

 const handleSelect = (date: Date) => {
  if (!startDate || endDate) {
    setStartDate(date);
    setEndDate(null);
  } else if (date < startDate) {
    setStartDate(date);
  } else {
    setEndDate(date);
  }
};
  
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d < today;
  };

  function formatThaiMonth(date: Date) {
    return new Intl.DateTimeFormat("th-TH", {
      month: "short",
      year: "numeric",
    }).format(date);
  }
  const formatThaiDate = (date: Date) => {
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  };
  const dateLabel =
    startDate && endDate
      ? `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`
      : "วัน/เดือน/ปี";
  console.log(maxBorrow)
  return (
    <div ref={ref} className={`relative ${width}`}>
      {/* ===== Input ===== */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex w-full items-center justify-between
          rounded-2xl border border-gray-300
          px-4 py-2.5 text-left
          text-gray-400
        "
      >
        <span className={dateLabel ? "text-gray-900" : ""}>
          {dateLabel || placeholder}
        </span>

        {/* calendar icon */}
        <Icon
          className=" cursor-pointer"
          icon="uil:calendar"
          width="20"
          height="20"
        />
      </button>
      
      {/* ===== Calendar ===== */}
      {open && (
        <div className="absolute left-0 -top-113 z-50 w-full">
          <div
            className={`${width} rounded-2xl bg-white  shadow-lg border  border-[#D9D9D9] `}
          >
            {/* Header */}
            <div className="border-b border-b-[#D9D9D9] p-4">
              <div className="mb-3 flex items-center justify-between ">
                <div className="space-x-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(new Date(year - 1, month, 1))
                    }
                  >
                    ‹‹
                  </button>
                  <button
                    type="button"
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
                    type="button"
                    onClick={() =>
                      setCurrentMonth(new Date(year, month + 1, 1))
                    }
                  >
                    ›
                  </button>
                  <button
                    type="button"
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
                  const past = isPastDate(date);

                  const overMax =
                    startDate &&
                    !endDate &&
                    getDiffDays(startDate, date) > maxBorrow;

                  const disabled = past || overMax;

                  return (
                    <button
                      type="button"
                      key={idx}
                      disabled={disabled}
                      onClick={() => handleSelect(date)}
                      className={`
        h-10 flex items-center justify-center text-sm
        ${
          isStart || isEnd
            ? "bg-blue-500 text-white rounded-full"
            : isInRange(date)
              ? "bg-blue-200 text-blue-900"
              : disabled
                ? "text-gray-300 cursor-not-allowed"
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
                    onClick?.(startDate, endDate);
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
