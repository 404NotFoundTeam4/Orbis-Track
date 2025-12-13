import { useEffect, useState } from "react"
import MainDeviceModal from "../components/DeviceModal"
import DevicesChilds from "../components/DevicesChilds"
import { useToast } from "../components/Toast";
import { DeviceService, type DeviceChild, type GetDeviceWithChildsResponse } from "../services/InventoryService";
import { useParams } from "react-router-dom";

const Inventory = () => {
  // ดึง parent id จาก URL
  const { id } = useParams();
  const parentId = Number(id);

  // เก็บข้อมูลอุปกรณ์แม่
  const [parentDevice, setParentDevice] = useState<GetDeviceWithChildsResponse | null>(null);
  // เก็บข้อมูลอุปกรณ์ลูก
  const [deviceChilds, setDeviceChilds] = useState<DeviceChild[]>([]);

  // ดึงข้อมูลอุปกรณ์แม่และอุปกรณ์ลูก
  const fetchDevice = async () => {
    const device = await DeviceService.getDeviceWithChilds(parentId);
    setParentDevice(device); // เก็บข้อมูลอุปกรณ์แม่เข้า state
    setDeviceChilds(device?.device_childs ?? []); // เก็บข้อมูลอุปกรณ์ลูกเข้า state
  }

  // โหลดข้อมูลเมื่อเรนเดอร์หน้าเว็บครั้งแรก
  useEffect(() => {
    fetchDevice();
  }, [parentId]);

  // เรียกใช้งาน toast
  const { push } = useToast();

  // เพิ่มอุปกรณ์ลูก
  const handleAddDeviceChild = async (parentId: number, quantity: number) => {
    if (!quantity) {
      push({ tone: "warning", message: "กรุณาระบุจำนวนอุปกรณ์!" });
      return;
    }

    const payload = { dec_de_id: parentId, quantity };
    // เรียกใช้งาน service
    await DeviceService.createDeviceChild(payload);
    push({ tone: "success", message: "เพิ่มอุปกรณ์ใหม่ในคลังแล้ว!" });
    await fetchDevice(); // โหลดข้อมูลใหม่
  }

  // ลบอุปกรณ์ลูก
  const handleDeleteDeviceChild = async (ids: number[]) => {
    await DeviceService.deleteDeviceChild({ dec_id: ids });
    push({ tone: "danger", message: "ลบอุปกรณ์สำเร็จ!" });
    setDeviceChilds(prev => prev.filter(device => !ids.includes(device.dec_id)));
    await fetchDevice(); // โหลดข้อมูลใหม่
  };

  // เปลี่ยนสถานะอุปกรณ์
  const handleChangeStatus = (id: number, status: DeviceChild["dec_status"]) => {
    setDeviceChilds(prev =>
      prev.map(device =>
        device.dec_id === id
          ? { ...device, dec_status: status }
          : device
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
      await DeviceService.uploadFileDeviceChild(parentId, formData);
      push({ tone: "success", message: "อัปโหลดไฟล์สำเร็จ!" });
      await fetchDevice(); // โหลดข้อมูลใหม่
    } catch (error) {
      push({ tone: "danger", message: "อัปโหลดไฟล์ล้มเหลว" });
    }
  }

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
        onSubmit={() => console.log("Submit Device")}
      />
      <DevicesChilds
        devicesChilds={deviceChilds}
        onAdd={handleAddDeviceChild}
        onUpload={handleUploadFile}
        onDelete={handleDeleteDeviceChild}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  )
}

export default Inventory