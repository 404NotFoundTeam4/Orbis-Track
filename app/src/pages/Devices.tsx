import MainDeviceModal from "../components/DeviceModal";
import { useState } from "react";
import { useInventorys } from "../hooks/useInventory";
import { useToast } from "../components/Toast";

export default function Devices() {
  const { push } = useToast();

  const handleSubmit = async (formData: FormData) => {
  const data = formData.get("data") as string | null;
  const mode = formData.get("mode") as string | null;

  // ใช้ก่อน
  console.log(data, mode);

  // ลบทิ้งก่อนส่ง backend
  formData.delete("data");
  formData.delete("mode");

  try {
    const res = await useInventorys.createDevicesdata(formData);

    push({
      tone: "confirm",
      message: "เพิ่มอุปกรณ์เรียบร้อยแล้ว",
    });
  } catch (e) {
    console.log(e);
    push({
      tone: "confirm",
      message: "ไม่สามารถเพิ่มอุปกรณ์",
    });
  }
};


  return (
    <>
      {/* ===== Modal ส่งข้อมูลมา ===== */}
      <MainDeviceModal mode="create" onSubmit={(data) => { handleSubmit(data); }} />

      {/* ===== Alert ยืนยัน ===== */}
    </>
  );
}