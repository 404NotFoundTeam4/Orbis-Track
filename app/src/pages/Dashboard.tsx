// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import DashboardDeviceUsageSection, {
  type DashboardSummaryCardItem,
  type LinePoint,
  type BarGroup,
  type HBarItem,
} from "../components/DashboardDevice";

/**
 * Description: รวม className หลายค่าเข้าด้วยกัน โดยตัดค่าที่เป็น falsy ออก
 * Input : classNameParts (Array<string | false | undefined | null>)
 * Output : string (className)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function classNames(...classNameParts: Array<string | false | undefined | null>) {
  return classNameParts.filter(Boolean).join(" ");
}

/**
 * Description: คีย์ของแท็บในหน้า Dashboard
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
type DashboardTabKey = "overview" | "issueHistory" | "deviceUsage";

/**
 * Description: คีย์ช่วงเวลา (สำหรับ filter ด้านขวาบน)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
type RangeKey = "today" | "thisWeek";

/**
 * Description: โครงสร้างข้อมูลสรุปบนการ์ด (mock state)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
type SummaryCard = {
  id: "total" | "borrowed" | "returned";
  value: number;
  subtitle: string;
  badgeLabel: string;
};

/**
 * Description: หน้า Dashboard (ตาม mock)
 * Output : React Component
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export default function Dashboard() {
  // ---- UI state ----
  const [activeTabKey, setActiveTabKey] = useState<DashboardTabKey>("deviceUsage");
  const [activeRange, setActiveRange] = useState<RangeKey>("today");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ---- mock state (แทนที่ด้วย service จริงได้ภายหลัง) ----
  const [summary, setSummary] = useState<SummaryCard[]>([]);
  const [lineData, setLineData] = useState<LinePoint[]>([]);
  const [barData, setBarData] = useState<BarGroup[]>([]);
  const [hbarData, setHbarData] = useState<HBarItem[]>([]);

  /**
   * Description: โหลดข้อมูล Dashboard (mock)
   * - โหลดเฉพาะตอนอยู่แท็บ "การใช้งานอุปกรณ์"
   * - สามารถเปลี่ยนเป็นเรียก API จริงได้
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  useEffect(() => {
    if (activeTabKey !== "deviceUsage") return;

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);

        // mock delay ให้เหมือนโหลดจาก API
        await new Promise((r) => setTimeout(r, 350));
        if (cancelled) return;

        // ===== Summary Cards =====
        const nextSummary: SummaryCard[] = [
          {
            id: "total",
            value: 1000,
            subtitle: "จำนวน 1000 รายการ",
            badgeLabel: "จำนวนอุปกรณ์",
          },
          {
            id: "borrowed",
            value: 100,
            subtitle: "จำนวน 100 รายการ",
            badgeLabel: "การยืมอุปกรณ์",
          },
          {
            id: "returned",
            value: 100,
            subtitle: "จำนวน 100 รายการ",
            badgeLabel: "การคืนอุปกรณ์",
          },
        ];

        // ===== Line chart =====
        const nextLine: LinePoint[] = [
          { label: "ม.ค.", value: 60 },
          { label: "ก.พ.", value: 105 },
          { label: "มี.ค.", value: 78 },
          { label: "เม.ย.", value: 32 },
          { label: "พ.ค.", value: 70 },
          { label: "มิ.ย.", value: 72 },
          { label: "ก.ค.", value: 45 },
          { label: "ส.ค.", value: 110 },
          { label: "ก.ย.", value: 35 },
          { label: "ต.ค.", value: 108 },
          { label: "พ.ย.", value: 95 },
          { label: "ธ.ค.", value: 62 },
        ];

        // ===== Group bar chart =====
        const nextBars: BarGroup[] = [
          {
            label: "ไอที",
            series: [
              { name: "การยืม", value: 80 },
              { name: "การคืน", value: 60 },
              { name: "สถานะผิดปกติ", value: 15 },
            ],
          },
          {
            label: "บัญชี",
            series: [
              { name: "การยืม", value: 40 },
              { name: "การคืน", value: 30 },
              { name: "สถานะผิดปกติ", value: 8 },
            ],
          },
          {
            label: "ผลิต",
            series: [
              { name: "การยืม", value: 75 },
              { name: "การคืน", value: 55 },
              { name: "สถานะผิดปกติ", value: 20 },
            ],
          },
          {
            label: "ซ่อมบำรุง",
            series: [
              { name: "การยืม", value: 130 },
              { name: "การคืน", value: 95 },
              { name: "สถานะผิดปกติ", value: 35 },
            ],
          },
          {
            label: "การเงิน",
            series: [
              { name: "การยืม", value: 145 },
              { name: "การคืน", value: 120 },
              { name: "สถานะผิดปกติ", value: 18 },
            ],
          },
          {
            label: "สำนักงาน",
            series: [
              { name: "การยืม", value: 140 },
              { name: "การคืน", value: 110 },
              { name: "สถานะผิดปกติ", value: 45 },
            ],
          },
        ];

        // ===== Horizontal bar chart =====
        const nextHbars: HBarItem[] = [
          { label: "โปรเจคเตอร์", value: 230 },
          { label: "โน้ตบุ๊ค", value: 226 },
          { label: "เมาส์", value: 150 },
          { label: "เครื่อง…", value: 115 },
          { label: "โต๊ะ…", value: 30 },
        ];

        setSummary(nextSummary);
        setLineData(nextLine);
        setBarData(nextBars);
        setHbarData(nextHbars);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTabKey, activeRange]);

  /**
   * Description: ตัวเลขสรุปสถานะด้านขวาบน (mock)
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const statusSummary = useMemo(() => {
    const rows = [
      { label: "พร้อมใช้งาน", value: 230, bg: "#E6F7FF", bar: "#1890FF" },
      { label: "อยู่ระหว่างซ่อม", value: 226, bg: "#FFF7E6", bar: "#FA8C16" },
      { label: "ชำรุด", value: 150, bg: "#FFF1F0", bar: "#FF4D4F" },
    ];
    const max = Math.max(...rows.map((r) => r.value), 1);
    return { rows, max };
  }, []);

  /**
   * Description: map summary state -> props ของ component ในวงแดง
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const summaryCardsForRender: DashboardSummaryCardItem[] = useMemo(() => {
    const find = (id: SummaryCard["id"]) => summary.find((s) => s.id === id);

    const total = find("total");
    const borrowed = find("borrowed");
    const returned = find("returned");

    return [
      {
        cardType: "Total",
        count: total?.value ?? 0,
        subtitle: total?.subtitle ?? "จำนวน 0 รายการ",
        badgeLabel: total?.badgeLabel ?? "จำนวนอุปกรณ์",
      },
      {
        cardType: "Borrowed",
        count: borrowed?.value ?? 0,
        subtitle: borrowed?.subtitle ?? "จำนวน 0 รายการ",
        badgeLabel: borrowed?.badgeLabel ?? "การยืมอุปกรณ์",
      },
      {
        cardType: "Returned",
        count: returned?.value ?? 0,
        subtitle: returned?.subtitle ?? "จำนวน 0 รายการ",
        badgeLabel: returned?.badgeLabel ?? "การคืนอุปกรณ์",
      },
    ];
  }, [summary]);

  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      {/* Breadcrumb */}
      <div className="text-sm text-neutral-500">แดชบอร์ด</div>

      {/* Header */}
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-3xl font-extrabold tracking-tight text-neutral-900">แดชบอร์ด</div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range Filter (วันนี้ / สัปดาห์นี้) */}
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-1">
            <RangeButton active={activeRange === "today"} onClick={() => setActiveRange("today")}>
              วันนี้
            </RangeButton>
            <RangeButton
              active={activeRange === "thisWeek"}
              onClick={() => setActiveRange("thisWeek")}
            >
              สัปดาห์นี้
            </RangeButton>
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={() => {
              // TODO: hook export action here
              console.log("[Dashboard] export clicked");
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1890FF] px-4 text-sm font-semibold text-white hover:opacity-95"
          >
            ส่งออก
            <Icon icon="solar:export-bold" className="text-lg" />
          </button>
        </div>
      </div>

      {/* Tabs (segmented pill) */}
      <div className="mt-5 overflow-x-auto">
        <div className="inline-flex min-w-max items-center gap-1 rounded-full bg-[#F6F7FB] p-1">
          <TabButton active={activeTabKey === "overview"} onClick={() => setActiveTabKey("overview")}>
            ภาพรวม
          </TabButton>
          <TabButton
            active={activeTabKey === "issueHistory"}
            onClick={() => setActiveTabKey("issueHistory")}
          >
            ประวัติการแจ้งปัญหา
          </TabButton>
          <TabButton
            active={activeTabKey === "deviceUsage"}
            onClick={() => setActiveTabKey("deviceUsage")}
          >
            การใช้งานอุปกรณ์
          </TabButton>
        </div>
      </div>

      {/* Loading strip (เฉพาะตอนอยู่ deviceUsage) */}
      {activeTabKey === "deviceUsage" && isLoading && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
          <Icon icon="mdi:loading" className="animate-spin text-lg" />
          กำลังโหลดข้อมูล...
        </div>
      )}

      {/* ====== TAB CONTENT ====== */}
      {activeTabKey === "deviceUsage" ? (
        <DashboardDeviceUsageSection
          summaryCards={summaryCardsForRender}
          lineData={lineData}
          barData={barData}
          hbarData={hbarData}
          statusSummary={{
            title: "จำนวนอุปกรณ์ทั้งหมดในแผนก",
            rows: statusSummary.rows,
            max: statusSummary.max,
          }}
        />
      ) : (
        <div className="mt-4 rounded-2xl border border-[#D9D9D9] bg-white p-6 text-sm text-neutral-600">
          กำลังพัฒนา
        </div>
      )}
    </div>
  );
}

/**
 * Description: ปุ่มแท็บแบบ segmented pill (เหมือนในรูป)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "h-9 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1890FF]/30",
        active ? "bg-[#1890FF] text-white shadow-sm" : "bg-transparent text-neutral-700 hover:bg-white"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Description: ปุ่มช่วงเวลา (วันนี้ / สัปดาห์นี้)
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
function RangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "h-8 rounded-full px-4 text-sm font-semibold transition",
        active ? "bg-neutral-900 text-white" : "bg-transparent text-neutral-700 hover:bg-neutral-50"
      )}
    >
      {children}
    </button>
  );
}
