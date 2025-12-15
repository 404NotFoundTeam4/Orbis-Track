import { useEffect, useState, useRef } from "react";
import DropDown from "./DropDown";
import Input from "./Input";
import Button from "./Button";
import { Icon } from "@iconify/react";
import Checkbox from "./Checkbox";
import QuantityInput from "./QuantityInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrash } from "@fortawesome/free-solid-svg-icons";
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

// โครงสร้างข้อมูลของแผนก
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
  approvers: ApproverItem[];
}
// ข้อมูลแผนกใน dropdown
const departmentList: Department[] = [
  { id: 1, label: "Media", value: 1 },
  { id: 2, label: "Design", value: 2 },
  { id: 3, label: "Marketing", value: 3 },
];

// ข้อมูลหมวดหมู่ใน dropdown
const categoryList: Category[] = [
  { id: 1, label: "อิเล็กทรอนิกส์", value: 1 },
  { id: 2, label: "เครื่องใช้ไฟฟ้า", value: 2 },
  { id: 3, label: "อำนวยความสะดวก", value: 3 },
];

// ข้อมูลหมวดฝ่ายย่อยใน dropdown
const sectionList: Section[] = [
  { id: 1, label: "A", value: 1 },
  { id: 2, label: "B", value: 2 },
  { id: 3, label: "C", value: 3 },
];

const approvalGroups: Approver[] = [
  {
    id: 1,
    label: "ABC",
    value: 1,
    approvers: [
      { id: 101, label: "หัวหน้าแผนก A", order: 1 },
      { id: 102, label: "หัวหน้าแผนก B", order: 2 },
      { id: 103, label: "หัวหน้าแผนก C", order: 3 },
    ],
  },
  {
    id: 2,
    label: "XY",
    value: 2,
    approvers: [
      { id: 201, label: "หัวหน้าแผนก X", order: 1 },
      { id: 202, label: "หัวหน้าแผนก Y", order: 2 },
    ],
  },
];

interface MainDeviceModalProps {
  mode: "create" | "edit";
  defaultValues?: any; // สำหรับ edit
  onSubmit: (data: any) => void;
}

const MainDeviceModal = ({
  mode,
  defaultValues,
  onSubmit,
}: MainDeviceModalProps) => {
  // รายละเอียดอุปกรณ์
  const [deviceName, setDeviceName] = useState<string>("");
  const [deviceCode, setDeviceCode] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [maxBorrowDays, setMaxBorrowDays] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);

  // รูปภาพอุปกรณ์
  const [preview, setPreview] = useState<string | null>(null);
  // มีการเลือกไฟล์รูปภาพ
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // เลือกเฉพาะไฟล์แรกที่อัปโหลด
    if (!file) return;
    const url = URL.createObjectURL(file); // แปลงเป็น url
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

    const file = e.dataTransfer.files?.[0]; // เลือกเฉพาะไฟล์แรกที่อัปโหลด
    if (!file) return;

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

  // modal สำหรับจัดการลำดับการอนุมัติ
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(true);
  const [approverGroupFlow, setapproverGroupFlow] = useState([]);
  const handleApproverGroup = (item) => {
    setapproverGroupFlow(
      (prev) =>
        prev.some((v) => v.value === item.value)
          ? prev // มีอยู่แล้ว → คงเดิม
          : [...prev, item] // ยังไม่มี → เพิ่ม
    );
  };
  const handleDeleteApproverGroup = (value) => {
  setapproverGroupFlow((prev) =>
    prev.filter((item) => item.label !== value)
  );
};

console.log(approverGroupFlow)
  // เปิด modal
  const openApproverModal = () => {
    // ถ้ามี selectedApprovers ให้เอามาเป็นค่าเริ่มต้นของ modal ถ้าไม่มีก็ว่าง
    setModalApproverList(
      selectedApprovers ? [...selectedApprovers.approvers] : []
    );
    setModalGroupLabel(selectedApprovers?.label ?? "");
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

  const [serialNumbers, setSerialNumbers] = useState([{ id: 1, value: "" }]);

  // เพิ่ม Input Serial Number
  const addSerial = () => {
    setSerialNumbers([...serialNumbers, { id: Date.now(), value: "" }]);
  };

  // อัปเดตค่า Serial
  const updateSerial = (id: number, newValue: string) => {
    setSerialNumbers(
      serialNumbers.map((item) =>
        item.id === id ? { ...item, value: newValue } : item
      )
    );
  };

  // ลบ Input Serial
  const removeSerial = (id: number) => {
    setSerialNumbers(serialNumbers.filter((item) => item.id !== id));
  };

  const [accessories, setAccessories] = useState([
    { id: 1, name: "", qty: "" },
  ]);
  
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
  };

  // ลบ Input อุปกรณ์เสริม
  const removeAccessory = (id: number) => {
    setAccessories((prev) => prev.filter((item) => item.id !== id));
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
      setSelectedDepartment(defaultValues.department ?? null);
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

  // ส่งข้อมูล
  const handleSubmit = () => {
    const payload = {
      device_name: deviceName,
      device_code: deviceCode,
      department: selectedDepartment,
      category: selectedCategory,
      section: selectedSection,
      location,
      maxBorrowDays,
      totalQuantity,
      description,
      serialNumbers,
      accessories,
      approverGroup: selectedApprovers,
      imageUrl: preview,
    };

    onSubmit(payload);
  };

  const dragItemIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(index));
    } catch {}
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDragOverStep = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropStep = (e: React.DragEvent) => {
    e.preventDefault();
    const from =
      dragItemIndex.current ?? Number(e.dataTransfer.getData("text/plain"));
    const to = dragOverIndex.current;
    if (from == null || to == null || from === to) {
      dragItemIndex.current = dragOverIndex.current = null;
      return;
    }

    setapproverGroupFlow((prev) => {
      const newArr = [...prev];
      const [moved] = newArr.splice(from, 1);
      // ถ้าลากจากตำแหน่งก่อน -> หลัง ให้ adjust index
      const insertIndex = from < to ? to - 1 : to;
      newArr.splice(insertIndex, 0, moved);
      return newArr;
    });

    dragItemIndex.current = dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    dragItemIndex.current = dragOverIndex.current = null;
  };

  // ปุ่มลบ — เอา item ที่มี value ตรงกับที่กดออก
  const handleDelete = (e: React.MouseEvent, value: number) => {
    // หยุด propagation เพื่อไม่ให้เกิด drag/drop หรือ onClick ของ parent
    e.stopPropagation();
    setapproverGroupFlow((prev) => prev.filter((g) => g.value !== value));
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
              />
            </div>
          </div>
          {/* แผนก / หมวดหมู่ / ฝ่ายย่อย */}
          <div className="flex gap-[20px]">
            <DropDown
              value={selectedDepartment}
              className="!w-[264px]"
              label="แผนกอุปกรณ์"
              items={departmentList}
              onChange={(item) => setSelectedDepartment(item)}
              placeholder="แผนก"
            />
            <DropDown
              value={selectedCategory}
              className="!w-[264px]"
              label="หมวดหมู่"
              items={categoryList}
              onChange={(item) => setSelectedCategory(item)}
              placeholder="หมวดหมู่อุปกรณ์"
            />
            <DropDown
              value={selectedSection}
              className="!w-[264px]"
              label="ฝ่ายย่อย"
              items={sectionList}
              onChange={(item) => setSelectedSection(item)}
              placeholder="ฝ่ายย่อย"
            />
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
              สถานที่เก็บอุปกรณ์
            </label>
            <textarea
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-[#D8D8D8] rounded-[16px] w-[833px] h-[140px] px-[15px] py-[8px]"
              placeholder="สถานที่เก็บอุปกรณ์"
            ></textarea>
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

      {/* Serail Number / อุปกรณ์เสริม / ลำดับการอนุมัติ */}
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
              <p>อุปกรณ์มี Serail Number</p>
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
          <div className="flex flex-col gap-[15px] h-full">
            <div className="flex gap-3 items-end">
              <DropDown
                value={selectedApprovers}
                className="w-[663px]"
                label="ลำดับการอนุมัติ"
                items={approvalGroups}
                onChange={handleSelectApprover}
                placeholder="ลำดับการอนุมัติ"
              />
              <Button
                className="bg-[#1890FF] w-[173px]"
                onClick={openApproverModal}
              >
                + เพิ่มลำดับการอนุมัติ
              </Button>
            </div>
            {
              // เลือกลำดับการอนุมัติ
              selectedApprovers && (
                <div className="flex items-center gap-[9px]">
                  {selectedApprovers.approvers.map((appr, index) => (
                    <div key={appr.id} className="flex items-center gap-2">
                      <span className="text-[16px] text-[#7BACFF]">
                        {appr.label}
                      </span>
                      {index < selectedApprovers.approvers.length - 1 && (
                        <span className="text-[16px] text-[#7BACFF]">›</span>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end gap-[20px]">
        <Button className="bg-[#D8D8D8] border border-[#CDCDCD] text-black hover:bg-gray-200">
          ยกเลิก
        </Button>
        <Button onClick={handleSubmit} className="bg-[#1890FF]">
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
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
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
                      items={departmentList}
                      onChange={handleApproverGroup}
                      placeholder="แผนก"
                    />
                    <DropDown
                      value={selectedDepartment}
                      className="max-w-[166px]"
                      label=""
                      items={departmentList}
                      onChange={handleApproverGroup}
                      placeholder="แผนก"
                    />
                    <DropDown
                      value={selectedSection}
                      className="max-w-[166px]"
                      label=""
                      items={departmentList}
                      onChange={handleApproverGroup}
                      placeholder="ฝ่ายย่อย"
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
                  <div className=" space-y-2.5 text-[16px]">
                    {approverGroupFlow.map((g, idx) => (
                      <div
                        key={g.value}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnter={(e) => handleDragEnter(e, idx)}
                        onDragOver={handleDragOverStep}
                        onDrop={handleDropStep}
                        onDragEnd={handleDragEnd}
                        className="flex"
                      >
                        <div className="m-2.5">
                          <FontAwesomeIcon
                            icon={faBars}
                            className="text-[13px]"
                          />
                        </div>
                        <div className="flex items-center  overflow-hidden w-full">
                          <div className="border-2 border-[#D8D8D8] border-r-0 rounded-l-2xl px-[15px] py-[9px]">
                            {idx + 1}
                          </div>
                          <div className="w-full border-2 border-[#D8D8D8] border-x-0 py-[9px]">
                            {g.label}
                          </div>
                          <button type="button" 
                           onClick={() => handleDeleteApproverGroup(g.label)}
                          className="border-2 border-[#F5222D] border-l-0 rounded-r-2xl p-[9px] bg-[#F5222D] ">
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
                <Button className="bg-[#1890FF]">บันทึก</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDeviceModal;
