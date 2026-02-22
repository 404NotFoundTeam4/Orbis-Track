import { useEffect, useState, useRef } from "react";
import DropDown from "./DropDown";
import Input from "./Input";
import Button from "./Button";
import { Icon } from "@iconify/react";
import Checkbox from "./Checkbox";
import QuantityInput from "./QuantityInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useInventorys } from "../hooks/useInventory";
import { AlertDialog } from "../components/AlertDialog";
import type {
  Department as DepartmentData,
  Section as SectionData,
  Category as CategoryData,
  ApprovalFlowOnly,
  ApprovalFlowWithSteps,
  ApprovalFlowStepPayload,
} from "../services/InventoryService";
import { useNavigate } from "react-router-dom";
import getImageUrl from "../services/GetImage";

// Staff User interface
interface StaffUser {
  us_id: number;
  us_name: string;
}

// Staff interface
interface StaffData {
  st_sec_id: number;
  st_name: string;
  st_dept_id: number;
  users: StaffUser[];
}

// Section with users
interface SectionWithUsers {
  sec_id: number;
  sec_name: string;
  sec_dept_id: number;
  users: StaffUser[];
}

// Department with users
interface DepartmentWithUsers {
  dept_id: number;
  dept_name: string;
  users: StaffUser[];
}
// โครงสร้างข้อมูลของแผนก
interface Department {
  id: number;
  label: string;
  value: number;
}

// โครงสร้างข้อมูลของหมวดหมู่
interface Category {
  id: number;
  label: string;
  value: number;
}

export interface CategoryDropdownItem {
  id: number;
  label: string;
  value: string;
}

// โครงสร้างข้อมูลของแผนก (Section) สำหรับ Dropdown
interface Section {
  id: number;
  label: string;
  value: number;
}

interface ApproverItem {
  id: number;
  label: string;
  order: number;
}

interface Approver {
  id: number;
  label: string;
  value: number;
  approvers?: ApproverItem[];
}

export interface DropdownItem {
  id: number;
  label: string;
  value: number;
  type?: "STAFF" | "HOD" | "HOS";
}

interface MainDeviceModalProps {
  mode: "create" | "edit";
  defaultValues?: any; // สำหรับ edit
  onSubmit: (data: any) => void;
  existingDeviceNames?: string[]; // ชื่ออุปกรณ์ที่มีอยู่
  existingDeviceCodes?: string[]; // รหัสอุปกรณ์ที่มีอยู่
}

interface DvivceFrom {
  serialNumber: string;
  name: string;
  location: string;
  maxBorrowDays: number;
  totalQuantity: number;
  userId: number;
  afId: number;
  caId: number;
  secId: number;
  deptId: number;
}
const MainDeviceModal = ({
  mode,
  defaultValues,
  onSubmit,
  existingDeviceNames = [],
  existingDeviceCodes = []
}: MainDeviceModalProps) => {
  // สำหรับเปลี่ยนหน้า
  const navigate = useNavigate();

  /*========================== รายละเอียดอุปกรณ์ ========================== */
  const [deviceName, setDeviceName] = useState<string>("");
  const [deviceCode, setDeviceCode] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [maxBorrowDays, setMaxBorrowDays] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [categorys, setCategory] = useState<CategoryData[]>([]);
  const [sections, setSection] = useState<SectionData[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const data = localStorage.getItem("User") || sessionStorage.getItem("User");
  const userId = JSON.parse(data).us_id;
  /*========================== Serial Number ========================== */
  // อุปกรณ์มี Serial Number
  const [checked, setChecked] = useState<boolean>(true);
  const [serialNumbers, setSerialNumbers] = useState([{ id: 1, value: "" }]);
  /*========================== accessories ========================== */
  const [accessories, setAccessories] = useState([
    { id: 1, name: "", qty: "", value: "" },
  ]);
  /*========================== รายละเอียดการอนุมัติ ========================== */
  const [titleApprove, setTitleApprove] = useState("");
  const [openStepId, setOpenStepId] = useState<number | null>(null);

  /*========================== Create ========================== */
  const fetchDataDevices = async () => {
    try {
      const res = await useInventorys.getDevicesAll();
      setDepartments(res.data.departments);
      setCategory(res.data.categories);
      setSection(res.data.sections);

      const filteredApprovalFlows = res.data.approval_flows.filter(
        (af: any) => af.af_us_id === userId,
      );
      setApprovalFlows(filteredApprovalFlows);
      setapprovalFlowSteps(res.data.approval_flow_step);
    } catch (error) {
      console.error("โหลดข้อมูลไม่สำเร็จ", error);
    }
  };
  const fetchDataApprove = async () => {
    try {
      const ap = await useInventorys.getApproveAll();

      setDepartmentsApprove(ap.data.departments);
      setSectionsApprove(ap.data.sections);
      setStaff(ap.data.staff);
    } catch (error) {
      console.error("fetchDataApprove โหลดข้อมูลไม่สำเร็จ", error);
    }
  };

  useEffect(() => {
    fetchDataApprove();
    fetchDataDevices();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // เลือกเฉพาะไฟล์แรกที่อัปโหลด
    if (!file) return;

    setImageFile(file);

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  /*========================== Create ส่วนการอนุมัติ ========================== */

  // ลากไฟล์รูปภาพ
  const [isDragging, setIsDragging] = useState(false);
  // ลากมาเหนือ Drop Zone
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  // ออกจาก Drop Zone
  const handleLeave = () => {
    setIsDragging(false);
  };
  // ปล่อยไฟล์ลง Drop Zone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0]; // เลือกเฉพาะไฟล์แรกที่อัปโหลด
    if (!file) return;

    const url = URL.createObjectURL(file); // แปลงเป็น url
    setPreview(url);
  };
  /*========================== dropdown หน้าเพิ่ม ========================== */
  // แผนกท่ีเลือกใน dropdown
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  // หมวดหมู่ท่ีเลือกใน dropdown
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  // ฝ่ายย่อยท่ีเลือกใน dropdown
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  // ลำดับการอนุมัติ
  const [selectedApprovers, setSelectedApprovers] = useState<Approver | null>(
    null,
  );

  /*========================== func Serial Number เพิ่ม-ลบ-แก้ไข ========================== */
  // เพิ่ม Input Serial Number
  const addSerial = () => {
    setSerialNumbers([...serialNumbers, { id: Date.now(), value: "" }]);
  };

  // อัปเดตค่า Serial
  const updateSerial = (id: number, newValue: string) => {
    setSerialNumbers(
      serialNumbers.map((item) =>
        item.id === id ? { ...item, value: newValue } : item,
      ),
    );
  };

  // ลบ Input Serial
  const removeSerial = (id: number) => {
    setSerialNumbers(serialNumbers.filter((item) => item.id !== id));
  };

  /*========================== func อุปกรณืเสริม เพิ่ม-ลบ-แก้ไข ========================== */
  // เพิ่ม Input อุปกรณ์เสริม
  const addAccessory = () => {
    setAccessories([
      ...accessories,
      { id: accessories.length + 1, name: "", qty: "", value: "" },
    ]);
  };

  // อัปเดตอุปกรณ์เสริม
  const updateAccessory = (id: number, key: "name" | "qty", value: string) => {
    setAccessories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  // ลบ Input อุปกรณ์เสริม
  const removeAccessory = (id: number) => {
    setAccessories((prev) => prev.filter((item) => item.id !== id));
  };
  /**
   * ============================================================
   * Modal เพิ่มลำดับอนุมัติ 
   * ------------------------------------------------------------
   * ใช้จัดการ state และ logic ที่เกี่ยวข้องกับ modal
   * สำหรับเพิ่มลำดับการอนุมัติ
   *
   * Author: ปัญญพนต์ ผลเลิศ (66160086)
   * ============================================================
   */
  /*========================== Modal เพิ่มลำดับอนุมัติ ========================== */
  // modal สำหรับจัดการลำดับการอนุมัติ
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [approverGroupFlow, setApproverGroupFlow] = useState<any[]>([]);
  const [approvalflows, setApprovalFlows] = useState<ApprovalFlowOnly[]>([]);
  const [approvalFlowSteps, setapprovalFlowSteps] = useState<
    ApprovalFlowWithSteps[]
  >([]);
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [sectionsApprove, setSectionsApprove] = useState<SectionWithUsers[]>(
    [],
  );
  const [departmentsApprove, setDepartmentsApprove] = useState<
    DepartmentWithUsers[]
  >([]);

  // reset error approve ตอนปิด modal
  useEffect(() => {
    if (!isApproverModalOpen) {
      setTitleApprove("");
      setApproverGroupFlow([]);
      setApproveErrors({});
    }
  }, [isApproverModalOpen]);
  /*========================== func เพิ่ม-ลบ  เพิ่มลำดับอนุมัติ ========================== */

  /**
 * ============================================================
 * Func: เพิ่มกลุ่มผู้อนุมัติ 
 * ------------------------------------------------------------
 * เพิ่มกลุ่มผู้อนุมัติเข้าไปใน flow
 * - ป้องกันการเพิ่มซ้ำ (เช็คจาก label)
 * - ล้าง error เมื่อมีการเลือกผู้อนุมัติแล้ว
 *
 * Input:
 * - item: object (ข้อมูลกลุ่มผู้อนุมัติ)
 *
 * Output:
 * - approverGroupFlow (state) ถูกอัปเดต
 *
 * Author: ปัญญพนต์ ผลเลิศ (66160086)
 * ============================================================
 */
  const handleApproverGroup = (item: any) => {
    setApproverGroupFlow((prev: any) =>
      prev.some((v: any) => v.label === item.label) ? prev : [...prev, item],
    );
    // ล้าง error ผู้อนุมัติ ตอนเลือก
    setApproveErrors((prev) => ({ ...prev, approvers: undefined }));
  };
  /**
 * ============================================================
 * Func: ลบกลุ่มผู้อนุมัติ 
 * ------------------------------------------------------------
 * ลบกลุ่มผู้อนุมัติออกจาก flow ตาม label
 *
 * Input:
 * - value: string (label ของกลุ่มผู้อนุมัติ)
 *
 * Output:
 * - approverGroupFlow (state) ถูกอัปเดต
 *
 * Author: ปัญญพนต์ ผลเลิศ (66160086)
 * ============================================================
 */
  const handleDeleteApproverGroup = (value: string) => {
    setApproverGroupFlow((prev) => prev.filter((item) => item.label !== value));
  };

  /*========================== func เปิด-ปิด modal เพิ่มลำดับอนุมัติ ========================== */
  const openApproverModal = () => {
    setIsApproverModalOpen(true);
  };
  const closeApproverModal = () => setIsApproverModalOpen(false);

  /*========================== func เลือกลำดับการอนุมัติ ========================== */
  // เลือกลำดับการอนุมัติ
  const handleSelectApprover = (item: Approver) => {
    setSelectedApprovers(item);
  };

  /*========================== func สำหรับลากและย้ายตำแหน่งการอนุมัติ ========================== */
  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  /**
 * เริ่มลาก item
 *
 * Input:
 * - e: DragEvent
 * - index: number
 *
 * Output:
 * - เก็บ index ที่กำลังลาก
 * 
 * Author: ปัญญพนต์ ผลเลิศ (66160086)
 */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };
  /**
 * ลากผ่านตำแหน่ง step อื่น
 *
 * Input:
 * - e: DragEvent
 * - index: number
 *
 * Output:
 * - เก็บ index ที่จะวาง
 * 
 * Author: ปัญญพนต์ ผลเลิศ (66160086)
 */
  const handleDragOverStep = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
    e.dataTransfer.dropEffect = "move";
  };
  /**
 * วาง item และสลับตำแหน่ง
 *
 * Input:
 * - e: DragEvent
 *
 * Output:
 * - approverGroupFlow ถูกจัดเรียงใหม่
 * 
 * Author: ปัญญพนต์ ผลเลิศ (66160086)
 */
  const handleDropStep = (e: React.DragEvent) => {
    e.preventDefault();

    const from = dragItemIndex.current;
    const to = dragOverIndex.current;

    if (from == null || to == null || from === to) {
      dragItemIndex.current = dragOverIndex.current = null;
      return;
    }

    setApproverGroupFlow((prev) => {
      const newArr = [...prev];
      const [moved] = newArr.splice(from, 1);
      newArr.splice(to, 0, moved);
      return newArr;
    });

    dragItemIndex.current = dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    dragItemIndex.current = dragOverIndex.current = null;
  };

  /*========================== func แสดงข้อมูล User เกี่ยวกับกับการอนุมัติ ========================== */
  /**
 * ============================================================
 * Func: ดึงข้อมูลผู้ใช้งานตามกลุ่มการอนุมัติ
 * ------------------------------------------------------------
 * แยกประเภทกลุ่มผู้อนุมัติจาก label แล้วดึง user ที่เกี่ยวข้อง
 *
 * Input:
 * - item: { value: number; label: string }
 *
 * Output:
 * - users: User[]
 *
 * Author: ปัญญพนต์ ผลเลิศ
 * ============================================================
 */
  const getUsersByLabel = (item: { value: number; label: string }) => {
    // เจ้าหน้าที่คลัง ไป staff
    if (item.label.includes("เจ้าหน้าที่คลัง")) {
      return staff.find((st) => st.st_sec_id === item.value)?.users ?? [];
    }
    // หัวหน้า + !ฝ่ายย่อย ไป sections
    if (item.label.includes("แผนก") && !item.label.includes("ฝ่ายย่อย")) {
      return (
        departmentsApprove.find((dept) => dept.dept_id === item.value)?.users ??
        []
      );
    }
    // หัวหน้า + ฝ่ายย่อย ไป sections
    if (item.label.includes("ฝ่ายย่อย")) {
      return (
        sectionsApprove.find((sec) => sec.sec_id === item.value)?.users ?? []
      );
    }

    return [];
  };

  /*========================= Edit ========================= */
  // ชื่อเดิมของอุปกรณ์
  const originalNameRef = useRef<string>("");

  // ค่าเริ่มต้น edit
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      // กำหนดชื่อเดิมของอุปกรณ์
      originalNameRef.current = (defaultValues.de_name ?? "").trim();

      // รูปภาพ
      setPreview(defaultValues.de_images ? getImageUrl(defaultValues.de_images) : null);

      // Input text
      setDeviceName(defaultValues.de_name ?? "");
      setDeviceCode(defaultValues.de_serial_number ?? "");
      setLocation(defaultValues.de_location ?? "");
      setDescription(defaultValues.de_description ?? "");

      // จำนวน
      setMaxBorrowDays(defaultValues.de_max_borrow_days ?? 0);
      setTotalQuantity(defaultValues.total_quantity ?? 0);

      // Dropdown

      setSelectedCategory({
        id: defaultValues.category.ca_id,
        label: defaultValues.category.ca_name,
        value: defaultValues.category.ca_id,
      });
      setSelectedSection({
        id: defaultValues.section.sec_id,
        label: defaultValues.section.sec_name,
        value: defaultValues.section.sec_id,
      });
      setSelectedDepartment({
        id: defaultValues.section.department.dept_id,
        label: defaultValues.section.department.dept_name,
        value: defaultValues.section.department.dept_id,
      });

      // Serial Number
      if (defaultValues.de_serial_number) {
        setChecked(true);
        setSerialNumbers([
          {
            id: defaultValues.de_id,
            value: defaultValues.de_serial_number,
          },
        ]);
      } else {
        setChecked(false);
        setSerialNumbers([{ id: Date.now(), value: "" }]); // แสดงช่อง input
      }
      // อุปกรณ์เสริม
      if (defaultValues.accessories) {
        setAccessories(
          defaultValues.accessories.map((acc, index) => ({
            id: index,
            name: acc.acc_name,
            qty: String(acc.acc_quantity),
            value: acc.acc_id,
          })),
        );
      } else {
        setAccessories([{ id: Date.now(), name: "", qty: "", value: "" }]); // แสดงช่อง input
      }

      // ลำดับการอนุมัติ
      if (defaultValues.approval_flow.steps) {
        setSelectedApprovers({
          id: defaultValues.approval_flow.af_id,
          label: defaultValues.approval_flow.af_name,
          value: defaultValues.approval_flow.af_id,
          // แปลง array เป็น approvers ที่ UI ใช้ render เช่น HOS › HOD
        });
        //  const   approvers = defaultValues.approval_flow.steps.map((step: any,index:number) => ({
        //         id: step.afs_id, // id ของแต่ละขั้นตอน
        //         label: step.afs_role, // role ที่อนุมัติ
        //         value: index, // ลำดับการอนุมัติ
        //       }))
        //     console.log(approvers)
        //     setApproverGroupFlow(
        //      approvers)
      }
    }
  }, [mode, defaultValues]);

  const mappedAccessories = accessories
    .filter((a) => a.name && a.qty)
    .map((a) => ({
      ...(a.value !== undefined ? { acc_id: Number(a.value) } : {}),
      acc_name: a.name,
      acc_quantity: Number(a.qty),
    }));

  const mappedSerialNumbers = checked
    ? serialNumbers
        .filter((sn) => sn.value.trim() !== "")
        .map((sn) => ({
          id: sn.id,
          value: sn.value.trim(),
        }))
    : [];

  // ตัดคำว่าหัวหน้าออกจากข้อมูลใน Dropdown
  const cleanDropdown = (name: string) => name.replace(/^หัวหน้า\s*/g, "");

  /*========================== พื้นที่แปลงข้อมูลเข้า Dropdown ========================== */
  const departmentItems: DropdownItem[] = departments.map((dept: any) => ({
    id: dept.dept_id,
    label: cleanDropdown(dept.dept_name),
    value: dept.dept_id,
  }));

  const categoryItem: DropdownItem[] = categorys.map((ca: any) => ({
    id: ca.ca_id,
    label: ca.ca_name,
    value: ca.ca_id,
  }));

  const sectionItems: DropdownItem[] = sections.map((sec: any) => ({
    id: sec.sec_id,
    label: cleanDropdown(sec.sec_name),
    value: sec.sec_id,
  }));

  const approveItems: DropdownItem[] = approvalflows.map((af: any) => ({
    id: af.af_id,
    label: af.af_name,
    value: af.af_id,
  }));

  const staffItems: DropdownItem[] = staff
    .filter((st) => st.users && st.users.length > 0)
    .map((st) => ({
      id: st.st_sec_id,
      label: st.st_name,
      value: st.st_sec_id,
      type: "STAFF",
    }));

  const departmentApproveItems: DropdownItem[] = departmentsApprove
    .filter((department) => department.users.length > 0)
    .map((dep) => ({
      id: dep.dept_id,
      label: cleanDropdown(dep.dept_name),
      value: dep.dept_id,
      type: "HOD",
    }));

  const sectionApproveItems: DropdownItem[] = sectionsApprove
    .filter((section) => section.users.length > 0)
    .map((sec) => ({
      id: sec.sec_id,
      label: cleanDropdown(sec.sec_name),
      value: sec.sec_id,
      type: "HOS",
    }));

  /*========================== func ส่งข้อมูลอุปกรณ์ ========================== */
  const handleSubmit = () => {
    const formData = new FormData();

    //  เอาไว้ใช้ชั่วคราว
    formData.append("data", "devices");
    formData.append("de_serial_number", deviceCode);
    formData.append("de_name", deviceName);
    formData.append("de_description", description ?? "");
    formData.append("de_location", location);
    formData.append("de_max_borrow_days", String(maxBorrowDays));
    formData.append("totalQuantity", String(totalQuantity));
    formData.append("de_af_id", String(selectedApprovers?.value ?? ""));
    formData.append("de_ca_id", String(selectedCategory?.value ?? ""));
    formData.append("de_us_id", userId);
    formData.append("de_sec_id", String(selectedSection?.value ?? ""));

    formData.append("accessories", JSON.stringify(mappedAccessories));
    formData.append("serialNumbers", JSON.stringify(mappedSerialNumbers));

    if (imageFile) {
      formData.append("de_images", imageFile);
    }
    onSubmit(formData);
  };
  /*========================== func ส่งข้อมูลเพิ่มลำดับการอนุมัติ ========================== */
  const handleSumbitApprove = () => {
    const approver: ApprovalFlowStepPayload[] = approverGroupFlow.map(
      (ap: any, indexvalue) => {
        // เจ้าหน้าที่คลัง
        if (ap.type === "STAFF") {
          const sec = sections.find((item) => item.sec_id === ap.value);

          return {
            afs_step_approve: indexvalue + 1,
            afs_dept_id: sec?.sec_dept_id ?? null,
            afs_sec_id: sec?.sec_id ?? null,
            afs_role: "STAFF",
          };
        }

        // หัวหน้าแผนก
        if (ap.type === "HOD") {
          return {
            afs_step_approve: indexvalue + 1,
            afs_dept_id: ap.value,
            afs_sec_id: null,
            afs_role: "HOD",
          };
        }

        // หัวหน้าฝ่ายย่อย
        const sec = sections.find((item) => item.sec_id === ap.value);

        return {
          afs_step_approve: indexvalue + 1,
          afs_dept_id: sec?.sec_dept_id ?? null,
          afs_sec_id: sec?.sec_id ?? null,
          afs_role: "HOS",
        };
      },
    );
    const formData = new FormData();
    formData.append("data", "approve");
    formData.append("af_name", titleApprove);
    formData.append("af_us_id", userId);
    formData.append("approvalflowsstep", JSON.stringify(approver));
    onSubmit(formData);
    setTimeout(() => {
      setIsApproverModalOpen(false);
      fetchDataDevices();
      setApproverGroupFlow([]);
      setTitleApprove("");
    }, 800); // หน่วง 1.5 วินาที
  };

  /*========================== ยืนยันข้อมูล ========================== */
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openConfirmApprove, setOpenConfirmApprove] = useState(false);

  // ฟังก์ชันสำหรับเปิด modal ยืนยันการเพิ่ม / แก้ไข อุปกรณ์
  const handleOpenConfirm = () => {
    // ตรวจสอบข้อมูล
    if (!validate()) {
      return;
    }

    // เปิด modal
    setOpenConfirm(true);
  };

  // ฟังก์ชันสำหรับการเปิด modal ยืนยันการเพิ่มลำดับการอนุมัติ
  const handleOpenApproverModal = () => {
    // ตรวจสอบข้อมูล
    if (!validateApprove()) {
      return;
    }

    setOpenConfirmApprove(true);
  };

  // กรองฝ่ายย่อยตามแผนกที่เลือก
  const filteredSections = selectedDepartment
    ? sections.filter((sec) => sec.sec_dept_id === selectedDepartment.value)
    : [];
  /*========================== validate ========================== */
  const [errors, setErrors] = useState<
    Partial<Record<keyof DvivceFrom, string>>
  >({});

  // ฟังก์ชันสำหรับการตรวจสอบข้อมูลการเพิ่มอุปกรณ์
  const validate = () => {
    const newError: typeof errors = {};

    if (!deviceName.trim()) {
      newError.name = "กรุณาระบุชื่ออุปกรณ์";
    } else {
      const inputName = deviceName.trim().toLowerCase(); // ชื่อที่ input เข้ามา
      const originalName = (originalNameRef.current || "").trim().toLowerCase(); // ชื่อเดิม

      // อนุญาตชื่อเดิมของตัวเอง กรณีแก้ไข
      const duplicateList =
        mode === "edit"
          ? existingDeviceNames.filter(
              (name) => name.trim().toLowerCase() !== originalName,
            )
          : existingDeviceNames;

      // ค้นหาชื่อที่ซ้ำ
      const isDuplicateName = duplicateList.some(
        (name) => name.trim().toLowerCase() === inputName,
      );

      if (isDuplicateName) {
        newError.name = "ชื่ออุปกรณ์นี้มีอยู่แล้ว";
      }
    }

    // const regex = /^[A-Z]+\d+$/;
    const regex = /^[a-zA-Z0-9-]+$/;

    if (!regex.test(deviceCode)) {
      newError.serialNumber = "กรุณาระบุรหัสอุปกรณ์";
    } else {
      // รหัสอุปกรณ์ที่ input เข้ามา
      const inputCode = deviceCode.trim().toLowerCase();

      // ถ้าเป็น mode edit เอารหัสตัวเองออกก่อน
      const duplicateCode =
        mode === "edit"
          ? existingDeviceCodes.filter((code) => code.trim().toLowerCase() !== defaultValues?.de_serial_number?.toLowerCase())
          : existingDeviceCodes

        // ตรวจสอบในรายการว่ามีตรงกับที่ input เข้ามาไหม
        const duplicate = duplicateCode.some((code) => code.trim().toLowerCase() === inputCode);

        if (duplicate) {
          newError.serialNumber = "รหัสอุปกรณ์นี้มีอยู่แล้ว";
        }
      };

    if (!selectedDepartment) {
      newError.deptId = "กรุณาระบุแผนกอุปกรณ์";
    }

    if (!selectedCategory) {
      newError.caId = "กรุณาระบุหมวดหมู่";
    }

    if (!selectedSection) {
      newError.secId = "กรุณาระบุฝ่ายย่อย";
    }

    if (!location) {
      newError.location = "กรุณาระบุสถานที่เก็บอุปกรณ์";
    }
    if (!maxBorrowDays) {
      newError.maxBorrowDays = "กรุณาระบุจํานวนวันสูงสุดที่สามารถยืมได้";
    }
    // ตรวจสอบเวลาที่คืน
    if (!totalQuantity) {
      newError.totalQuantity = "กรุณาระบุจำนวนอุปกรณ์";
    }
    if (!selectedApprovers) {
      newError.afId = "กรุณาระบุลำดับการอนุมัติ";
    }

    // อัปเดต state เพื่อให้แสดงข้อความ error
    setErrors(newError);

    // คืนค่า true เมื่อไม่ error (ฟอร์มถูกต้อง)
    return Object.keys(newError).length === 0;
  };

  // เก็บ error ของเพิ่มลำดับการอนุมัติ
  const [approveErrors, setApproveErrors] = useState<{
    titleApprove?: string;
    approvers?: string;
  }>({});

  // ฟังก์ชันสำหรับตรวจสอบข้อมูลในการเพิ่มลำดับการอนุมัติ
  const validateApprove = () => {
    const newError: typeof approveErrors = {};
    // ค่าว่าง
    if (!titleApprove.trim()) {
      newError.titleApprove = "กรุณาระบุชื่อลำดับการอนุมัติ";
    }
    // ไม่เลือกผู้อนุมัติ
    if (approverGroupFlow.length === 0) {
      newError.approvers = "กรุณาเพิ่มผู้อนุมัติอย่างน้อย 1 รายการ";
    }
    // ตรวจสอบชื่อซ้ำ
    const isDuplicate = approvalflows.some(
      (approve) =>
        approve.af_name.trim().toLowerCase() ===
        titleApprove.trim().toLowerCase(),
    );
    // ชื่อซ้ำ
    if (isDuplicate) {
      newError.titleApprove = "ชื่อลำดับการอนุมัตินี้มีอยู่แล้ว";
    }

    setApproveErrors(newError);

    return Object.keys(newError).length === 0;
  };

  return (
    <div className="flex flex-col gap-[60px] bg-[#FFFFFF] border border-[#BFBFBF] w-[1660px] rounded-[16px] px-[60px] py-[60px]">
      {/* ข้อมูลอุปกรณ์ / แบบฟอร์ม */}
      <form className="flex justify-center gap-[110px] w-[1540px] min-h-[837px] px-[100px]">
        {/* ข้อมูลอุปกรณ์ */}
        <div className="flex flex-col gap-[7px] w-[212px] h-[69px]">
          <p className="text-[20px] font-medium">ข้อมูลอุปกรณ์</p>
          <p className="text-[16px] text-[#40A9FF] font-medium">
            รายละเอียดข้อมูลอุปกรณ์
          </p>
        </div>
        {/* กรอกรายละเอียดอุปกรณ์ */}
        <div className="flex flex-col gap-[20px] w-[853px]">
          <div className="flex gap-[20px]">
            {/* ชื่ออุปกรณ์ */}
            <div className="flex flex-col gap-[4px]">
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                label="ชื่ออุปกรณ์"
                placeholder="ชื่อของอุปกรณ์"
                size="md"
                className="!w-[552px]"
                required
                error={errors.name}
              />
            </div>
            {/* รหัสอุปกรณ์ */}
            <div className="flex flex-col gap-[4px]">
              <Input
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value)}
                label="รหัสอุปกรณ์"
                placeholder="รหัสของอุปกรณ์"
                size="md"
                className="!w-[261px]"
                required
                error={errors.serialNumber}
              />
            </div>
          </div>
          {/* แผนก / หมวดหมู่ / ฝ่ายย่อย */}
          <div className="flex gap-[20px]">
            <div>
              <DropDown
                value={selectedDepartment}
                className="!w-[264px]"
                label="แผนกอุปกรณ์"
                items={departmentItems}
                onChange={(item) => {
                  setSelectedDepartment(item);
                  setSelectedSection(null);
                }}
                placeholder="แผนก"
                required
                triggerClassName={
                  errors.deptId ? "!border-red-500" : "!border-[#D8D8D8]"
                }
              />
              {errors.deptId && (
                <p className="text-sm mt-1 text-[#F5222D]">{errors.deptId}</p>
              )}
            </div>
            <div>
              <DropDown
                value={selectedCategory}
                className="!w-[264px]"
                label="หมวดหมู่"
                items={categoryItem}
                onChange={(item) => setSelectedCategory(item)}
                placeholder="หมวดหมู่อุปกรณ์"
                required
                triggerClassName={
                  errors.caId ? "!border-red-500" : "!border-[#D8D8D8]"
                }
              />
              {errors.caId && (
                <p className="text-sm mt-1 text-[#F5222D]">{errors.caId}</p>
              )}
            </div>
            <div>
              <DropDown
                value={selectedSection}
                className="!w-[264px]"
                label="ฝ่ายย่อย"
                items={filteredSections.map((sec) => ({
                  id: sec.sec_id,
                  label: cleanDropdown(sec.sec_name),
                  value: sec.sec_id,
                }))}
                onChange={(item) => setSelectedSection(item)}
                placeholder="ฝ่ายย่อย"
                required
                triggerClassName={
                  errors.secId ? "!border-red-500" : "!border-[#D8D8D8]"
                }
              />
              {errors.secId && (
                <p className="text-sm mt-1 text-[#F5222D]">{errors.secId}</p>
              )}
            </div>
          </div>
          {/* รูปภาพ */}
          <div className="flex flex-col gap-[10px]">
            <p className="text-[16px] font-medium">รูปภาพ</p>
            {/* Upload / Preview */}
            <div
              className={`flex flex-col items-center justify-center border rounded-[16px] w-[833px] h-[225.32px]
              ${isDragging ? "border-[#40A9FF] bg-blue-50" : "border-[#D9D9D9]"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleLeave}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center justify-center w-full h-full text-center cursor-pointer">
                <input
                  className="hidden"
                  type="file"
                  onChange={handleImageUpload}
                />

                {preview ? (
                  <img
                    className="w-full h-full object-cover rounded-[16px] pointer-events-none"
                    src={preview}
                  />
                ) : (
                  <div className="flex flex-col gap-[20px] items-center text-center text-[#A2A2A2]">
                    <Icon icon="famicons:image-sharp" width="48" height="40" />
                    <div className="text-[14px] font-medium">
                      <p className="text-[#40A9FF]">
                        อัปโหลดไฟล์
                        <span className="text-[#A2A2A2]">
                          {" "}
                          หรือวางไฟล์ที่นี่
                        </span>
                      </p>
                      <p>ประเภทไฟล์ PNG, JPG</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
          {/* สถานที่เก็บอุปกรณ์ */}
          <div className="flex flex-col gap-[10px]">
            <label className="text-[16px] font-medium">
              สถานที่เก็บอุปกรณ์ <span className="text-[#F5222D]">*</span>
            </label>
            <textarea
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`border rounded-[16px] w-[833px] h-[140px] px-[15px] py-[8px] focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.location ? "border-red-500 focus:ring-red-500" : "border-[#D8D8D8] focus:ring-blue-500"}`}
              placeholder="สถานที่เก็บอุปกรณ์"
            ></textarea>
            {errors.location && (
              <p className="text-sm mt-1 text-[#F5222D]">{errors.location}</p>
            )}
          </div>
          {/* รายละเอียดอุปกรณ์ */}
          <div className="flex flex-col gap-[10px]">
            <label className="text-[16px] font-medium">รายละเอียดอุปกรณ์</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[#D8D8D8] rounded-[16px] w-[833px] h-[140px] px-[15px] py-[8px]"
              placeholder="รายละเอียดอุปกรณ์"
            ></textarea>
          </div>
          <div className="flex gap-[20px]">
            <div>
              <QuantityInput
                label="จำนวนวันสูงสุดที่สามารถยืมได้"
                value={maxBorrowDays}
                onChange={(value) => setMaxBorrowDays(value)}
                required
                error={errors.maxBorrowDays}
              />
            </div>

            {mode == "create" && (
              <div>
                <QuantityInput
                  label="จำนวนอุปกรณ์"
                  value={totalQuantity}
                  onChange={(value) => setTotalQuantity(value)}
                  required
                  error={errors.totalQuantity}
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Serial Number / อุปกรณ์เสริม / ลำดับการอนุมัติ */}
      <div className="flex flex-col items-center gap-[60px] w-[1540px] px-[100px]">
        {mode == "create" && (
          <div className="flex items-start gap-[110px]">
            <div className="flex flex-col gap-[7px] w-[212px] self-start">
              <p className="text-[18px] font-medium">Serial Number</p>
              <p className="text-[16px] font-medium text-[#40A9FF]">
                รหัสของอุปกรณ์
              </p>
            </div>
            <div className="flex flex-col gap-[15px] w-[856px]">
              {/* checkbox อุปกร์มี Serial Number */}
              <div className="flex gap-2">
                <Checkbox
                  isChecked={checked}
                  onClick={() => setChecked(!checked)}
                />
                <p onClick={() => setChecked(!checked)}>
                  อุปกรณ์มี Serial Number
                </p>
              </div>
              {/* อุปกรณ์ที่มี Serial Number */}
              {checked && (
                <div className="flex items-start gap-[110px] ">
                  <div className="flex flex-col gap-[15px] h-full">
                    <div className="flex gap-3">
                      <div className="border border-[#D8D8D8] rounded-[16px] text-[16px] font-medium w-[663px] px-3 py-2">
                        Serial Number
                      </div>
                      <Button
                        className="bg-[#1890FF] w-[173px]"
                        onClick={addSerial}
                      >
                        + Serial Number
                      </Button>
                    </div>

                    {serialNumbers.map((sn) => (
                      <div key={sn.id} className="flex gap-5">
                        <Input
                          className="!w-[568px]"
                          placeholder="ABC12-3456-7890"
                          value={sn.value}
                          onChange={(e) => updateSerial(sn.id, e.target.value)}
                        />

                        <Button
                          className="bg-[#DF203B] !w-[46px] !h-[46px] !rounded-[16px] hover:bg-red-600"
                          onClick={() => removeSerial(sn.id)}
                        >
                          <Icon
                            icon="solar:trash-bin-trash-outline"
                            width="22"
                            height="22"
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* อุปกรณ์เสริม */}
        <div className="flex items-start gap-[110px]">
          <div className="flex flex-col gap-[7px] w-[212px] self-start">
            <p className="text-[18px] font-medium">อุปกรณ์เสริม</p>
            <p className="text-[16px] font-medium text-[#40A9FF]">
              ข้อมูลของอุปกรณ์เสริม
            </p>
          </div>
          <div className="flex flex-col gap-[15px] h-full">
            <div className="flex gap-3">
              <div className="flex justify-between border border-[#D8D8D8] rounded-[16px] text-[16px] font-medium w-[663px] px-3 py-2">
                <span>ชื่ออุปกรณ์</span>
                <span className="pr-38">จำนวน</span>
              </div>
              <Button className="bg-[#1890FF] w-[173px]" onClick={addAccessory}>
                + เพิ่มอุปกรณ์เสริม
              </Button>
            </div>
            {accessories.map((item) => (
              <div key={item.id} className="flex gap-5">
                <Input
                  className="!w-[419px]"
                  placeholder="ชื่ออุปกรณ์"
                  value={item.name}
                  onChange={(e) =>
                    updateAccessory(item.id, "name", e.target.value)
                  }
                />
                <Input
                  className="!w-[133px]"
                  placeholder="จำนวน"
                  value={item.qty}
                  onChange={(e) =>
                    updateAccessory(item.id, "qty", e.target.value)
                  }
                />
                <Button
                  className="bg-[#DF203B] !w-[46px] !h-[46px] !rounded-[16px] hover:bg-red-600"
                  onClick={() => removeAccessory(item.id)}
                >
                  <Icon
                    icon="solar:trash-bin-trash-outline"
                    width="22"
                    height="22"
                  />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ลำดับการอนุมัติ */}
        <div className="flex items-start gap-[110px]">
          <div className="flex flex-col gap-[7px] w-[212px] self-start">
            <p className="text-[18px] font-medium">ลำดับการอนุมัติ</p>
            <p className="text-[16px] font-medium text-[#40A9FF]">
              ลำดับผู้อนุมัติของอุปกรณ์
            </p>
          </div>
          <div className="flex flex-col gap-x-[15px] h-full">
            <div className="flex gap-3 items-end">
              <DropDown
                value={selectedApprovers}
                className="w-[663px]"
                label="ลำดับการอนุมัติ"
                items={approveItems}
                onChange={handleSelectApprover}
                placeholder="ลำดับการอนุมัติ"
                required
                triggerClassName={
                  errors.afId ? "!border-red-500" : "!border-[#D8D8D8]"
                }
              />
              <Button
                className="bg-[#1890FF] w-[173px]"
                onClick={() => {
                  openApproverModal();
                  fetchDataApprove();
                }}
              >
                + เพิ่มลำดับการอนุมัติ
              </Button>
            </div>
            {errors.afId && (
              <p className="text-sm mt-1 text-[#F5222D]">{errors.afId}</p>
            )}
            {selectedApprovers &&
              (() => {
                const steps =
                  approvalFlowSteps?.find(
                    (item) => item.af_id === selectedApprovers.value,
                  )?.steps ?? [];

                return (
                  <div
                    className="
          flex flex-wrap items-start gap-x-[6px] gap-y-[8px]
          max-w-[800px]
        "
                  >
                    {steps.map((ap, index) => (
                      <div key={ap.afs_id} className="flex flex-col">
                        {/* ===== ชื่อขั้น ===== */}
                        <div className="flex items-center whitespace-nowrap">
                          <span
                            className="
                  text-[16px] text-[#7BACFF] cursor-pointer
                  hover:underline
                "
                            onClick={() =>
                              setOpenStepId(
                                openStepId === ap.afs_id ? null : ap.afs_id,
                              )
                            }
                          >
                            {ap.afs_name}
                          </span>

                          {index < steps.length - 1 && (
                            <span className="mx-[4px] text-[16px] text-[#7BACFF]">
                              ›
                            </span>
                          )}
                        </div>

                        {/* ===== รายชื่อผู้ใช้ ===== */}
                        {openStepId === ap.afs_id && (
                          <div className="mt-[6px] ml-[8px] space-y-[2px]">
                            {ap.users?.length ? (
                              ap.users.map((u) => (
                                <div
                                  key={u.us_id}
                                  className="text-[14px] text-gray-600"
                                >
                                  • {u.fullname}
                                </div>
                              ))
                            ) : (
                              <div className="text-[14px] text-gray-400 italic">
                                ไม่มีผู้ใช้งาน
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
          </div>
        </div>
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end gap-[20px]">
        <Button
          className="bg-[#D8D8D8] border border-[#CDCDCD] text-black hover:bg-[#D8D8D8]"
          onClick={() => navigate("/inventory")}
        >
          ยกเลิก
        </Button>
        <Button onClick={handleOpenConfirm} className="bg-[#1890FF]">
          {mode === "create" ? "เพิ่มอุปกรณ์" : "บันทึก"}
        </Button>
      </div>
      {/* Approver Modal (simple) */}
      {isApproverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeApproverModal}
          />
          <div className="relative bg-white rounded-2xl p-[45px] w-auto h-auto overflow-auto z-10 max">
            <div className="flex flex-col justify-between  gap-10 ">
              <div className=" space-y-4 text-[16px]">
                <p className="text-center text-[32px] font-semibold">
                  เพิ่มลำดับการอนุมัติใหม่
                </p>
                <div>
                  <Input
                    value={titleApprove}
                    onChange={(e) => setTitleApprove(e.target.value)}
                    label="ชื่อลำดับการอนุมัติ"
                    placeholder="ชื่อลำดับการอนุมัติ"
                    size="md"
                    className="w-full"
                    required
                    error={approveErrors.titleApprove}
                  />
                </div>
                <div className=" space-y-2.5">
                  <div className="flex items-center gap-1">
                    <p>เพิ่มผู้อนุมัติ</p>
                    <p className="text-[#F5222D]">*</p>
                  </div>

                  <div className="flex gap-5  ">
                    <DropDown
                      className="max-w-[166px]"
                      label=""
                      items={staffItems}
                      onChange={handleApproverGroup}
                      placeholder="เจ้าหน้าที่คลัง"
                      triggerClassName={
                        approveErrors.approvers
                          ? "!border-red-500"
                          : "!border-[#D8D8D8]"
                      }
                    />
                    <DropDown
                      className="max-w-[166px]"
                      label=""
                      items={departmentApproveItems}
                      onChange={handleApproverGroup}
                      placeholder="หัวหน้าแผนก"
                      triggerClassName={
                        approveErrors.approvers
                          ? "!border-red-500"
                          : "!border-[#D8D8D8]"
                      }
                    />
                    <DropDown
                      className="max-w-[166px]"
                      label=""
                      items={sectionApproveItems}
                      onChange={handleApproverGroup}
                      placeholder="หัวหน้าฝ่ายย่อย"
                      triggerClassName={
                        approveErrors.approvers
                          ? "!border-red-500"
                          : "!border-[#D8D8D8]"
                      }
                    />
                  </div>
                  {approveErrors.approvers && (
                    <p className="text-sm mt-1 text-[#F5222D]">
                      {approveErrors.approvers}
                    </p>
                  )}
                  <div className=" space-y-[7px]">
                    <div className="flex items-center gap-1">
                      <p>ลำดับการอนุมัติ</p>
                      <p className="text-[#F5222D]">*</p>
                    </div>
                    <p className=" text-[#858585]">
                      สามารถลากเพื่อสลับลำดับผู้อนุมัติได้
                    </p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto  text-[16px]">
                    {approverGroupFlow.map((data, idx) => (
                      <div
                        key={data.label}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOverStep(e, idx)}
                        onDrop={handleDropStep}
                        onDragEnd={handleDragEnd}
                        className="flex"
                      >
                        <div className="m-2 cursor-grab py-3">
                          <FontAwesomeIcon
                            icon={faBars}
                            className="text-[14px]"
                          />
                        </div>

                        <div className="flex items-center overflow-hidden w-full">
                          <div className="border-2 border-[#D8D8D8] border-r-0 rounded-l-2xl px-[15px] py-[12.5px]">
                            {idx + 1}
                          </div>

                          <div className="w-full border-2 border-[#D8D8D8] border-x-0 py-0.5">
                            <div className="font-medium truncate">
                              {data.label}
                            </div>

                            {(() => {
                              const users = getUsersByLabel(data);
                              const MAX_SHOW = 2;

                              if (!users || users.length === 0)
                                return (
                                  <div className="text-[14px] text-gray-500 flex flex-wrap items-center">
                                    <div className="">
                                      ไม่มีผู้ใช้งานในตำแหน่งนี้
                                    </div>
                                  </div>
                                );

                              const previewNames = users
                                .slice(0, MAX_SHOW)
                                .map((u: any) => u.us_name)
                                .join(" , ");

                              return (
                                <div className=" text-[14px] text-gray-500 flex flex-wrap items-center">
                                  <p className="text-gray-400">
                                    ผู้ใช้งานในตำแหน่งนี้ :
                                  </p>
                                  <p className="truncate max-w-[220px]">
                                    {previewNames}
                                  </p>
                                </div>
                              );
                            })()}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteApproverGroup(data.label)
                            }
                            className="border-2 border-[#F5222D] border-l-0 rounded-r-2xl p-[12px] bg-[#F5222D]"
                          >
                            <Icon
                              icon="solar:trash-bin-trash-linear"
                              width="24"
                              height="24"
                              className="text-white"
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 justify-end">
                <Button
                  onClick={() => setIsApproverModalOpen(false)}
                  className="bg-[#E5E7EB] hover:bg-[#D9D9D9]"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleOpenApproverModal}
                  className="bg-[#1890FF]"
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <AlertDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        tone="success"
        title={
          mode === "create"
            ? "ต้องการเพิ่มอุปกรณ์นี้ลงในคลัง?"
            : "ยืนยันการแก้ไขอุปกรณ์นี้หรือไม่?"
        }
        description={
          mode === "create"
            ? "อุปกรณ์นี้จะถูกเพิ่มลงในรายการคลังของคุณ"
            : "ข้อมูลอุปกรณ์จะถูกแก้ไขในรายการคลังของคุณ"
        }
        icon={
          <Icon
            icon={
              mode === "create"
                ? "material-symbols-light:box-add-sharp"
                : "material-symbols-light:box-edit-outline-sharp"
            }
            width="72"
            height="72"
          />
        }
        confirmText="บันทึก"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          handleSubmit();
        }}
        onCancel={() => {}}
      />
      <AlertDialog
        width={680}
        open={openConfirmApprove}
        onOpenChange={setOpenConfirmApprove}
        tone="success"
        icon={
          <Icon
            icon="material-symbols-light:box-add-sharp"
            width="72"
            height="72"
          />
        }
        title="ต้องการเพิ่มลำดับการอนุมัติใช่หรือไม่?"
        description="เพิ่มลำดับผู้อนุมัติจะถูกเพิ่มลงในรายการคลังของคุณ"
        confirmText="บันทึก"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          handleSumbitApprove();
        }}
        onCancel={() => {}}
      />
    </div>
  );
};

export default MainDeviceModal;
