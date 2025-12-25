import * as Popover from "@radix-ui/react-popover"
import { useState } from "react"

// โครงสร้าง props ที่ต้องส่งมาเมื่อเรียกใช้งาน
interface TimePickerFieldProps {
    label?: string; // หัวข้อ
    value: string; // เวลา
    width?: number;
    onChange: (time: string) => void; // เปลี่ยนเวลา
}

const TimePickerField = ({
    // default
    label = "เวลา",
    value,
    width = 137,
    onChange
}: TimePickerFieldProps) => {
    const hours = [
        "09:00", "09:30",
        "10:00", "10:30",
        "11:00", "11:30",
        "12:00", "12:30",
        "13:00", "13:30",
        "14:00", "14:30",
        "15:00", "15:30",
        "16:00", "16:30",
        "17:00"
    ]; // เวลาที่สามารถเลือกได้ภายใน Popup

    return (
        <div className="flex flex-col gap-1">
            {/* หัวข้อ */}
            <label className="font-medium">{label}</label>
            {/* เวลา */}
            <Popover.Root>
                {/* เปิด Popover Select เวลา */}
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={`border border-[#A2A2A2] rounded-[16px] h-[46px] text-center text-[16px] ${value ? "text-black" : "text-[#CDCDCD]"}`}
                        style={{ width: width }}
                    >
                        {value || "ขั่วโมง : นาที"}
                    </button>
                </Popover.Trigger>
                {/* Popup เลือกเวลา */}
                <Popover.Content
                    sideOffset={6} // ระยะห่างจากปุ่มที่กด (trigger)
                    className="bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2 w-[137px]"
                >
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-scroll">
                        {
                            // ลูปแสดงเวลา
                            hours.map((hour) => (
                                <Popover.Close key={hour} asChild>
                                    <button
                                        type="button"
                                        onClick={() => onChange(hour)}
                                        className={`py-2 rounded-xl text-[18px]
                                    ${value === hour
                                                ? "bg-[#40A9FF] text-white"
                                                : "hover:bg-blue-100"
                                            }
                `               }>
                                        {hour}
                                    </button>
                                </Popover.Close>
                            ))}
                    </div>
                </Popover.Content>
            </Popover.Root>
        </div>
    )
}

export default TimePickerField