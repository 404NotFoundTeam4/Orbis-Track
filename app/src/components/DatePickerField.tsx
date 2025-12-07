import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale/th";
import { Icon } from "@iconify/react";

// โครงสร้าง props ที่ต้องส่งมาเมื่อเรียกใช้งาน
interface DatePickerFieldProps {
  label?: string; // หัวข้อ
  value: Date | null; // วันที่
  width?: number;
  onChange: (date: Date | null) => void; // เปลี่ยนวัน
}

const DatePickerField = ({
  // default
  label = "วันที่",
  value,
  width = 280,
  onChange
}: DatePickerFieldProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);   // ควบคุมการเปิด / ปิด popup
  const [tempDate, setTempDate] = useState<Date | null>(value); // เก็บวันที่เลือก

  // ให้ popup เปิดมาพร้อมค่าล่าสุด
  useEffect(() => {
    setTempDate(value);
  }, [value]);

  // แปลงวันที่เป็น พ.ศ. สำหรับแสดงในช่อง Input
  const formatThaiInput = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // ตกแต่ง Header ปฏิทิน
  const CustomHeader = ({
    date, // วันที่ปัจจุบันที่ปฏิทินกำลังแสดง
    decreaseMonth, // เดือนย้อนหลัง
    increaseMonth // เดือนถัดไป
  }: any) => (
    <div className="flex items-center justify-between px-4 py-2 text-black">
      <Icon
        onClick={decreaseMonth}
        className="text-gray-400 hover:bg-gray-200 hover:text-black rounded-md w-8 h-8 cursor-pointer"
        icon="mdi:chevron-left"
        width="22"
        height="22"
      />
      <span>
        {/* แสดงชื่อเดือนเต็มและปี */}
        {date.toLocaleString("th-TH", {
          month: "long",
          year: "numeric"
        })}
      </span>
      <Icon
        onClick={increaseMonth}
        className="text-gray-400 hover:bg-gray-200 hover:text-black rounded-md w-8 h-8 cursor-pointer"
        icon="mdi:chevron-right"
        width="22"
        height="22"
      />
    </div>
  );

  // ตกแต่งช่อง Input ปฏิทิน
  const CustomInput = forwardRef<HTMLInputElement>((props, ref) => (
    <input
      ref={ref}
      {...props} // รับ props ที่ DatePicker ส่งเข้ามา
      readOnly // ป้องกันผู้ใช้พิมพ์เอง
      value={formatThaiInput(value)} // แสดงวันที่แบบไทย
      placeholder="วัน/เดือน/ปี"
      className="border border-[#A2A2A2] h-[46px] text-[16px] rounded-[16px] px-5 py-[6px] cursor-pointer"
      style={{ width: width }}
    />
  ));

  // ตกแต่งปฏิทินแยก
  const datepickerStyle = `
    /* กล่องปฏิทิน */
    .react-datepicker {
      background-color: #FFFFFF !important;
      border: none !important;
      border-radius: 16px !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
      overflow: hidden !important;
    }

    /* ส่วนหัวของปฏิทิน */
    .react-datepicker__header {
      background-color: #FFFFFF !important;
      border-bottom: 1px solid #E5E7EB !important;
      border-top-left-radius: 16px !important;
      border-top-right-radius: 16px !important;
    }

    /* วันที่เลือก */
    .react-datepicker__day--selected,
    .react-datepicker__day--selected:hover {
      background-color: #1890FF !important;
      color: #ffffff !important;
    }

    /* hover สำหรับวันที่เลือก */
    .react-datepicker__day--selected:hover {
      background-color: #3b82f6 !important;
    }

    /* โฟกัสคีย์บอร์ดเหมือน selected */
    .react-datepicker__day--keyboard-selected {
      background-color: #1890FF !important;
      color: #ffffff !important;
    }

    /* เส้นคั่นก่อนปุ่ม OK */
    .react-datepicker__month-container::after {
      content: "";
      display: block;
      border-top: 1px solid #E5E7EB;
      margin-top: 8px;
      margin-bottom: 8px;
    }
  `;

  // ปรับแต่งโครงสร้าง Popup โดยการ เพิ่มปุ่ม OK ต่อท้าย
  const CustomContainer = ({ children }: any) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
      {/* calendar */}
      {children}

      {/* ปุ่ม OK */}
      <div className="text-right">
        <button
          className="bg-[#1890FF] hover:bg-blue-500 text-white text-md rounded-full w-[38px] h-[24px]"
          onClick={() => {
            onChange(tempDate); // เปลี่ยนวันที่เลือกและส่งไปตัวที่เรียกใช้งาน
            setIsOpen(false); // ปิด popup
          }}
        >
          OK
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-[4px]">
      {/* หัวข้อ */}
      <label className="font-medium">{label}</label>
      {/* ปฏิทิน */}
      <div className="relative">
        <style>{datepickerStyle}</style>
        <DatePicker
          placeholderText="วัน/เดือน/ปี"
          selected={value} // วันที่เลือก
          open={isOpen}
          locale={th} // ภาษาไทย
          onChange={(selectDate) => {
            setTempDate(selectDate); // เก็บวันที่เลือก
          }}
          minDate={new Date()} // เลือกวันที่ผ่านมาไม่ได้
          onInputClick={() => setIsOpen(true)} // เปิด popup เมื่อกดภายในช่อง
          onClickOutside={() => setIsOpen(false)} // ปิด popup เมื่อกดข้างนอก
          renderCustomHeader={(props) => <CustomHeader {...props} />} // ใช้ Header ที่ตกแต่งแยก
          customInput={<CustomInput />} // ใช้ Input ที่ตกแต่งแยก
          calendarContainer={CustomContainer} // ใช้โครงสร้างที่ตกแต่งแยก
        />
        {/* Icon ปฏิทิน */}
        <Icon
          className="absolute top-3 right-4 cursor-pointer"
          icon="uil:calendar"
          width="20"
          height="20"
          onClick={() => setIsOpen(true)} // เปิด popup เมื่อกด icon
        />
      </div>
    </div>
  )
}

export default DatePickerField