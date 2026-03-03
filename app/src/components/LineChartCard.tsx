// src/components/LineChartCard.tsx
/**
 * Description: Card Line chart (Recharts)
 * Note      :
 * - รองรับปรับขนาดจาก Dashboard ผ่าน props: width, minHeight (เหมือน Toast style)
 * - รองรับ animation แบบ Toast: mounted/leaving (slide + fade)
 * - Layout: header คงที่ + chart (flex-1) กินพื้นที่ที่เหลือ
 * - รองรับ config จาก Dashboard ผ่าน prop `chart`
 * Author    : Nontapat Sinthum (Guitar) 66160104
 */
import { Icon } from "@iconify/react";
import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/**
 * Description: จุดข้อมูลกราฟเส้น
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LinePoint = { label: string; value: number };

type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Description: ตัวเลือกปรับแต่งหน้าตากราฟ
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LineChartStyle = {
  padding?: Partial<ChartPadding>;

  gridStroke?: string;
  gridDasharray?: string;

  stroke?: string;

  tickColor?: string;
  tickFontSize?: number;
  xLabelColor?: string;
  xLabelFontSize?: number;

  lineWidth?: number;
  dotRadius?: number;

  showArea?: boolean;
  areaOpacityTop?: number;
  areaOpacityBottom?: number;
};

/**
 * Description: Config กราฟที่ส่งมาจาก Dashboard (override ค่าใน component)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LineChartConfig = {
  ticks?: number[];
  stroke?: string;

  lineWidth?: number;
  dotRadius?: number;

  padding?: Partial<ChartPadding>;

  showArea?: boolean;
  areaOpacityTop?: number;
  areaOpacityBottom?: number;

  gridStroke?: string;
  gridDasharray?: string;

  tickColor?: string;
  tickFontSize?: number;
  xLabelColor?: string;
  xLabelFontSize?: number;

  minChartHeight?: number;
  aspect?: number;
};

export type LineChartCardProps = {
  title?: string;
  badgeText?: string;
  badgeBgColor?: string;

  periodLabel?: string;
  periodIcon?: string;
  showPeriod?: boolean;

  data: LinePoint[];

  ticks?: number[];
  stroke?: string;
  emptyText?: string;

  className?: string;
  style?: CSSProperties;

  width?: number | string;
  minHeight?: number | string;

  borderColor?: string;
  borderWidth?: number;

  animate?: boolean;
  leaving?: boolean;

  titleClassName?: string;
  badgeClassName?: string;
  periodClassName?: string;

  chartStyle?: LineChartStyle;
  chartContainerClassName?: string;

  chart?: LineChartConfig;

  svgClassName?: string;
  svgStyle?: CSSProperties;
};

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Input : parts (Array<string | false | null | undefined>)
 * Output : string (className ที่รวมแล้ว)
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Description: Card แสดงสถิติการยืม + กราฟเส้น (Recharts)
 * Input : LineChartCardProps
 * Output : JSX.Element (การ์ดพร้อมกราฟ)
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
export default function LineChartCard({
  title = "สถิติการยืม",
  badgeText,
  badgeBgColor,

  periodLabel = "รายเดือน",
  periodIcon = "solar:calendar-bold",
  showPeriod = false,

  data,
  ticks,
  stroke = "#3B82F6",
  emptyText = "ยังไม่มีข้อมูลสถิติ",

  className,
  style,

  width,
  minHeight,
  borderColor = "#D9D9D9",
  borderWidth = 1.5,

  animate = true,
  leaving = false,

  titleClassName,
  badgeClassName,
  periodClassName,

  chartStyle,
  chartContainerClassName,

  chart,

  svgClassName,
  svgStyle,
}: LineChartCardProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  const [mounted, setMounted] = useState(false);

  /**
   * Description: trigger enter animation (slide+fade) แบบ Toast feel
   * Input : animate (boolean)
   * Output : void (setMounted(true))
   * Author : Nontapat Sinthum (Guitar) 66160104
   **/
  useEffect(() => {
    if (!animate) return;
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [animate]);

  const transition =
    "transition-[opacity,transform] duration-250 ease-out will-change-transform";

  return (
    <div
      className={classNames(
        "select-none bg-white shadow-[0_8px_18px_rgba(0,0,0,0.03)] rounded-[18px] p-5",
        "flex flex-col",
        animate && transition,
        className,
      )}
      style={{
        width,
        minHeight,

        borderColor,
        borderStyle: "solid",
        borderWidth,

        ...(animate
          ? {
              opacity: leaving ? 0 : mounted ? 1 : 0,
              transform: leaving
                ? "translateY(-6px) scale(0.98)"
                : mounted
                  ? "translateY(0) scale(1)"
                  : "translateY(-8px) scale(0.98)",
            }
          : null),

        ...style,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={classNames(
            "text-[20px] font-bold text-[#000000]",
            titleClassName,
          )}
        >
          {title}
        </div>

        {badgeText ? (
          <div
            className={classNames(
              "flex rounded-full w-[183px] h-[52px] justify-center items-center px-4 py-2 text-[16px] font-regular text-[#000000]",
              badgeClassName,
            )}
            style={{ backgroundColor: badgeBgColor }}
          >
            {badgeText}
          </div>
        ) : null}
      </div>

      {showPeriod && (
        <div
          className={classNames(
            "mt-2 flex items-center gap-2 text-xs text-neutral-500",
            periodClassName,
          )}
        >
          <Icon icon={periodIcon} className="text-base" />
          {periodLabel}
        </div>
      )}

      {/* Chart Area */}
      <div
        className={classNames(
          "mt-3 flex-1 min-h-[220px]",
          chartContainerClassName,
        )}
      >
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            {emptyText}
          </div>
        ) : (
          <LineChartRecharts
            data={data}
            ticks={ticks}
            stroke={stroke}
            chartStyle={chartStyle}
            chart={chart}
            wrapperClassName={svgClassName}
            wrapperStyle={svgStyle}
          />
        )}
      </div>
    </div>
  );
}

// Auto ticks by data max
function niceStep(stepRaw: number) {
  if (!Number.isFinite(stepRaw) || stepRaw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(stepRaw)));
  const n = stepRaw / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function buildAutoTicks(maxValue: number) {
  const dataMax = Math.max(0, maxValue);

  // ไม่มีข้อมูล/ค่าเป็น 0 -> ให้ยังมีสเกลดูได้
  if (dataMax === 0) return { ticks: [0, 1, 2, 3, 4], max: 4 };

  // เผื่อหัวเล็กน้อย ให้เส้นไม่ติดขอบบน
  const paddedMax = dataMax * 1.05;

  // อยากได้ประมาณ 6 ticks (0..5)
  const step = Math.max(1, niceStep(paddedMax / 5));

  const max = step * Math.ceil(paddedMax / step);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);

  return { ticks, max };
}

/**
 * Description: กราฟเส้นแบบ Recharts (เส้นหยัก + tooltip ปักที่จุด)
 * Input : data,ticks,stroke,chartStyle,chart
 * Output : JSX.Element (Recharts chart)
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
function LineChartRecharts({
  data,
  ticks,
  stroke,
  chartStyle,
  chart,
  wrapperClassName,
  wrapperStyle,
}: {
  data: LinePoint[];
  ticks?: number[]; 
  stroke: string;
  chartStyle?: LineChartStyle;
  chart?: LineChartConfig;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}) {
  const uid = useId();

  // stroke/padding (priority: chart > chartStyle > props)
  const resolvedStroke = chart?.stroke ?? chartStyle?.stroke ?? stroke;
  const resolvedPadding = chart?.padding ?? chartStyle?.padding;

  // ticks (priority: chart.ticks > props.ticks)
  const chartTicks = chart?.ticks;
  const propTicks = ticks;
  const resolvedTicks =
    (chartTicks && chartTicks.length ? chartTicks : undefined) ??
    (propTicks && propTicks.length ? propTicks : undefined);

  // data max
  const dataMax = Math.max(
    ...data.map((d) => (Number.isFinite(d.value) ? d.value : 0)),
    0,
  );

  // auto ticks if not provided
  const auto = resolvedTicks ? null : buildAutoTicks(dataMax);
  const finalTicks = resolvedTicks ?? auto!.ticks;

  // domain max
  const tickMax = Math.max(...finalTicks, 1);
  const domainMax = resolvedTicks ? Math.max(tickMax, dataMax, 1) : auto!.max;

  const basePadding: ChartPadding = {
    top: 12,
    right: 20,
    bottom: 12,
    left: 12,
  };
  const margin = {
    top: resolvedPadding?.top ?? basePadding.top,
    right: resolvedPadding?.right ?? basePadding.right,
    bottom: resolvedPadding?.bottom ?? basePadding.bottom,
    left: resolvedPadding?.left ?? basePadding.left,
  };

  const gridStroke = chart?.gridStroke ?? chartStyle?.gridStroke ?? "#D1D5DB";
  const gridDasharray =
    chart?.gridDasharray ?? chartStyle?.gridDasharray ?? "4 4";

  const tickColor = chart?.tickColor ?? chartStyle?.tickColor ?? "#9CA3AF";
  const tickFontSize = chart?.tickFontSize ?? chartStyle?.tickFontSize ?? 12;

  const xLabelColor =
    chart?.xLabelColor ?? chartStyle?.xLabelColor ?? "#9CA3AF";
  const xLabelFontSize =
    chart?.xLabelFontSize ?? chartStyle?.xLabelFontSize ?? 12;

  const lineWidth = chart?.lineWidth ?? chartStyle?.lineWidth ?? 3;
  const dotRadius = chart?.dotRadius ?? chartStyle?.dotRadius ?? 5;

  const showArea = chart?.showArea ?? chartStyle?.showArea ?? true;
  const areaOpacityTop =
    chart?.areaOpacityTop ?? chartStyle?.areaOpacityTop ?? 0.18;
  const areaOpacityBottom =
    chart?.areaOpacityBottom ?? chartStyle?.areaOpacityBottom ?? 0.03;

  const ASPECT = chart?.aspect ?? 980 / 260;
  const minChartHeight = chart?.minChartHeight ?? 220;

  const gradId = useMemo(() => `borrow-area-${uid}`, [uid]);

  const [pinned, setPinned] = useState<null | {
    index: number;
    x: number;
    y: number;
  }>(null);

  const handleMove = (state: any) => {
    if (!state?.isTooltipActive) return;

    const idx: number | undefined = state.activeTooltipIndex;
    const c: { x: number; y: number } | undefined = state.activeCoordinate;
    if (idx == null || !c) return;

    setPinned((prev) =>
      prev?.index === idx ? prev : { index: idx, x: c.x + 10, y: c.y - 48 },
    );
  };

  const handleLeave = () => setPinned(null);

  return (
    <div
      className={classNames("w-full", wrapperClassName)}
      style={wrapperStyle}
    >
      <ResponsiveContainer
        width="100%"
        aspect={ASPECT}
        minHeight={minChartHeight}
      >
        <ComposedChart
          data={data}
          margin={margin}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={resolvedStroke}
                stopOpacity={areaOpacityTop}
              />
              <stop
                offset="100%"
                stopColor={resolvedStroke}
                stopOpacity={areaOpacityBottom}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke={gridStroke}
            strokeDasharray={gridDasharray}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: xLabelColor, fontSize: xLabelFontSize }}
            interval={0}
            height={28}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            ticks={finalTicks}
            domain={[0, domainMax]}
            tick={{ fill: tickColor, fontSize: tickFontSize }}
            width={34}
          />

          <Tooltip
            cursor={false}
            position={pinned ? { x: pinned.x, y: pinned.y } : undefined}
            wrapperStyle={{ pointerEvents: "none" }}
            allowEscapeViewBox={{ x: true, y: true }}
            content={({ active, payload, label }) => {
              const v = payload?.[0]?.value as number | undefined;
              if (!active || v == null) return null;
              return (
                <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                  <div className="font-semibold text-neutral-900">{label}</div>
                  <div className="mt-1 text-neutral-600">
                    จำนวน:{" "}
                    <span className="font-semibold text-neutral-900">{v}</span>
                  </div>
                </div>
              );
            }}
          />

          {showArea ? (
            <Area
              type="linear"
              dataKey="value"
              stroke="none"
              fill={`url(#${gradId})`}
              isAnimationActive={false}
            />
          ) : null}

          <Line
            type="linear"
            dataKey="value"
            stroke={resolvedStroke}
            strokeWidth={lineWidth}
            dot={{ r: dotRadius }}
            activeDot={{ r: dotRadius + 1 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
