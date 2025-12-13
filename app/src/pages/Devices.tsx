import MainDeviceModal from "../components/DeviceModal";
import { useState } from "react";

export default function Devices() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log("ผลลัพธ์จาก modal :", data);
    // 👉 ส่ง API create ยัด DB ตรงนี้
  };

  return (
    <div>
      <MainDeviceModal
        mode="create"
        onSubmit={(data) => {
          handleSubmit(data);
          setOpen(false);
        }}
      />
    </div>
  );
}
