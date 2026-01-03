/**
 * Description: Modal จัดการอุปกรณ์ในคำร้อง
 * - แสดงตาราง: ลำดับ, รหัสอุปกรณ์, สถานะ dropdown, ปุ่มลบ
 * - ปุ่ม "+ เพิ่มอุปกรณ์" และ "ยืนยัน"
 * Input : DeviceManageModalProps
 * Output : React Component (Modal)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  ticketsService,
  type TicketDetailDates,
  type TicketDevice,
  type TicketDeviceSummary,
} from "../services/TicketsService";
import Button from "./Button";
import DropDown from "./DropDown";
import DeviceSelectModal from "./DeviceSelectModal";
import { useToast } from "./Toast";
import { AlertDialog } from "./AlertDialog";

interface DeviceManageModalProps {
  deviceSummary: TicketDeviceSummary;
  isOpen: boolean;
  onClose: () => void;
  devices: TicketDevice[];
  ticketDate?: TicketDetailDates | undefined;
  onConfirm?: (devices: TicketDevice[], changes: DeviceChildChanges) => void;
}

interface DeviceChildAddRemove {
  id: number;
  status?: string;
}

interface DeviceChildUpdate {
  id: number;
  oldStatus: string;
  status: string;
  note?: string;
}

export interface DeviceChildChanges {
  devicesToAdd: DeviceChildAddRemove[];
  devicesToRemove: DeviceChildAddRemove[];
  devicesToUpdate: DeviceChildUpdate[];
}

// Status options for manage dropdown (IN_USE tickets)
const statusItems = [
  {
    id: "BORROWED",
    label: "กำลังใช้งาน",
    value: "BORROWED",
    textColor: "#73D13D",
  },
  { id: "DAMAGED", label: "ชำรุด", value: "DAMAGED", textColor: "#FF4D4F" },
  { id: "LOST", label: "สูญหาย", value: "LOST", textColor: "#FF7A45" },
];

const DeviceManageModal = ({
  deviceSummary,
  isOpen,
  onClose,
  devices,
  ticketDate,
  onConfirm,
}: DeviceManageModalProps) => {
  const { push } = useToast();
  const [localDevices, setLocalDevices] = useState<TicketDevice[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [deviceChildLength, setDeviceChildLength] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<TicketDevice[]>([]);
  const [updateDeviceChild, setUpdateDeviceChild] =
    useState<DeviceChildChanges>({
      devicesToAdd: [],
      devicesToRemove: [],
      devicesToUpdate: [],
    });

  // เก็บ device ที่ถูกลบ (เฉพาะตัวเดิมที่มีอยู่ก่อน) เพื่อแสดงในรายการ "เลือกอุปกรณ์"
  const [removedOriginalDevices, setRemovedOriginalDevices] = useState<
    TicketDevice[]
  >([]);

  // State สำหรับ confirm dialog (reusable)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    onCancel?: () => void;
    tone: "success" | "warning" | "danger" | "reject" | "confirm";
    icon?: React.ReactNode;
  }>({
    title: "",
    description: "",
    onConfirm: async () => {},
    onCancel: undefined,
    tone: "success",
  });

  /**
   * Description: Reset state ที่เกี่ยวกับการจัดการอุปกรณ์ทั้งหมด
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const resetStates = () => {
    setUpdateDeviceChild({
      devicesToAdd: [],
      devicesToRemove: [],
      devicesToUpdate: [],
    });
    setRemovedOriginalDevices([]);
    setAvailableDevices([]);
  };

  /**
   * Description: Sync local state เมื่อเปิด modal หรือ devices prop เปลี่ยน
   * Input      : devices (TicketDevice[]), isOpen (boolean)
   * Output     : void - อัปเดต localDevices และ reset states
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  useEffect(() => {
    if (isOpen) {
      setLocalDevices(devices);
      resetStates();
    }
  }, [devices, isOpen]);

  /**
   * Description: อัปเดต deviceChildLength เมื่อ localDevices เปลี่ยน
   * Input      : localDevices (TicketDevice[]) - รายการอุปกรณ์ปัจจุบัน
   * Output     : void - อัปเดตจำนวน device childs
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  useEffect(() => {
    setDeviceChildLength(localDevices.length - 1);
  }, [localDevices]);

  /**
   * Description: Clear state ทั้งหมดและปิด Modal
   * Author    : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleClose = () => {
    setLocalDevices([]);
    resetStates();
    setConfirmOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  /**
   * Description: อัปเดตสถานะอุปกรณ์ใน dropdown (BORROWED, DAMAGED, LOST)
   * Input      : index (number) - ตำแหน่งใน array, newStatus (string) - สถานะใหม่
   * Output     : void - อัปเดต localDevices และ devicesToUpdate
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const updateStatus = (index: number, newStatus: string) => {
    const deviceToUpdate = localDevices[index];
    const isNotInUpdateList = !updateDeviceChild.devicesToUpdate.some(
      (deviceUpdate) => deviceUpdate.id === localDevices[index].child_id,
    );

    if (isNotInUpdateList) {
      setUpdateDeviceChild((prev) => ({
        ...prev,
        devicesToUpdate: [
          ...prev.devicesToUpdate,
          {
            id: deviceToUpdate.child_id,
            oldStatus: deviceToUpdate.current_status,
            status: newStatus,
          },
        ],
      }));
    } else {
      setUpdateDeviceChild((prev) => ({
        ...prev,
        devicesToUpdate: prev.devicesToUpdate.map((deviceUpdate) =>
          deviceUpdate.id === deviceToUpdate.child_id
            ? { ...deviceUpdate, status: newStatus }
            : deviceUpdate,
        ),
      }));
    }

    setLocalDevices((prev) =>
      prev.map((localDevice, idx) =>
        idx === index
          ? { ...localDevice, current_status: newStatus }
          : localDevice,
      ),
    );
  };

  /**
   * Description: เปิด confirm dialog ก่อนลบอุปกรณ์ออกจากรายการ
   * Input      : index (number) - ตำแหน่งอุปกรณ์ที่จะลบ
   * Output     : void - เปิด AlertDialog และจัดการ state เมื่อยืนยัน
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleDeleteClick = (index: number) => {
    const device = localDevices[index];

    setConfirmData({
      title: "คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์?",
      description: `อุปกรณ์ "${device.asset_code}" จำถูกนำออกจากรายการ`,
      tone: "reject",
      onConfirm: async () => {
        const deviceToRemove = localDevices[index];

        const isDeviceAddedInThisSession = updateDeviceChild.devicesToAdd.some(
          (deviceAdd) => deviceAdd.id === deviceToRemove.child_id,
        );

        if (isDeviceAddedInThisSession) {
          // ถ้าเป็นตัวที่เพิ่งเพิ่มมาใหม่ ลบออกจาก devicesToAdd เท่านั้น
          setUpdateDeviceChild((prev) => ({
            ...prev,
            devicesToAdd: prev.devicesToAdd.filter(
              (deviceAdd) => deviceAdd.id !== deviceToRemove.child_id,
            ),
            devicesToUpdate: prev.devicesToUpdate.filter(
              (deviceUpdate) => deviceUpdate.id !== deviceToRemove.child_id,
            ),
          }));
        } else {
          // ถ้าเป็นตัวเดิม เพิ่มเข้า devicesToRemove และ removedOriginalDevices
          setUpdateDeviceChild((prev) => ({
            ...prev,
            devicesToRemove: [
              ...prev.devicesToRemove,
              {
                id: deviceToRemove.child_id,
                status: deviceToRemove.current_status,
              },
            ],
            devicesToUpdate: prev.devicesToUpdate.filter(
              (deviceUpdate) => deviceUpdate.id !== deviceToRemove.child_id,
            ),
          }));

          // เพิ่มเข้า removedOriginalDevices เพื่อแสดงในรายการ "เลือกอุปกรณ์" (เฉพาะที่สถานะ READY เท่านั้น)
          setRemovedOriginalDevices((prev) => [...prev, { ...deviceToRemove }]);
        }

        setLocalDevices((prev) => prev.filter((_, idx) => idx !== index));

        // แสดง toast
        push({
          tone: "danger",
          message: "นำอุปกรณ์ออกจากรายการแล้ว",
        });

        // ปิด dialog
        setConfirmOpen(false);
      },
    });
    setConfirmOpen(true);
  };

  /**
   * Description: เพิ่มอุปกรณ์ที่เลือกจาก DeviceSelectModal เข้า localDevices
   * Input      : newDevices (TicketDevice[]) - รายการอุปกรณ์ที่เลือก
   * Output     : void - อัปเดต localDevices และ devicesToAdd
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleAddDevices = (newDevices: TicketDevice[]) => {
    const existingChildIds = new Set(
      localDevices.map((device) => device.child_id),
    );
    const uniqueNewDevices = newDevices.filter(
      (newDevice) => !existingChildIds.has(newDevice.child_id),
    );

    if (uniqueNewDevices.length === 0) {
      setIsSelectModalOpen(false);
      return;
    }

    // เช็คว่า device ที่เพิ่มกลับมาเคยอยู่ใน removedOriginalDevices หรือไม่
    const addedBackChildIds = new Set(
      uniqueNewDevices
        .filter((newDevice) =>
          removedOriginalDevices.some(
            (removedDevice) => removedDevice.child_id === newDevice.child_id,
          ),
        )
        .map((newDevice) => newDevice.child_id),
    );

    // ถ้าเคยถูกลบและเพิ่มกลับ → ลบออกจาก removedOriginalDevices และ devicesToRemove
    if (addedBackChildIds.size > 0) {
      setRemovedOriginalDevices((prev) =>
        prev.filter(
          (removedDevice) => !addedBackChildIds.has(removedDevice.child_id),
        ),
      );
      setUpdateDeviceChild((prev) => ({
        ...prev,
        devicesToRemove: prev.devicesToRemove.filter(
          (deviceRemove) => !addedBackChildIds.has(deviceRemove.id),
        ),
      }));
    }

    // เพิ่ม device ที่เป็นของใหม่จริงๆ เข้า devicesToAdd (ไม่รวมตัวที่เคยถูกลบแล้วเพิ่มกลับ)
    const trulyNewDevices = uniqueNewDevices.filter(
      (newDevice) => !addedBackChildIds.has(newDevice.child_id),
    );

    setLocalDevices((prev) => [
      ...prev,
      ...uniqueNewDevices.map((newDevice) => ({
        ...newDevice,
        current_status: "BORROWED",
      })),
    ]);

    if (trulyNewDevices.length > 0) {
      setUpdateDeviceChild((prev) => ({
        ...prev,
        devicesToAdd: [
          ...prev.devicesToAdd,
          ...trulyNewDevices.map((newDevice) => ({ id: newDevice.child_id })),
        ],
      }));
    }

    setIsSelectModalOpen(false);
  };

  /**
   * Description: ดึงรายการอุปกรณ์ที่ว่างจาก API และเปิด DeviceSelectModal
   * Input      : void
   * Output     : Promise<void> - เรียก API และเปิด modal
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleAddDevicesButton = async () => {
    const result = await ticketsService.getDeviceAvailable({
      deviceId: deviceSummary?.deviceId,
      deviceChildIds: localDevices.map((ld) => ld.child_id),
      startDate: ticketDate?.start || "",
      endDate: ticketDate?.end || "",
    });

    // รวม device ที่ถูกลบ (removedOriginalDevices) เข้าไปด้วย
    // กรองเฉพาะตัวที่ยังไม่ได้ถูกเพิ่มกลับเข้า localDevices และสถานะไม่ใช่ ชำรุด/สูญหาย
    const currentChildIds = new Set(
      localDevices.map((device) => device.child_id),
    );
    const filteredRemovedDevices = removedOriginalDevices.filter(
      (removedDevice) =>
        !currentChildIds.has(removedDevice.child_id) &&
        removedDevice.current_status !== "DAMAGED" &&
        removedDevice.current_status !== "LOST",
    );

    setAvailableDevices([...result, ...filteredRemovedDevices]);
    setIsSelectModalOpen(true);
  };

  /**
   * Description: ตรวจสอบว่าเป็น index สุดท้ายหรือไม่ (สำหรับ styling)
   * Input      : currIndex (number), lengthDeviceChild (number)
   * Output     : boolean
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const checkLastIndex = (currIndex: number, lengthDeviceChild: number) => {
    return currIndex === lengthDeviceChild;
  };

  /**
   * Description: เปิด confirm dialog สำหรับยืนยันการบันทึกการเปลี่ยนแปลง
   * Input      : void
   * Output     : void - เปิด AlertDialog และเรียก onConfirm เมื่อยืนยัน
   * Author     : Pakkapon Chomchoey (Tonnam) 66160080
   */
  const handleConfirm = () => {
    setConfirmData({
      title: "ยืนยันการบันทึก?",
      description: `ระบบจะบันทึกการเปลี่ยนแปลงทั้งหมดที่คุณทำไว้`,
      tone: "confirm",
      onConfirm: async () => {
        onConfirm?.(localDevices, updateDeviceChild);
        onClose();
        // ปิด dialog
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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div
          className="relative bg-white rounded-[16px] shadow-xl w-[95%] max-w-[900px] flex flex-col p-6"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-black">
              รายการอุปกรณ์
            </h2>
            <Button
              variant="primary"
              onClick={() => handleAddDevicesButton()}
              className={"rounded-xl"}
              style={{ width: 130, height: 46 }}
            >
              + เพิ่มอุปกรณ์
            </Button>
          </div>

          {/* Table */}
          <div className="">
            {/* Table Header */}
            <div className="border border-[#D9D9D9] rounded-xl flex py-3 px-4 md:px-6 sticky top-0 z-10">
              <div className="w-[100px] md:w-[140px] font-medium text-black">
                ลำดับ
              </div>
              <div className="flex-1 font-medium text-black">รหัสอุปกรณ์</div>
              <div className="w-[140px] md:w-[180px] font-medium text-black text-left">
                สถานะ
              </div>
              <div className="w-[80px] md:w-[100px] font-medium text-black text-end">
                จัดการ
              </div>
            </div>

            {/* Table Body */}
            <div
              className="mt-3 border border-[#D9D9D9] rounded-xl overflow-y-auto"
              style={{ maxHeight: "220px" }}
            >
              {localDevices.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  ไม่มีอุปกรณ์
                </div>
              ) : (
                localDevices.map((device, index) => (
                  <div
                    key={`${device.child_id}-${index}`}
                    className={`flex items-center py-4 px-4 md:px-6 ${!checkLastIndex(index, deviceChildLength) ? "border-b border-[#D9D9D9]" : "rounded-xl"}`}
                  >
                    <div className="w-[100px] md:w-[140px] text-black">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-black font-medium">
                        {device.asset_code}
                      </div>
                      <div className="text-sm text-black">
                        Serial no. {device.serial || "-"}
                      </div>
                    </div>
                    <div className="w-[140px] md:w-[180px] flex justify-start">
                      <DropDown
                        items={statusItems}
                        value={
                          statusItems.find(
                            (status) => status.value === device.current_status,
                          ) || null
                        }
                        onChange={(item) => updateStatus(index, item.value)}
                        placeholder="สถานะ"
                        searchable={false}
                        className="w-[130px]"
                      />
                    </div>
                    <div className="w-[80px] md:w-[100px] flex justify-end">
                      <button
                        onClick={() => handleDeleteClick(index)}
                        className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <Icon
                          icon="solar:trash-bin-trash-outline"
                          width="25"
                          height="25"
                          color="white"
                        />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-5">
            <Button
              variant="primary"
              onClick={handleConfirm}
              className={"rounded-xl"}
              style={{ width: 105, height: 46 }}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog (Reusable) */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone={confirmData.tone}
        title={confirmData.title}
        description={confirmData.description}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={confirmData.onConfirm}
        onCancel={() => {
          confirmData.onCancel?.();
          setConfirmOpen(false);
        }}
        width={700}
        padX={43}
        icon={confirmData.icon}
      />

      {/* DeviceSelectModal */}
      <DeviceSelectModal
        availableDeviceChilds={availableDevices}
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onConfirm={handleAddDevices}
      />
    </>
  );
};

export default DeviceManageModal;
