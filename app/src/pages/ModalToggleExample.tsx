import { useState } from "react";
import BorrowModal from "../components/BorrowModal";

export default function SerialModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
      >
        เปิดหน้าจอยืมอุปกรณ์
      </button>

      <BorrowModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
