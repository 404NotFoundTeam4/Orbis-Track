import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "./DropDown";
import Input from "./Input";
import Button from "./Button";
import { Icon } from "@iconify/react";
import Checkbox from "./Checkbox";
import QuantityInput from "./QuantityInput";
import api from "../api/axios.js"; 
import { AlertDialog } from "./AlertDialog.js";
import { useToast } from "./Toast";
import { set } from "date-fns";

const API_BASE_URL = "http://localhost:4041/api/v1"; 

// --- Types ---
type DropdownOption = {
  id: number | string;
  label: string;
  value: string;
  deptId?: string;
};

interface Approver {
  id: number;
  label: string;
  value: number;
  approvers: {
    id: number;
    label: string;
    order: number;
  }[];
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
          <p className="text-[16px] text-[#40A9FF] font-medium">รายละเอียดข้อมูลอุปกรณ์</p>
        </div>

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
              items={departmentList}
              onChange={handleDepartmentChange}
              placeholder="แผนก"
            />
            <DropDown
              value={selectedCategory}
              className="!w-[264px]"
              label="หมวดหมู่"
              items={categoryList}
              onChange={setSelectedCategory}
              placeholder="หมวดหมู่อุปกรณ์"
            />
            <DropDown
              value={selectedSection}
              className="!w-[264px]"
              label="ฝ่ายย่อย"
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
                  <div className="flex flex-col gap-[20px] items-center text-[#A2A2A2]">
                    <Icon icon="famicons:image-sharp" width="48" />
                    <div className="text-[14px] font-medium">
                      <p className="text-[#40A9FF]">อัปโหลดไฟล์ <span className="text-[#A2A2A2]">หรือวางไฟล์ที่นี่</span></p>
                      <p>ประเภทไฟล์ PNG, JPG</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <label className="text-[16px] font-medium">สถานที่เก็บอุปกรณ์</label>
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
        </div>
      </form>

      {/* Serial / Accessories / Approval */}
      <div className="flex flex-col items-center gap-[60px] w-[1540px] px-[100px]">
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