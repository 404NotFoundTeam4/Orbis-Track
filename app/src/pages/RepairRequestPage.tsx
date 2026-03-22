import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import RepairRequestForm from "../components/RepairRequestForm";
import { useToast } from "../components/Toast";
import {
  repairService,
  type RepairPrefill,
} from "../services/RepairService";
import { inventoryService, DeviceService, type DeviceChild, type GetInventory } from "../services/InventoryService";
import { ticketsService } from "../services/TicketsService";
import { historyIssueService } from "../services/HistoryIssueService";
import { historyBorrowService } from "../services/HistoryBorrowService";

type RepairRequestNavigationState = {
  selectedRepairItem?: {
    issueId?: number;
    deviceId?: number;
    borrowTicketId?: number;
    deviceName: string;
    category: string;
    requesterName: string;
    requesterEmpCode: string | null;
  };
};

type BorrowedMainDevice = {
  de_id: number;
  de_name: string;
  de_serial_number: string;
};

export default function RepairRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { push } = useToast();

  const mode = searchParams.get("mode") === "other" ? "other" : "fromIssue";
  const issueIdParam = searchParams.get("issueId");
  const deviceIdParam = searchParams.get("deviceId");
  const selectedIssueId = issueIdParam ? Number(issueIdParam) : null;
  const selectedDeviceId = deviceIdParam ? Number(deviceIdParam) : null;
  const selectedRepairItem = (location.state as RepairRequestNavigationState | null)?.selectedRepairItem;
  const effectiveIssueId = selectedIssueId ?? selectedRepairItem?.issueId ?? null;
  const effectiveDeviceId = selectedDeviceId ?? selectedRepairItem?.deviceId ?? null;
  const effectiveBorrowTicketId = selectedRepairItem?.borrowTicketId ?? null;
  const currentUserId = useMemo(() => {
    const userRaw = sessionStorage.getItem("User") || localStorage.getItem("User");
    const parsed = userRaw ? JSON.parse(userRaw) : null;
    return (parsed?.us_id ?? parsed?.state?.user?.us_id ?? null) as number | null;
  }, []);

  const [prefill, setPrefill] = useState<RepairPrefill | null>(null);
  const [loading, setLoading] = useState(false);
  const [mainDevices, setMainDevices] = useState<GetInventory[]>([]);
  const [borrowedMainDevices, setBorrowedMainDevices] = useState<BorrowedMainDevice[]>([]);
  const [selectedMainDeviceId, setSelectedMainDeviceId] = useState<number | "">("");
  const [subDevices, setSubDevices] = useState<DeviceChild[]>([]);
  const [selectedSubDeviceIds, setSelectedSubDeviceIds] = useState<number[]>([]);

  const availableMainDevices = useMemo(() => {
    return mainDevices.filter((device) => Number(device.available) > 0);
  }, [mainDevices]);

  const otherModeMainDevices = useMemo(() => {
    return mainDevices.filter((device) => Number(device.total) > 0 && Number(device.available) > 0);
  }, [mainDevices]);

  const formMainDevices = useMemo(() => {
    if (mode === "other") {
      return otherModeMainDevices;
    }

    if (effectiveIssueId && effectiveIssueId > 0) {
      return availableMainDevices;
    }

    return borrowedMainDevices;
  }, [mode, effectiveDeviceId, availableMainDevices, otherModeMainDevices, effectiveIssueId, borrowedMainDevices]);

  const fetchPrefill = async (issueId: number) => {
    setLoading(true);
    try {
      const data = await repairService.getRepairPrefill(issueId);
      setPrefill(data);
    } catch {
      setPrefill(null);
      push({ tone: "danger", message: "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const deviceList = await inventoryService.getInventory();
        setMainDevices(deviceList);

        if (effectiveIssueId && effectiveIssueId > 0) {
          await fetchPrefill(effectiveIssueId);
          setBorrowedMainDevices([]);
          return;
        }

        if (mode === "other") {
          setBorrowedMainDevices([]);
          return;
        }

        const borrowedTicketList = await ticketsService.getTickets({
          page: 1,
          limit: 100,
          status: "IN_USE",
        });

        const mappedBorrowed = borrowedTicketList.data.reduce<BorrowedMainDevice[]>((acc, ticket) => {
          const deviceId = ticket.device_summary.deviceId;
          if (acc.some((item) => item.de_id === deviceId)) return acc;

          acc.push({
            de_id: deviceId,
            de_name: ticket.device_summary.name,
            de_serial_number: ticket.device_summary.serial_number ?? "",
          });
          return acc;
        }, []);

        setPrefill(null);
        setBorrowedMainDevices(mappedBorrowed);
      } catch {
        push({ tone: "danger", message: "ไม่สามารถโหลดข้อมูลแบบฟอร์มแจ้งซ่อมได้" });
      }
    })();
  }, [effectiveIssueId, mode, push]);

  useEffect(() => {
    if (!prefill?.device_id) return;
    setSelectedMainDeviceId(prefill.device_id);
  }, [prefill?.device_id]);

  useEffect(() => {
    if (mode !== "other") return;
    if (!effectiveDeviceId || effectiveDeviceId <= 0) return;
    setSelectedMainDeviceId(effectiveDeviceId);
  }, [mode, effectiveDeviceId]);

  useEffect(() => {
    if (!selectedMainDeviceId) {
      setSubDevices([]);
      setSelectedSubDeviceIds([]);
      return;
    }

    void (async () => {
      try {
        const deviceWithChilds = await DeviceService.getDeviceWithChilds(Number(selectedMainDeviceId));
        let remainingSubDevices = deviceWithChilds.device_childs ?? [];

        if (mode === "other" && effectiveBorrowTicketId) {
          const borrowedDetail = await historyBorrowService.getHistoryBorrowTicketDetail(
            Number(effectiveBorrowTicketId),
          );
          const borrowedChildIdSet = new Set(
            (borrowedDetail.deviceChildren ?? []).map((child) => child.deviceChildId),
          );
          remainingSubDevices = remainingSubDevices.filter((sub) => borrowedChildIdSet.has(sub.dec_id));
        } else if (mode === "other") {
          remainingSubDevices = remainingSubDevices.filter((sub) => sub.dec_status === "READY");
        }

        /**
         * Description: กรองอุปกรณ์ย่อยที่ถูกแจ้งซ่อมค้างอยู่เฉพาะ flow ที่ไม่ใช่ mode=other
         * Input : mode, effectiveDeviceId, currentUserId, issue list/detail
         * Output : remainingSubDevices ที่ผ่านเงื่อนไขการกรอง
         * Author: Rachata Jitjeankhan (Tang) 66160369
         */
        if (mode !== "other" && effectiveDeviceId && currentUserId) {
          const [pendingIssues, inProgressIssues] = await Promise.all([
            historyIssueService.getHistoryIssueList({ status: "PENDING" }),
            historyIssueService.getHistoryIssueList({ status: "IN_PROGRESS" }),
          ]);

          const sameDeviceIssueIds = [...pendingIssues, ...inProgressIssues]
            .filter(
              (issue) =>
                issue.parentDevice.id === Number(selectedMainDeviceId) &&
                issue.reporterUser.id === currentUserId,
            )
            .map((issue) => issue.issueId);

          if (sameDeviceIssueIds.length > 0) {
            const issueDetails = await Promise.all(
              sameDeviceIssueIds.map((issueId) => historyIssueService.getHistoryIssueDetail(issueId)),
            );

            const blockedSubDeviceIds = new Set<number>(
              issueDetails.flatMap((detail) => detail.deviceChildList.map((child) => child.deviceChildId)),
            );

            remainingSubDevices = remainingSubDevices.filter(
              (sub) => !blockedSubDeviceIds.has(sub.dec_id),
            );
          }
        }

        setSubDevices(remainingSubDevices);
        setSelectedSubDeviceIds([]);

        if (mode === "other") {
          setPrefill((prev) => ({
            issue_id: prev?.issue_id ?? 0,
            device_id: deviceWithChilds.de_id,
            device_code: deviceWithChilds.de_serial_number,
            device_name: deviceWithChilds.de_name,
            quantity: prev?.quantity ?? 1,
            category: prev?.category ?? deviceWithChilds.category?.ca_name ?? "-",
            requester_name: prev?.requester_name ?? "",
            requester_emp_code: prev?.requester_emp_code ?? null,
          }));
        }
      } catch {
        setSubDevices([]);
        setSelectedSubDeviceIds([]);
        push({ tone: "danger", message: "ไม่สามารถโหลดอุปกรณ์ย่อยของอุปกรณ์แม่ที่เลือกได้" });
      }
    })();
  }, [selectedMainDeviceId, mode, push, effectiveDeviceId, currentUserId, effectiveBorrowTicketId]);

  const toggleSubDevice = (decId: number) => {
    setSelectedSubDeviceIds((prev) =>
      prev.includes(decId) ? prev.filter((id) => id !== decId) : [...prev, decId],
    );
  };

  const repairListPath = useMemo(() => {
    const path = location.pathname;
    const parts = path.split("/").filter(Boolean);
    if (parts.length > 0) return `/${parts[0]}/repair`;
    return "/repair";
  }, []);

  const handleCancel = () => {
    navigate(repairListPath);
  };

  const handleSuccess = () => {
    push({ tone: "success", message: "แจ้งซ่อมเรียบร้อยแล้ว" });
    navigate(repairListPath);
  };

  const isDeviceLocked =
    (mode === "fromIssue" && Boolean(effectiveIssueId)) ||
    (mode === "other" && Boolean(effectiveDeviceId));
  const lockedDeviceId =
    mode === "fromIssue"
      ? effectiveIssueId
        ? prefill?.device_id ?? null
        : null
      : mode === "other"
        ? effectiveDeviceId ?? null
        : null;

  return (
    <div className="p-4">
      <div className="space-x-[9px]">
        <Link
          to={repairListPath}
          className="text-[#858585]"
        >
          แจ้งซ่อม
        </Link>
        <span className="text-[#858585]">&gt;</span>
        <span className="text-[#000000]">
          แบบฟอร์มแจ้งซ่อม
        </span>
      </div>

      <div className="mb-[21px] flex items-center gap-[14px]">
        <h1 className="text-2xl font-semibold">แจ้งซ่อม</h1>
      </div>

      <div className="w-full">
        <RepairRequestForm
          mode={mode}
          prefill={prefill}
          loadingPrefill={loading}
          isDeviceLocked={isDeviceLocked}
          lockedDeviceId={lockedDeviceId}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
          submitLabel="แจ้งซ่อม"
          selectedSubDeviceIds={selectedSubDeviceIds}
          mainDevices={formMainDevices}
          allowedMainDeviceIds={formMainDevices.map((device) => device.de_id)}
          selectedMainDeviceId={selectedMainDeviceId}
          onMainDeviceChange={setSelectedMainDeviceId}
          subDevices={subDevices}
          onToggleSubDevice={toggleSubDevice}
        />
      </div>
    </div>
  );
}

