import { Icon } from "@iconify/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function EditCart() {
  const [qty, setQty] = useState(1);
  const maxQty = 32;
  const minQty = 1;

  const increment = () => setQty((prev) => Math.min(prev + 1, maxQty));
  const decrement = () => setQty((prev) => Math.max(prev - 1, minQty));
  return (
    <div className="w-full min-h-screen flex flex-col p-4 gap-6">
      {/* LEFT SIDE: Cart Items */}
      <div className="flex-1">
        {/* แถบนำทาง */}
        <div className="mb-[24px] space-x-[9px] text-sm">
          <span className="text-[#858585]">รายการอุปกรณ์</span>
          <span className="text-[#858585]">&gt;</span>
          <Link
            to="/list-devices/cart"
            className="text-[#858585] font-medium hover:underline"
          >
            รถเข็น
          </Link>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000] font-medium">แก้ไขรายระเอียด</span>
        </div>
        <h1 className="text-2xl font-semibold mb-[24px]">แก้ไขรายระเอียด</h1>

        <div className="flex flex justify-center bg-white rounded-[16px] shadow p-6 gap-[119px] px-[64px] py-[71px]">
          {/* รายละเอียดอุปกรณ์ */}
          <div className="w-[609px] border border-[#BFBFBF] bg-white rounded-[16px] shadow p-6">
            {/* หัวข้อ */}
            <h2 className="text-center font-semibold text-lg mb-6">
              รายละเอียดอุปกรณ์
            </h2>

            {/* รูปอุปกรณ์ */}
            <div className="flex justify-center mb-6 h-[164px] w-full">
              <img
                src="Picture"
                alt="Picture"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>

            {/* รายละเอียด */}
            <div className="space-y-2 text-sm">
              <p>
                โปรเจคเตอร์ (รุ่น XXX){" "}
                <div className="float-right">
                  <span>จำนวนคงเหลือ : </span>
                  <span className="text-blue-500">30 / 32 ชิ้น</span>
                </div>
              </p>
              <p>รหัสอุปกรณ์ : PJ</p>
              <p>หมวดหมู่ : อุปกรณ์ IT</p>
              <p>แผนก : Media</p>
              <p>ฝ่ายย่อย : Z</p>
              <p className="text-red-500 text-sm">*ยืมได้สูงสุดไม่เกิน 3 วัน</p>
            </div>

            {/* อุปกรณ์เสริม */}
            <div className="mt-6">
              <div className="grid grid-cols-2 text-sm font-semibold mb-2 bg-[#D9D9D9]  rounded-[16px]">
                <h3 className="px-3 py-2">อุปกรณ์เสริม</h3>
                <h3 className="px-3 py-2">จำนวน</h3>
              </div>
              <div className="grid grid-cols-2 text-sm mb-2 px-3 py-1 overflow-hidden">
                <div className="px-3 py-2">อแดปเตอร์ (Adapter)</div>
                <div className="px-3 py-2">1 ชิ้น</div>
                <div className="px-3 py-2">สายยาว</div>
                <div className="px-3 py-2">2 ชิ้น</div>
              </div>
            </div>
          </div>

          {/* คำร้อง */}
          <div className="w-[581px]">
            <h2 className="font-medium text-[18px]">ระบุข้อมูลการยืม</h2>
            <h2 className="font-medium text-[16px] mb-4 text-[#858585]">
              รายละเอียดข้อมูลอุปกรณ์
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-[16px] mb-1">ชื่อผู้ยืม</label>
                <input
                  type="text"
                  placeholder="กรอกชื่อผู้ยืม"
                  className="w-full h-[46px] border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                />
              </div>

              <div>
                <label className="block text-[16px] mb-1">
                  เบอร์โทรศัพท์ผู้ยืม
                </label>
                <input
                  type="text"
                  placeholder="กรอกเบอร์โทรศัพท์"
                  className="w-full border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                />
              </div>

              <div>
                <label className="block text-[16px] mb-1">เหตุผลในการยืม</label>
                <textarea
                  placeholder="กรอกเหตุผล"
                  className="w-full border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px] resize-none"
                />
              </div>

              <div>
                <label className="block text-[16px] mb-1">สถานที่ใช้งาน</label>
                <input
                  type="text"
                  placeholder="กรอกสถานที่"
                  className="w-full border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                />
              </div>

              {/* จำนวนอุปกรณ์ */}
              <div className="items-center gap-2">
                <div className="mb-1">
                  <label className="text-[16px]">จำนวนอุปกรณ์</label>
                </div>
                <div className="flex w-[260px] border border-[#D8D8D8] rounded-[8px] overflow-hidden">
                  <button
                    type="button"
                    onClick={decrement}
                    className="px-3 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Icon icon="ic:round-minus" width="16" height="16" />
                  </button>
                  <div className="flex-1 px-4 py-2 border-l border-r border-[#D8D8D8]">
                    {qty} ชิ้น
                  </div>
                  <button
                    type="button"
                    onClick={increment}
                    className="px-3 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Icon icon="ic:round-plus" width="16" height="16" />
                  </button>
                </div>
              </div>

              {/* วันที่และเวลา */}
              <div>
                <div className="flex items-start gap-[10px]">
                  <div>
                    <label className="block text-[16px] mb-1">วันที่ยืม</label>
                    <input
                      type="date"
                      className="w-[280px] border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] mb-1">เวลายืม</label>
                    <input
                      type="time"
                      className="w-[137px] border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-[10px]">
                  <div>
                    <label className="block text-[16px] mb-1">วันที่คืน</label>
                    <input
                      type="date"
                      className="w-[280px] border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] mb-1">เวลาคืน</label>
                    <input
                      type="time"
                      className="w-[137px] border border-[#D8D8D8] rounded-[16px] px-3 py-2 text-[16px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex mt-4 h-[44px]">
                <Link
                  to="/list-devices/cart"
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-3 border border-[#008CFF] rounded-full text-[#008CFF] hover:bg-blue-50"
                >
                  <Icon
                    icon="ic:baseline-add-shopping-cart"
                    width="20"
                    height="20"
                  />
                  เพิ่มไปยังรถเข็น
                </Link>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center px-6 py-3 bg-[#40A9FF] text-white text-[18px] rounded-full hover:bg-blue-600"
                >
                  ส่งคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
