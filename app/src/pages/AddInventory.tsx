import MainDeviceModal from "../components/DeviceModal";
import { useState } from "react";
import { useInventorys } from "../hooks/useInventory";
import { useToast } from "../components/Toast";

export default function AddInventory() {
  const { push } = useToast();
  const userString =
    sessionStorage.getItem("User") || localStorage.getItem("User");

  const user = userString ? JSON.parse(userString) : null;

  const handleSubmit = async (formData: FormData) => {
    const data = formData.get("data") as string | null;
    const mode = formData.get("mode") as string | null;
    if (data === "devices") {
      // ใช้ก่อน

      // ลบทิ้งก่อนส่ง backend
      formData.delete("data");
      formData.delete("mode");
      formData.set("de_us_id",user?.us_id)
      console.log(user?.us_id)
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
    }
    else if (data === "approve") {

      // ลบทิ้งก่อนส่ง backend
      formData.delete("data");
      formData.delete("mode");
      const payload = {
        "af_name": formData.get("af_name"),
        "af_us_id": formData.get("af_us_id"),
        "approvalflowsstep": formData.get("approvalflowsstep")
      }
      try {
        const res = await useInventorys.createApprovedata(payload);
        push({
          tone: "confirm",
          message: "เพิ่มการอนุมัติเรียบร้อยแล้ว",
        });
      } catch (e) {
        console.log(e);
        push({
          tone: "danger",
          message: "ไม่สามารถเพิ่มการอนุมัติ",
        });
      }
    }
  }

  return (
    <div className="p-4">
      {/* ===== Modal ส่งข้อมูลมา ===== */}
      <MainDeviceModal mode="create" onSubmit={(data) => { handleSubmit(data); }} />

      {/* ===== Alert ยืนยัน ===== */}
    </div>
  );
}