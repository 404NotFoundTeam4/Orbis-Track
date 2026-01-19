import { Icon } from "@iconify/react";
import React, { useEffect, useRef, useState } from "react";
import DateValue from "./DateValue";
import DropdownTime from "./DropdownTime";

export interface ActiveBorrow {
  da_start: string;
  da_end: string;
}

type DayTimeRange = {
  day: number;
  timeStart: string;
  timeEnd: string;
};
interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface TimeDefault {
  time_start?: string | null;
  time_end?: string | null;
}
type Device = {
  dec_id: number;
  dec_serial_number: string;
  dec_asset_code: string;
  dec_status: string;
  activeBorrow: ActiveBorrow[];
};
type BorrowModalProps = {
  defaultValues: Device[];
  fullWidth?: boolean;
  onConfirm: (data: {
    borrow_start: string;
    borrow_end: string;
    time_start?: string;
    time_end?: string;
  }) => void;
  dateDefault?: DateRange;
  timeDefault?: TimeDefault;
};

interface timeDropdownItem {
  id: number;
  label: string;
  value: string;
}

type ViewType = "month" | "week" | "day";

export default function BorrowModal({
  defaultValues,
  onConfirm,
  dateDefault,
  timeDefault,
  fullWidth = false,
}: BorrowModalProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ViewType>("month");
  const baseClass =
    "w-20 h-[46px]  transition-colors duration-200 bg-[#D9D9D9]";
  const activeClass = "bg-white border border-[#D9D9D9] ";
  const inactiveClass = "hover:bg-gray-50";
  const today = new Date();
  const day = today.getDate(); // วันที่ (1–31)
  const [defaultBorrow, setdefaultBorrow] = useState<Device[]>([]);
  /* ================= เก็บข้อมูล ================= */
  const [start, setStart] = useState<Date | null>(null); // วันที่ยืม
  const [end, setEnd] = useState<Date | null>(null); // วันที่คืน
  const [timeStart, setTimeStart] = useState<string>(); // "08:00"
  const [timeEnd, setTimeEnd] = useState<string>(); // "17:30"
 
  const [selectedActiveBorrow, setSelectedActiveBorrow] = useState<
    ActiveBorrow[] | null
  >(null);
  const widthClass = fullWidth ? "w-full" : "w-[489px]";
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isBorrowAvailable = (
    start: Date | null,
    end: Date | null,
    timeStart?: string,
    timeEnd?: string,
    activeBorrow?: ActiveBorrow[] | null
  ): boolean => {
    if (!activeBorrow || activeBorrow.length === 0) return true;

    const now = new Date();

    const parseTime = (time?: string) => {
      if (!time) {
        return {
          hour: now.getHours(),
          minute: now.getMinutes(),
        };
      }
      const [hours, minutes] = time.split(":").map(Number);
      return { hour: hours, minute: minutes };
    };

    const combineDateTime = (date: Date, time?: string) => {
      const day = new Date(date);
      const { hour, minute } = parseTime(time);
      day.setHours(hour, minute, 0, 0);
      return day;
    };

    const startDate = start ?? now;
    const endDate = end ?? now;

    const userStart = combineDateTime(startDate, timeStart);
    const userEnd = combineDateTime(endDate, timeEnd);

    if (userStart > userEnd) return false;

    return !activeBorrow.some((borrow) => {
      const borrowStart = new Date(borrow.da_start);
      const borrowEnd = new Date(borrow.da_end);
      return userStart < borrowEnd && userEnd > borrowStart;
    });
  };

  useEffect(() => {
    setdefaultBorrow(defaultValues);
  }, [defaultValues]);
  useEffect(() => {
    setTimeStart(timeDefault?.time_start)
    setTimeEnd(timeDefault?.time_end)
     
  },[timeDefault]);


 
  let yearValue = 2025;
  useEffect(() => {
    if (!dateDefault) return null;
    setStart(dateDefault.start);
    setEnd(dateDefault.end);
  }, [dateDefault]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const resultYear = new Date(
    yearValue,
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const changeMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
  };

  const getWeekRange = (date: Date) => {
    const today = new Date(date);

    const dayOfWeek = today.getDay();

    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      startDay: startOfWeek,
      endDay: endOfWeek,
    };
  };
  const { startDay } = getWeekRange(new Date());
  const dayValue = Array.from({ length: 7 }, (_, i) => i);

  const formatThaiMonth = (date: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      month: "long",
      year: "numeric",
    }).format(date);

  const hourHeight = 120;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };
  const readyDevices = (defaultBorrow ?? []).filter((device) =>
    isBorrowAvailable(start, end, timeStart, timeEnd, device.activeBorrow)
  );
  const borrowDevices = (defaultBorrow ?? []).filter(
    (device) =>
      !isBorrowAvailable(start, end, timeStart, timeEnd, device.activeBorrow)
  );
  /* ========================================== */
  const timeToMinutes = (time?: string): number | null => {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  const isValidBorrowTime = (
    start: Date | null,
    end: Date | null,
    timeStart?: string,
    timeEnd?: string
  ): boolean => {
    if (!start || !end) return true;

    if (isSameDay(start, end)) {
      const startMin = timeToMinutes(timeStart);
      const endMin = timeToMinutes(timeEnd);

      if (startMin === null || endMin === null) return false;

      return endMin - startMin >= 60;
    }

    return true;
  };
  const mergeDateAndTime = (date: Date, time: string) => {
    const [hour, minute] = time.split(":").map(Number);

    const result = new Date(date);
    result.setHours(hour, minute, 0, 0);

    return result;
  };

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const canBorrow = isValidBorrowTime(start, end, timeStart, timeEnd);

  const timeItems: timeDropdownItem[] = hours.flatMap((hour, index) => {
    return [0, 30]
      .filter((m) => !(hour === 17 && m > 0))
      .map((minute, indexRound) => {
        const isPM = hour >= 12;
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;

        return {
          id: index * 2 + indexRound,
          label: `${displayHour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")} ${isPM ? "PM" : "AM"}`,
          value: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
        };
      });
  });

  const splitBorrowToDays = (
    da_start: string,
    da_end: string
  ): DayTimeRange[] => {
    const start = new Date(da_start);
    const end = new Date(da_end);

    const result: DayTimeRange[] = [];

    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    while (current <= end) {
      const isStartDay = current.toDateString() === start.toDateString();
      const isEndDay = current.toDateString() === end.toDateString();

      const timeStart = isStartDay ? formatAMPM(start) : "8:00 AM";

      const timeEnd = isEndDay ? formatAMPM(end) : "05:00 PM";

      result.push({
        day: current.getDate(),
        timeStart,
        timeEnd,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  const formatAMPM = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const min = minutes.toString().padStart(2, "0");

    return `${hours}:${min} ${ampm}`;
  };

  const buildAllBorrowDays = (
    activeBorrow?: { da_start: string; da_end: string }[] | null
  ): DayTimeRange[] => {
    if (!activeBorrow || activeBorrow.length === 0) return [];

    return activeBorrow.flatMap((b) => splitBorrowToDays(b.da_start, b.da_end));
  };
  const timeBorrow = buildAllBorrowDays(selectedActiveBorrow);

  const timeToMinute = (times: string) => {
    const [time, period] = times.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startHour = 8;

  const calcBlockStyle = (
    timeStart: string,
    timeEnd: string,
    hourHeight: number
  ) => {
    const start = timeToMinute(timeStart);
    const end = timeToMinute(timeEnd);

    return {
      top: ((start - startHour * 60) / 60) * hourHeight + 5,
      height: ((end - start) / 60) * hourHeight,
    };
  };

  const dayBorrow = timeBorrow.find((b) => b.day === day);
  const handleConfirm = () => {
    if (!isValid) return;
    const borrowStart = mergeDateAndTime(start, timeStart);
    const borrowEnd = mergeDateAndTime(end, timeEnd);

    const payload = {
      borrow_start: borrowStart.toISOString(),
      borrow_end: borrowEnd.toISOString(),
      time_start: timeStart,
      time_end: timeEnd,
    };
    console.log(payload);
    onConfirm(payload);
    setOpen(false);
  };
  const isValid =
    start !== null &&
    end !== null &&
    !!timeStart &&
    !!timeEnd &&
    (() => {
      if (!start || !end || !timeStart || !timeEnd) return false;

      const startDateTime = mergeDateAndTime(start, timeStart);
      const endDateTime = mergeDateAndTime(end, timeEnd);

      return startDateTime <= endDateTime;
    })();
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
    start && end
      ? `${formatThaiDate(start)} - ${formatThaiDate(end)}`
      : "วัน/เดือน/ปี";

  return (
    <div className="">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
    ${widthClass}
    flex items-center justify-between text-[#CDCDCD]
    rounded-2xl border border-[#D8D8D8]
    px-4 py-3 text-left
  `}
      >
        <span className="text-[#CDCDCD]">{dateLabel}</span>
        <Icon
          className="text-[#CDCDCD]"
          icon="uil:calendar"
          width="20"
          height="20"
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            ref={ref}
            className="bg-white  p-6 rounded-xl relative  "
            onClick={(e) => e.stopPropagation()} // ป้องกันปิดเมื่อคลิกข้างใน
          >
            <div className="relative w-[1442px] h-[922px] bg-[#F9FAFB] rounded-2xl shadow-xl flex overflow-hidden border border-[#D9D9D9]">
              <div className="w-[392px] bg-white border-r border-r-[#D9D9D9]  overflow-y-auto">
                {/* Device List */}
                <div>
                  <div className="flex items-center text-[16px] gap-2 h-[81px] border-b border-b-[#D9D9D9] p-4 ">
                    <h2 className="font-semibold">รายการอุปกรณ์</h2>
                    <span className="bg-green-100 text-green-600 text-sm px-6 py-2.5 rounded-[10px]">
                      ว่าง {readyDevices.length} / {defaultBorrow?.length ?? 0}
                    </span>
                  </div>
                  <div className="p-4 h-[480px] flex flex-col gap-1 border-b border-b-[#D9D9D9] ">
                    <div className="flex flex-col gap-2">
                      <span>พร้อมให้ยืม ({readyDevices?.length ?? 0})</span>
                      <div className="max-h-45  overflow-y-auto w-98">
                        {readyDevices.length > 0 ? (
                          readyDevices.map((device) => (
                            <div
                              key={device.dec_id}
                              onClick={() => {
                                setSelectedActiveBorrow(device.activeBorrow);
                                setSelectedDeviceId(device.dec_id);
                              }}
                              className={`flex items-center justify-between mb-2 w-[362px] p-3 rounded-xl border 
        shadow-md transition-all duration-200 cursor-pointer
        ${
          selectedDeviceId === device.dec_id
            ? "border-[#40A9FF] shadow-lg"
            : "border-[#D8D8D8] hover:border-[#40A9FF] hover:shadow-lg"
        }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#00AA1A] flex items-center justify-center">
                                  <Icon
                                    icon="pajamas:check"
                                    width="13"
                                    height="13"
                                    className="text-white"
                                  />
                                </span>
                                <span>{device.dec_serial_number}</span>
                              </div>

                              <span className="px-3 py-1 rounded-lg text-sm bg-[#00AA1A]/10 text-[#00AA1A]">
                                พร้อมยืม
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="h-45 flex items-center justify-center text-gray-400">
                            ไม่มีอุปกรณ์ที่พร้อมยืม
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span>ไม่ว่าง ({borrowDevices?.length ?? 0})</span>
                      <div className="max-h-45  overflow-y-auto w-98">
                        {borrowDevices.length > 0 ? (
                          borrowDevices.map((device) => (
                            <div
                              key={device.dec_id}
                              onClick={() => {
                                setSelectedActiveBorrow(device.activeBorrow);
                                setSelectedDeviceId(device.dec_id);
                              }}
                              className={`flex items-center justify-between mb-2 w-[362px] p-3 rounded-xl border 
                        shadow-md transition-all duration-200 cursor-pointer
                        ${
                          selectedDeviceId === device.dec_id
                            ? "border-[#40A9FF] shadow-lg"
                            : "border-[#D8D8D8] hover:border-[#40A9FF] hover:shadow-lg"
                        }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#ED1A1A] flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-[#ED1A1A] border border-white "></div>
                                </div>
                                <span>{device.dec_serial_number}</span>
                              </div>

                              <span className="px-3 py-1 rounded-lg text-sm bg-[#ED1A1A]/10 text-[#ED1A1A]">
                                ถูกยืม
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="h-45 flex items-center justify-center text-gray-400">
                            ไม่มีอุปกรณ์ที่พร้อมยืม
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {/* Borrow Form */}
                    <div className=" p-4">
                      <h3 className="font-semibold mb-4">
                        วันและเวลาที่ต้องการยืม
                      </h3>

                      <div className="space-y-3">
                        <div className="flex gap-2 items-center justify-center">
                          <label className="w-20">วันที่ยืม</label>
                          <DateValue
                            value={{ start, end }}
                            onChange={(startDate, endDate) => {
                              setStart(startDate);
                              setEnd(endDate);
                            }}
                          />
                        </div>

                        <div className="flex gap-2 items-center justify-center">
                          <label className="w-20">เวลายืม</label>
                          <DropdownTime
                            value={timeStart}
                            onChange={setTimeStart}
                            options={timeItems}
                            placeholder="เวลายืม"
                          />
                        </div>

                        <div className="flex gap-2 items-center justify-center">
                          <label className="w-20">เวลาคืน</label>
                          <DropdownTime
                            value={timeEnd}
                            onChange={setTimeEnd}
                            options={timeItems}
                            placeholder="เวลายืม"
                          />
                        </div>

                        {start &&
                          end &&
                          isSameDay(start, end) &&
                          !canBorrow && (
                            <p className="text-red-500 text-sm">
                              การยืมวันเดียวกัน ต้องเลือกเวลาขั้นต่ำ 1 ชั่วโมง
                            </p>
                          )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="flex-1 border rounded-xl py-2"
                            onClick={() => {
                              setStart(null);
                              setEnd(null);
                              setTimeStart(undefined);
                              setTimeEnd(undefined);
                            }}
                          >
                            ล้างค่า
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!isValid}
                            className={`
    flex-1 rounded-xl py-2 text-white transition
    ${
      isValid
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-gray-300 cursor-not-allowed"
    }
  `}
                          >
                            ยืนยัน
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ================= RIGHT ================= */}
              <div className="flex-1  overflow-auto">
                <div className="flex justify-between items-center h-20 w-[1030px]">
                  <div className="flex gap-1.5 items-center">
                    <button type="button" onClick={() => changeMonth(-1)}>
                      <Icon
                        icon="proicons:chevron-left"
                        width="18"
                        height="18"
                      />
                    </button>

                    <h2 className="font-semibold text-lg">
                      {formatThaiMonth(currentMonth)}
                    </h2>

                    {/* Next */}
                    <button type="button" onClick={() => changeMonth(1)}>
                      <Icon
                        icon="proicons:chevron-right"
                        width="18"
                        height="18"
                      />
                    </button>
                  </div>

                  <div className="  flex overflow-hidden text-sm">
                    <button
                      type="button"
                      onClick={() => setActive("month")}
                      className={`${baseClass}  rounded-l-xl ${
                        active === "month" ? activeClass : inactiveClass
                      }`}
                    >
                      Month
                    </button>

                    <button
                      type="button"
                      onClick={() => setActive("week")}
                      className={`${baseClass} ${
                        active === "week" ? activeClass : inactiveClass
                      }`}
                    >
                      Week
                    </button>

                    <button
                      type="button"
                      onClick={() => setActive("day")}
                      className={`${baseClass} rounded-r-xl ${
                        active === "day" ? activeClass : inactiveClass
                      }`}
                    >
                      Day
                    </button>
                  </div>
                </div>
                {active === "month" && (
                  <div className="w-[1030px]   pb-5">
                    <div className="grid grid-cols-7 border-t border-t-[#D9D9D9]">
                      {Array.from({ length: resultYear }).map((_, index) => {
                        const dayIndex = index % 7;

                        return (
                          <div
                            key={index}
                            className="h-[142px] border-r border-b border-r-[#D9D9D9] border-b-[#D9D9D9] p-2 relative text-sm"
                          >
                            {index < 7 && (
                              <span className="absolute top-2 left-2 font-medium">
                                {days[dayIndex]}
                              </span>
                            )}

                            <span className="absolute top-2 right-2 text-black">
                              {index + 1 <= 31 ? index + 1 : ""}
                            </span>
                            {timeBorrow.map((borrow, idx) =>
                              borrow.day === index + 1 ? (
                                <div
                                  key={idx}
                                  className="absolute top-10 left-2 right-2 bottom-[10%] w-33.25 h-13
                 bg-[#FFEEEE] border border-[#FF4D4F]
                 rounded-md p-2 z-0"
                                >
                                  <p className="text-red-500 text-[10px] font-bold">
                                    อุปกรณ์นี้ถูกยืม
                                  </p>
                                  <p className="text-red-400 text-[8px]">
                                    {borrow.timeStart} - {borrow.timeEnd}
                                  </p>
                                </div>
                              ) : null
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {active === "week" && (
                  <div className="w-[1030px] pb-5">
                    <div className="grid grid-cols-[90px_repeat(7,134px)] border-t border-t-[#D9D9D9]">
                      {/* Header */}
                      <div />
                      {dayValue.map((offset) => {
                        const day = startDay.getDate() + offset;
                        return (
                          <div
                            key={day}
                            className="text-center py-2 border border-[#D9D9D9]"
                          >
                            วันที่ {day}
                          </div>
                        );
                      })}

                      {hours.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="border border-[#D9D9D9] text-right pr-2">
                            {formatHour(hour)}
                          </div>

                          {dayValue.map((offset) => {
                            const day = startDay.getDate() + offset;
                            const borrow = timeBorrow.find(
                              (b) => b.day === day
                            );

                            return (
                              <div
                                key={day}
                                className="relative border border-[#D9D9D9]"
                                style={{ height: hourHeight }}
                              >
                                {/* เส้นแบ่งครึ่งชั่วโมง */}
                                <div className="border-b border-b-[#D9D9D9] border-dashed h-1/2" />

                                {/* แสดง block แค่ครั้งเดียว */}
                                {hour === 8 && borrow && (
                                  <div
                                    className="absolute left-2 right-2 bg-[#FFEEEE] border border-[#FF4D4F] rounded-md p-2 z-10"
                                    style={calcBlockStyle(
                                      borrow.timeStart,
                                      borrow.timeEnd,
                                      hourHeight - 0.5
                                    )}
                                  >
                                    <p className="text-[#FF4D4F] text-[10px] font-bold">
                                      อุปกรณ์นี้ถูกยืม
                                    </p>
                                    <p className="text-[#FF4D4F] text-[8px]">
                                      {borrow.timeStart} - {borrow.timeEnd}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {active === "day" && (
                  <div className="w-[1030px] pb-5">
                    <div className="grid grid-cols-[90px_1fr] border-t border-t-[#D9D9D9]">
                      <div className="border-r border-b border-b-[#D9D9D9] border-r-[#D9D9D9] text-center py-2 font-medium" />
                      <div className="border-r border-b border-b-[#D9D9D9] border-r-[#D9D9D9] text-center py-2 font-medium">
                        วันที่ {day}
                      </div>
                      {hours.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="flex border-r border-b border-b-[#D9D9D9] border-r-[#D9D9D9] text-sm justify-center py-3">
                            {formatHour(hour)}
                          </div>

                          <div
                            className="relative border-r border-b border-b-[#D9D9D9] border-r-[#D9D9D9]"
                            style={{ height: hourHeight }}
                          >
                            <div className="border-b border-dashed border-b-[#D9D9D9]  h-1/2" />
                            {hour === hours[0] && dayBorrow && (
                              <div
                                className="absolute left-2 right-2 bg-red-50 border border-red-200 rounded-md p-2 z-10"
                                style={calcBlockStyle(
                                  dayBorrow.timeStart,
                                  dayBorrow.timeEnd,
                                  hourHeight - 0.5
                                )}
                              >
                                <p className="text-red-500 text-[10px] font-bold">
                                  อุปกรณ์นี้ถูกยืม
                                </p>
                                <p className="text-red-400 text-[8px]">
                                  {dayBorrow.timeStart} - {dayBorrow.timeEnd}
                                </p>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
