import * as Popover from "@radix-ui/react-popover"
import { useState } from "react"

// โครงสร้าง props ที่ต้องส่งมาเมื่อเรียกใช้งาน
interface TimePickerFieldProps {
    label?: string; // หัวข้อ
    value: string; // เวลา
    onChange: (time: string) => void; // เปลี่ยนเวลา
}

const TimePickerField = ({ label = "เวลา", value, onChange }: TimePickerFieldProps) => {
    const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]; // เวลาที่สามารถเลือกได้ภายใน Popup
    const [tempTime, setTempTime] = useState<string>(value); // เก็บเวลาที่เลือก

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
                        className={`border border-[#A2A2A2] rounded-[16px] w-[137px] h-[46px] text-center text-[16px] ${value ? "text-black" : "text-[#CDCDCD]"}`}
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
                                <button
                                    type="button"
                                    key={hour}
                                    onClick={() => setTempTime(hour)}
                                    className={`py-2 rounded-xl text-[18px]
                                    ${tempTime === hour
                                        ? "bg-[#40A9FF] text-white"
                                        : "hover:bg-blue-100"
                                    }
                `               }>
                                    {hour}
                                </button>
                            ))}
                    </div>
                    <div className="flex justify-end">
                        {/* ปิด Popover */}
                        <Popover.Close asChild>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(tempTime) // เปลี่ยนเวลาที่เลือกและส่งไปตัวที่เรียกใช้งาน
                                }}
                                className="bg-[#40A9FF] border border-[#1890FF] text-white w-[38px] h-[26px] rounded-full hover:bg-blue-500"
                            >
                                OK
                            </button>
                        </Popover.Close>
                    </div>
                </Popover.Content>
            </Popover.Root>
        </div>
    )
}

export default TimePickerField