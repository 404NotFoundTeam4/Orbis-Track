// src/components/BorrowStatsLineCard.tsx
/**
 * Description: Card "สถิติการยืม" + Line chart (Recharts)
 * Note      :
 * - รองรับปรับขนาดจาก Dashboard ผ่าน props: width, minHeight (เหมือน Toast style)
 * - รองรับ animation แบบ Toast: mounted/leaving (slide + fade)
 * - Layout: header คงที่ + chart (flex-1) กินพื้นที่ที่เหลือ
 * - Tooltip ปักตำแหน่งบน "จุด" ที่ชี้ ไม่เลื่อนตามเมาส์
 * - เส้นกราฟเป็นเส้นหยัก (type="linear") ไม่โค้ง
 * - รองรับ config จาก Dashboard ผ่าน prop `chart`
 * - คง props svgClassName/svgStyle ไว้เพื่อ backward compat:
 *   -> ใช้เป็น class/style ของ wrapper ที่ครอบ ResponsiveContainer (ไม่ใช่ <svg>)
 * Author    : Nontapat Sinthum (Guitar) 66160104
 */
import { Icon } from "@iconify/react"; // Icon component สำหรับแสดง icon
import { useEffect, useId, useMemo, useState, type CSSProperties } from "react"; // React hooks + type CSSProperties
import {
  ResponsiveContainer, // ทำให้ chart responsive ตาม container
  ComposedChart, // chart หลักสำหรับรวมหลายกราฟ (Area + Line)
  Area, // พื้นที่ใต้กราฟ (area)
  Line, // เส้นกราฟ (line)
  XAxis, // แกน X
  YAxis, // แกน Y
  CartesianGrid, // เส้นตาราง
  Tooltip, // Tooltip ของ Recharts
} from "recharts"; // Recharts components

/**
 * Description: จุดข้อมูลกราฟเส้น
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LinePoint = { label: string; value: number }; // label=ชื่อแกน X, value=ค่าบนแกน Y

type ChartPadding = {
  top: number; // padding ด้านบนของกราฟ (margin top)
  right: number; // padding ด้านขวาของกราฟ (margin right)
  bottom: number; // padding ด้านล่างของกราฟ (margin bottom)
  left: number; // padding ด้านซ้ายของกราฟ (margin left)
};

/**
 * Description: ตัวเลือกปรับแต่งหน้าตากราฟ
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type LineChartStyle = {
  padding?: Partial<ChartPadding>; // margin ของ chart

  gridStroke?: string; // สีเส้นกริด
  gridDasharray?: string; // ลายเส้นกริด

  tickColor?: string; // สีตัวเลขแกน Y
  tickFontSize?: number; // ขนาดตัวเลขแกน Y
  xLabelColor?: string; // สี label แกน X
  xLabelFontSize?: number; // ขนาด label แกน X

  lineWidth?: number; // ความหนาเส้นกราฟ
  dotRadius?: number; // รัศมีจุดบนเส้น

  showArea?: boolean; // เปิด/ปิด area ใต้กราฟ
  areaOpacityTop?: number; // ความทึบด้านบนของ area
  areaOpacityBottom?: number; // ความทึบด้านล่างของ area
};

/**
 * Description: Config กราฟที่ส่งมาจาก Dashboard (override ค่าใน component)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export type BorrowLineChartConfig = {
  ticks?: number[]; // ticks แกน Y (override props ticks)
  stroke?: string; // สีเส้นกราฟ (override props stroke)

  lineWidth?: number; // ความหนาเส้น (override chartStyle.lineWidth)
  dotRadius?: number; // รัศมีจุด (override chartStyle.dotRadius)

  padding?: Partial<ChartPadding>; // margin ของกราฟ (override chartStyle.padding)

  showArea?: boolean; // เปิด/ปิด area (override chartStyle.showArea)
  areaOpacityTop?: number; // opacity top (override chartStyle.areaOpacityTop)
  areaOpacityBottom?: number; // opacity bottom (override chartStyle.areaOpacityBottom)

  gridStroke?: string; // สีกริด (override chartStyle.gridStroke)
  gridDasharray?: string; // ลายกริด (override chartStyle.gridDasharray)

  tickColor?: string; // สี tick Y (override chartStyle.tickColor)
  tickFontSize?: number; // ขนาด tick Y (override chartStyle.tickFontSize)
  xLabelColor?: string; // สี label X (override chartStyle.xLabelColor)
  xLabelFontSize?: number; // ขนาด label X (override chartStyle.xLabelFontSize)

  minChartHeight?: number; // minHeight ของกราฟ (override 220)
  aspect?: number; // aspect ของ ResponsiveContainer (override 980/260)
};

export type BorrowStatsLineCardProps = {
  title?: string; // ข้อความหัวการ์ด
  badgeText?: string; // badge ด้านขวาบน

  periodLabel?: string; // ข้อความช่วงเวลา (เช่น รายเดือน)
  periodIcon?: string; // ไอคอนช่วงเวลา
  showPeriod?: boolean; // แสดง/ซ่อนช่วงเวลา

  data: LinePoint[]; // ข้อมูลกราฟ

  ticks?: number[]; // ค่าตัวเลขบนแกน Y
  stroke?: string; // สีเส้นกราฟ
  emptyText?: string; // ข้อความกรณีไม่มีข้อมูล

  className?: string; // className เพิ่มเติมของการ์ด
  style?: CSSProperties; // style เพิ่มเติมของการ์ด

  width?: number | string; // ความกว้างการ์ด
  minHeight?: number | string; // ความสูงขั้นต่ำการ์ด

  borderColor?: string; // สีขอบการ์ด
  borderWidth?: number; // ความหนาขอบการ์ด

  animate?: boolean; // เปิด/ปิด animation
  leaving?: boolean; // สถานะกำลังออก (fade out)

  titleClassName?: string; // className ส่วน title
  badgeClassName?: string; // className ส่วน badge
  periodClassName?: string; // className ส่วน period

  chartStyle?: LineChartStyle; // config ปรับแต่งกราฟ (fallback)
  chartContainerClassName?: string; // className ครอบกราฟ

  chart?: BorrowLineChartConfig; //  config จาก Dashboard (override)

  svgClassName?: string; // (compat) className ของ wrapper chart
  svgStyle?: CSSProperties; // (compat) style ของ wrapper chart
};

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Input : parts (Array<string | false | null | undefined>)
 * Output : string (className ที่รวมแล้ว)
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" "); // รวม className และตัด falsy
}

/**
 * Description: Card แสดงสถิติการยืม + กราฟเส้น (Recharts)
 * Input : BorrowStatsLineCardProps
 * Output : JSX.Element (การ์ดพร้อมกราฟ)
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
export default function BorrowStatsLineCard({
  title = "สถิติการยืม", // ชื่อหัวการ์ด
  badgeText, // badge ขวาบน
  periodLabel = "รายเดือน", // label ช่วงเวลา
  periodIcon = "solar:calendar-bold", // icon ช่วงเวลา
  showPeriod = true, // toggle ช่วงเวลา
  data, // ข้อมูลกราฟ
  ticks = [0, 30, 60, 90, 120], // ticks แกน Y (fallback)
  stroke = "#3B82F6", // สีเส้นกราฟ (fallback)
  emptyText = "ยังไม่มีข้อมูลสถิติ", // ข้อความไม่มีข้อมูล

  className, // className ของการ์ด
  style, // style ของการ์ด

  width, // ความกว้างการ์ด
  minHeight, // ความสูงขั้นต่ำการ์ด
  borderColor = "#D9D9D9", // สีขอบ
  borderWidth = 1.5, // ความหนาขอบ

  animate = true, // เปิด animation
  leaving = false, // สถานะออก

  titleClassName, // className title
  badgeClassName, // className badge
  periodClassName, // className period

  chartStyle, // config กราฟ (fallback)
  chartContainerClassName, // className ครอบกราฟ

  chart, //  config กราฟจาก Dashboard

  svgClassName, // className wrapper กราฟ
  svgStyle, // style wrapper กราฟ
}: BorrowStatsLineCardProps) {
  const hasData = Array.isArray(data) && data.length > 0; // เช็คว่ามีข้อมูลกราฟหรือไม่

  const [mounted, setMounted] = useState(false); // สถานะ enter animation (mounted=true หลัง render frame แรก)

  /**
   * Description: trigger enter animation (slide+fade) แบบ Toast feel
   * Input : animate (boolean)
   * Output : void (setMounted(true))
   * Author : Nontapat Sinthum (Guitar) 66160104
   **/
  useEffect(() => {
    if (!animate) return; // ถ้าปิด animate ไม่ต้องทำ
    const t = requestAnimationFrame(() => setMounted(true)); // รอ frame แล้วค่อย set mounted เพื่อให้ transition ทำงาน
    return () => cancelAnimationFrame(t); // cleanup frame
  }, [animate]);

  const transition =
    "transition-[opacity,transform] duration-250 ease-out will-change-transform"; // class สำหรับ transition ของการ์ด

  return (
    <div
      className={classNames(
        "select-none bg-white shadow-[0_8px_18px_rgba(0,0,0,0.03)] rounded-[18px] p-5", // สไตล์การ์ดหลัก
        "flex flex-col", // layout แนวตั้ง
        animate && transition, // ใส่ transition เมื่อเปิด animate
        className, // className เพิ่มเติมจากภายนอก
      )}
      style={{
        width, // คุม width จาก Dashboard
        minHeight, // คุม minHeight จาก Dashboard

        borderColor, // สีขอบการ์ด
        borderStyle: "solid", // รูปแบบขอบ
        borderWidth, // ความหนาขอบ

        ...(animate
          ? {
              opacity: leaving ? 0 : mounted ? 1 : 0, // opacity ตามสถานะเข้า/ออก
              transform: leaving
                ? "translateY(-6px) scale(0.98)" // ตอนออก (leaving)
                : mounted
                  ? "translateY(0) scale(1)" // ตอนเข้าเสร็จ
                  : "translateY(-8px) scale(0.98)", // ตอนกำลังเข้า
            }
          : null),

        ...style, // allow override style
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={classNames(
            "text-sm font-semibold text-neutral-900", // ตัวอักษร title
            titleClassName, // className title เพิ่มเติม
          )}
        >
          {title}
        </div>

        {badgeText ? (
          <div
            className={classNames(
              "rounded-full bg-sky-50 px-4 py-2 text-xs font-medium text-sky-700", // style badge
              badgeClassName, // className badge เพิ่มเติม
            )}
          >
            {badgeText}
          </div>
        ) : null}
      </div>

      {showPeriod && (
        <div
          className={classNames(
            "mt-2 flex items-center gap-2 text-xs text-neutral-500", // style period row
            periodClassName, // className period เพิ่มเติม
          )}
        >
          <Icon icon={periodIcon} className="text-base" />
          {periodLabel}
        </div>
      )}

      {/* Chart Area */}
      <div
        className={classNames(
          "mt-3 flex-1 min-h-[220px]", // ให้พื้นที่กราฟอย่างน้อย 220px
          chartContainerClassName, // className container กราฟ เพิ่มเติม
        )}
      >
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            {emptyText}
          </div>
        ) : (
          <LineChartRecharts
            data={data} // ข้อมูลกราฟ
            ticks={ticks} // ticks แกน Y (fallback)
            stroke={stroke} // สีกราฟ (fallback)
            chartStyle={chartStyle} // config กราฟ (fallback)
            chart={chart} //  override จาก Dashboard
            wrapperClassName={svgClassName} // wrapper class (compat)
            wrapperStyle={svgStyle} // wrapper style (compat)
          />
        )}
      </div>
    </div>
  );
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
  ticks: number[];
  stroke: string;
  chartStyle?: LineChartStyle;
  chart?: BorrowLineChartConfig;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}) {
  const uid = useId(); // id unique สำหรับสร้างชื่อ gradient ไม่ชนกัน

  const resolvedTicks = chart?.ticks ?? ticks; // ticks ที่ใช้จริง (chart มาก่อน)
  const resolvedStroke = chart?.stroke ?? stroke; // สีเส้นที่ใช้จริง (chart มาก่อน)
  const resolvedPadding = chart?.padding ?? chartStyle?.padding; // padding ที่ใช้จริง (chart มาก่อน)

  const basePadding: ChartPadding = { top: 12, right: 20, bottom: 12, left: 12 }; // padding default
  const margin = {
    top: resolvedPadding?.top ?? basePadding.top, // margin top
    right: resolvedPadding?.right ?? basePadding.right, // margin right
    bottom: resolvedPadding?.bottom ?? basePadding.bottom, // margin bottom
    left: resolvedPadding?.left ?? basePadding.left, // margin left
  }; // margin ของ recharts

  const gridStroke = chart?.gridStroke ?? chartStyle?.gridStroke ?? "#D1D5DB"; // สีกริด
  const gridDasharray = chart?.gridDasharray ?? chartStyle?.gridDasharray ?? "4 4"; // ลายกริด

  const tickColor = chart?.tickColor ?? chartStyle?.tickColor ?? "#9CA3AF"; // สี tick Y
  const tickFontSize = chart?.tickFontSize ?? chartStyle?.tickFontSize ?? 12; // ขนาด tick Y

  const xLabelColor = chart?.xLabelColor ?? chartStyle?.xLabelColor ?? "#9CA3AF"; // สี label X
  const xLabelFontSize = chart?.xLabelFontSize ?? chartStyle?.xLabelFontSize ?? 12; // ขนาด label X

  const lineWidth = chart?.lineWidth ?? chartStyle?.lineWidth ?? 3; // ความหนาเส้น
  const dotRadius = chart?.dotRadius ?? chartStyle?.dotRadius ?? 5; // รัศมีจุด

  const showArea = chart?.showArea ?? chartStyle?.showArea ?? true; // toggle area
  const areaOpacityTop = chart?.areaOpacityTop ?? chartStyle?.areaOpacityTop ?? 0.18; // opacity top
  const areaOpacityBottom = chart?.areaOpacityBottom ?? chartStyle?.areaOpacityBottom ?? 0.03; // opacity bottom

  const ASPECT = chart?.aspect ?? 980 / 260; // อัตราส่วนกราฟ
  const minChartHeight = chart?.minChartHeight ?? 220; // minHeight ของกราฟ

  const gradId = useMemo(() => `borrow-area-${uid}`, [uid]); // id ของ linearGradient

  const tickMax = Math.max(...resolvedTicks, 1); // ค่าสูงสุดจาก ticks (กันหาร 0)
  const dataMax = Math.max(
    ...data.map((d) => (Number.isFinite(d.value) ? d.value : 0)),
    0,
  ); // ค่าสูงสุดจาก data
  const domainMax = Math.max(tickMax, dataMax, 1); // domain max ของแกน Y

  const [pinned, setPinned] = useState<null | { index: number; x: number; y: number }>(null); // state เก็บตำแหน่ง tooltip ที่ "ปัก" ไว้

  /**
   * Description: ล็อคตำแหน่ง Tooltip ให้ปักตาม "จุด" ที่ active ไม่ให้ไหลตามเมาส์
   * Input : state (Recharts mouse move state)
   * Output : void (อัปเดต pinned state)
   * Author : Nontapat Sinthum (Guitar) 66160104
   **/
  const handleMove = (state: any) => {
    if (!state?.isTooltipActive) return; // ถ้า tooltip ไม่ active ไม่ต้องทำ

    const idx: number | undefined = state.activeTooltipIndex; // index ของจุดที่ active
    const c: { x: number; y: number } | undefined = state.activeCoordinate; // พิกัดของจุด active
    if (idx == null || !c) return; // กันค่าหาย

    setPinned((prev) =>
      prev?.index === idx ? prev : { index: idx, x: c.x + 10, y: c.y - 48 },
    ); // ปัก tooltip และ offset ให้อยู่เหนือ/ข้างจุด
  };

  /**
   * Description: รีเซ็ตตำแหน่ง Tooltip เมื่อเมาส์ออกจากกราฟ
   * Input : none
   * Output : void (setPinned(null))
   * Author : Nontapat Sinthum (Guitar) 66160104
   **/
  const handleLeave = () => setPinned(null);

  return (
    <div className={classNames("w-full", wrapperClassName)} style={wrapperStyle}>
      <ResponsiveContainer width="100%" aspect={ASPECT} minHeight={minChartHeight}>
        <ComposedChart
          data={data} // data กราฟ
          margin={margin} // margin ของกราฟ
          onMouseMove={handleMove} // handler เมาส์ขยับ
          onMouseLeave={handleLeave} // handler เมาส์ออก
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolvedStroke} stopOpacity={areaOpacityTop} />
              <stop offset="100%" stopColor={resolvedStroke} stopOpacity={areaOpacityBottom} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={gridStroke} strokeDasharray={gridDasharray} vertical={false} />

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
            ticks={resolvedTicks}
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
                    จำนวน: <span className="font-semibold text-neutral-900">{v}</span>
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