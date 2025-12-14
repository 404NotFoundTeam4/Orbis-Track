/**
 * Description: Modal Component สำหรับจัดการแผนก (Department) และฝ่ายย่อย (Section)
 * Note      : รองรับ 4 modes - เพิ่ม/แก้ไขแผนก, เพิ่ม/แก้ไขฝ่ายย่อย พร้อม AlertDialog สำหรับยืนยัน
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
import React, { useState, useEffect } from "react";
import Button from "./Button";
import Input from "./Input";
import DropDown from "./DropDown";
import { AlertDialog } from "./AlertDialog";

type ModalType =
  | "add-department"
  | "edit-department"
  | "add-section"
  | "edit-section"
  | "delete-section"
  | "delete-department";

// interface Department {
//   id: number;
//   name: string;
// }
interface Department {
  id: number;
  name: string;
  sections: { id: number; name: string }[];
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

  // ไอคอนกากบาทวงกลมจาก Radix Icons (ใช้แทนไอคอนปิด)
  const CrossCircledIcon = (props: any) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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

  const normalizeName = (str: string) =>
    str.trim().replace(/\s+/g, "").toLowerCase();
  const normalizeSectionName = (str: string) => {
    return str
      .replace(/^แผนก\s*[^\s]+\s*ฝ่ายย่อย/i, "") // ตัด "แผนก XXX ฝ่ายย่อย"
      .replace(/^ฝ่ายย่อย/i, "") // ตัด "ฝ่ายย่อย" (กรณีแก้ไข)
      .trim()
      .toLowerCase();
  };
  // ตรวจชื่อซ้ำทั้งหมด
  const isDuplicate = () => {
    const trimmedDept = department.trim();
    const trimmedSection = section.trim();

    // ● ตรวจแผนกซ้ำ
    if (type === "add-department" || type === "edit-department") {
      const inputName = normalizeName(trimmedDept);

      return departments.some((d) => {
        if (isEdit && d.id === initialData?.id) return false; // เคสแก้ไข → ถ้าชื่อเดิมให้ผ่าน
        return normalizeName(d.name) === inputName; // ตรวจซ้ำแบบ normalize
      });
    }

    // ● ตรวจฝ่ายย่อยซ้ำเฉพาะแผนกเดียวกัน
    if (type === "add-section") {
      const dept = departments.find((d) => d.id === selectedDepartment?.value);
      if (!dept) return false;

      const input = normalizeSectionName(trimmedSection);

      return dept.sections.some((s) => normalizeSectionName(s.name) === input);
    }

    if (type === "edit-section") {
      const dept = departments.find((d) => d.id === initialData?.departmentId);
      if (!dept) return false;

      const input = normalizeSectionName(trimmedSection);

      return dept.sections.some((s) => {
        if (s.id === initialData?.sectionId) return false;
        return normalizeSectionName(s.name) === input;
      });
    }

    return false;
  };

  // Reset form เมื่อเปิด modal
  useEffect(() => {
    // if (isOpen) {
    //   setDepartment(initialData?.department || "");
    //   setSection(initialData?.section || "");
    //   setSectionId(initialData?.sectionId || 0);
    //   setDeptError("");

    //   if (initialData?.departmentId && type === "add-section") {
    //     const foundDept = departmentItems.find(
    //       (item) => item.id === initialData.departmentId
    //     );
    //     setSelectedDepartment(foundDept || null);
    //   } else {
    //     setSelectedDepartment(null);
    //   }
    // }

    if (!isOpen) return;

    //ล้าง error ทุกโหมด
    setDeptError("");

    if (type === "add-department") {
      //เพิ่มแผนก → ช่องต้องว่าง
      setDepartment("");
      setSection("");
      setSelectedDepartment(null);
    } else if (type === "edit-department") {
      //แก้ไขแผนก → ใส่ข้อมูลเดิม
      setDepartment(initialData?.department || "");
      setSection("");
      setSelectedDepartment(null);
    } else if (type === "add-section") {
      //เพิ่มฝ่ายย่อย → ช่องว่างทั้งหมด
      setSection("");
      setSelectedDepartment(null);
      setDepartment("");
    } else if (type === "edit-section") {
      //แก้ไขฝ่ายย่อย → ใช้ข้อมูลเดิม
      setSection(initialData?.section || "");
      setSelectedDepartment(null);
      setDepartment(initialData?.department || "");
    }

    setSectionId(initialData?.sectionId || 0);
  }, [isOpen, type]);

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

  const [deptError, setDeptError] = useState("");

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDept = department.trim();
    const trimmedSection = section.trim();

    // ตัวอักษรไทย/อังกฤษ ห้ามเว้นวรรค ห้ามเลข ห้ามพิเศษ
    // const onlyLetters = /^[A-Za-zก-ฮ]+$/;
    const onlyLetters = /^[\u0E00-\u0E7FA-Za-z\s]+$/;

    //Validate แผนก
    if (type === "add-department" || type === "edit-department") {
      if (trimmedDept === "") {
        setDeptError("กรุณากรอกประเภทแผนก");
        return false;
      }

      if (!onlyLetters.test(trimmedDept)) {
        setDeptError("กรุณากรอกเฉพาะตัวอักษรเท่านั้น");
        return false;
      }

      if (isDuplicate()) {
        setDeptError("ชื่อแผนกนี้มีอยู่แล้ว");
        return false;
      }
    }

    //Validate เพิ่มฝ่ายย่อย
    if (type === "add-section") {
      if (!selectedDepartment) {
        setDeptError("กรุณาเลือกแผนก");
        return false;
      }

      if (trimmedSection === "") {
        setDeptError("กรุณากรอกประเภทฝ่ายย่อย");
        return false;
      }

      if (!onlyLetters.test(trimmedSection)) {
        setDeptError("กรุณากรอกเฉพาะตัวอักษรเท่านั้น");
        return false;
      }

      if (isDuplicate()) {
        setDeptError("ชื่อฝ่ายย่อยนี้มีอยู่แล้วในแผนกนี้");
        return false;
      }
    }

    //Validate แก้ไขฝ่ายย่อย
    if (type === "edit-section") {
      const pureValue = trimmedSection
        .replace(/^ฝ่ายย่อย/i, "")
        .replace(/\s+/g, "") //ตัดช่องว่างทั้งหมด
        .trim();

      if (pureValue === "") {
        setDeptError("กรุณากรอกชื่อฝ่ายย่อย");
        return false;
      }

      if (!onlyLetters.test(pureValue)) {
        setDeptError("กรุณากรอกเฉพาะตัวอักษรเท่านั้น");
        return false;
      }

      if (isDuplicate()) {
        setDeptError("ชื่อฝ่ายย่อยนี้มีอยู่แล้วในแผนกนี้");
        return false;
      }
    }
    setDeptError("");

    if (deptError) return;
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
        className={`bg-white rounded-[42px] p-8 pb-0 w-[90%] max-w-[804px] border border-solid border-[#858585]
          ${type.includes("section") ? "h-[470px]" : "h-[371px]"} relative shadow-2xl transform transition-all duration-300 ease-out flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-7 right-7 color-[#000000] transition"
        >
          <CrossCircledIcon className="w-[35px] h-[35px]" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[32px] mt-3 text-center text-[#000000]">
          {getTitle()}
        </h2>

        <div className="flex-1 flex items-center justify-center">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full gap-[47px]"
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
                  onChange={(e: any) => {
                    setDepartment(e?.target?.value ?? e);
                    setDeptError("");
                  }}
                  autoFocus
                  required
                  error={deptError}
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
                  onChange={(e) => {
                    setSection(e.target.value);
                    setDeptError("");
                  }}
                  autoFocus={type === "edit-section"}
                  required
                  error={deptError}
                />
              </div>
            )}
            {/* Submit Button */}
            <div className="flex justify-center items-center">
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
        // (optionally) ใส่สัดส่วนตามสเปค
        onConfirm={doSubmit}
      />
    </div>
  );
};
