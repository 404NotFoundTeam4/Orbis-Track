import * as Popover from "@radix-ui/react-popover"
import { Icon } from "@iconify/react"

// โครงสร้าง props ที่ต้องส่งมาเมื่อเรียกใช้งาน
interface TimePickerFieldProps {
    label?: string; // หัวข้อ
    value: string; // เวลา
    width?: number;
    placeholder?: string;
    onChange: (time: string) => void; // เปลี่ยนเวลา
    date?: Date | null; // เวลาที่เลือก
}

const TimePickerField = ({
    // default
    label = "เวลา",
    value,
    width = 137,
    placeholder = "ชั่วโมง : นาที",
    onChange,
    date
}: TimePickerFieldProps) => {
    const hours = [
        "08:00", "08:30",
        "09:00", "09:30",
        "10:00", "10:30",
        "11:00", "11:30",
        "12:00", "12:30",
        "13:00", "13:30",
        "14:00", "14:30",
        "15:00", "15:30",
        "16:00", "16:30",
        "17:00", "17:30",
        "18:00"
    ]; // เวลาที่สามารถเลือกได้ภายใน Popup

    // แปลงเวลาเป็น AM หรือ PM
    const formatToAMPM = (time: string) => {
        const [hour, minute] = time.split(":").map(Number); // แยกชั่วโมงและนาที
        const period = hour >= 12 ? "PM" : "AM"; // แปลงชั่วโมงเป็น AM หรือ PM
        const hour12 = (hour % 12 === 0 ? 12 : hour % 12).toString().padStart(2, "0");
        return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    /**
    * Description: ตรวจสอบว่าเวลาที่เลือกเป็นเวลาที่ผ่านมาแล้วหรือไม่
    * Input : time - เวลาในรูปแบบ "HH:mm"
    * Output : true - เวลาที่เลือกอยู่ในอดีต, false - เวลาที่ยังไม่ผ่าน
    * Author : Thakdanai Makmi (Ryu) 66160355
    */
    const isPastTime = (time: string) => {
        if (!date) return false;
        const now = new Date(); // วันที่ปัจจุบัน
        const [hour, minute] = time.split(":").map(Number); // แยกชั่วโมงและนาที
        const selected = new Date(date); // วันที่เลือก
        selected.setHours(hour, minute, 0, 0); // กำหนดเวลาให้กับวันที่ที่เลือก
        return selected < now;
    }

    return (
        <div className="flex flex-col gap-1 z-10">
            {/* หัวข้อ */}
            <label className="font-medium">{label}</label>
            {/* เวลา */}
            <Popover.Root>
                {/* เปิด Popover Select เวลา */}
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={`group flex items-center justify-between border border-[#D8D8D8] rounded-[16px] h-[46px] text-left px-5 text-[16px] ${value ? "text-black" : "text-[#CDCDCD]"}`}
                        style={{ width: width }}
                    >
                        {value ? formatToAMPM(value) : placeholder}

                        <Icon
                            icon="mdi:chevron-down"
                            className="text-[#A2A2A2] transition-transform duration-200 group-data-[state=open]:rotate-180"
                            width={22}
                            height={22}
                        />
                    </button>
                </Popover.Trigger>
                {/* Popup เลือกเวลา */}
                <Popover.Content
                    sideOffset={6} // ระยะห่างจากปุ่มที่กด (trigger)
                    className="bg-white rounded-2xl shadow-xl flex flex-col gap-2 w-[239px]"
                >
                    <div className="flex flex-col max-h-[322px] overflow-y-scroll">
                        {
                            // ลูปแสดงเวลา
                            hours.map((hour) => {
                                const disabled = isPastTime(hour); // เวลาที่เลือกอยู่ในอดีต

                                return (
                                    <Popover.Close key={hour} asChild>
                                        <button
                                            type="button"
                                            onClick={() => onChange(hour)}
                                            className={`px-5 py-3 rounded-xl text-left text-[16px]
                                                ${disabled
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : value === hour
                                                        ? "bg-[#F6F6F6]"
                                                        : "hover:bg-[#F6F6F6]"
                                                }`}
                                            disabled={disabled}
                                        >
                                            {formatToAMPM(hour)}
                                        </button>
                                    </Popover.Close>
                                )
                            })}
                    </div>
                </Popover.Content>
            </Popover.Root>
        </div>
    )
}

export default TimePickerField
