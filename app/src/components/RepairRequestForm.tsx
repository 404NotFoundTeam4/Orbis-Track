import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "./Button";
import DropDown from "./DropDown";
import {
  repairService,
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

type DeviceDropdownItem = {
  id: number;
  label: string;
  value: number;
  searchText: string;
};

type RepairRequestFormProps = {
  mode: "fromIssue" | "other";
  prefill: RepairPrefill | null;
  loadingPrefill?: boolean;
  isDeviceLocked?: boolean;
  lockedDeviceId?: number | null;
  allowedMainDeviceIds?: number[];
  defaultRequesterName?: string;
  defaultRequesterEmpCode?: string | null;
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
  Record<"subject" | "problemDescription" | "subDeviceIds", string>
>;

const sectionTitleClass = "text-[18px] font-medium text-[#1F1F1F]";
const sectionHelperClass = "text-[14px] font-medium text-[#40A9FF]";
const fieldLabelClass = "text-[16px] font-medium text-[#1F1F1F]";
const baseInputClass =
  "h-[46px] w-full rounded-[16px] border border-[#D9D9D9] px-[15px] text-[16px] text-[#1F1F1F]";

export default function RepairRequestForm({
  mode,
  prefill,
  loadingPrefill = false,
  isDeviceLocked = false,
  lockedDeviceId = null,
  allowedMainDeviceIds = [],
  defaultRequesterName,
  defaultRequesterEmpCode,
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
  const [category, setCategory] = useState("");
  const [requesterName, setRequesterName] = useState(defaultRequesterName ?? "");
  const [requesterEmpCode, setRequesterEmpCode] = useState(defaultRequesterEmpCode ?? "");
  const [subject, setSubject] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [receiveLocation, setReceiveLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedSubDeviceText = useMemo(() => {
    const selected = subDevices
      .filter((sub) => selectedSubDeviceIds.includes(sub.dec_id))
      .map((sub) => sub.dec_asset_code)
      .slice(0, 3);

    if (selected.length === 0) {
      return "เลือกแล้ว 0 รายการ";
    }

    return `เลือกแล้ว ${selectedSubDeviceIds.length} รายการ (${selected.join(" , ")}${
      selectedSubDeviceIds.length > 3 ? " ..." : ""
    })`;
  }, [selectedSubDeviceIds, subDevices]);

  const deviceOptions = useMemo<DeviceDropdownItem[]>(() => {
    return mainDevices.map((device) => ({
      id: device.de_id,
      value: device.de_id,
      label: device.de_name,
      searchText: `${device.de_name} ${device.de_serial_number || ""} ${device.de_id}`.toLowerCase(),
    }));
  }, [mainDevices]);

  const selectedDeviceOption = useMemo(() => {
    if (typeof selectedMainDeviceId !== "number") return null;
    return deviceOptions.find((item) => item.value === selectedMainDeviceId) ?? null;
  }, [deviceOptions, selectedMainDeviceId]);

  const autoFillFormData = (selectedData: RepairPrefill) => {
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
      setCategory("");
    }
  }, [mode, prefill, defaultRequesterName, defaultRequesterEmpCode]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!subject.trim()) nextErrors.subject = "กรุณาระบุหัวข้อ";
    if (!problemDescription.trim()) nextErrors.problemDescription = "กรุณาระบุรายละเอียดปัญหา";
    if (subDevices.length > 0 && selectedSubDeviceIds.length === 0) {
      nextErrors.subDeviceIds = "กรุณาเลือกอุปกรณ์ย่อยอย่างน้อย 1 รายการ";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const resolvedDeviceId =
      isDeviceLocked && lockedDeviceId
        ? lockedDeviceId
        : prefill?.device_id ??
          (typeof selectedMainDeviceId === "number" ? selectedMainDeviceId : null);

    if (!resolvedDeviceId) {
      setErrors((prev) => ({ ...prev, subject: prev.subject ?? "กรุณาเลือกอุปกรณ์จากรายการก่อน" }));
      return;
    }

    if (!isDeviceLocked && allowedMainDeviceIds.length > 0 && !allowedMainDeviceIds.includes(resolvedDeviceId)) {
      setErrors((prev) => ({
        ...prev,
        subject: prev.subject ?? "อุปกรณ์นี้ไม่พร้อมให้ยืมและไม่สามารถแจ้งซ่อมจากเมนูนี้ได้",
      }));
      return;
    }

    const sourceIssueId = prefill?.issue_id && prefill.issue_id > 0 ? prefill.issue_id : null;
    const resolvedRequesterName = requesterName?.trim() || prefill?.requester_name || "ไม่ระบุชื่อ";
    const resolvedRequesterEmpCode = requesterEmpCode || prefill?.requester_emp_code || null;

    setSubmitting(true);
    try {
      await repairService.createRepairRequest({
        sourceIssueId,
        deviceId: resolvedDeviceId,
        subDeviceIds: selectedSubDeviceIds,
        subject,
        problemDescription,
        quantity: Math.max(selectedSubDeviceIds.length, 1),
        category,
        requesterName: resolvedRequesterName,
        requesterEmpCode: resolvedRequesterEmpCode,
        receiveLocation: receiveLocation || null,
        images,
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[#D8D8D8] bg-white px-8 py-9 lg:px-10 lg:py-10">
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-[7px]">
            <h3 className={sectionTitleClass}>1. ระบุข้อมูลอุปกรณ์</h3>
            <p className={sectionHelperClass}>รายละเอียดข้อมูลอุปกรณ์</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className={fieldLabelClass}>ชื่ออุปกรณ์</label>
            {isDeviceLocked ? (
              <input
                className={`${baseInputClass} bg-[#F5F5F5] text-[#666666]`}
                value={
                  prefill?.device_name
                    ? `${prefill.device_name} (${prefill.device_code || "-"})`
                    : "-"
                }
                readOnly
                disabled
              />
            ) : (
              <DropDown
                items={deviceOptions}
                value={selectedDeviceOption}
                onChange={(item) => onMainDeviceChange?.(item.value)}
                placeholder="เลือกอุปกรณ์แม่"
                searchPlaceholder="ค้นหาชื่ออุปกรณ์"
                searchable
                className="w-full"
                triggerClassName="!border-[#D9D9D9]"
                emptyMessage="ไม่พบอุปกรณ์"
                filterFunction={(item, searchTerm) => {
                  const keyword = searchTerm.trim().toLowerCase();
                  if (!keyword) return true;

                  return (
                    item.searchText.includes(keyword) ||
                    item.label.toLowerCase().includes(keyword) ||
                    String(item.value).includes(keyword)
                  );
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className={fieldLabelClass}>ระบุรหัสอุปกรณ์</label>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {subDevices.map((sub) => (
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
                    <span className="text-[16px] text-[#1F1F1F]">{sub.dec_asset_code}</span>
                    <span className="text-[14px] text-[#8C8C8C]">{sub.dec_serial_number ?? "-"}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="inline-flex rounded-[10px] bg-[rgba(0,170,26,0.1)] px-5 py-2 text-[14px] font-medium text-[#00AA1A]">
              {selectedSubDeviceText}
            </div>
            {errors.subDeviceIds && <span className="text-sm text-red-500">{errors.subDeviceIds}</span>}
          </div>

        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-[7px]">
            <h3 className={sectionTitleClass}>2. ระบุปัญหาที่พบเจอ</h3>
            <p className={sectionHelperClass}>รายละเอียดข้อมูลปัญหา</p>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <label className={fieldLabelClass}>หัวข้อ</label>
                <input
                  className={`${baseInputClass} ${
                    errors.subject ? "border-red-500" : "border-[#D9D9D9]"
                  }`}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && <span className="text-sm text-red-500">{errors.subject}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className={fieldLabelClass}>รายละเอียดปัญหา</label>
                <textarea
                  className={`min-h-[180px] w-full rounded-[16px] border px-[15px] py-[10px] text-[16px] text-[#1F1F1F] focus:outline-none ${
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

            <div className="flex flex-col gap-3">
              <label className={fieldLabelClass}>รูปภาพ</label>
              <label className="flex min-h-[254px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-[16px] border border-[#D9D9D9] px-6 text-center text-[#40A9FF]">
                <svg
                  width="48"
                  height="40"
                  viewBox="0 0 48 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#A2A2A2]"
                >
                  <path
                    d="M40 36H8C5.79086 36 4 34.2091 4 32V8C4 5.79086 5.79086 4 8 4H20L24 10H40C42.2091 10 44 11.7909 44 14V32C44 34.2091 42.2091 36 40 36Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[14px] font-medium leading-[22px] text-[#40A9FF]">
                  อัปโหลดไฟล์ หรือวางไฟล์ที่นี่
                  <br />
                  <span className="text-[#8C8C8C]">ประเภทไฟล์ PNG, JPG</span>
                </span>
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

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-[7px]">
            <h3 className={sectionTitleClass}>3. ระบุสถานที่รับอุปกรณ์</h3>
            <p className={sectionHelperClass}>รายละเอียดข้อมูลสถานที่รับอุปกรณ์</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className={fieldLabelClass}>สถานที่รับ</label>
            <textarea
              className="h-[115px] w-full rounded-[16px] border border-[#D9D9D9] px-[15px] py-[10px] text-[16px] text-[#1F1F1F]"
              value={receiveLocation}
              onChange={(e) => setReceiveLocation(e.target.value)}
            />
          </div>
        </section>

        <div className="mt-2 flex justify-end gap-[10px] border-t border-[#F0F0F0] pt-6">
          <Button variant="secondary" type="button" onClick={onCancel} className="rounded-[16px]">
            ยกเลิก
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={loadingPrefill || submitting}
            className="rounded-[16px]"
          >
            {submitting ? "กำลังส่ง..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

