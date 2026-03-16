import { useEffect, useMemo, useState } from "react";
import BorrowStatsLineCard, {
  type LinePoint,
} from "../components/LineChartCard";
import DashboardBorrowService from "../services/DashboardLineChartService";
import DropDown from "../components/DropDown";
import { Icon } from "@iconify/react";
import Button from "../components/Button";
import BorrowGridTable from "../components/Dashboard/BorrowGridTable";
import RepairStatusSummary from "../components/RepairStatusSummary";
import BorrowStatusSummary from "../components/BorrowStatusSummary";

/**
 * Description: โครงสร้างข้อมูลสำหรับตัวเลือกใน DropDown
 * Input : id, label, value, subtitle?, disabled?
 * Output: SelectItem
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
const repairData = [
  { name: "รอดำเนินการ", value: 12 },
  { name: "กำลังซ่อม", value: 8 },
  { name: "ซ่อมเสร็จ", value: 20 },
  { name: "ยกเลิก", value: 3 },
];
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
const mockData = [
  {
    id: 1,
    name: "สมชาย ใจดี",
    position: "เจ้าหน้าที่",
    department: "IT",
    equipment: "Notebook",
    lateDays: 3,
    year: 2025,
    quarter: 2,
  },
  {
    id: 2,
    name: "สมหญิง พรชัย",
    position: "หัวหน้าแผนก",
    department: "HR",
    equipment: "iPad",
    lateDays: 1,
    year: 2024,
    quarter: 4,
  },
  {
    id: 3,
    name: "วิทยา แสงทอง",
    position: "เจ้าหน้าที่",
    department: "Finance",
    equipment: "Printer",
    lateDays: 5,
    year: 2025,
    quarter: 1,
  },
  {
    id: 4,
    name: "กนกวรรณ มีสุข",
    position: "ผู้จัดการ",
    department: "Marketing",
    equipment: "MacBook",
    lateDays: 0,
    year: 2024,
    quarter: 3,
  },
  {
    id: 5,
    name: "ธีรภัทร์ บุญมาก",
    position: "เจ้าหน้าที่",
    department: "IT",
    equipment: "Monitor",
    lateDays: 2,
    year: 2025,
    quarter: 2,
  },
  {
    id: 6,
    name: "ปาริชาติ อินทร์แก้ว",
    position: "เจ้าหน้าที่",
    department: "HR",
    equipment: "Notebook",
    lateDays: 4,
    year: 2023,
    quarter: 4,
  },
  {
    id: 7,
    name: "ศุภชัย ทองดี",
    position: "หัวหน้าแผนก",
    department: "Finance",
    equipment: "Projector",
    lateDays: 6,
    year: 2025,
    quarter: 3,
  },
  {
    id: 8,
    name: "อรทัย สุขใจ",
    position: "เจ้าหน้าที่",
    department: "Marketing",
    equipment: "Tablet",
    lateDays: 1,
    year: 2024,
    quarter: 2,
  },
  {
    id: 9,
    name: "ณัฐพล แก้วคำ",
    position: "ผู้จัดการ",
    department: "IT",
    equipment: "Server",
    lateDays: 8,
    year: 2025,
    quarter: 1,
  },
  {
    id: 10,
    name: "จิราพร คงมั่น",
    position: "เจ้าหน้าที่",
    department: "Finance",
    equipment: "Scanner",
    lateDays: 0,
    year: 2023,
    quarter: 3,
  },
  {
    id: 11,
    name: "ภาณุพงศ์ ใจกล้า",
    position: "เจ้าหน้าที่",
    department: "HR",
    equipment: "Notebook",
    lateDays: 2,
    year: 2025,
    quarter: 4,
  },
  {
    id: 12,
    name: "สุภาวดี แสงจันทร์",
    position: "หัวหน้าแผนก",
    department: "Marketing",
    equipment: "Camera",
    lateDays: 7,
    year: 2024,
    quarter: 1,
  },
  {
    id: 13,
    name: "ธนกร ศรีสุข",
    position: "เจ้าหน้าที่",
    department: "IT",
    equipment: "Keyboard",
    lateDays: 1,
    year: 2023,
    quarter: 2,
  },
  {
    id: 14,
    name: "พิมพ์ชนก วัฒนะ",
    position: "เจ้าหน้าที่",
    department: "Finance",
    equipment: "Notebook",
    lateDays: 3,
    year: 2025,
    quarter: 3,
  },
  {
    id: 15,
    name: "อนุชา รัตน์ดี",
    position: "ผู้จัดการ",
    department: "HR",
    equipment: "iPad",
    lateDays: 9,
    year: 2024,
    quarter: 2,
  },
  {
    id: 16,
    name: "เบญจวรรณ ทองมาก",
    position: "เจ้าหน้าที่",
    department: "Marketing",
    equipment: "Printer",
    lateDays: 2,
    year: 2025,
    quarter: 1,
  },
  {
    id: 17,
    name: "จักรกฤษณ์ นิ่มนวล",
    position: "เจ้าหน้าที่",
    department: "IT",
    equipment: "Mouse",
    lateDays: 0,
    year: 2023,
    quarter: 4,
  },
  {
    id: 18,
    name: "ชลธิชา สุขสำราญ",
    position: "หัวหน้าแผนก",
    department: "Finance",
    equipment: "Notebook",
    lateDays: 4,
    year: 2025,
    quarter: 2,
  },
  {
    id: 19,
    name: "วรเมธ คำภา",
    position: "เจ้าหน้าที่",
    department: "HR",
    equipment: "Tablet",
    lateDays: 5,
    year: 2024,
    quarter: 3,
  },
  {
    id: 20,
    name: "ณิชาภา แก้วดี",
    position: "เจ้าหน้าที่",
    department: "Marketing",
    equipment: "MacBook",
    lateDays: 1,
    year: 2025,
    quarter: 4,
  },
];
const borrowData = [
  { name: "โปรเจคเตอร์", value: 230 },
  { name: "โน้ตบุ๊ก", value: 226 },
  { name: "เมาส์", value: 150 },
  { name: "เก้าอี้", value: 115 },
  { name: "โต๊ะ", value: 30 },
];
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
    <div className="w-full px-[20px] py-[20px] ">
      <div className="text-sm text-[#000000]">แดชบอร์ด</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">
        แดชบอร์ด
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pr-[8px]">
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
              <Icon
                icon="flowbite:download-solid"
                width="24"
                height="24"
                className="text-[16px]"
              />
            </span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex gap-3">
          <div className="">
            <BorrowStatsLineCard
              title="สถิติการยืม"
              badgeText="รายปี"
              badgeBgColor="#E6F7FF"
              data={lineData}
              width={982}
              minHeight={409}
              chart={{ stroke: "#40A9FF" }}
            />
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
          </div>
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
    </div>
  );
}
