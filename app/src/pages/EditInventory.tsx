import { useEffect, useState } from "react";
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
import type { CreateApprovalFlowPayload } from "../services/InventoryService";

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

  // โหลดข้อมูลเมื่อเรนเดอร์หน้าเว็บครั้งแรก
  useEffect(() => {
    fetchDevice();
    fetchLastAssetCode();
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

  // เปลี่ยนสถานะอุปกรณ์
  const handleChangeStatus = (
    id: number,
    status: DeviceChild["dec_status"]
  ) => {
    setDeviceChilds((prev) =>
      prev.map((device) =>
        device.dec_id === id ? { ...device, dec_status: status } : device
      )
    );
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

  /**
   * Description: ฟังก์ชันสำหรับบันทึกอุปกรณ์ลูกที่อยู่ในสถานะ draft
   * Input     : drafts - รายการอุปกรณ์ลูกแบบ draft ที่ผู้ใช้เพิ่ม
   * Output    : 
   *             - สร้างอุปกรณ์ลูกในฐานข้อมูล
   *             - แสดง toast ผลการทำงาน
   *             - โหลดข้อมูลอุปกรณ์ใหม่
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  const handleSaveDraft = async (drafts: DraftDevice[]) => {
    // แปลงข้อมูล draft ให้เป็นรูปแบบ payload
    const payload: CreateDeviceChildPayload[] = drafts.map((draft) => ({
      dec_de_id: Number(parentId),
      dec_serial_number: draft.dec_serial_number?.trim() || null,
      dec_asset_code: draft.dec_asset_code,
      dec_status: draft.dec_status
    }));

    try {
      await DeviceService.createDeviceChild(payload); // เรียกใช้งาน API
      push({ tone: "success", message: "เพิ่มอุปกรณ์ใหม่ในคลังแล้ว!" }); // แสดง toast
      await fetchDevice(); // โหลดข้อมูลใหม่
      await fetchLastAssetCode(); // ดึง asset ล่าสุด
    } catch (error) {
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์" })
    }
  }

   /**
   * Description: ฟังก์ชันสำหรับตรวจสอบ serial number ของอุปกรณ์ลูกแบบ draft
   * Input     : drafts - รายการอุปกรณ์ลูกแบบ draft ที่ผู้ใช้เพิ่ม
   * Output    : ผลการตรวจสอบ true / false
   * Author    : Thakdanai Makmi (Ryu) 66160355
   */
  const isValidateDraft = (drafts: DraftDevice[]) => {
    // ตรวจสอบ serial number ที่มีอยู่แล้ว
    const existingSerials = new Set(
      deviceChilds
        .map(device => device.dec_serial_number?.trim())
        .filter(Boolean)
    );

    // ตรวจสอบ serial number ใน draft
    const draftSerials = drafts
      .map(draft => draft.dec_serial_number?.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    
    // เช็คว่า draft ซ้ำกันเองไหม
    for (const serial of draftSerials) {
      if (seen.has(serial!)) {
        push({ tone: "danger", message: "มีรายการ Serial Number ที่ซ้ำกัน" });
        return false;
      }
      seen.add(serial!);
    }

    // เช็คว่าซ้ำกับของในระบบ
    for (const serial of draftSerials) {
      if (existingSerials.has(serial!)) {
        push({ tone: "danger", message: "Serial Number ซ้ำกับที่มีอยู่" });
        return false;
      }
    }

    return true;
  }

  // ดึงรหัสอุปกรณ์จาก sessionStorage
  const existingDeviceCodes: string[] = JSON.parse(
    sessionStorage.getItem("existingDeviceCodes") ?? "[]"
  );

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
        parentCode={parentDevice?.de_serial_number}
        devicesChilds={deviceChilds}
        onSaveDraft={handleSaveDraft}
        onUpload={handleUploadFile}
        onDelete={handleDeleteDeviceChild}
        onChangeStatus={handleChangeStatus}
        lastAssetCode={lastAssetCode}
        isValidateDraft={isValidateDraft}
      />
    </div>
  );
};

export default EditInventory;
