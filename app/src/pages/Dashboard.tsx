import { useEffect, useMemo, useState } from "react";
import BorrowStatsLineCard, { type LinePoint } from "../components/LineChartCard";
import DashboardBorrowService from "../services/DashboardLineChartService";
import DropDown from "../components/DropDown";
import { Icon } from "@iconify/react";
import Button from "../components/Button";

/**
 * Description: โครงสร้างข้อมูลสำหรับตัวเลือกใน DropDown
 * Input : id, label, value, subtitle?, disabled?
 * Output: SelectItem
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
type SelectItem = {
  id: number;
  label: string;
  value: number;
  subtitle?: string;
  disabled?: boolean;
};

/**
 * Description: หน้า Dashboard สำหรับแสดงสถิติการยืมและสถิติการแจ้งปัญหา
 * Input : -
 * Output: JSX.Element
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
export default function Dashboard() {
  /**
   * Description: สร้างรายการปีสำหรับใช้ใน DropDown โดยเริ่มจากปีปัจจุบันย้อนหลังถึงปี 2021
   * Input : -
   * Output: SelectItem[]
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const yearOptions: SelectItem[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = 2021;
    const years: SelectItem[] = [];
    for (let year = currentYear; year >= minYear; year--) {
      years.push({ id: year, label: String(year), value: year });
    }
    return years;
  }, []);

  /**
   * Description: สร้างรายการไตรมาสสำหรับใช้ใน DropDown
   * Input : -
   * Output: SelectItem[]
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
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

  /**
   * Description: state สำหรับเก็บปีที่ผู้ใช้เลือก โดยค่าเริ่มต้นเป็นปีปัจจุบัน
   * Input : -
   * Output: yearItem, setYearItem
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [yearItem, setYearItem] = useState<SelectItem | null>(() => {
    const year = new Date().getFullYear();
    return { id: year, label: String(year), value: year };
  });

  /**
   * Description: state สำหรับเก็บไตรมาสที่ผู้ใช้เลือก โดยค่าเริ่มต้นเป็นทั้งปี
   * Input : -
   * Output: quarterItem, setQuarterItem
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [quarterItem, setQuarterItem] = useState<SelectItem | null>(() => ({
    id: 0,
    label: "ทั้งปี",
    value: 0,
    subtitle: "ม.ค. - ธ.ค.",
  }));

  /**
   * Description: state สำหรับเก็บข้อมูลกราฟสถิติการยืม
   * Input : -
   * Output: lineData, setLineData
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [lineData, setLineData] = useState<LinePoint[]>([]);

  /**
   * Description: state สำหรับเก็บข้อมูลกราฟสถิติการแจ้งปัญหา
   * Input : -
   * Output: issueLineData, setIssueLineData
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [issueLineData, setIssueLineData] = useState<LinePoint[]>([]);

  /**
   * Description: state สำหรับเก็บจำนวนอุปกรณ์ย่อยสะสม
   * Input : -
   * Output: deviceTotal, setDeviceTotal
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [deviceTotal, setDeviceTotal] = useState<number>(0);

  /**
   * Description: state สำหรับบอกสถานะการโหลดข้อมูลของหน้า Dashboard
   * Input : -
   * Output: loading, setLoading
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [loading, setLoading] = useState(false);

  /**
   * Description: ดึงข้อมูล Dashboard ใหม่ทุกครั้งเมื่อปีหรือไตรมาสเปลี่ยน
   * Input : yearItem?.value, quarterItem?.value
   * Output: อัปเดต lineData, issueLineData, deviceTotal, loading
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  useEffect(() => {
    const year = yearItem?.value ?? new Date().getFullYear();
    const quarter = quarterItem?.value ?? 0;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const [borrowRes, deviceRes, issueRes] = await Promise.all([
          DashboardBorrowService.getBorrowStats({ year, quarter }),
          DashboardBorrowService.getDeviceChildCount({ year, quarter }),
          DashboardBorrowService.getIssueStats({ year, quarter }),
        ]);

        if (!cancelled) {
          setLineData(borrowRes.points);
          setDeviceTotal(deviceRes.total);
          setIssueLineData(issueRes.points);
        }
      } catch (exception) {
        console.error("load dashboard stats error:", exception);
        if (!cancelled) {
          setLineData([]);
          setIssueLineData([]);
          setDeviceTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [yearItem?.value, quarterItem?.value]);

  /**
   * Description: ค่าปีที่ใช้จริงในการ query หากยังไม่ได้เลือกจะใช้ปีปัจจุบัน
   * Input : yearItem
   * Output: year
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const year = yearItem?.value ?? new Date().getFullYear();

  /**
   * Description: ค่าไตรมาสที่ใช้จริงในการ query หากยังไม่ได้เลือกจะใช้ทั้งปี
   * Input : quarterItem
   * Output: quarter
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const quarter = quarterItem?.value ?? 0;

  /**
   * Description: ข้อความช่วงเวลาที่ใช้แสดงบนการ์ดสถิติ
   * Input : year, quarter, loading
   * Output: string
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const periodText = `ปี ${year} / ${quarter === 0 ? "ทั้งปี" : `ไตรมาส ${quarter}`}${loading ? " (กำลังโหลด...)" : ""}`;

  /**
   * Description: ข้อความจำนวนอุปกรณ์ที่ใช้แสดงบน badge ของการ์ด
   * Input : deviceTotal
   * Output: string
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const deviceText = `จำนวนอุปกรณ์ ${deviceTotal.toLocaleString()} ชิ้น`;

  return (
    <div className="mx-auto w-full px-[20px] py-[20px]">
      <div className="text-sm text-[#000000]">แดชบอร์ด</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">แดชบอร์ด</div>

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
            onClick={() => console.log("export clicked")}
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
          periodLabel={periodText}
          badgeText={deviceText}
          badgeBgColor="#E6F7FF"
          data={lineData}
          width={982}
          minHeight={392}
          svgClassName="w-full h-full"
          chart={{ stroke: "#40A9FF" }}
        />

        <BorrowStatsLineCard
          title="สถิติการแจ้งปัญหา"
          periodLabel={periodText}
          badgeText={deviceText}
          badgeBgColor="#FFF1F0"
          data={issueLineData}
          width={982}
          minHeight={392}
          svgClassName="w-full h-full"
          chart={{ stroke: "#FF7875" }}
        />
      </div>
    </div>
  );
}