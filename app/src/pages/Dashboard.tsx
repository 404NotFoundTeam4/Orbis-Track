// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import BorrowStatsLineCard, {
  type LinePoint,
} from "../components/BorrowStatsLineCard";

/**
 * Description: หน้า Dashboard (ใช้ component ใหม่: BorrowStatsLineCard)
 * Output : React Component
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);

  // ข้อมูลที่ส่งเข้า component
  const [totalDevices, setTotalDevices] = useState(0);
  const [lineData, setLineData] = useState<LinePoint[]>([]);

  /**
   * Description: โหลดข้อมูล Dashboard (mock)
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);

        await new Promise((r) => setTimeout(r, 350));
        if (cancelled) return;

        setTotalDevices(1000);

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

        setLineData(nextLine);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const badgeText = useMemo(
    () => `จำนวนอุปกรณ์ ${totalDevices} ชิ้น`,
    [totalDevices],
  );

  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      {/* Breadcrumb */}
      <div className="text-sm text-neutral-500">แดชบอร์ด</div>

      {/* Header */}
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-3xl font-extrabold tracking-tight text-neutral-900">
          แดชบอร์ด
        </div>

        <button
          type="button"
          onClick={() => console.log("[Dashboard] export clicked")}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1890FF] px-4 text-sm font-semibold text-white hover:opacity-95"
        >
          ส่งออก
          <Icon icon="solar:export-bold" className="text-lg" />
        </button>
      </div>

      {/* Loading strip */}
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
          <Icon icon="mdi:loading" className="animate-spin text-lg" />
          กำลังโหลดข้อมูล...
        </div>
      )}

      <div className="mt-4">
        <BorrowStatsLineCard
          title="สถิติการยืม" // title การ์ด
          badgeText={badgeText} // badge ขวาบน
          data={lineData} // ข้อมูลกราฟ
          width={982} // ความกว้าง card
          minHeight={392} // ความสูงขั้นต่ำ card
          chart={{
            ticks: [0, 50, 100, 150], // ticks แกน Y ที่อยากได้
            stroke: "#1890FF", // สีเส้นกราฟ
            showArea: true, // เปิด area ใต้กราฟ
            lineWidth: 3, // ความหนาเส้น
            dotRadius: 4, // ขนาดจุด
            padding: { left: 6, right: 10, top: 8, bottom: 8 }, // margin ของกราฟ
            minChartHeight: 260, // กันกราฟเตี้ยเกิน
            aspect: 980 / 300, // aspect กราฟ
          }}
        />
      </div>
    </div>
  );
}
