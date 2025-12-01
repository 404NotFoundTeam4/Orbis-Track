import { useEffect, useState } from "react";
import DropDown from "./DropDown";
import QuantityInput from "./QuantityInput";
import Input from "./Input";
import Button from "./Button";
import { Icon } from "@iconify/react";
import Checkbox from "./Checkbox";

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
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // แผนกท่ีเลือกใน dropdown
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  // หมวดหมู่ท่ีเลือกใน dropdown
  const [selectedCategory, setSelectedCategory] = useState<Department | null>(
    null,
  );
  // ฝ่ายย่อยท่ีเลือกใน dropdown
  const [selectedSection, setSelectedSection] = useState<Department | null>(
    null,
  );
  // ลำดับการอนุมัติ
  const [selectedApprovers, setSelectedApprovers] = useState<Approver | null>(
    null,
  );
  // เลือกลำดับการอนุมัติ
  const handleSelectApprover = (item: Approver) => {
    setSelectedApprovers(item);
  };

  // อุปกรณ์มี Serial Number
  const [checked, setChecked] = useState(true);

  const [serialNumbers, setSerialNumbers] = useState([{ id: 1, value: "" }]);

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

  const [accessories, setAccessories] = useState([
    { id: 1, name: "", qty: "" },
  ]);

  // เพิ่ม Input อุปกรณ์เสริม
  const addAccessory = () => {
    setAccessories([...accessories, { id: Date.now(), name: "", qty: "" }]);
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

  // ค่าเริ่มต้น edit
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      // รูปภาพ
      setPreview(defaultValues.imageUrl ?? null);

      // Input text
      setDeviceName(defaultValues.device_name ?? "");
      setDeviceCode(defaultValues.device_code ?? "");
      setLocation(defaultValues.location ?? "");
      setDescription(defaultValues.description ?? "");

      // จำนวน
      setMaxBorrowDays(defaultValues.maxBorrowDays ?? 0);
      setTotalQuantity(defaultValues.totalQuantity ?? 0);

      // Dropdown
      setSelectedDepartment(defaultValues.department ?? null);
      setSelectedCategory(defaultValues.category ?? null);
      setSelectedSection(defaultValues.section ?? null);

      // Serial Numbers
      if (defaultValues.serialNumbers?.length > 0) {
        setChecked(true);
        setSerialNumbers(defaultValues.serialNumbers);
      } else {
        setChecked(false);
      }

      // อุปกรณ์เสริม
      setAccessories(defaultValues.accessories ?? []);

      // ลำดับการอนุมัติ
      setSelectedApprovers(defaultValues.approverGroup ?? null);
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

  return (
    <div className="flex flex-col gap-[60px] bg-white border border-[#BFBFBF] w-[1660px] max-h-[1407px] rounded-[16px] px-[60px] py-[60px]">
      {/* ข้อมูลอุปกรณ์ / แบบฟอร์ม */}
      <div className="flex justify-between px-[60px] py-[60px]">
        {/* ข้อมูลอุปกรณ์ */}
        <div className="flex flex-col gap-[7px]">
          <p className="text-[20px] font-medium">ข้อมูลอุปกรณ์</p>
          <p className="text-[16px] text-[#858585] font-medium">
            รายละเอียดข้อมูลอุปกรณ์
          </p>
          {/* รูปภาพ */}
          <div className="flex flex-col gap-[7px]">
            {/* Preview */}
            <div className="flex items-center justify-center border border-[#D9D9D9] rounded-[16px] w-[538px] h-[225.32px]">
              {preview ? (
                <img
                  className="w-full h-full object-cover rounded-[16px]"
                  src={preview}
                />
              ) : (
                <Icon
                  icon="famicons:image-sharp"
                  width="62"
                  height="62"
                  className="text-[#A2A2A2]"
                />
              )}
            </div>
            {/* Upload */}
            <label className="border border-[#D9D9D9] rounded-[16px] w-[538px] h-[63.2px] text-[16px] font-medium px-[16px] py-[8px] flex items-center justify-center cursor-pointer">
              อัปโหลดรูปภาพ
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          {/* จำนวนวันสูงสุดที่สามารถยืมได้ / จำนวนอุปกรณ์ */}
          <div className="flex gap-5">
            <QuantityInput
              label="จำนวนวันสูงสุดที่สามารถยืมได้"
              value={maxBorrowDays}
              onChange={(value: number) => setMaxBorrowDays(value)}
            />
            <QuantityInput
              label="จำนวนอุปกรณ์"
              value={totalQuantity}
              onChange={(value: number) => setTotalQuantity(value)}
            />
          </div>
        </div>

        {/* กรอกรายละเอียดอุปกรณ์ */}
        <div className="flex flex-col gap-[7px] w-[672px]">
          <div className="flex gap-[20px]">
            {/* ชื่ออุปกรณ์ */}
            <div className="flex flex-col gap-[4px]">
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                label="ชื่ออุปกรณ์"
                placeholder="ชื่อของอุปกรณ์"
                size="md"
                className="!w-[425px]"
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
                className="!w-[207px]"
              />
            </div>
          </div>
          {/* แผนก / หมวดหมู่ / ฝ่ายย่อย */}
          <div className="flex gap-[20px]">
            <DropDown
              value={selectedDepartment}
              className="!w-[204px]"
              label="แผนกอุปกรณ์"
              items={departmentList}
              onChange={(item) => setSelectedDepartment(item)}
              placeholder="แผนก"
            />
            <DropDown
              value={selectedCategory}
              className="!w-[204px]"
              label="หมวดหมู่"
              items={categoryList}
              onChange={(item) => setSelectedCategory(item)}
              placeholder="หมวดหมู่อุปกรณ์"
            />
            <DropDown
              value={selectedSection}
              className="!w-[204px]"
              label="ฝ่ายย่อย"
              items={sectionList}
              onChange={(item) => setSelectedSection(item)}
              placeholder="ฝ่ายย่อย"
            />
          </div>
          {/* สถานที่เก็บอุปกรณ์ */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[16px]">สถานที่เก็บอุปกรณ์</label>
            <textarea
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-[#D8D8D8] rounded-[16px] w-[652px] h-[111px] px-[15px] py-[8px]"
              placeholder="สถานที่เก็บอุปกรณ์"
            ></textarea>
          </div>
          {/* รายละเอียดอุปกรณ์ */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[16px]">รายละเอียดอุปกรณ์</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[#D8D8D8] rounded-[16px] w-[652px] h-[111px] px-[15px] py-[8px]"
              placeholder="รายละเอียดอุปกรณ์"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Serail Number / อุปกรณ์เสริม / ลำดับการอนุมัติ */}
      <div className="flex flex-col gap-[20px] px-[60px]">
        {/* checkbox อุปกร์มี Serail Number */}
        <div className="flex items-center gap-2 h-[46px]">
          <Checkbox isChecked={checked} onClick={() => setChecked(!checked)} />
          <p>อุปกรณ์มี Serail Number</p>
        </div>

        {/* อุปกรณ์ที่มี Serail Number */}
        {checked && (
          <div className="flex items-start gap-[110px] min-h-[132px]">
            <div className="flex flex-col gap-[7px] w-[212px] self-start">
              <p>อุปกรณ์ที่มี Serail Number</p>
              <p className="text-[#858585]">รหัสของอุปกรณ์</p>
            </div>
            <div className="flex flex-col gap-[15px] h-full">
              <div className="flex gap-3">
                <div className="border border-[#D8D8D8] rounded-[16px] text-[16px] font-medium w-[663px] px-3 py-2">
                  Serial Number
                </div>
                <Button className="bg-[#1890FF] w-[173px]" onClick={addSerial}>
                  + Serail Number
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

        {/* อุปกรณ์เสริม */}
        <div className="flex items-start gap-[110px] min-h-[132px]">
          <div className="flex flex-col gap-[7px] w-[212px] self-start">
            <p>อุปกรณ์เสริม</p>
            <p className="text-[#858585]">ข้อมูลของอุปกรณ์เสริม</p>
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
        <div className="flex items-start gap-[110px] min-h-[132px]">
          <div className="flex flex-col gap-[7px] w-[212px] self-start">
            <p>ลำดับการอนุมัติ</p>
            <p className="text-[#858585]">ลำดับผู้อนุมัติของอุปกรณ์</p>
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
              <Button className="bg-[#1890FF] w-[173px]">
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
    </div>
  );
};

export default MainDeviceModal;
