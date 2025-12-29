import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "./DropDown";
import Input from "./Input";
import Button from "./Button";
import { Icon } from "@iconify/react";
import Checkbox from "./Checkbox";
import QuantityInput from "./QuantityInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useInventorys } from "../hooks/useInventory";
import { AlertDialog } from "../components/AlertDialog";
import { useToast } from "../components/Toast";
import api from "../api/axios.js"; 
import { useToast } from "./Toast";
import { set } from "date-fns";

const API_BASE_URL = "http://localhost:4041/api/v1"; 

// --- Types ---
type DropdownOption = {
  id: number | string;
  label: string;
  value: number;
  deptId?: string;
}
type ApproverPayload = {
  sec_id: number;
  dept_id: number;
  value: string;
};

interface ApproverItem {
  id: number;
  label: string;
  order: number;
}

interface Approver {
  id: number;
  label: string;
  value: number;
  approvers: ApproverItem[];
}

interface MainDeviceModalProps {
  mode: "create" | "edit";
  defaultValues?: any; 
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

const MainDeviceModal = ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: MainDeviceModalProps) => {
  const navigate = useNavigate();
  const toast = useToast();
 const [isAlertOpen, setIsAlertOpen] = useState(false);
  // --- States ---
  const [departmentList, setDepartmentList] = useState<DropdownOption[]>([]);
  const [categoryList, setCategoryList] = useState<DropdownOption[]>([]);
  const [allSectionList, setAllSectionList] = useState<DropdownOption[]>([]);
  const [approvalGroups, setApprovalGroups] = useState<Approver[]>([]);

  // Selected Values
  const [selectedDepartment, setSelectedDepartment] = useState<DropdownOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption | null>(null);
  const [selectedSection, setSelectedSection] = useState<DropdownOption | null>(null);
  const [selectedApprovers, setSelectedApprovers] = useState<Approver | null>(null);

  // Form Fields
  const [deviceName, setDeviceName] = useState<string>("");
  const [deviceCode, setDeviceCode] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [maxBorrowDays, setMaxBorrowDays] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [departments, setDepartments] = useState([]);
  const [categorys, setCategory] = useState([]);
  const [sections, setSection] = useState([]);
  const [titleApprove, setTitleApprove] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [approvalflows, setApprovalFlows] = useState([]);
  const [approvalFlowSteps, setapprovalFlowSteps] = useState([]);
  const [staff, setStaff] = useState([]);
  const [sectionsApprove, setSectionsApprove] = useState([]);
  const [departmentsApprove, setDepartmentsApprove] = useState([]);
  const [openStepId, setOpenStepId] = useState<number | null>(null);
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  const data = localStorage.getItem("User") || sessionStorage.getItem("User");
   const userId = JSON.parse(data).us_id;
  const fetchDataDevices = async () => {
    try {
      const res = await useInventorys.getDevicesAll();
      setDepartments(res.data.departments);
      setCategory(res.data.categories);
      setSection(res.data.sections);
      // us_id ที่รับมา เช่น 1
  
      const filteredApprovalFlows = res.data.approval_flows.filter(
        (af: any) => af.af_us_id === userId
      );
      setApprovalFlows(filteredApprovalFlows);
      setapprovalFlowSteps(res.data.approval_flow_step);

      console.log(res.data);
    } catch (error) {
      console.error("โหลดข้อมูลไม่สำเร็จ", error);
    }
  };
  useEffect(() => {
    fetchDataDevices();
  }, []);

  const fetchDataApprove = async () => {
    try {
      const ap = await useInventorys.getApproveAll();
      console.log(ap.data);
      setDepartmentsApprove(ap.data.departments);
      setSectionsApprove(ap.data.sections);
      setStaff(ap.data.staff);
    } catch (error) {
      console.error("fetchDataApprove โหลดข้อมูลไม่สำเร็จ", error);
    }
  };

  useEffect(() => {
    fetchDataApprove();
  }, []);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openConfirmApprove, setOpenConfirmApprove] = useState(false);

  const departmentItems: DepartmentDropdownItem[] = departments.map((dept) => ({
    id: dept.dept_id,
    label: dept.dept_name,
    value: dept.dept_id,
  }));

  const categoryItem: CategoryDropdownITem[] = categorys.map((ca) => ({
    id: ca.ca_id,
    label: ca.ca_name,
    value: ca.ca_id,
  }));

  const sectionItems: SectionsDropdownItem[] = sections.map((sec) => ({
    id: sec.sec_id,
    label: sec.sec_name,
    value: sec.sec_id,
  }));

  const approveItems: ApproveDropdownItem[] = approvalflows.map((af) => ({
    id: af.af_id,
    label: af.af_name,
    value: af.af_id,
  }));

  const staffItems: StaffDropdownItem[] = staff.map((st) => ({
    id: st.st_sec_id,
    label: st.st_name,
    value: st.st_sec_id,
  }));

  // รูปภาพอุปกรณ์
  const [preview, setPreview] = useState<string | null>(null);
  // มีการเลือกไฟล์รูปภาพ
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // เลือกเฉพาะไฟล์แรกที่อัปโหลด
    if (!file) return;

    setImageFile(file);

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

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
  const [preview, setPreview] = useState<string | null>(null);

  const [checked, setChecked] = useState<boolean>(true);
  const [serialNumbers, setSerialNumbers] = useState([{ id: 1, value: "" }]);
  const [accessories, setAccessories] = useState([{ id: 1, name: "", qty: "" }]);

  // --- Logic กรอง Section ตาม Department ---
  // จะแสดง Section เฉพาะที่มี deptId ตรงกับ Department ที่เลือก
 const filteredSectionList = useMemo(() => {
    if (!selectedDepartment) return []; 

    return allSectionList
      .filter(sec => String(sec.deptId) === String(selectedDepartment.value))
      .map(sec => {
         // ตัดชื่อแผนกออกจากชื่อฝ่ายย่อย
         let cleanLabel = sec.label;
         const deptName = selectedDepartment.label.trim();

         if (cleanLabel.includes(deptName)) {
             cleanLabel = cleanLabel.replace(deptName, "").trim();
         }

         return {
             ...sec,
             label: cleanLabel // ใช้ชื่อที่ตัดแล้ว
         };
      });
  }, [selectedDepartment, allSectionList]);

  //แผนก หมวดหมู่ ฝ่ายย่อย ลำดับการอนุมัติ
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [deptRes, catRes, secRes, flowRes] = await Promise.all([
          api.get(`${API_BASE_URL}/inventory/departments`),
          api.get(`${API_BASE_URL}/inventory/categories`),
          api.get(`${API_BASE_URL}/inventory/sub-sections`),
          api.get(`${API_BASE_URL}/inventory/approval-flows`),
        ]);

        // Helper: แปลงให้เป็น Array ชัวร์ๆ
        const ensureArray = (response: any) => {
            let data = response.data?.data || response.data;
            if (!Array.isArray(data)) {
               if (data && Array.isArray(data.data)) return data.data;
               return []; 
            }
            return data;
        };

        const deptArray = ensureArray(deptRes);
        setDepartmentList(deptArray.map((d: any) => ({
            id: d.dept_id,
            label: d.dept_name,
            value: String(d.dept_id)
        })));

        const catArray = ensureArray(catRes);
        setCategoryList(catArray.map((c: any) => ({
            id: c.ca_id,
            label: c.ca_name,
            value: String(c.ca_id)
        })));

        const secArray = ensureArray(secRes);
        setAllSectionList(secArray.map((s: any) => ({
            id: s.sec_id,
            label: s.sec_name,
            value: String(s.sec_id),
            deptId: String(s.sec_dept_id)
        })));

        const flowArray = ensureArray(flowRes);
        setApprovalGroups(flowArray.map((f: any) => ({
            id: f.af_id,
            label: f.af_name,
            value: f.af_id,
            approvers: (f.steps || []).map((step: any) => ({
                id: step.afs_id,
                label: step.afs_role,
                order: step.afs_step_approve
            }))
        })));

      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };
    fetchMasterData();
  }, []);

    const url = URL.createObjectURL(file); // แปลงเป็น url
    setPreview(url);
  };

  // แผนกท่ีเลือกใน dropdown
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  // หมวดหมู่ท่ีเลือกใน dropdown
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  // ฝ่ายย่อยท่ีเลือกใน dropdown
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  // ลำดับการอนุมัติ
  const [selectedApprovers, setSelectedApprovers] = useState<Approver | null>(
    null
  );
  const [selectedApproverSteps, setSelectedApproverSteps] = useState([]);
  // modal สำหรับจัดการลำดับการอนุมัติ
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [approverGroupFlow, setApproverGroupFlow] = useState([]);
  const handleApproverGroup = (item) => {
    setApproverGroupFlow((prev: any) =>
      prev.some((v) => v.label === item.label) ? prev : [...prev, item]
    );
  };
  const handleDeleteApproverGroup = (value: string) => {
    setApproverGroupFlow((prev) => prev.filter((item) => item.label !== value));
  };

  // เปิด modal
  const openApproverModal = () => {
    setIsApproverModalOpen(true);
  };
  const closeApproverModal = () => setIsApproverModalOpen(false);

  // ข้อมูลใน modal (editable copy)
  const [modalApproverList, setModalApproverList] = useState<ApproverItem[]>(
    []
  );
  const [modalGroupLabel, setModalGroupLabel] = useState("");

  // เลือกลำดับการอนุมัติ
  const handleSelectApprover = (item: Approver) => {
    setSelectedApprovers(item);
  };

  // อุปกรณ์มี Serial Number
  const [checked, setChecked] = useState<boolean>(true);
  // --- Set Default Values (Edit Mode) ---
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      console.log("🛠️ Edit Mode Loading...");
      
      setDeviceName(defaultValues.de_name ?? "");
      setDeviceCode(defaultValues.de_serial_number ?? "");
      setLocation(defaultValues.de_location ?? "");
      setDescription(defaultValues.de_description ?? "");
      setMaxBorrowDays(defaultValues.de_max_borrow_days ?? 0);
      setTotalQuantity(defaultValues.total_quantity ?? 0);
      setPreview(defaultValues.de_images ?? null);


      // Department: ถ้าไม่มี dept_id ให้ไปเอาจาก section.sec_dept_id
      const deptId = defaultValues.dept_id || defaultValues.section?.sec_dept_id || defaultValues.section?.department?.dept_id;
      if (deptId) {
        const foundDept = departmentList.find(d => String(d.value) === String(deptId));
        // ถ้าเจอใน List ใช้ label จาก List, ถ้าไม่เจอค่อยไปหาจาก defaultValues, ถ้าไม่มีอีกให้เป็น "-"
        const deptLabel = foundDept?.label || defaultValues.department_name || defaultValues.department || defaultValues.section?.department?.dept_name || "-";
        
        setSelectedDepartment({
            id: deptId,
            label: deptLabel, 
            value: String(deptId)
        });
      }

      // Category: ถ้าไม่มี ca_id ให้ไปเอาจาก category.ca_id
      const caId = defaultValues.ca_id || defaultValues.category?.ca_id;
      if (caId) {
        const foundCat = categoryList.find(c => String(c.value) === String(caId));
        const catLabel = foundCat?.label || defaultValues.category_name || defaultValues.category?.ca_name || "-";
        
        setSelectedCategory({
            id: caId,
            label: catLabel,
            value: String(caId)
        });
      }

      // Section: ถ้าไม่มี sec_id ให้ไปเอาจาก section.sec_id
      const secId = defaultValues.sec_id || defaultValues.section?.sec_id;
      if (secId) {
        const currentDeptLabel = selectedDepartment?.label || defaultValues.department_name || defaultValues.section?.department?.dept_name || "";
        
        let secLabel = defaultValues.sub_section_name || defaultValues.sub_section || defaultValues.section?.sec_name || "-";
        if (currentDeptLabel && secLabel.includes(currentDeptLabel)) {
            secLabel = secLabel.replace(currentDeptLabel, "").trim();
        }
        setSelectedSection({
            id: secId,
            label: secLabel,
            value: String(secId),
            deptId: String(deptId)
        });
      }

      // Approval Flow
      const afId = defaultValues.af_id || defaultValues.approval_flow?.af_id;
      if (afId) {
         // พยายามหาจาก List ก่อนเพื่อเอา steps
         const foundFlow = approvalGroups.find(f => String(f.id) === String(afId));
         
         if (foundFlow) {
             setSelectedApprovers(foundFlow);
         } else if (defaultValues.approval_flow) {
             // ถ้าหาไม่เจอ ให้ใช้ข้อมูลที่ติดมาแสดงไปก่อน
             setSelectedApprovers({
                 id: defaultValues.approval_flow.af_id,
                 label: defaultValues.approval_flow.af_name,
                 value: defaultValues.approval_flow.af_id,
                 approvers: (defaultValues.approval_flow.steps || []).map((step: any) => ({
                    id: step.afs_id,
                    label: step.afs_role,
                    order: step.afs_step_approve
                 }))
             });
         }
      }

      // Serial & Accessories
      if(defaultValues.de_serial_number) {
          setChecked(true);
          setSerialNumbers([{ id: defaultValues.de_id, value: defaultValues.de_serial_number }]);
      } else {
          setChecked(false);
      }
      
      if(defaultValues.accessory) {
         setAccessories([{ 
             id: defaultValues.accessory.acc_id, 
             name: defaultValues.accessory.acc_name, 
             qty: String(defaultValues.accessory.acc_quantity) 
         }]);
      }
    }
  }, [mode, defaultValues, approvalGroups, departmentList, categoryList, allSectionList]);

  // --- Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  // อัปเดตค่า Serial
  const updateSerial = (id: number, newValue: string) => {
    setSerialNumbers(
      serialNumbers.map((item) =>
        item.id === id ? { ...item, value: newValue } : item
      )
    );
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const addSerial = () => setSerialNumbers([...serialNumbers, { id: Date.now(), value: "" }]);
  const removeSerial = (id: number) => setSerialNumbers(serialNumbers.filter((item) => item.id !== id));
  const updateSerial = (id: number, val: string) => setSerialNumbers(serialNumbers.map((item) => (item.id === id ? { ...item, value: val } : item)));

  const addAccessory = () => setAccessories([...accessories, { id: Date.now(), name: "", qty: "" }]);
  const removeAccessory = (id: number) => setAccessories(accessories.filter((item) => item.id !== id));
  const updateAccessory = (id: number, key: "name" | "qty", val: string) => setAccessories(accessories.map((item) => (item.id === id ? { ...item, [key]: val } : item)));

  // เพิ่ม Input อุปกรณ์เสริม
  const addAccessory = () => {
    setAccessories([
      ...accessories,
      { id: accessories.length + 1, name: "", qty: "" },
    ]);
  };

  // อัปเดตอุปกรณ์เสริม
  const updateAccessory = (id: number, key: "name" | "qty", value: string) => {
    setAccessories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  const handleSelectApprover = (item: Approver) => {
    setSelectedApprovers(item);
  };

  const handleDepartmentChange = (item: DropdownOption) => {
    setSelectedDepartment(item);
    setSelectedSection(null); // เคลียร์ Section เมื่อเปลี่ยนแผนก
  };

  const handleSaveClick = () => {
    setIsAlertOpen(true);
  };

  // ค่าเริ่มต้น edit
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      // รูปภาพ
      setPreview(defaultValues.de_images ?? null);

      // Input text
      setDeviceName(defaultValues.de_name ?? "");
      setDeviceCode(defaultValues.de_serial_number ?? "");
      setLocation(defaultValues.de_location ?? "");
      setDescription(defaultValues.de_description ?? "");

      // จำนวน
      setMaxBorrowDays(defaultValues.de_max_borrow_days ?? 0);
      setTotalQuantity(defaultValues.total_quantity ?? 0);

      // Dropdown

      setSelectedCategory(defaultValues.category ?? null);
      setSelectedSection(defaultValues.section ?? null);

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
      if (defaultValues.accessory) {
        setAccessories([
          {
            id: defaultValues.accessory.acc_id,
            name: defaultValues.accessory.acc_name,
            qty: String(defaultValues.accessory.acc_quantity),
          },
        ]);
      } else {
        setAccessories([{ id: Date.now(), name: "", qty: "" }]); // แสดงช่อง input
      }

      // ลำดับการอนุมัติ
      if (defaultValues.approval_flow.steps) {
        setSelectedApprovers({
          id: defaultValues.approval_flow.af_id,
          label: defaultValues.approval_flow.af_name,
          value: defaultValues.approval_flow.af_id,
          // แปลง array เป็น approvers ที่ UI ใช้ render เช่น HOS › HOD
          approvers: defaultValues.approval_flow.steps.map((step: any) => ({
            id: step.afs_id, // id ของแต่ละขั้นตอน
            label: step.afs_role, // role ที่อนุมัติ
            order: step.afs_step_approve, // ลำดับการอนุมัติ
          })),
        });
      }
    }
  }, [mode, defaultValues]);

  const mappedAccessories = accessories
    .filter((a) => a.name && a.qty)
    .map((a) => ({
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

  // ส่งข้อมูล
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
    formData.append("de_us_id",userId);
    formData.append("de_sec_id", String(selectedSection?.value ?? ""));

    formData.append("accessories", JSON.stringify(mappedAccessories));
    formData.append("serialNumbers", JSON.stringify(mappedSerialNumbers));

    if (imageFile) {
      formData.append("de_images", imageFile);
    }
    onSubmit(formData);
  };

  const handleSumbitApprove = () => {
    const approver: ApprovalFlowStepPayload[] = approverGroupFlow.map(
      (ap, indexvalue) => {
        if (ap.label.includes("เจ้าหน้าที่")) {
          const sec = sections.find((item) => item.sec_id === ap.value);
          console.log(sec);
          return {
            afs_step_approve: indexvalue + 1,
            afs_dept_id: sec.sec_dept_id,
            afs_sec_id: sec.sec_id,
            afs_role: "STAFF",
          };
        } else if (
          ap.label.includes("หัวหน้าแผนก") &&
          !ap.label.includes("ฝ่ายย่อย")
        ) {
          const dept = departments.find((item) => item.dept_id === ap.value);
          return {
            afs_step_approve: indexvalue + 1,
            afs_dept_id: dept.dept_id,
            afs_sec_id: null,
            afs_role: "HOD",
          };
        } else {
          const sec = sections.find((item) => item.sec_id === ap.value);
          return {
            afs_step_approve: indexvalue + 1,
            afs_dept_id: sec.sec_dept_id,
            afs_sec_id: sec.sec_id,
            afs_role: "HOS",
          };
        }
      }
    );
    console.log(approver)
    const formData = new FormData();
    formData.append("data", "approve");
    formData.append("af_name", titleApprove);
    formData.append("af_us_id", userId);

    formData.append("approvalflowsstep", JSON.stringify(approver));

    onSubmit(formData);
  };

  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverStep = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
    e.dataTransfer.dropEffect = "move";
  };

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

  const getUsersByLabel = (data: string) => {
    // เจ้าหน้าที่คลัง ไป staff
    if (data.includes("เจ้าหน้าที่คลัง")) {
      return staff.find((s) => s.st_name === data)?.users ?? [];
    }
    // หัวหน้า + !ฝ่ายย่อย ไป sections
    else if (data.includes("หัวหน้า") && !data.includes("ฝ่ายย่อย")) {
      return (
        departmentsApprove.find((dept) => dept.dept_name === data)?.users ?? []
      );
    }
    // หัวหน้า + ฝ่ายย่อย ไป sections
    else if (data.includes("หัวหน้าแผนก") && data.includes("ฝ่ายย่อย")) {
      return sectionsApprove.find((s) => s.sec_name === data)?.users ?? [];
    }

    return [];
  const handleConfirmSave = async() => {
    setIsAlertOpen(false);
    const payload = {
      device_name: deviceName,
      device_code: deviceCode,
      department_id: selectedDepartment ? Number(selectedDepartment.value) : null,
      category_id: selectedCategory ? Number(selectedCategory.value) : null,
      sub_section_id: selectedSection ? Number(selectedSection.value) : null,
      approver_flow_id: selectedApprovers ? Number(selectedApprovers.value) : null,
      location,
      maxBorrowDays,
      totalQuantity,
      description,
      serialNumbers: checked ? serialNumbers : [],
      accessories,
      imageUrl: preview,
    };
    try {
      if (mode === "edit") {
        // --- กรณีแก้ไข (EDIT) : PATCH /inventory/devices/:id ---
        const id = defaultValues?.de_id; // ดึง ID จากค่า defaultValues ที่ส่งเข้ามา
        
        if (!id) {
          alert("❌ ไม่พบ ID อุปกรณ์ที่ต้องการแก้ไข");
          return;
        }

        // ยิง API PATCH ตาม Route ที่ระบุ
        await api.patch(`${API_BASE_URL}/inventory/devices/${id}`, payload);
        toast.push({ message: "แก้ไขข้อมูลอุปกรณ์ในคลังแล้ว!", tone: "confirm"  });

      } else {
        // --- กรณีสร้างใหม่ (CREATE) : POST /inventory/devices ---
        // ใช้ Route เดียวกันแต่เป็น POST (ตามหลัก REST API ทั่วไป)
        await api.post(`${API_BASE_URL}/inventory/devices`, payload);

        toast.push({ message: "เพิ่มอุปกรณ์สำเร็จ", tone: "confirm"  });
      }
      navigate("/inventory");

      // ส่งข้อมูลกลับไปหา Parent Component เพื่อปิด Modal หรือ Refresh หน้าจอ
      if (onSubmit) onSubmit(payload);

    } catch (error: any) {
      console.error("❌ Error saving data:", error);
      
      // ดึงข้อความ Error จาก Backend (ถ้ามี)
      const errorMsg = error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      alert(`⚠️ บันทึกไม่สำเร็จ: ${errorMsg}`);
    }
  };

  return (
    <div className="flex flex-col gap-[60px] bg-[#FFFFFF] border border-[#BFBFBF] w-[1660px] rounded-[16px] px-[60px] py-[60px]">
      <form className="flex justify-center gap-[110px] w-[1540px] min-h-[837px] px-[100px]">
        <div className="flex flex-col gap-[7px] w-[212px] h-[69px]">
          <p className="text-[20px] font-medium">ข้อมูลอุปกรณ์</p>
          <p className="text-[16px] text-[#40A9FF] font-medium">
            รายละเอียดข้อมูลอุปกรณ์
          </p>
        </div>
        {/* กรอกรายละเอียดอุปกรณ์ */}
        <div className="flex flex-col gap-[20px] w-[853px]">
          <div className="flex gap-[20px]">
            <div className="flex flex-col gap-[4px]">
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                label="ชื่ออุปกรณ์"
                placeholder="ชื่อของอุปกรณ์"
                size="md"
                className="!w-[552px]"
              />
            </div>
            <div className="flex flex-col gap-[4px]">
              <Input
                value={deviceCode}
                onChange={(e) => setDeviceCode(e.target.value)}
                label="รหัสอุปกรณ์"
                placeholder="รหัสของอุปกรณ์"
                size="md"
                className="!w-[261px]"
              />
            </div>
          </div>

          <div className="flex gap-[20px]">
            <DropDown
              value={selectedDepartment}
              className="!w-[264px]"
              label="แผนกอุปกรณ์"
              items={departmentItems}
              onChange={(item) => setSelectedDepartment(item)}
              items={departmentList}
              onChange={handleDepartmentChange}
              placeholder="แผนก"
            />
            <DropDown
              value={selectedCategory}
              className="!w-[264px]"
              label="หมวดหมู่"
              items={categoryItem}
              onChange={(item) => setSelectedCategory(item)}
              items={categoryList}
              onChange={setSelectedCategory}
              placeholder="หมวดหมู่อุปกรณ์"
            />
            <DropDown
              value={selectedSection}
              className="!w-[264px]"
              label="ฝ่ายย่อย"
              items={sectionItems}
              onChange={(item) => setSelectedSection(item)}
              items={filteredSectionList} // ใช้รายการที่กรองแล้วตามแผนก
              onChange={setSelectedSection}
              placeholder="ฝ่ายย่อย"
              disabled={!selectedDepartment} 
            />
          </div>

          <div className="flex flex-col gap-[10px]">
            <p className="text-[16px] font-medium">รูปภาพ</p>
            <div
              className={`flex flex-col items-center justify-center border rounded-[16px] w-[833px] h-[225.32px] ${isDragging ? "border-[#40A9FF] bg-blue-50" : "border-[#D9D9D9]"}`}
              onDragOver={handleDragOver} onDragLeave={handleLeave} onDrop={handleDrop}
            >
              <label className="flex flex-col items-center justify-center w-full h-full text-center cursor-pointer">
                <input className="hidden" type="file" onChange={handleImageUpload} />
                {preview ? (
                  <img className="w-full h-full object-cover rounded-[16px]" src={preview} alt="preview" />
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

          <div className="flex flex-col gap-[10px]">
            <label className="text-[16px] font-medium">
              สถานที่เก็บอุปกรณ์
            </label>
            <textarea
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-[#D8D8D8] rounded-[16px] w-[833px] h-[140px] px-[15px] py-[8px]"
              placeholder="สถานที่เก็บอุปกรณ์"
            />
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="text-[16px] font-medium">รายละเอียดอุปกรณ์</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[#D8D8D8] rounded-[16px] w-[833px] h-[140px] px-[15px] py-[8px]"
              placeholder="รายละเอียดอุปกรณ์"
            />
          </div>

          <div className="flex gap-[20px]">
             <QuantityInput label="จำนวนวันสูงสุดที่สามารถยืมได้" value={maxBorrowDays} onChange={setMaxBorrowDays} />
             <QuantityInput label="จำนวนอุปกรณ์" value={totalQuantity} onChange={setTotalQuantity} />
          </div>
          <div className="flex gap-[20px]">
            <QuantityInput
              label="จำนวนวันสูงสุดที่สามารถยืมได้"
              value={maxBorrowDays}
              onChange={(value) => setMaxBorrowDays(value)}
            />
            <QuantityInput
              label="จำนวนอุปกรณ์"
              value={totalQuantity}
              onChange={(value) => setTotalQuantity(value)}
            />
          </div>
        </div>
      </form>

      {/* Serial / Accessories / Approval */}
      <div className="flex flex-col items-center gap-[60px] w-[1540px] px-[100px]">
        <div className="flex items-start gap-[110px]">
          <div className="flex flex-col gap-[7px] w-[212px] self-start">
            <p className="text-[18px] font-medium">Serial Number</p>
            <p className="text-[16px] font-medium text-[#40A9FF]">
              รหัสของอุปกรณ์
            </p>
          </div>
          <div className="flex flex-col gap-[15px] w-[856px]">
            {/* checkbox อุปกร์มี Serail Number */}
            <div className="flex gap-2">
              <Checkbox
                isChecked={checked}
                onClick={() => setChecked(!checked)}
              />
              <p  onClick={() => setChecked(!checked)}>อุปกรณ์มี Serail Number</p>
            </div>
            {/* อุปกรณ์ที่มี Serail Number */}
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
         <div className="flex items-start gap-[110px]">
            <div className="flex flex-col gap-[7px] w-[212px]">
               <p className="text-[18px] font-medium">Serial Number</p>
               <p className="text-[16px] font-medium text-[#40A9FF]">รหัสของอุปกรณ์</p>
            </div>
            <div className="flex flex-col gap-[15px] w-[856px]">
               <div className="flex gap-2">
                  <Checkbox isChecked={checked} onClick={() => setChecked(!checked)} />
                  <p>อุปกรณ์มี Serial Number</p>
               </div>
               {checked && (
                  <div className="flex flex-col gap-[15px]">
                     <div className="flex gap-3">
                        <div className="border border-[#D8D8D8] rounded-[16px] px-3 py-2 w-[663px] font-medium">Serial Number</div>
                        <Button className="bg-[#1890FF] w-[173px]" onClick={addSerial}>+ Serial Number</Button>
                     </div>
                     {serialNumbers.map(sn => (
                        <div key={sn.id} className="flex gap-5">
                           <Input className="!w-[568px]" value={sn.value} onChange={(e) => updateSerial(sn.id, e.target.value)} />
                           <Button className="bg-[#DF203B] !w-[46px] !h-[46px] rounded-[16px]" onClick={() => removeSerial(sn.id)}>
                              <Icon icon="solar:trash-bin-trash-outline" width="22" />
                           </Button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         <div className="flex items-start gap-[110px]">
             <div className="flex flex-col gap-[7px] w-[212px]">
                <p className="text-[18px] font-medium">อุปกรณ์เสริม</p>
                <p className="text-[16px] font-medium text-[#40A9FF]">ข้อมูลของอุปกรณ์เสริม</p>
             </div>
             <div className="flex flex-col gap-[15px] w-[856px]">
                <div className="flex gap-3">
                   <div className="flex justify-between border border-[#D8D8D8] rounded-[16px] px-3 py-2 w-[663px] font-medium">
                      <span>ชื่ออุปกรณ์</span><span>จำนวน</span>
                   </div>
                   <Button className="bg-[#1890FF] w-[173px]" onClick={addAccessory}>+ เพิ่มอุปกรณ์เสริม</Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
                {accessories.map(acc => (
                   <div key={acc.id} className="flex gap-5">
                      <Input className="!w-[419px]" value={acc.name} onChange={(e) => updateAccessory(acc.id, "name", e.target.value)} />
                      <Input className="!w-[133px]" value={acc.qty} onChange={(e) => updateAccessory(acc.id, "qty", e.target.value)} />
                      <Button className="bg-[#DF203B] !w-[46px] !h-[46px] rounded-[16px]" onClick={() => removeAccessory(acc.id)}>
                         <Icon icon="solar:trash-bin-trash-outline" width="22" />
                      </Button>
                   </div>
                ))}
             </div>
         </div>

         <div className="flex items-start gap-[110px]">
            <div className="flex flex-col gap-[7px] w-[212px]">
               <p className="text-[18px] font-medium">ลำดับการอนุมัติ</p>
               <p className="text-[16px] font-medium text-[#40A9FF]">ลำดับผู้อนุมัติของอุปกรณ์</p>
            </div>
            <div className="flex flex-col gap-[15px] w-[856px]">
               <div className="flex gap-3 items-end">
                  <DropDown
                     value={selectedApprovers}
                     className="w-[663px]"
                     label="ลำดับการอนุมัติ"
                     items={approvalGroups}
                     onChange={handleSelectApprover}
                     placeholder="ลำดับการอนุมัติ"
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
          <div className="flex flex-col gap-[15px] h-full">
            <div className="flex gap-3 items-end">
              <DropDown
                value={selectedApprovers}
                className="w-[663px]"
                label="ลำดับการอนุมัติ"
                items={approveItems}
                onChange={handleSelectApprover}
                placeholder="ลำดับการอนุมัติ"
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
            {selectedApprovers &&
              (() => {
                const steps =
                  approvalFlowSteps?.find(
                    (item) => item.af_id === selectedApprovers.value
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
                                openStepId === ap.afs_id ? null : ap.afs_id
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
                  <Button className="bg-[#1890FF] w-[173px]">+ เพิ่มลำดับการอนุมัติ</Button>
               </div>
               {selectedApprovers && (
                  <div className="flex items-center gap-[9px]">
                     {selectedApprovers.approvers.map((appr, index) => (
                        <div key={appr.id} className="flex items-center gap-2">
                           <span className="text-[16px] text-[#7BACFF]">{appr.label}</span>
                           {index < selectedApprovers.approvers.length - 1 && <span className="text-[#7BACFF]">›</span>}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>

      <div className="flex justify-end gap-[20px]">
        <Button onClick={onCancel} className="bg-[#D8D8D8] border border-[#CDCDCD] text-black hover:bg-gray-200 cursor-pointer">
          ยกเลิก
        </Button>
        <Button onClick={() => setOpenConfirm(true)} className="bg-[#1890FF]">
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
                    placeholder="ชื่อของอุปกรณ์"
                    size="md"
                    className="w-full"
                  />
                </div>
                <div className=" space-y-2.5">
                  <div className="flex items-center gap-1">
                    <p>เพิ่มผู้อนุมัติ</p>
                    <p className="text-[#F5222D]">*</p>
                  </div>

                  <div className="flex gap-5  ">
                    <DropDown
                      value={selectedDepartment}
                      className="max-w-[166px]"
                      label=""
                      items={staffItems}
                      onChange={handleApproverGroup}
                      placeholder="เจ้าหน้าที่คลัง"
                    />
                    <DropDown
                      value={selectedDepartment}
                      className="max-w-[166px]"
                      label=""
                      items={departmentItems}
                      onChange={handleApproverGroup}
                      placeholder="หัวหน้าแผนก"
                    />
                    <DropDown
                      value={selectedSection}
                      className="max-w-[166px]"
                      label=""
                      items={sectionItems}
                      onChange={handleApproverGroup}
                      placeholder="หัวหน้าฝ่ายย่อย"
                    />
                  </div>
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
                              const users = getUsersByLabel(data.label);
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
                  className="bg-[#D9D9D9]"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={() => setOpenConfirmApprove(true)}
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
        title="ยืนยันการบันทึก"
        description="คุณต้องการบันทึกข้อมูลอุปกรณ์นี้ใช่หรือไม่"
        confirmText="บันทึก"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          handleSubmit();
        }}
        onCancel={() => {}}
      />
      <AlertDialog
        open={openConfirmApprove}
        onOpenChange={setOpenConfirmApprove}
        tone="success"
        title="ยืนยันการบันทึก"
        description="คุณต้องการบันทึกการอนุมัตินี้ใช่หรือไม่"
        confirmText="บันทึก"
        cancelText="ยกเลิก"
        onConfirm={async () => {
          handleSumbitApprove();
     
        }}
        onCancel={() => {}}
        <Button onClick={handleSaveClick} className="bg-[#1890FF] cursor-pointer ">
          {mode === "create" ? "เพิ่มอุปกรณ์" : "บันทึก"}
        </Button>
      </div>
                
      {/* Alert Dialog */}
       <AlertDialog
        open={isAlertOpen}                
        onOpenChange={setIsAlertOpen}     
        onConfirm={handleConfirmSave}      
        title={mode === "create" ? "ยืนยันการเพิ่มอุปกรณ์" : "ยืนยันการแก้ไขข้อมูลอุปกรณ์นี้หรือไม่?"}
        description={mode === "create" ? "คุณต้องการเพิ่มอุปกรณ์นี้ใช่หรือไม่?" : "ข้อมูลอุปกรณ์จะถูกแก้ไขในรายการคลังของคุณ?"} 
        confirmText="ยืนยัน"           
        cancelText="ยกเลิก"      
        tone="editDevice"     
        icon={<Icon icon="material-symbols-light:box-edit-outline-sharp" width="80%" height="80%" />}
        padX={26}          
      />
    </div>
  );
};

export default MainDeviceModal;