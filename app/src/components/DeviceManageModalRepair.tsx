/**
 * Description: Modal จัดการสถานะอุปกรณ์รายชิ้นในคำร้องแจ้งซ่อม
 * - แสดงตาราง: ลำดับ, รหัสอุปกรณ์, สถานะ dropdown (กำลังซ่อม, ซ่อมเสร็จ, ซ่อมไม่ได้)
 * - ปุ่ม "ยกเลิก" และ "ยืนยัน"
 * Author: Worrawat Namwat (Wave) 66160372
 */
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Button from "./Button";
import DropDown from "./DropDown";
import { AlertDialog } from "./AlertDialog";

export interface RepairDeviceItem {
  id: number;           // ID ของ device_child
  asset_code: string;
  serial_number: string | null;
  current_status: string;
}

export interface RepairDeviceUpdate {
  id: number;
  asset_code: string;
  oldStatus: string;
  status: string;
}

interface DeviceManageModalRepairProps {
  isOpen: boolean;
  onClose: () => void;
  devices: RepairDeviceItem[];
  onConfirm?: (updates: RepairDeviceUpdate[]) => void;
}

const repairStatusItems = [
  { 
    id: "READY", 
    label: "สำเร็จ", 
    value: "READY", 
    textColor: "#52C41A" // สีเขียว
  },
  { 
    id: "DAMAGED", 
    label: "ชำรุด", 
    value: "DAMAGED", 
    textColor: "#FF4D4F" // สีแดง
  },
];

const DeviceManageModalRepair = ({
  isOpen,
  onClose,
  devices,
  onConfirm,
}: DeviceManageModalRepairProps) => {
  
  // State เก็บรายการอุปกรณ์เพื่อนำมาโชว์ในตาราง
  const [localDevices, setLocalDevices] = useState<RepairDeviceItem[]>([]);
  
  // State เก็บ Error (Index ของแถวที่ยังไม่ได้เลือกสถานะ)
  const [errors, setErrors] = useState<number[]>([]);

  // State สำหรับ confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    tone: "success" | "warning" | "danger" | "reject" | "confirm";
    icon?: React.ReactNode;
  }>({
    title: "",
    description: "",
    onConfirm: async () => {},
    tone: "success",
  });

   /**
   * Description: เมื่อ Modal เปิดขึ้นมา จะทำการเซ็ต localDevices ด้วยข้อมูล devices ที่ส่งมาจาก props และรีเซ็ตค่า errors ให้เป็น array ว่าง เพื่อเตรียมพร้อมสำหรับการจัดการสถานะของอุปกรณ์ในตาราง
   * Input : - devices: array (อาร์เรย์ของอุปกรณ์ที่ถูกส่งมาจาก props ซึ่งจะถูกนำมาแสดงในตารางภายใน Modal)
   * Output : void (ฟังก์ชันนี้จะอัปเดต state localDevices ด้วยข้อมูล devices ที่ได้รับ และรีเซ็ต state errors ให้เป็น array ว่างทุกครั้งที่ Modal ถูกเปิดขึ้นมา)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  useEffect(() => {
    if (isOpen) {
      setLocalDevices(devices);
      setErrors([]); // Reset ค่า Error เมื่อเปิด Modal ใหม่
    }
  }, [devices, isOpen]);

   /**
   * Description: ฟังก์ชันสำหรับจัดการการปิด Modal โดยจะทำการรีเซ็ตค่า localDevices และ errors ให้เป็นค่าเริ่มต้น และปิด confirm dialog หากเปิดอยู่ จากนั้นเรียกใช้ onClose เพื่อแจ้งให้พาเรนต์คอมโพเนนต์ทราบว่า Modal ถูกปิดแล้ว
   * Output : void (ฟังก์ชันนี้จะรีเซ็ต state localDevices และ errors ให้เป็นค่าเริ่มต้น และปิด confirm dialog หากเปิดอยู่ จากนั้นเรียกใช้ onClose เพื่อแจ้งให้พาเรนต์คอมโพเนนต์ทราบว่า Modal ถูกปิดแล้ว)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleClose = () => {
    setLocalDevices([]);
    setErrors([]);
    setConfirmOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  /**
   * Description: ฟังก์ชันสำหรับอัปเดตสถานะของอุปกรณ์ใน localDevices เมื่อมีการเลือกสถานะใหม่จาก dropdown โดยจะรับ index ของแถวที่ถูกแก้ไขและสถานะใหม่ที่ถูกเลือกมาเป็นพารามิเตอร์ จากนั้นจะทำการอัปเดตสถานะของอุปกรณ์ใน localDevices ตาม index ที่ระบุ และลบ Error ของแถวนั้นออกจาก state errors หากมีอยู่ เพื่อให้ UI อัปเดตและไม่แสดงข้อความแจ้งเตือนสีแดงอีกต่อไป
   * Input : - index: number (ตำแหน่งของแถวใน localDevices ที่ถูกแก้ไข)
   * Output : void (ฟังก์ชันนี้จะอัปเดตสถานะของอุปกรณ์ใน localDevices ตาม index ที่ระบุ และลบ Error ของแถวนั้นออกจาก state errors หากมีอยู่ เพื่อให้ UI อัปเดตและไม่แสดงข้อความแจ้งเตือนสีแดงอีกต่อไป)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const updateStatus = (index: number, newStatus: string) => {
    // ลบ Error ของแถวนี้ออกเมื่อผู้ใช้เลือกสถานะใหม่แล้ว
    setErrors((prevErrors) => prevErrors.filter((errorIndex) => errorIndex !== index));

    setLocalDevices((prevDevices) =>
      prevDevices.map((localDevice, idx) =>
        idx === index
          ? { ...localDevice, current_status: newStatus }
          : localDevice,
      ),
    );
  };

   /**
   * Description: ฟังก์ชันสำหรับจัดการการคลิกปุ่มยืนยัน โดยจะทำการตรวจสอบว่าใน localDevices มีแถวไหนที่ยังไม่ได้เลือกสถานะหรือไม่ (เช่น ยังเป็นสถานะเริ่มต้นที่ไม่ใช่ READY หรือ DAMAGED) หากพบแถวที่ยังไม่ได้เลือกสถานะ จะทำการเซ็ต state errors ด้วย index ของแถวนั้นเพื่อให้แสดงข้อความแจ้งเตือนสีแดง และหยุดการทำงานของฟังก์ชัน หากทุกแถวถูกเลือกสถานะเรียบร้อยแล้ว จะสร้างข้อมูลอัปเดตทั้งหมดและตั้งค่า confirmData เพื่อเปิด AlertDialog ให้ผู้ใช้ยืนยันการซ่อมอุปกรณ์ก่อนที่จะส่งข้อมูลกลับไปบันทึก
   * Output : void (ฟังก์ชันนี้จะตรวจสอบความถูกต้องของข้อมูลใน localDevices และหากพบข้อผิดพลาดจะแสดงข้อความแจ้งเตือนสีแดง หากข้อมูลถูกต้องทั้งหมดจะเปิด AlertDialog เพื่อยืนยันการซ่อมอุปกรณ์ และเมื่อผู้ใช้ยืนยันแล้วจะเรียกใช้ onConfirm เพื่อส่งข้อมูลอัปเดตกลับไปบันทึก)
   * Author : Worrawat Namwat (Wave) 66160372
   */
  const handleConfirm = () => {
    // ดึงสถานะที่ถูกต้องทั้งหมด (READY, DAMAGED)
    const validStatuses = repairStatusItems.map(item => item.value);
    
    // ตรวจสอบว่ามีแถวไหนที่สถานะยังไม่ถูกเลือก (เช่น ยังเป็น REPAIRING)
    const invalidIndices = localDevices
      .map((device, index) => (!validStatuses.includes(device.current_status) ? index : -1))
      .filter((index) => index !== -1);

    // ถ้าเจอแถวที่ยังไม่เลือก ให้เซ็ต State Error แล้วหยุดทำงาน
    if (invalidIndices.length > 0) {
      setErrors(invalidIndices);
      return; 
    }

    // ถ้าผ่าน Validate หมดแล้ว สร้างข้อมูลเพื่อส่งกลับไปบันทึก
    const allUpdates = localDevices.map((device) => ({
      id: device.id,
      asset_code: device.asset_code,
      oldStatus: "REPAIRING",
      status: device.current_status,
    }));

    setConfirmData({
      title: "ยืนยันการซ่อมอุปกรณ์?",
      description: `การดำเนินการนี้ไม่สามารถกู้คืนได้`,
      tone: "confirm",
      onConfirm: async () => {
        if (onConfirm) {
            onConfirm(allUpdates);
        }
        onClose();
        setConfirmOpen(false);
      },
      icon: (
        <Icon
          icon="material-symbols:box-edit-outline-sharp"
          width="56"
          height="56"
          color="#52C41A"
        />
      ),
    });

    setConfirmOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div
          className="relative bg-white rounded-[16px] shadow-xl w-[95%] max-w-[800px] flex flex-col p-6"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-2">
              รายการอุปกรณ์
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <Icon icon="mdi:close" width="24" height="24" />
            </button>
          </div>

          {/* Table */}
          <div className="">
            {/* Table Header */}
            <div className="border border-[#F5F5F5] rounded-[16px] flex py-3 px-4 md:px-6 sticky top-0 z-10 bg-[#F5F5F5]">
              <div className="w-[100px] md:w-[140px] font-medium text-black">
                ลำดับ
              </div>
              <div className="flex-1 font-medium text-black text-center">รหัสอุปกรณ์</div>
              <div className="w-[180px] font-medium text-black text-center ">
                สถานะ
              </div>
            </div>

            {/* Table Body */}
            <div
              className="mt-3  rounded-xl overflow-y-auto pb-4"
              style={{ maxHeight: "250px" }}
            >
              {localDevices.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  ไม่มีอุปกรณ์
                </div>
              ) : (
                localDevices.map((device, index) => (
                  <div
                    key={`${device.id}-${index}`}
                    className={`flex items-center py-4 px-4 md:px-6 ${index !== localDevices.length - 1 ? "border-b border-[#EAEAEA]" : ""}`}
                  >
                    <div className="w-[100px] md:w-[140px] text-black">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-black font-medium ">
                        {device.serial_number || "-"}
                      </div>
                    </div>
                    
                    {/* ส่วนจัดการ Dropdown และ Validate แจ้งเตือนสีแดง */}
                    <div className="w-[180px] flex flex-col justify-center items-center relative pb-2 pt-2">
                      <div className={`w-full ${errors.includes(index) ? "border border-red-500 rounded-[14px]" : ""}`}>
                        <DropDown
                          items={repairStatusItems}
                          value={
                            repairStatusItems.find(
                              (status) => status.value === device.current_status,
                            ) || null
                          }
                          onChange={(item) => updateStatus(index, item.value)}
                          placeholder="เลือกสถานะ"
                          searchable={false}
                          className="w-full"
                        />
                      </div>
                      
                      {/* ถ้าแถวนี้มี Error ให้แสดงข้อความแจ้งเตือน */}
                      {errors.includes(index) && (
                        <span className="text-red-500 text-[12px] absolute bottom-[-10px]">
                          * กรุณาเลือกผลการซ่อม
                        </span>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-5 gap-3 mt-2 border-t border-[#D9D9D9]">
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              className="rounded-xl font-medium"
              style={{ width: 110, height: 44 }}
            >
              บันทึก
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog (Reusable) */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone= "warning"
        title={confirmData.title}
        description={confirmData.description}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={confirmData.onConfirm}
        width={500}
        padX={30}
      />
    </>
  );
};

export default DeviceManageModalRepair;