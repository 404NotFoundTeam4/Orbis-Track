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
export type LinePoint = {
  label: string; // ชื่อข้อมูลที่ใช้แสดงบนแกน X
  value: number; // ค่าตัวเลขของจุดข้อมูล
};

type ChartPadding = {
  top: number; // ระยะห่างด้านบนของกราฟ
  right: number; // ระยะห่างด้านขวาของกราฟ
  bottom: number; // ระยะห่างด้านล่างของกราฟ
  left: number; // ระยะห่างด้านซ้ายของกราฟ
};

/**
 * Description: ตัวเลือกปรับแต่งหน้าตากราฟ
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LineChartStyle = {
  padding?: Partial<ChartPadding>; // ระยะ padding ภายในกราฟ

  gridStroke?: string; // สีของเส้น grid
  gridDasharray?: string; // รูปแบบเส้นประของ grid

  stroke?: string; // สีหลักของเส้นกราฟ

  tickColor?: string; // สีตัวอักษรบนแกน Y
  tickFontSize?: number; // ขนาดตัวอักษรบนแกน Y
  xLabelColor?: string; // สีตัวอักษรบนแกน X
  xLabelFontSize?: number; // ขนาดตัวอักษรบนแกน X

  lineWidth?: number; // ความหนาของเส้นกราฟ
  dotRadius?: number; // ขนาดของจุดข้อมูลบนกราฟ

  showArea?: boolean; // กำหนดให้แสดงพื้นที่ใต้เส้นกราฟหรือไม่
  areaOpacityTop?: number; // ความทึบด้านบนของ gradient area
  areaOpacityBottom?: number; // ความทึบด้านล่างของ gradient area
};

/**
 * Description: Config กราฟที่ส่งมาจาก Dashboard (override ค่าใน component)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LineChartConfig = {
  ticks?: number[]; // ค่า tick ของแกน Y ที่กำหนดเอง
  stroke?: string; // สีเส้นกราฟ

  lineWidth?: number; // ความหนาเส้นกราฟ
  dotRadius?: number; // ขนาดจุดข้อมูล

  padding?: Partial<ChartPadding>; // ระยะ padding ภายในกราฟ

  showArea?: boolean; // แสดง/ซ่อนพื้นที่ใต้เส้นกราฟ
  areaOpacityTop?: number; // ความทึบด้านบนของ area
  areaOpacityBottom?: number; // ความทึบด้านล่างของ area

  gridStroke?: string; // สีของเส้น grid
  gridDasharray?: string; // รูปแบบเส้นประของ grid

  tickColor?: string; // สีตัวอักษรแกน Y
  tickFontSize?: number; // ขนาดตัวอักษรแกน Y
  xLabelColor?: string; // สีตัวอักษรแกน X
  xLabelFontSize?: number; // ขนาดตัวอักษรแกน X

  minChartHeight?: number; // ความสูงขั้นต่ำของกราฟ
  aspect?: number; // อัตราส่วนกว้าง/สูงของกราฟ
};

export type LineChartCardProps = {
  title?: string; // ชื่อหัวข้อการ์ด
  badgeText?: string; // ข้อความใน badge ด้านขวา
  badgeBgColor?: string; // สีพื้นหลังของ badge

  periodLabel?: string; // ข้อความช่วงเวลา
  periodIcon?: string; // icon ที่ใช้กับช่วงเวลา
  showPeriod?: boolean; // แสดงหรือซ่อนส่วนช่วงเวลา

  data: LinePoint[]; // ข้อมูลทั้งหมดของกราฟ

  ticks?: number[]; // tick แกน Y ที่กำหนดเอง
  stroke?: string; // สีเส้นกราฟ
  emptyText?: string; // ข้อความกรณีไม่มีข้อมูล

  className?: string; // className เพิ่มเติมของ card
  style?: CSSProperties; // style เพิ่มเติมของ card

  width?: number | string; // ความกว้างของ card
  minHeight?: number | string; // ความสูงขั้นต่ำของ card

  borderColor?: string; // สีเส้นขอบของ card
  borderWidth?: number; // ความหนาของเส้นขอบของ card

  animate?: boolean; // เปิด/ปิด animation ตอนแสดงผล
  leaving?: boolean; // ระบุสถานะกำลังออกจากหน้าจอ

  titleClassName?: string; // className เพิ่มเติมของ title
  badgeClassName?: string; // className เพิ่มเติมของ badge
  periodClassName?: string; // className เพิ่มเติมของ period

  chartStyle?: LineChartStyle; // style ของกราฟแบบรวม
  chartContainerClassName?: string; // className ของ container กราฟ

  chart?: LineChartConfig; // config สำหรับ override รายละเอียดกราฟ

  svgClassName?: string; // className ของ wrapper กราฟ
  svgStyle?: CSSProperties; // style ของ wrapper กราฟ
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
  const hasData = Array.isArray(data) && data.length > 0; // ตรวจสอบว่ามีข้อมูลสำหรับแสดงกราฟหรือไม่

  const [mounted, setMounted] = useState(false); // state สำหรับควบคุม animation ตอน mount component

  /**
   * Description: trigger enter animation (slide+fade) แบบ Toast feel
   * Input : animate (boolean)
   * Output : void (setMounted(true))
   * Author : Nontapat Sinthum (Guitar) 66160104
   **/
  useEffect(() => {
    if (!animate) return;
    const t = requestAnimationFrame(() => setMounted(true)); // เริ่ม animation ใน frame ถัดไป
    return () => cancelAnimationFrame(t); // cleanup animation frame
  }, [animate]);

  const transition =
    "transition-[opacity,transform] duration-250 ease-out will-change-transform"; // class transition สำหรับ animation ของ card

  return (
    <div
      className={classNames(
        "select-none bg-white shadow-[0_8px_18px_rgba(0,0,0,0.03)] rounded-[18px] p-5",
        "flex flex-col",
        animate && transition,
        className,
      )}
      style={{
        width, // ความกว้างของ card
        minHeight, // ความสูงขั้นต่ำของ card

        borderColor, // สีเส้นขอบ
        borderStyle: "solid", // รูปแบบเส้นขอบ
        borderWidth, // ความหนาเส้นขอบ

        ...(animate
          ? {
              opacity: leaving ? 0 : mounted ? 1 : 0, // ควบคุมความทึบตอน animate
              transform: leaving
                ? "translateY(-6px) scale(0.98)"
                : mounted
                  ? "translateY(0) scale(1)"
                  : "translateY(-8px) scale(0.98)", // ควบคุมการเลื่อนและย่อขยายตอน animate
            }
          : null),

        ...style, // style เพิ่มเติมจากภายนอก
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
            style={{ backgroundColor: badgeBgColor }} // สีพื้นหลังของ badge
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

/**
 * Description: ปรับค่า step ของแกน Y ให้อยู่ในรูปแบบที่อ่านง่าย เช่น 1, 2, 5, 10
 * Input : stepRaw (number)
 * Output : number
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
function niceStep(stepRaw: number) {
  if (!Number.isFinite(stepRaw) || stepRaw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(stepRaw))); // ฐานกำลังสิบของค่า step
  const n = stepRaw / pow; // ค่า step ที่ normalize แล้ว
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10; // เลือกค่าที่อ่านง่าย
  return nice * pow;
}

/**
 * Description: สร้างค่า ticks อัตโนมัติจากค่าสูงสุดของข้อมูล
 * Input : maxValue (number)
 * Output : { ticks: number[], max: number }
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
function buildAutoTicks(maxValue: number) {
  const dataMax = Math.max(0, maxValue); // ค่าสูงสุดของข้อมูลที่ไม่ต่ำกว่า 0

  // ไม่มีข้อมูล/ค่าเป็น 0 -> ให้ยังมีสเกลดูได้
  if (dataMax === 0) return { ticks: [0, 1, 2, 3, 4], max: 4 };

  // เผื่อหัวเล็กน้อย ให้เส้นไม่ติดขอบบน
  const paddedMax = dataMax * 1.05; // เพิ่ม headroom ด้านบนกราฟ

  // อยากได้ประมาณ 6 ticks (0..5)
  const step = Math.max(1, niceStep(paddedMax / 5)); // ระยะห่างแต่ละ tick

  const max = step * Math.ceil(paddedMax / step); // ค่าสูงสุดของแกน Y
  const ticks: number[] = []; // รายการ ticks ของแกน Y
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
  data: LinePoint[]; // ข้อมูลทั้งหมดของกราฟ
  ticks?: number[]; // tick แกน Y ที่รับมาจาก props
  stroke: string; // สีเส้นกราฟจาก props
  chartStyle?: LineChartStyle; // style ของกราฟ
  chart?: LineChartConfig; // config override ของกราฟ
  wrapperClassName?: string; // className ของ wrapper ภายนอกกราฟ
  wrapperStyle?: CSSProperties; // style ของ wrapper ภายนอกกราฟ
}) {
  const uid = useId(); // id เฉพาะของ component instance

  // stroke/padding (priority: chart > chartStyle > props)
  const resolvedStroke = chart?.stroke ?? chartStyle?.stroke ?? stroke; // สีเส้นกราฟที่ใช้จริง
  const resolvedPadding = chart?.padding ?? chartStyle?.padding; // padding ของกราฟที่ใช้จริง

  // ticks (priority: chart.ticks > props.ticks)
  const chartTicks = chart?.ticks; // ticks ที่มาจาก chart config
  const propTicks = ticks; // ticks ที่มาจาก props
  const resolvedTicks =
    (chartTicks && chartTicks.length ? chartTicks : undefined) ??
    (propTicks && propTicks.length ? propTicks : undefined); // ticks ที่ใช้จริง

  // data max
  const dataMax = Math.max(
    ...data.map((d) => (Number.isFinite(d.value) ? d.value : 0)),
    0,
  ); // ค่าสูงสุดของข้อมูลทั้งหมดในกราฟ

  // auto ticks if not provided
  const auto = resolvedTicks ? null : buildAutoTicks(dataMax); // ticks อัตโนมัติเมื่อไม่ได้กำหนดเอง
  const finalTicks = resolvedTicks ?? auto!.ticks; // ticks สุดท้ายที่ใช้กับแกน Y

  // domain max
  const tickMax = Math.max(...finalTicks, 1); // ค่าสูงสุดของ ticks
  const domainMax = resolvedTicks ? Math.max(tickMax, dataMax, 1) : auto!.max; // ค่าสูงสุดของ domain แกน Y

  const basePadding: ChartPadding = {
    top: 12, // padding ด้านบนเริ่มต้น
    right: 20, // padding ด้านขวาเริ่มต้น
    bottom: 12, // padding ด้านล่างเริ่มต้น
    left: 12, // padding ด้านซ้ายเริ่มต้น
  };
  const margin = {
    top: resolvedPadding?.top ?? basePadding.top, // margin ด้านบนที่ใช้จริง
    right: resolvedPadding?.right ?? basePadding.right, // margin ด้านขวาที่ใช้จริง
    bottom: resolvedPadding?.bottom ?? basePadding.bottom, // margin ด้านล่างที่ใช้จริง
    left: resolvedPadding?.left ?? basePadding.left, // margin ด้านซ้ายที่ใช้จริง
  };

  const gridStroke = chart?.gridStroke ?? chartStyle?.gridStroke ?? "#D1D5DB"; // สีเส้น grid
  const gridDasharray =
    chart?.gridDasharray ?? chartStyle?.gridDasharray ?? "4 4"; // รูปแบบเส้นประของ grid

  const tickColor = chart?.tickColor ?? chartStyle?.tickColor ?? "#9CA3AF"; // สีตัวอักษรแกน Y
  const tickFontSize = chart?.tickFontSize ?? chartStyle?.tickFontSize ?? 16; // ขนาดตัวอักษรแกน Y

  const xLabelColor =
    chart?.xLabelColor ?? chartStyle?.xLabelColor ?? "#9CA3AF"; // สีตัวอักษรแกน X
  const xLabelFontSize =
    chart?.xLabelFontSize ?? chartStyle?.xLabelFontSize ?? 16; // ขนาดตัวอักษรแกน X

  const lineWidth = chart?.lineWidth ?? chartStyle?.lineWidth ?? 3; // ความหนาเส้นกราฟ
  const dotRadius = chart?.dotRadius ?? chartStyle?.dotRadius ?? 5; // ขนาดจุดข้อมูลบนกราฟ

  const showArea = chart?.showArea ?? chartStyle?.showArea ?? true; // แสดงพื้นที่ใต้เส้นกราฟหรือไม่
  const areaOpacityTop =
    chart?.areaOpacityTop ?? chartStyle?.areaOpacityTop ?? 0.18; // ความทึบด้านบนของ area
  const areaOpacityBottom =
    chart?.areaOpacityBottom ?? chartStyle?.areaOpacityBottom ?? 0.03; // ความทึบด้านล่างของ area

  const ASPECT = chart?.aspect ?? 980 / 260; // อัตราส่วนของกราฟ
  const minChartHeight = chart?.minChartHeight ?? 220; // ความสูงขั้นต่ำของกราฟ

  const gradId = useMemo(() => `borrow-area-${uid}`, [uid]); // id ของ gradient ใต้กราฟ

  const [pinned, setPinned] = useState<null | {
    index: number; // index ของจุดข้อมูลที่กำลัง hover
    x: number; // ตำแหน่งแกน X ของ tooltip
    y: number; // ตำแหน่งแกน Y ของ tooltip
  }>(null);

  const handleMove = (state: any) => {
    if (!state?.isTooltipActive) return;

    const idx: number | undefined = state.activeTooltipIndex; // index ของจุดที่ active
    const c: { x: number; y: number } | undefined = state.activeCoordinate; // พิกัดของจุดที่ active
    if (idx == null || !c) return;

    setPinned((prev) =>
      prev?.index === idx ? prev : { index: idx, x: c.x + 10, y: c.y - 48 },
    ); // อัปเดตตำแหน่ง tooltip ให้ปักตามจุด
  };

  const handleLeave = () => setPinned(null); // ล้าง tooltip เมื่อเมาส์ออกจากกราฟ

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
            tick={{ fill: xLabelColor, fontSize: xLabelFontSize, fontWeight: 400 }}
            interval={0}
            height={28}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            ticks={finalTicks}
            domain={[0, domainMax]}
            tick={{ fill: tickColor, fontSize: tickFontSize, fontWeight: 400 }}
            width={34}
          />

          <Tooltip
            cursor={false}
            position={pinned ? { x: pinned.x, y: pinned.y } : undefined}
            wrapperStyle={{ pointerEvents: "none" }}
            allowEscapeViewBox={{ x: true, y: true }}
            content={({ active, payload, label }) => {
              const v = payload?.[0]?.value as number | undefined; // ค่าของจุดข้อมูลที่ hover
              if (!active || v == null) return null;
              return (
                <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[16px] shadow-sm">
                  <div className="font-regular text-neutral-900">{label}</div>
                  <div className="mt-1 text-neutral-600">
                    จำนวน:{" "}
                    <span className="font-regular text-neutral-900">{v}</span>
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