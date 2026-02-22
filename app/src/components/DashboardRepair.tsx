/**
 * Description: Section ใต้แท็บ "การใช้งานอุปกรณ์" (ส่วนในวงแดงตามภาพ)
 * - รับข้อมูลจาก Dashboard.tsx ผ่าน props
 * - Layout: Summary Cards (บน) -> Line Chart + Status Summary (กลาง) -> Bar + HBar (ล่าง)
 * Author    : Nontapat Sinthum (Guitar) 66160104
 */
import { type ReactNode } from "react";
import { Icon } from "@iconify/react";
import DashboardSummaryCard, {
  type DashboardSummaryCardType,
} from "./DashboardSummaryCard";
import CardDashboard from "./CardDashboard";

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function classNames(
  ...classNameParts: Array<string | false | undefined | null>
) {
  return classNameParts.filter(Boolean).join(" ");
}

/**
 * Description: ข้อมูลที่ใช้ใน Summary Cards (ส่งจาก Dashboard.tsx)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type DashboardSummaryCardItem = {
  cardType: DashboardSummaryCardType;
  count: number | string;
  subtitle: string;
  badgeLabel: string;
  onClick?: () => void;
};

/**
 * Description: ข้อมูล line chart (จำนวนการยืม-คืนรายเดือน)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LinePoint = { label: string; value: number };

/**
 * Description: ข้อมูล bar chart (สถิติการใช้งานอุปกรณ์ของแต่ละแผนก)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type BarGroup = {
  label: string;
  series: { name: "การยืม" | "การคืน" | "สถานะผิดปกติ"; value: number }[];
};

/**
 * Description: ข้อมูล horizontal bar chart (อุปกรณ์ที่ถูกยืมบ่อยที่สุด)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type HBarItem = { label: string; value: number };

/**
 * Description: แถวสรุปสถานะอุปกรณ์ (การ์ดขวาบน)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type StatusSummaryRow = {
  label: string;
  value: number;
  bg: string;
  bar: string;
};

/**
 * Description: Props ของ Section นี้ (รับค่าจาก Dashboard.tsx)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type DashboardDeviceProps = {
  summaryCards: DashboardSummaryCardItem[];

  lineData: LinePoint[];
  barData: BarGroup[];
  hbarData: HBarItem[];

  statusSummary: {
    title?: string;
    rows: StatusSummaryRow[];
    max: number;
  };
};

export default function DashboardDevice({
  summaryCards,
  lineData,
  barData,
  hbarData,
  statusSummary,
}: DashboardDeviceProps) {
  return (
    <div className="mt-4">
      {/* ===== Summary Cards (แถวบน) ===== */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {summaryCards.map((c) => (
          <DashboardSummaryCard
            key={c.cardType}
            cardType={c.cardType}
            count={c.count}
            subtitle={c.subtitle}
            badgeLabel={c.badgeLabel}
            onClick={c.onClick}
          />
        ))}
      </div>

      {/* ===== กลาง: Line chart (ซ้าย) + Status summary (ขวา) ===== */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
        {/* Line chart */}
        <CardDashboard
          icon="fluent-mdl2:repair"
          title="หน้าหลัก"
          bgColor={["#D3ADF7", "#EFDBFF", "#FFFFFF"]}
          borderColor={["#FFFFFF", "#9254DE"]} 
          titleBorderColor={"#722ED1"} 
          colorTheme={"#9254DE"} 
          count={0}      
          
          />
           <CardDashboard
          icon="picon:check"
          
          title="หน้าหลัก"
          bgColor={["#D3ADF7", "#EFDBFF", "#FFFFFF"]}
          borderColor={["#FFFFFF", "#9254DE"]} 
          titleBorderColor={"#722ED1"} 
          colorTheme={"#9254DE"} 
          count={0}      
          
          />
        {/* Status summary card (ขวาบน) */}
        <Card>
          <div className="text-sm font-semibold text-neutral-900">
            {statusSummary.title ?? "จำนวนอุปกรณ์ทั้งหมดในแผนก"}
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[360px]">
              <div className="grid grid-cols-[1.2fr_0.6fr] px-2 text-xs font-semibold text-neutral-500">
                <div>สถานะอุปกรณ์</div>
                <div className="text-right">จำนวน</div>
              </div>

              <div className="mt-2 space-y-2">
                {statusSummary.rows.map((row) => {
                  const pct = Math.max(
                    0,
                    Math.min(
                      100,
                      (row.value / Math.max(statusSummary.max, 1)) * 100,
                    ),
                  );

                  return (
                    <div
                      key={row.label}
                      className="grid grid-cols-[1.2fr_0.6fr] items-center gap-3 rounded-xl px-2 py-2"
                      style={{ background: row.bg }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${pct}%`, background: row.bar }}
                          />
                        </div>

                        <div className="min-w-[110px] text-sm font-medium text-neutral-800">
                          {row.label}
                        </div>
                      </div>

                      <div className="text-right text-sm font-semibold text-neutral-900">
                        {row.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== ล่าง: Group bar (ซ้าย) + Horizontal bar (ขวา) ===== */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Grouped bar chart */}
        <Card>
          <div className="text-sm font-semibold text-neutral-900">
            สถิติการใช้งานอุปกรณ์ของแต่ละแผนก
          </div>

          <div className="mt-3">
            <GroupedBarChartSvg data={barData} height={240} />
          </div>

          <Legend
            items={[
              { label: "การยืม", dot: "#1890FF" },
              { label: "การคืน", dot: "#BFBFBF" },
              { label: "สถานะผิดปกติ", dot: "#FF4D4F" },
            ]}
          />
        </Card>

        {/* Horizontal bar chart */}
        <Card>
          <div className="text-sm font-semibold text-neutral-900">
            อุปกรณ์ที่ถูกยืมบ่อยที่สุด
          </div>

          <div className="mt-3">
            <HorizontalBarChartSvg data={hbarData} height={240} />
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Description: การ์ด container แบบเดียวกันทั้งหน้า
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[#D9D9D9] bg-white p-5 shadow-[0_8px_18px_rgba(0,0,0,0.03)]">
      {children}
    </div>
  );
}

/**
 * Description: Legend ใต้กราฟ (dot + label)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function Legend({ items }: { items: { label: string; dot: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: it.dot }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}

/**
 * Description: Line chart แบบ SVG (ไม่พึ่ง lib)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function LineChartSvg({ data, height }: { data: LinePoint[]; height: number }) {
  const width = 980;
  const padding = { top: 10, right: 20, bottom: 28, left: 36 };

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = 0;

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (plotW * i) / Math.max(data.length - 1, 1);
    const y =
      padding.top +
      plotH -
      ((d.value - minValue) / Math.max(maxValue - minValue, 1)) * plotH;
    return { x, y };
  });

  const pathD = points
    .map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const ticks = [0, 30, 60, 90, 120];
  const tickMax = Math.max(...ticks, maxValue);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
    >
      {ticks.map((t) => {
        const y =
          padding.top + plotH - ((t - 0) / Math.max(tickMax - 0, 1)) * plotH;

        return (
          <g key={t}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#EDEDED"
              strokeWidth="1"
            />
            <text x={10} y={y + 4} fontSize="12" fill="#9CA3AF">
              {t}
            </text>
          </g>
        );
      })}

      <path d={pathD} fill="none" stroke="#1890FF" strokeWidth="3" />

      {points.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#1890FF"
          opacity={0.95}
        />
      ))}

      {data.map((d, i) => {
        const x = padding.left + (plotW * i) / Math.max(data.length - 1, 1);
        return (
          <text
            key={d.label}
            x={x}
            y={height - 8}
            fontSize="12"
            fill="#9CA3AF"
            textAnchor="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/**
 * Description: Grouped bar chart แบบ SVG (3 series)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function GroupedBarChartSvg({
  data,
  height,
}: {
  data: BarGroup[];
  height: number;
}) {
  const width = 980;
  const padding = { top: 10, right: 20, bottom: 34, left: 36 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const allValues = data.flatMap((g) => g.series.map((s) => s.value));
  const maxValue = Math.max(...allValues, 1);

  const seriesOrder: Array<BarGroup["series"][number]["name"]> = [
    "การยืม",
    "การคืน",
    "สถานะผิดปกติ",
  ];

  const seriesColor: Record<string, string> = {
    การยืม: "#1890FF",
    การคืน: "#BFBFBF",
    สถานะผิดปกติ: "#FF4D4F",
  };

  const groupGap = 18;
  const barGap = 6;
  const barWidth = 16;

  const groupWidth =
    seriesOrder.length * barWidth + (seriesOrder.length - 1) * barGap;
  const totalGroupsWidth =
    data.length * groupWidth + (data.length - 1) * groupGap;

  const startX = padding.left + Math.max(0, (plotW - totalGroupsWidth) / 2);

  const ticks = [0, 30, 60, 90, 120, 150];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
    >
      {ticks.map((t) => {
        const y =
          padding.top +
          plotH -
          (t / Math.max(ticks[ticks.length - 1], 1)) * plotH;

        return (
          <g key={t}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#EDEDED"
              strokeWidth="1"
            />
            <text x={10} y={y + 4} fontSize="12" fill="#9CA3AF">
              {t}
            </text>
          </g>
        );
      })}

      {data.map((g, gi) => {
        const gx = startX + gi * (groupWidth + groupGap);

        return (
          <g key={g.label}>
            {seriesOrder.map((name, si) => {
              const v = g.series.find((s) => s.name === name)?.value ?? 0;
              const h = (v / maxValue) * plotH;
              const x = gx + si * (barWidth + barGap);
              const y = padding.top + (plotH - h);

              return (
                <rect
                  key={name}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(0, h)}
                  rx={6}
                  fill={seriesColor[name]}
                />
              );
            })}

            <text
              x={gx + groupWidth / 2}
              y={height - 10}
              fontSize="12"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {g.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Description: Horizontal bar chart แบบ SVG
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function HorizontalBarChartSvg({
  data,
  height,
}: {
  data: HBarItem[];
  height: number;
}) {
  const width = 980;
  const padding = { top: 10, right: 20, bottom: 16, left: 140 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const rowGap = 12;
  const barH = Math.max(
    10,
    (plotH - rowGap * (data.length - 1)) / Math.max(data.length, 1),
  );

  const ticks = [0, 100, 500, 1000];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
    >
      {ticks.map((t) => {
        const x = padding.left + (t / ticks[ticks.length - 1]) * plotW;
        return (
          <g key={t}>
            <line
              x1={x}
              y1={padding.top}
              x2={x}
              y2={height - padding.bottom}
              stroke="#F0F0F0"
              strokeWidth="1"
            />
            <text
              x={x}
              y={height - 2}
              fontSize="12"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {t}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const y = padding.top + i * (barH + rowGap);
        const w = (d.value / maxValue) * plotW;

        return (
          <g key={d.label}>
            <text
              x={padding.left - 10}
              y={y + barH / 2 + 4}
              fontSize="12"
              fill="#6B7280"
              textAnchor="end"
            >
              {d.label}
            </text>

            <rect
              x={padding.left}
              y={y}
              width={Math.max(0, w)}
              height={barH}
              rx={8}
              fill="#1890FF"
              opacity={0.85}
            />

            <text
              x={padding.left + Math.max(0, w) + 10}
              y={y + barH / 2 + 4}
              fontSize="12"
              fill="#6B7280"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
