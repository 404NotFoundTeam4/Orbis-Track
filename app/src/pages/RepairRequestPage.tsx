import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import RepairRequestForm from "../components/RepairRequestForm";
import { useToast } from "../components/Toast";
import {
  repairService,
  type RepairPrefill,
} from "../services/RepairService";
import { inventoryService, DeviceService, type DeviceChild, type GetInventory } from "../services/InventoryService";

type RepairRequestNavigationState = {
  selectedRepairItem?: {
    issueId: number;
    deviceName: string;
    category: string;
    requesterName: string;
    requesterEmpCode: string | null;
  };
};

export default function RepairRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { push } = useToast();

  const mode = searchParams.get("mode") === "other" ? "other" : "fromIssue";
  const issueIdParam = searchParams.get("issueId");
  const selectedIssueId = issueIdParam ? Number(issueIdParam) : null;
  const selectedRepairItem = (location.state as RepairRequestNavigationState | null)?.selectedRepairItem;
  const effectiveIssueId = selectedIssueId ?? selectedRepairItem?.issueId ?? null;

  const [prefill, setPrefill] = useState<RepairPrefill | null>(null);
  const [loading, setLoading] = useState(false);
  const [mainDevices, setMainDevices] = useState<GetInventory[]>([]);
  const [selectedMainDeviceId, setSelectedMainDeviceId] = useState<number | "">("");
  const [subDevices, setSubDevices] = useState<DeviceChild[]>([]);
  const [selectedSubDeviceIds, setSelectedSubDeviceIds] = useState<number[]>([]);

  const availableMainDevices = useMemo(() => {
    return mainDevices.filter((device) => Number(device.available) > 0);
  }, [mainDevices]);

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
          return;
        }

        if (mode === "fromIssue") {
          setPrefill(null);
          push({ tone: "danger", message: "ไม่พบรายการอ้างอิงสำหรับแบบฟอร์มแจ้งซ่อม" });
        }
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
    if (!selectedMainDeviceId) {
      setSubDevices([]);
      setSelectedSubDeviceIds([]);
      return;
    }

    void (async () => {
      try {
        const deviceWithChilds = await DeviceService.getDeviceWithChilds(Number(selectedMainDeviceId));
        setSubDevices(deviceWithChilds.device_childs ?? []);
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
  }, [selectedMainDeviceId, mode, push]);

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

  const isDeviceLocked = mode === "fromIssue";
  const lockedDeviceId = isDeviceLocked ? prefill?.device_id ?? null : null;

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
          mainDevices={availableMainDevices}
          allowedMainDeviceIds={availableMainDevices.map((device) => device.de_id)}
          selectedMainDeviceId={selectedMainDeviceId}
          onMainDeviceChange={setSelectedMainDeviceId}
          subDevices={subDevices}
          onToggleSubDevice={toggleSubDevice}
        />
      </div>
    </div>
  );
}

