import { useEffect, useMemo, useState } from "react";
import BorrowStatsLineCard, {
  type LinePoint,
} from "../components/LineChartCard";
import DashboardBorrowService from "../services/DashboardLineChartService";
import DashboardService, {
  type MostBorrowedPoint,
  type RepairStatusPoint,
  type OverdueTicket,
} from "../services/dashboard";
import DropDown from "../components/DropDown";
import { Icon } from "@iconify/react";
import Button from "../components/Button";
import BorrowGridTable from "../components/Dashboard/BorrowGridTable";
import RepairStatusSummary from "../components/RepairStatusSummary";
import BorrowStatusSummary from "../components/BorrowStatusSummary";

import { exportDashboardToExcel } from "../utils/exportDashboardToExcel";
import { exportDashboardToPdf } from "../utils/exportDashboardToPdf";
import ExportDashboardModal, {
  type ExportFileType,
} from "../components/ExportDashboardModal";

/**
 * Description: หน้า Dashboard สำหรับแสดงสถิติการยืมและสถิติการแจ้งปัญหา
 * Input : -
 * Output: JSX.Element
 * Author: Nontapat Sinthum (Guitar) 66160104
 */
type SelectItem = {
  id: number;
  label: string;
  value: number;
  subtitle?: string;
  disabled?: boolean;
};

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

  const [borrowMonthData, setBorrowMonthData] = useState<LinePoint[]>([]);

  /**
   * Description: state สำหรับเก็บข้อมูลกราฟสถิติการแจ้งปัญหา
   * Input : -
   * Output: issueLineData, setIssueLineData
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const [issueLineData, setIssueLineData] = useState<LinePoint[]>([]);

  // New states for real API data
  const [mostBorrowedData, setMostBorrowedData] = useState<MostBorrowedPoint[]>(
    [],
  );
  const [repairStatusData, setRepairStatusData] = useState<RepairStatusPoint[]>(
    [],
  );
  const [overdueTableData, setOverdueTableData] = useState<OverdueTicket[]>([]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
        const [
          _deviceRes,
          issueRes,
          borrowMonthRes,
          mostBorrowedRes,
          repairStatusRes,
          overdueTableRes,
        ] = await Promise.all([
          DashboardBorrowService.getDeviceChildCount({ year, quarter }),
          DashboardBorrowService.getIssueStats({ year, quarter }),
          DashboardService.getBorrowStats(year, quarter),
          DashboardService.getMostBorrowedStats(year, quarter),
          DashboardService.getRepairStatusStats(year, quarter),
          DashboardService.getOverdueTable(),
        ]);

        if (!cancelled) {
          // stats
          setIssueLineData(issueRes.points);
          setBorrowMonthData(borrowMonthRes.points);
          setMostBorrowedData(mostBorrowedRes.points);
          setRepairStatusData(repairStatusRes.points);
          setOverdueTableData(overdueTableRes);
        }
      } catch (exception) {
        console.error("load dashboard stats error:", exception);
        if (!cancelled) {
          setIssueLineData([]);
          setBorrowMonthData([]);
          setMostBorrowedData([]);
          setRepairStatusData([]);
          setOverdueTableData([]);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [yearItem?.value, quarterItem?.value]);

  // Translate mapped points for the BorrowStatusSummary component (it expects {name, value})
  const mostBorrowedFormattedData = mostBorrowedData.map((d) => ({
    name: d.equipmentName,
    value: d.value,
  }));

  // Translate mapped points for the RepairStatusSummary component (it expects {name, value})
  // Let's aggregate the whole year for the pie chart view
  const repairChartData = useMemo(() => {
    let pending = 0,
      inProgress = 0,
      completed = 0;
    repairStatusData.forEach((m) => {
      pending += m.pending;
      inProgress += m.inProgress;
      completed += m.completed;
    });
    return [
      { name: "รอดำเนินการ", value: pending },
      { name: "กำลังซ่อม", value: inProgress },
      { name: "ซ่อมเสร็จ", value: completed },
    ];
  }, [repairStatusData]);

  /**
   * Description: คำนวณยอดรวมของข้อมูลในกราฟเพื่อแสดงบน badge
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  const totalBorrow = useMemo(
    () => borrowMonthData.reduce((acc, curr) => acc + curr.value, 0),
    [borrowMonthData],
  );
  const totalIssue = useMemo(
    () => issueLineData.reduce((acc, curr) => acc + curr.value, 0),
    [issueLineData],
  );

  /**
   * Description: จัดการส่งออกข้อมูล Dashboard ตามประเภทไฟล์ที่ผู้ใช้เลือก
   * Input : fileName, fileType
   * Output: สร้างไฟล์ Excel หรือ PDF และปิด Export Modal
   * Author: Chanwit Muangma (Boom) 66160224
   */
  const handleExportFile = async (
    fileName: string,
    fileType: ExportFileType,
  ) => {
    const payload = {
      fileName,
      borrowMonthData,
      issueLineData,
      mostBorrowedData,
      repairChartData,
      overdueTableData,
      year: yearItem?.value ?? new Date().getFullYear(),
      quarterLabel: quarterItem?.label ?? "ทั้งปี",
    };

    if (fileType === "excel") {
      exportDashboardToExcel(payload);
    } else {
      await exportDashboardToPdf(payload);
    }

    setIsExportModalOpen(false);
  };

  /**
   * Description: ข้อความช่วงเวลาที่ใช้แสดงบนการ์ดสถิติ
   * Input : year, quarter, loading
   * Output: string
   * Author: Nontapat Sinthum (Guitar) 66160104
   */
  return (
    <div className="w-full px-[20px] py-[20px] ">
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">
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
            onClick={() => setIsExportModalOpen(true)}
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
      <div className="flex flex-col mt-4 gap-1">
        <div className="flex gap-3">
          <div className="">
            <BorrowStatsLineCard
              title="สถิติการยืม (รายเดือนปีเต็ม)"
              badgeText={`จำนวนอุปกรณ์ ${totalBorrow.toLocaleString()} ชิ้น`}
              badgeBgColor="#E6F7FF"
              data={borrowMonthData}
              width={982}
              minHeight={392}
              chart={{ stroke: "#40A9FF" }}
            />
          </div>

          <div className=" flex flex-col gap-[7px]">
            <BorrowStatusSummary
              title="อุปกรณ์ที่ถูกยืมบ่อยที่สุด"
              width={667}
              height={392}
              isAnimation={true}
              data={mostBorrowedFormattedData}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div>
            <BorrowStatsLineCard
              title="สถิติการแจ้งปัญหา"
              badgeText={`จำนวนอุปกรณ์ ${totalIssue.toLocaleString()} ชิ้น`}
              badgeBgColor="#E6F7FF"
              data={issueLineData}
              width={982}
              minHeight={409}
              chart={{ stroke: "#40A9FF" }}
            />
          </div>
          <div>
            <RepairStatusSummary
              title="สถิติสถานะงานซ่อม"
              data={repairChartData}
              width={667}
              height={405}
            />
          </div>
        </div>
        <div className="mr-[3px]">
          <BorrowGridTable data={overdueTableData} />
        </div>
      </div>
      <ExportDashboardModal
        open={isExportModalOpen}
        defaultFileName="dashboard-report"
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportFile}
      />
    </div>
  );
}
