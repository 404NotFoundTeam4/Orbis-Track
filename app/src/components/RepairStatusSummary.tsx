import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    type PieLabelRenderProps
} from "recharts";

// โครงสร้างของข้อมูลในการแสดงกราฟ
interface RepairRateItem {
    name: string; // ชื่อสถานะ
    value: number; // ค่า (ที่ไม่ใช่เปอร์เซ็น เปอร์เซ็นจะถูกคำนวณในส่วนของ percentage)
}

// โครงสร้างข้อมูลที่ต้องส่งมาเมื่อเรียกใช้งาน
interface RepairRateProps {
    title?: string; // หัวข้อการ์ด
    width?: number; // ความกว้างของการ์ด
    height?: number; // ความสูงของการ์ด
    isAnimation?: boolean; // อนิเมชันตอนโหลดกราฟ
    data: RepairRateItem[]; // ข้อมูลสำหรับสร้างกราฟ
}

// สีของกราฟในแต่ละ slice
const COLORS = ["#4A90E2", "#7ED321", "#FF4D4F", "#F5A623"];

const RepairStatusSummary = ({
    // ค่า Default
    title = "สรุปสถานะการซ่อม",
    width = 666,
    height = 405,
    isAnimation = true,
    data
}: RepairRateProps) => {
    // กรองข้อมูลที่มีค่าเป็น 0 ออก
    const filteredData = data.filter(item => item.value > 0);
    // คำนวณผลรวมของข้อมูล เพื่อตรวจสอบว่าควรแสดงกราฟหรือไม่
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);

    /**
    * Description: ฟังก์ชันสำหรับการ Custom label สำหรับแสดงชื่อและเปอร์เซ็นต์
    * Input : props (name, percent, x, y, textAnchor) - ชื่อ, สัดส่วน, ตำแหน่งแกน x, ตำแหน่งแกน y, ความชิดของข้อความ
    * Output : แสดงข้อความ 2 บรรทัด ได้แก่ ชื่อและเปอร์เซ็นต์
    * Author: Thakdanai Makmi (Ryu) 66160355
    */
    const renderCustomLabel = ({ name, percent, x, y, textAnchor }: PieLabelRenderProps) => {
        // ระยะห่างข้อความ (ชื่อและเปอร์เซ็นต์) จากเส้น label
        const offset = 10;
        // คำนวณเป็นเปอร์เซ็นต์
        const percentage = typeof percent === "number" ? (percent * 100).toFixed(0) : "0";
        // ปรับตำแหน่ง X ตามฝั่งของ label (ไม่ให้ข้อความชนเส้น)
        const positionX = textAnchor === "start" ? x + offset : x - offset;

        return (
            <g>
                {/* Name */}
                <text
                    x={positionX} // ตำแหน่งแกน X ของข้อความ
                    y={y - 6} // ตำแหน่งแกน Y ของข้อความ
                    textAnchor={textAnchor} // กำหนดการจัดแนวนอนของข้อความ
                    fill="#7A808A" // สีของข้อความ
                    fontSize={14} // ขนาดของข้อความ
                >
                    {name}
                </text>
                {/* Percent */}
                <text
                    x={positionX}
                    y={y + 18}
                    textAnchor={textAnchor}
                    fill="#252B41"
                    fontSize={16}
                    fontWeight={600}
                >
                    {percentage}%
                </text>
            </g>
        );
    };

    return (
        <div
            className="bg-[#FFFFFF] border border-[#D9D9D9] rounded-[16px] px-[46px] py-[25px]"
            style={{
                width: `${width}px`,
                height: `${height}px`
            }}
        >
            {/* Header */}
            <h2 className="text-center text-[18px] font-semibold mb-4">
                {title}
            </h2>
            {/* Graph */}
            {(!data || data.length === 0 || total === 0)
                // กรณีไม่มีข้อมูลหรือผลรวมเป็น 0
                ? (
                    <div className="flex justify-center items-center h-[90%]">
                        <span className="text-gray-400 text-sm">ไม่มีข้อมูล</span>
                    </div>
                ) : (
                    <div className="relative h-[90%]">
                        {/* Pie */}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    style={{ outline: "none" }} // เอากรอบออกเมื่อมีการ click ที่กราฟ
                                    data={filteredData} // ข้อมูล
                                    cx="50%" // จัดกึ่งกลางแนวนอน
                                    cy="50%" // จัดกึ่งกลางแนวตั้ง
                                    outerRadius={120} // รัศมีวงกลม (ความใหญ่ของวงกลม)
                                    dataKey="value" // ใช้ key "value" ในการคำนวณขนาด
                                    label={renderCustomLabel} // custom label
                                    stroke="none" // เอาขอบออก
                                    isAnimationActive={isAnimation} // การเปิดปิด animation
                                >
                                    {filteredData.map((_, index) => (
                                        // กำหนดสีแต่ละ slice
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* แสดงข้อมูลตอน hover */}
                                <Tooltip isAnimationActive={isAnimation} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="absolute bottom-3 left-4 flex flex-col gap-2">
                            {/* แสดง Legend ครบทุกตัว แม้ว่าตัวนั้นจะไม่มีข้อมูล */}
                            {data.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        // สีของ legend ตาม slice
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-[#7A808A] text-sm">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
        </div>
    );
}

export default RepairStatusSummary