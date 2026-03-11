import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "./Button";
import Input from "./Input";
import {
  repairService,
  type RepairItem,
  type RepairPrefill,
} from "../services/RepairService";

type MainDeviceOption = {
  de_id: number;
  de_name: string;
  de_serial_number: string;
};

type SubDeviceItem = {
  dec_id: number;
  dec_asset_code: string;
  dec_serial_number: string | null;
};

type RepairRequestFormProps = {
  mode: "fromIssue" | "other";
  issues: RepairItem[];
  prefill: RepairPrefill | null;
  loadingPrefill?: boolean;
  defaultRequesterName?: string;
  defaultRequesterEmpCode?: string | null;
  onSelectIssue: (issueId: number) => void;
  onCancel: () => void;
  onSuccess: () => void;
  submitLabel?: string;
  selectedSubDeviceIds?: number[];
  mainDevices?: MainDeviceOption[];
  selectedMainDeviceId?: number | "";
  onMainDeviceChange?: (value: number | "") => void;
  subDevices?: SubDeviceItem[];
  onToggleSubDevice?: (decId: number) => void;
};

type FormErrors = Partial<
  Record<"subject" | "problemDescription", string>
>;

export default function RepairRequestForm({
  mode,
  issues,
  prefill,
  loadingPrefill = false,
  defaultRequesterName,
  defaultRequesterEmpCode,
  onSelectIssue,
  onCancel,
  onSuccess,
  submitLabel = "บันทึก",
  selectedSubDeviceIds = [],
  mainDevices = [],
  selectedMainDeviceId = "",
  onMainDeviceChange,
  subDevices = [],
  onToggleSubDevice,
}: Readonly<RepairRequestFormProps>) {
  const [selectedIssueId, setSelectedIssueId] = useState<number | "">("");
  const [deviceCode, setDeviceCode] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");
  const [requesterName, setRequesterName] = useState(defaultRequesterName ?? "");
  const [requesterEmpCode, setRequesterEmpCode] = useState(defaultRequesterEmpCode ?? "");
  const [subject, setSubject] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [receiveLocation, setReceiveLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const issueOptions = useMemo(
    () =>
      issues.map((item) => ({
        issueId: item.id,
        label: `${item.device_name} (${item.category}) - ผู้ร้อง: ${item.requester_name}`,
      })),
    [issues],
  );

  const autoFillFormData = (selectedData: RepairPrefill) => {
    setSelectedIssueId(selectedData.issue_id);
    setDeviceCode(selectedData.device_code ?? "");
    setDeviceName(selectedData.device_name ?? "");
    setQuantity(selectedData.quantity || 1);
    setCategory(selectedData.category || "");
    setRequesterName(selectedData.requester_name || "");
    setRequesterEmpCode(selectedData.requester_emp_code || "");
  };

  useEffect(() => {
    if (!prefill) return;
    autoFillFormData(prefill);
  }, [prefill]);

  useEffect(() => {
    if (!prefill && mode === "other") {
      setRequesterName(defaultRequesterName ?? "");
      setRequesterEmpCode(defaultRequesterEmpCode ?? "");
      setDeviceCode("");
      setDeviceName("");
      setCategory("");
      setQuantity(1);
    }
  }, [mode, prefill, defaultRequesterName, defaultRequesterEmpCode]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!subject.trim()) nextErrors.subject = "กรุณาระบุหัวข้อ";
    if (!problemDescription.trim()) nextErrors.problemDescription = "กรุณาระบุรายละเอียดปัญหา";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    if (!prefill?.device_id) {
      setErrors((prev) => ({ ...prev, subject: prev.subject ?? "กรุณาเลือกอุปกรณ์จากรายการก่อน" }));
      return;
    }

    setSubmitting(true);
    try {
      await repairService.createRepairRequest({
        sourceIssueId: prefill.issue_id > 0 ? prefill.issue_id : null,
        deviceId: prefill.device_id,
        subDeviceIds: selectedSubDeviceIds,
        subject,
        problemDescription,
        quantity: Math.max(selectedSubDeviceIds.length, 1),
        category,
        requesterName: requesterName?.trim() || prefill.requester_name || "ไม่ระบุชื่อ",
        requesterEmpCode: requesterEmpCode || prefill.requester_emp_code || null,
        receiveLocation: receiveLocation || null,
        images,
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1475px] rounded-2xl border border-[#D8D8D8] bg-white p-[50px]">
      <form className="flex flex-col gap-[20px]" onSubmit={handleSubmit}>
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-[7px]">
            <h3 className="text-[18px] font-medium">1. ระบุข้อมูลอุปกรณ์</h3>
            <p className="text-[16px] font-medium text-[#40A9FF]">รายละเอียดข้อมูลอุปกรณ์</p>
          </div>

          <div className="flex flex-col gap-[13px]">
            <label className="text-[18px] font-medium">ชื่ออุปกรณ์แม่</label>
            <select
              className="h-[46px] w-full rounded-[16px] border border-[#D9D9D9] px-[15px]"
              value={selectedMainDeviceId}
              onChange={(e) => {
                const raw = e.target.value;
                const parsed = raw === "" ? "" : Number(raw);
                if (raw === "" || !Number.isNaN(parsed)) {
                  onMainDeviceChange?.(parsed as number | "");
                }
              }}
            >
              <option value="">-- เลือกอุปกรณ์แม่ --</option>
              {mainDevices.map((device) => (
                <option key={device.de_id} value={device.de_id}>
                  {device.de_name} ({device.de_serial_number})
                </option>
              ))}
            </select>
          </div>

          {mode === "other" && (
            <div className="flex flex-col gap-2">
              <label className="text-[16px] font-medium">เลือกรายการอ้างอิงข้อมูลเดิม</label>
              <select
                className="h-[46px] rounded-[16px] border border-[#D9D9D9] px-4"
                value={selectedIssueId}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value)) {
                    setSelectedIssueId(value);
                    onSelectIssue(value);
                  }
                }}
              >
                <option value="">-- เลือกรายการ --</option>
                {issueOptions.map((opt) => (
                  <option key={opt.issueId} value={opt.issueId}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-[13px]">
            <label className="text-[18px] font-medium">ระบุรหัสอุปกรณ์ย่อย</label>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {subDevices.length === 0 ? (
                <div className="rounded-[8px] border border-[#D8D8D8] p-4 text-sm text-gray-500 lg:col-span-2">
                  เลือกอุปกรณ์แม่ก่อนเพื่อแสดงอุปกรณ์ย่อย
                </div>
              ) : (
                subDevices.map((sub) => (
                  <label
                    key={sub.dec_id}
                    className="flex h-[55px] items-center gap-[10px] rounded-[8px] border border-[#D8D8D8] px-5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubDeviceIds.includes(sub.dec_id)}
                      onChange={() => onToggleSubDevice?.(sub.dec_id)}
                    />
                    <span className="flex flex-col">
                      <span className="text-[16px]">{sub.dec_asset_code}</span>
                      <span className="text-[14px] text-[#CDCDCD]">{sub.dec_serial_number ?? "ไม่มี serial"}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <div className="inline-flex rounded-[10px] bg-[rgba(0,170,26,0.1)] px-5 py-2 text-[#00AA1A]">
              เลือกแล้ว {selectedSubDeviceIds.length} รายการ
            </div>
          </div>

        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-[7px]">
            <h3 className="text-[18px] font-medium">2. ระบุปัญหาที่พบเจอ</h3>
            <p className="text-[16px] font-medium text-[#40A9FF]">รายละเอียดข้อมูลปัญหา</p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[837px_472px]">
            <div className="flex flex-col gap-[13px]">
              <Input
                label="หัวข้อ"
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                error={errors.subject}
                required
              />
              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-medium">รายละเอียดปัญหา *</label>
                <textarea
                  className={`min-h-[164px] rounded-[16px] border px-4 py-3 focus:outline-none ${
                    errors.problemDescription ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                />
                {errors.problemDescription && (
                  <span className="text-sm text-red-500">{errors.problemDescription}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[13px]">
              <label className="text-[18px] font-medium">รูปภาพ</label>
              <label className="flex h-[254px] cursor-pointer items-center justify-center rounded-[16px] border border-[#D9D9D9] text-center text-[#40A9FF]">
                อัปโหลดไฟล์ หรือวางไฟล์ที่นี่ (PNG, JPG)
                <input
                  type="file"
                  accept="image/png,image/jpg,image/jpeg"
                  multiple
                  className="hidden"
                  onChange={(e) => setImages(Array.from(e.target.files ?? []))}
                />
              </label>
            </div>
          </div>
        </section>

        {images.length > 0 && (
          <ul className="text-sm text-gray-600">
            {images.map((file) => (
              <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
            ))}
          </ul>
        )}

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-[7px]">
            <h3 className="text-[18px] font-medium">3. ระบุสถานที่รับอุปกรณ์</h3>
            <p className="text-[16px] font-medium text-[#40A9FF]">รายละเอียดข้อมูลสถานที่รับอุปกรณ์</p>
          </div>

          <div className="flex flex-col gap-[13px]">
            <label className="text-[18px] font-medium">สถานที่รับ</label>
            <textarea
              className="h-[115px] w-full rounded-[16px] border border-[#D9D9D9] px-[15px] py-[10px]"
              value={receiveLocation}
              onChange={(e) => setReceiveLocation(e.target.value)}
            />
          </div>
        </section>

        <div className="mt-2 flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button variant="danger" type="submit" disabled={loadingPrefill || submitting}>
            {submitting ? "กำลังส่ง..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

