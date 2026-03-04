import type { BorrowItem } from "./Types";

interface Props {
  data: BorrowItem | null;
  onClose: () => void;
}

export default function BorrowDetailModal({ data, onClose }: Props) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[720px] rounded-3xl p-8 relative">
        <button
          className="absolute right-6 top-6 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold mb-6">รายละเอียด</h2>

        <div className="grid grid-cols-2 gap-y-4 text-lg">
          <p className="text-red-500 font-semibold">เลยกำหนด</p>
          <div></div>

          <p>วันที่ - เวลา</p>
          <p>{data.requestDate}</p>

          <p>ผู้ส่งคำขอ</p>
          <p>{data.borrower}</p>

          <p>เบอร์โทรศัพท์</p>
          <p>{data.phone}</p>

          <p>อุปกรณ์</p>
          <p>{data.equipment}</p>

          <p>หมวดหมู่</p>
          <p>{data.deviceCategory}</p>

          <p>รหัสอุปกรณ์</p>
          <p>{data.deviceCode}</p>

          <p>จำนวน</p>
          <p>{data.quantity} รายการ</p>

          <p>เหตุผลในการยืม</p>
          <p>{data.reason}</p>

          <p>สถานที่ใช้งาน</p>
          <p>{data.location}</p>

          <p>ผู้ดำเนินการ</p>
          <p>{data.operator}</p>

          <p>วันที่ยืม</p>
          <p>{data.borrowDate}</p>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-10 py-3 rounded-xl"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}