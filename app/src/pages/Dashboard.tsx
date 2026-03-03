import { useEffect, useMemo, useState } from "react";
import BorrowStatsLineCard, {
  type LinePoint,
} from "../components/BorrowStatsLineCard";
import DashboardBorrowService from "../services/DashboardBorrowService";
import DropDown from "../components/DropDown";
import { Icon } from "@iconify/react";
import Button from "../components/Button";

type SelectItem = {
  id: number;
  label: string;
  value: number;
  subtitle?: string;
  disabled?: boolean;
};

export default function Dashboard() {
  const yearOptions: SelectItem[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = 2021;
    const years: SelectItem[] = [];
    for (let y = currentYear; y >= minYear; y--) {
      years.push({ id: y, label: String(y), value: y });
    }
    return years;
  }, []);

  const quarterOptions: SelectItem[] = useMemo(
    () => [
      { id: 0, label: "ทั้งปี", value: 0, subtitle: "ม.ค. - ธ.ค." },
      { id: 1, label: "Q1 (ม.ค. - มี.ค.)", value: 1 },
      { id: 2, label: "Q2 (เม.ย. - มิ.ย.)", value: 2 },
      { id: 3, label: "Q3 (ก.ค. - ก.ย.)", value: 3 },
      { id: 4, label: "Q4 (ต.ค. - ธ.ค.)", value: 4 },
    ],
    [],
  );

  const [yearItem, setYearItem] = useState<SelectItem | null>(() => {
    const y = new Date().getFullYear();
    return { id: y, label: String(y), value: y };
  });

  const [quarterItem, setQuarterItem] = useState<SelectItem | null>(() => ({
    id: 0,
    label: "ทั้งปี",
    value: 0,
    subtitle: "ม.ค. - ธ.ค.",
  }));

  const [lineData, setLineData] = useState<LinePoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const year = yearItem?.value ?? new Date().getFullYear();
    const quarter = quarterItem?.value ?? 0;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await DashboardBorrowService.getBorrowStats({
          year,
          quarter,
        });
        if (!cancelled) setLineData(res.points);
      } catch (e) {
        console.error("load borrow stats error:", e);
        if (!cancelled) setLineData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [yearItem?.value, quarterItem?.value]);

  const year = yearItem?.value ?? new Date().getFullYear();
  const quarter = quarterItem?.value ?? 0;

  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      <div className="text-sm text-[#000000]">แดชบอร์ด</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
        แดชบอร์ด
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <DropDown
          items={quarterOptions}
          value={quarterItem}
          onChange={setQuarterItem}
          placeholder="ไตรมาส"
          searchable={false}
          width={137}
        />
        <DropDown
          items={yearOptions}
          value={yearItem}
          onChange={setYearItem}
          placeholder="ปี"
          searchable={false}
          width={137}
        />
        <div className="flex justify-end">
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              console.log("export clicked");
            }}
            className="!w-[108px] !h-[46px] !rounded-full !bg-[#58B3FF] hover:!bg-[#40A9FF] active:!bg-[#1890FF] !text-[16px] !font-bold"
          >
            <span className="inline-flex items-center gap-1">
              ส่งออก
              <Icon icon="flowbite:download-solid" width="24" height="24" className="text-[16px]" />
            </span>
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-[7px]">
        <BorrowStatsLineCard
          title="สถิติการยืม"
          badgeText={`ปี ${year} / ${quarter === 0 ? "ทั้งปี" : `ไตรมาส ${quarter}`}${loading ? " (กำลังโหลด...)" : ""}`}
          badgeBgColor={"#E6F7FF"}
          data={lineData}
          width={982}
          minHeight={392}
          svgClassName="w-full h-full"
          chart={{ stroke: "#40A9FF" }}
        />
        <BorrowStatsLineCard
          title="สถิติการแจ้งปัญหา"
          badgeText={`ปี ${year} / ${quarter === 0 ? "ทั้งปี" : `ไตรมาส ${quarter}`}${loading ? " (กำลังโหลด...)" : ""}`}
          badgeBgColor={"#FFF1F0"}
          data={lineData}
          width={982}
          minHeight={392}
          svgClassName="w-full h-full"
          chart={{ stroke: "#FFCCC7" }}
        />
      </div>
    </div>
  );
}
