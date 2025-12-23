export function BorrowForm() {
  return (
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

        <p className="text-red-500 text-sm flex items-center gap-1">
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
  );
}
