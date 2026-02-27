import { useEffect, useMemo, useState } from "react";
import MainDeviceModal from "../components/DeviceModal";
import DevicesChilds, { type DraftDevice } from "../components/DevicesChilds";
import { useToast } from "../components/Toast";
import {
  DeviceService,
  type CreateDeviceChildPayload,
  type DeviceChild,
  type GetDeviceWithChildsResponse,
} from "../services/InventoryService";
import { useParams } from "react-router-dom";
import { useInventorys } from "../hooks/useInventory";
import type { CreateApprovalFlowPayload, UpdateDevices } from "../services/InventoryService";

const EditInventory = () => {
  const { id } = useParams();

  // รับจาก navigate





  // ดึง url ปัจจุบัน

  // ข้อมูลอุปกรณ์แม่ที่ส่งมา


  // รหัสอุปกรณ์แม่
  const parentId = id
  console.log(id)
  // เก็บข้อมูลอุปกรณ์แม่
  const [parentDevice, setParentDevice] =
    useState<GetDeviceWithChildsResponse | null>(null);

  // เก็บข้อมูลอุปกรณ์ลูก
  const [deviceChilds, setDeviceChilds] = useState<DeviceChild[]>([]);

  // ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
  // ดึงชื่ออุปกรณ์ที่มีอยู่แล้วจาก sessionStorage
  const existingDeviceNames: string[] = JSON.parse(
    sessionStorage.getItem("existingDeviceNames") ?? "[]"
  );

  const fetchDevice = async () => {
    const device = await DeviceService.getDeviceWithChilds(Number(parentId));
    setParentDevice(device); // เก็บข้อมูลอุปกรณ์แม่เข้า state
    setDeviceChilds(device?.device_childs ?? []); // เก็บข้อมูลอุปกรณ์ลูกเข้า state
  };

  // เก็บข้อมูล asset code ล่าสุดของอุปกรณ์ลูก
  const [lastAssetCode, setLastAssetCode] = useState<string | null>(null);

  /**
  * Description: ฟังก์ชันสำหรับดึงข้อมูล asset code ล่าสุดของอุปกรณ์ลูก
  * Input     : -
  * Output    : asset code ล่าสุดของอุปกรณ์ลูก
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  const fetchLastAssetCode = async () => {
    const lastAsset = await DeviceService.getLastAssetCode(Number(parentId));
    setLastAssetCode(lastAsset.decAssetCode);
  }

  // เก็บข้อมูล status ทั้งหมดของอุปกรณ์ลูก
  const [deviceChildStatus, setDeviceChildStatus] = useState<DeviceChild["dec_status"][]>([]);

  /**
  * Description: ฟังก์ชันสำหรับดึงข้อมูล status ทั้งหมดของอุปกรณ์ลูก
  * Input     : -
  * Output    : status ทั้งหมดของอุปกรณ์ลูก
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  const fetchDeviceChildStatus = async () => {
    const status = await DeviceService.getDeviceChildStatus();
    setDeviceChildStatus(status);
  }

  /**
  * Description: ฟังก์ชันสำหรับแปลงค่า status ของอุปกรณ์ลูก
  * Input     : status - ค่าสถานะของอุปกรณ์ลูก
  * Output    : { label - ชื่อภาษาไทย, color - สี }
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  const getStatus = (status: DeviceChild["dec_status"]) => {
    switch (status) {
      case "READY":
        return { label: "พร้อมใช้งาน", color: "#73D13D" };
      case "BORROWED":
        return { label: "ถูกยืม", color: "#40A9FF" };
      case "DAMAGED":
        return { label: "ชำรุด", color: "#FF4D4F" };
      case "REPAIRING":
        return { label: "กำลังซ่อม", color: "#FF7A45" };
      case "LOST":
        return { label: "สูญหาย", color: "#000000" };
      case "UNAVAILABLE":
        return { label: "ไม่พร้อมใช้งาน", color: "#A0A0A0" };
      default:
        return { label: status, color: "#000000" };
    }
  };

  /**
  * Description: แปลงรายการสถานะให้เป็นรูปแบบ DropDown
  * Input     : deviceChildStatus - รายการสถานะทั้งหมดของอุปกรณ์ลูก
  * Output    : { id - ลำดับ, value - ค่าสถานะ, label - ชื่อสถานะ, textColor - สี }
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  const statusItems = useMemo(() => {
    return deviceChildStatus.map((status, index) => {
      const meta = getStatus(status);
      return {
        id: index + 1,
        value: status,
        label: meta.label,
        textColor: meta.color,
      };
    });
  }, [deviceChildStatus]);

  // โหลดข้อมูลเมื่อเรนเดอร์หน้าเว็บครั้งแรก
  useEffect(() => {
    if (!parentId) return;

    fetchDevice();
    fetchLastAssetCode();
    fetchDeviceChildStatus();
  }, [parentId]);

  // เรียกใช้งาน toast
  const { push } = useToast();

  // ลบอุปกรณ์ลูก
  const handleDeleteDeviceChild = async (ids: number[]) => {
    console.log(parentId);

    await DeviceService.deleteDeviceChild({ dec_id: ids });
    push({ tone: "danger", message: "ลบอุปกรณ์สำเร็จ!" });
    setDeviceChilds((prev) =>
      prev.filter((device) => !ids.includes(device.dec_id))
    );
    await fetchDevice(); // โหลดข้อมูลใหม่
    await fetchLastAssetCode(); // ดึง asset ล่าสุดใหม่
  };

  // อัปโหลดไฟล์อุปกรณ์ลูก
  const handleUploadFile = async (file?: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // เรียกใช้งาน service
      const res = await DeviceService.uploadFileDeviceChild(Number(parentId), formData);
      push({ tone: "success", message: res.message });
      await fetchDevice(); // โหลดข้อมูลใหม่
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "อัปโหลดไฟล์ล้มเหลว";
      push({ tone: "danger", message });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const data = formData.get("data") as string | null;
    if (data === "devices") {
      const isEdit = Boolean(parentId);
      // ใช้ก่อน

      // ลบทิ้งก่อนส่ง backend
      formData.delete("data");

      try {
        await useInventorys.updateDevicesdata(Number(parentId), formData);

        push({
          tone: "confirm",
          message: isEdit ? "แก้ไขข้อมูลอุปกรณ์ในคลังแล้ว!" : "เพิ่มอุปกรณ์ใหม่ในคลังแล้ว!",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500); // หน่วง 1.5 วินาที
      } catch (e) {
        console.log(e);
        push({
          tone: "danger",
          message: isEdit ? "เกิดข้อผิดพลาดในการแก้ไขอุปกรณ์" : "เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์",
        });
      }
    } else if (data === "approve") {
      // ลบทิ้งก่อนส่ง backend
      formData.delete("data");
      console.log("app")
      const payload: CreateApprovalFlowPayload = {
        af_name: String(formData.get("af_name") ?? ""),
        af_us_id: 1,
        approvalflowsstep: JSON.parse(String(formData.get("approvalflowsstep") ?? "[]")),
      };
      try {
        await useInventorys.createApprovedata(payload);
        push({
          tone: "confirm",
          message: "เพิ่มการอนุมัติเรียบร้อยแล้ว",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500); // หน่วง 1.5 วินาที
      } catch (e) {
        console.log(e);
        push({
          tone: "danger",
          message: "ไม่สามารถเพิ่มการอนุมัติ",
        });
      }
    }
  };

  // ดึงรหัสอุปกรณ์จาก sessionStorage
  const existingDeviceCodes: string[] = JSON.parse(
    sessionStorage.getItem("existingDeviceCodes") ?? "[]"
  );

  /**
  * Description: บันทึกการเปลี่ยนแปลงอุปกรณ์ลูก (เพิ่มและแก้ไข)
  * Input     : drafts  - รายการอุปกรณ์ใหม่, updates - รายการอุปกรณ์ที่มีการแก้ไขข้อมูล
  * Output    :
  *             - เพิ่มอุปกรณ์ใหม่ในระบบ
  *             - อัปเดตข้อมูลอุปกรณ์
  *             - โหลดข้อมูลใหม่
  *             - แสดงข้อความแจ้งเตือน
  * Author    : Thakdanai Makmi (Ryu) 66160355
  */
  const handleSaveAll = async (drafts: DraftDevice[], updates: UpdateDevices[]) => {
    try {
      // มีอุปกรณ์ที่ต้องการจะเพิ่ม
      if (drafts.length > 0) {
        // แปลง payload ให้ตรงตาม backend
        const payload: CreateDeviceChildPayload[] = drafts.map((draft) => ({
          dec_de_id: Number(parentId),
          dec_serial_number: draft.dec_serial_number?.trim() || null,
          dec_asset_code: draft.dec_asset_code,
          dec_status: draft.dec_status
        }));
        // เรียก API เพิ่มอุปกรณ์
        await DeviceService.createDeviceChild(payload);
      }

      // มีรายการอุปกรณ์ที่ถูกแก้ไข
      if (updates.length > 0) {
        // เรียก API อัปเดตข้อมูล
        await DeviceService.updateDeviceChild(updates);
      }

      // โหลดข้อมูลใหม่
      await fetchDevice();
      await fetchLastAssetCode();

      push({ tone: "success", message: "บันทึกการเปลี่ยนแปลงเสร็จสิ้น!" });

    } catch (error) {
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการบันทึก" });
    }
  };

  return (
    <div className="flex flex-col gap-[20px] px-[24px] py-[24px]">
      {/* แถบนำทาง */}
      <div className="text-[18px] mb-[8px] space-x-[9px]">
        <span className="text-[#858585]">การจัดการ</span>
        <span className="text-[#858585]">&gt;</span>
        <span className="text-[#858585]">คลังอุปกรณ์</span>
        <span className="text-[#858585]">&gt;</span>
        <span className="text-[#000000]">แก้ไขอุปกรณ์</span>
      </div>
      {/* ชื่อหน้า */}
      <div className="flex items-center gap-[14px] mb-[21px]">
        <h1 className="text-[36px] font-semibold">แก้ไขอุปกรณ์</h1>
      </div>
      <MainDeviceModal
        mode="edit"
        defaultValues={parentDevice}
        onSubmit={(data) => {
          handleSubmit(data);
        }}
        existingDeviceNames={existingDeviceNames}
        existingDeviceCodes={existingDeviceCodes}
      />
      <DevicesChilds
        devicesChilds={deviceChilds}
        onUpload={handleUploadFile}
        onDelete={handleDeleteDeviceChild}
        onSaveAll={handleSaveAll}
        lastAssetCode={lastAssetCode}
        statusItems={statusItems}
      />
    </div>
  );
};

export default EditInventory;
