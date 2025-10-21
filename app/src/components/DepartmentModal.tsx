/**
 * Description: Modal Component สำหรับจัดการแผนก (Department) และฝ่ายย่อย (Section)
 * Note      : รองรับ 4 modes - เพิ่ม/แก้ไขแผนก, เพิ่ม/แก้ไขฝ่ายย่อย พร้อม AlertDialog สำหรับยืนยัน
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import React, { useState, useEffect } from "react";
import Button from "./Button";
import { Icon } from "@iconify/react";
import Input from "./Input";
import DropDown from "./DropDown";
import { AlertDialog } from "./AlertDialog";

type ModalType =
  | "add-department"
  | "edit-department"
  | "add-section"
  | "edit-section";

interface Department {
  id: number;
  name: string;
}

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  departments?: Department[];
  initialData?: {
    id?: number;
    department?: string;
    departmentId?: number;
    section?: string;
    sectionId?: number;
  };
  onSubmit: (data: any) => void | Promise<void>;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  type,
  departments = [],
  initialData,
  onSubmit,
}) => {
  const [department, setDepartment] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [section, setSection] = useState("");
  const [sectionId, setSectionId] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const departmentItems = departments.map((dept) => ({
    id: dept.id,
    label: dept.name,
    value: dept.id,
  }));

  const isEdit = type.startsWith("edit");
  const isSection = type.includes("section");

  const titleText = isEdit
    ? isSection
      ? "ยืนยันการแก้ไขฝ่ายย่อย?"
      : "ยืนยันการแก้ไขแผนก?"
    : isSection
      ? "ยืนยันการเพิ่มฝ่ายย่อย?"
      : "ยืนยันการเพิ่มแผนก?";

  const descText = isSection
    ? isEdit
      ? ""
      : `แผนก: ${type === "add-section" ? (selectedDepartment?.label ?? "-") : (initialData?.department ?? "-")} • ฝ่ายย่อย: ${section || "-"}`
    : isEdit
      ? ""
      : `แผนก: ${department || initialData?.department || "-"}`;

  const iconName = isEdit ? "ci:warning" : "mdi:clipboard-check-outline";
  const dialogTone: "success" | "warning" | "danger" = isEdit
    ? "warning"
    : "success";

  // Reset form เมื่อเปิด modal
  useEffect(() => {
    if (isOpen) {
      setDepartment(initialData?.department || "");
      setSection(initialData?.section || "");
      setSectionId(initialData?.sectionId || 0);

      if (initialData?.departmentId && type === "add-section") {
        const foundDept = departmentItems.find(
          (item) => item.id === initialData.departmentId,
        );
        setSelectedDepartment(foundDept || null);
      } else {
        setSelectedDepartment(null);
      }
    }
  }, [isOpen, initialData, type]);

  // Title ของแต่ละ modal
  const getTitle = () => {
    switch (type) {
      case "add-department":
        return "เพิ่มแผนก";
      case "edit-department":
        return "แก้ไขแผนก";
      case "add-section":
        return "เพิ่มฝ่ายย่อย";
      case "edit-section":
        return "แก้ไขฝ่ายย่อย";
    }
  };

  // Validate form
  const isValid = () => {
    if (type === "add-department" || type === "edit-department") {
      return department.trim() !== "";
    }
    if (type === "add-section") {
      return selectedDepartment !== null && section.trim() !== "";
    }
    if (type === "edit-section") {
      return section.trim() !== "";
    }
    return false;
  };

  const buildPayload = () =>
    type.includes("section")
      ? {
          id: sectionId || initialData?.sectionId,
          departmentId:
            type === "add-section"
              ? selectedDepartment?.value
              : initialData?.departmentId,
          section,
        }
      : {
          id: initialData?.id,
          department,
        };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    setPendingPayload(buildPayload());
    setConfirmOpen(true);
  };

  // ปิด modal และ reset form
  const handleClose = () => {
    setDepartment("");
    setSelectedDepartment(null);
    setSection("");
    onClose();
  };

  const doSubmit = async () => {
    if (!pendingPayload) return;
    setLoading(true);
    try {
      await onSubmit(pendingPayload);
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingPayload(null);
    }
  };

  // ถ้าไม่เปิดก็ไม่แสดงอะไร
  if (!isOpen) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal Content */}
      <div
        className={`bg-white rounded-[42px] p-8 pb-0 w-[90%] max-w-[804px] 
          ${type.includes("section") ? "h-[470px]" : "h-[371px]"} relative shadow-2xl transform transition-all duration-300 ease-out flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-7 right-7 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#000000] hover:text-gray-900 text-2xl"
        >
          <Icon icon="radix-icons:cross-circled" width="35" height="35" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[32px] mt-3 text-center text-[#000000]">
          {getTitle()}
        </h2>

        <div className="flex-1 flex items-center justify-center">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 flex flex-col items-center w-full gap-[47px]"
          >
            {/* Field: แผนก (input) - สำหรับ add/edit department */}
            {(type === "add-department" || type === "edit-department") && (
              <div>
                {/*<label className="block text-[16px] font-medium text-[#000000] mb-2">
                  แผนก
                </label>*/}
                <Input
                  label="แผนก"
                  placeholder="ประเภทแผนก"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            )}
            {/* Field: แผนก (dropdown) - สำหรับ add section */}
            {type === "add-section" && (
              <div>
                <DropDown
                  label="แผนก"
                  items={departmentItems}
                  value={selectedDepartment}
                  onChange={(item) => setSelectedDepartment(item)}
                  placeholder="ประเภทแผนก"
                  searchPlaceholder="ค้นหาแผนก"
                  searchable={true}
                  className="w-[333px]"
                  triggerClassName="h-[46px] pl-[15px] pr-[8px] py-3
                                   border-[#A2A2A2] text-[#000] rounded-[16px]
                                   h-[46px] pl-[15px] pr-[8px] py-3
                                       border-[#A2A2A2] text-[#000] rounded-[16px]
                                       text-[16px] [&>span]:text-[16px]"
                />
              </div>
            )}
            {/* Field: แผนก (disabled) - สำหรับ edit section */}
            {type === "edit-section" && (
              <div>
                <Input
                  label="แผนก"
                  value={initialData?.department || ""}
                  disabled
                />
              </div>
            )}
            {/* Field: ฝ่ายย่อย - สำหรับ add/edit section */}
            {type.includes("section") && (
              <div>
                <Input
                  label="ฝ่ายย่อย"
                  placeholder="ประเภทฝ่ายย่อย"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  autoFocus={type === "edit-section"}
                  required
                />
              </div>
            )}
            {/* Submit Button */}
            <div className="flex justify-center items-center mt-9">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isValid()}
                className="rounded-full"
                style={{ width: 128, height: 46, fontSize: 18 }}
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && setConfirmOpen(false)}
        tone={dialogTone}
        title={titleText}
        description={descText}
        icon={<Icon icon={iconName} className="h-20 w-20" />}
        // (optionally) ใส่สัดส่วนตามสเปค
        onConfirm={doSubmit}
      />
    </div>
  );
};
