import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

interface BorrowRateItem {
  name: string;
  value: number;
}

interface BorrowRateProps {
  title?: string;
  width?: number;
  height?: number;
  isAnimation?: boolean;
  data: BorrowRateItem[];
}

/* 🔥 ไล่เฉดสีแต่ละแท่ง */
const GRADIENT_COLORS = [
  ["#40A9FF", "#40A9FF"],
  ["#69C0FF", "#69C0FF"],
  ["#91D5FF", "#91D5FF"],
  ["#BAE7FF", "#BAE7FF"],
  ["#E6F7FF", "#E6F7FF"],
];

const BorrowStatusSummary = ({
  title = "อุปกรณ์ที่ถูกยืมบ่อยที่สุด",
  width = 900,
  height = 500,
  isAnimation = true,
  data,
}: BorrowRateProps) => {
  const filteredData = [...data]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...filteredData.map((d) => d.value));
   
 const getSmartMax = (value: number) => {
  if (value <= 100) return 100;
  if (value <= 500) return 500;
  if (value <= 1000) return 1000;
  if (value <= 5000) return 5000;
  return 10000;
};

const maxDomain = getSmartMax(maxValue);
  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-[20px] px-10 py-8"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <h2 className="text-[20px] font-bold text-[#1F2937] mb-8">{title}</h2>

      {total === 0 ? (
        <div className="flex justify-center items-center h-[80%] text-gray-400">
          ไม่มีข้อมูล
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 20, bottom: 0 }}
          >
            <defs>
              {filteredData.map((_, index) => (
                <linearGradient
                  key={index}
                  id={`gradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      GRADIENT_COLORS[index % GRADIENT_COLORS.length][0]
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      GRADIENT_COLORS[index % GRADIENT_COLORS.length][1]
                    }
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#E5E7EB"
            />
            <XAxis
              type="number"
              domain={[0, maxDomain]}
              ticks={[
                0,
                maxDomain * 0.25,
                maxDomain * 0.5,
                maxDomain * 0.75,
                maxDomain,
              ]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF" }}
            />

            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 16 }}
              width={140}
            />

            <Tooltip />

            <Bar
              dataKey="value"
              radius={[12, 12, 12, 12]}
              barSize={28}
              isAnimationActive={isAnimation}
            >
              {filteredData.map((_, index) => (
                <Cell key={index} fill={`url(#gradient-${index})`} />
              ))}

              <LabelList
                dataKey="value"
                position="right"
                style={{
                  fill: "#6B7280",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BorrowStatusSummary;
