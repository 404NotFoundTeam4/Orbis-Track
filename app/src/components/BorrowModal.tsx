import React from "react";

type BorrowModalProps = {
  open: boolean;
  onClose: () => void;
};

const devices = [
  { id: 1, code: "EX-01", status: "available" },
  { id: 2, code: "EX-01", status: "borrowed" },
  { id: 3, code: "EX-01", status: "borrowed" },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

 {/* ================= LEFT ================= */}



  {/* ================= LEFT ================= */}


export default function BorrowModal({ open, onClose }: BorrowModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[90vw] h-[90vh] bg-[#F9FAFB] rounded-2xl shadow-xl flex overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        {/* ================= LEFT ================= */}
        <div className="w-[380px] bg-white border-r p-4 overflow-y-auto">
          {/* Device List */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold">รายการอุปกรณ์</h2>
              <span className="bg-green-100 text-green-600 text-sm px-2 py-0.5 rounded-full">
                ว่าง 1 / 5
              </span>
            </div>

            {devices.map((d) => (
              <div
                key={d.id}
                className={`flex items-center justify-between mb-2 p-3 rounded-xl border
                ${
                  d.status === "available"
                    ? "border-green-300"
                    : "border-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full
                    ${
                      d.status === "available"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span>{d.code}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-lg text-sm
                  ${
                    d.status === "available"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {d.status === "available" ? "พร้อมยืม" : "ถูกยืม"}
                </span>
              </div>
            ))}
          </div>

          {/* Borrow Form */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">วันและเวลาที่ต้องการยืม</h3>

            <div className="space-y-3">
              <input
                type="date"
                className="w-full border rounded-xl px-4 py-2"
              />

              <select className="w-full border rounded-xl px-4 py-2">
                <option>เวลาเริ่ม</option>
                <option>08:30</option>
                <option>09:00</option>
              </select>

              <select className="w-full border rounded-xl px-4 py-2">
                <option>เวลาคืน</option>
                <option>11:30</option>
                <option>12:00</option>
              </select>

              <p className="text-red-500 text-sm">
                ❗ สามารถยืมได้ขั้นต่ำ 1 ชั่วโมง
              </p>

              <div className="flex gap-2">
                <button className="flex-1 border rounded-xl py-2">
                  ล้างค่า
                </button>
                <button className="flex-1 bg-blue-500 text-white rounded-xl py-2">
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-2xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">ธันวาคม 2025</h2>

              <div className="flex border rounded-xl overflow-hidden text-sm">
                <button className="px-4 py-1 bg-gray-100">Month</button>
                <button className="px-4 py-1">Week</button>
                <button className="px-4 py-1">Day</button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l">
              {days.map((d) => (
                <div
                  key={d}
                  className="border-r border-b text-center py-2 font-medium text-sm"
                >
                  {d}
                </div>
              ))}

              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[110px] border-r border-b p-2 relative text-sm"
                >
                  <span className="absolute top-2 right-2 text-gray-400">
                    {i + 1 <= 31 ? i + 1 : ""}
                  </span>

                  {i === 2 && (
                    <div className="mt-6 bg-red-100 text-red-600 rounded-lg p-2 text-xs">
                      อุปกรณ์ถูกยืม
                      <div>8:30 AM - 11:30 AM</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
