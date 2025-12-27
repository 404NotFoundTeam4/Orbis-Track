import { useNavigate } from "react-router-dom";
import type { GetInventory } from "../services/InventoryService"
import Button from "./Button"

interface DevicesCardProps {
  device: GetInventory;
}

const DevicesCard = ({ device }: DevicesCardProps) => {
  // ใช้สำหรับเปลี่ยนหน้า
  const navigate = useNavigate();

  /**
  * Description: ฟังก์ชันสำหรับเปลี่ยนหน้าไปยังหน้าการยืมอุปกรณ์
  * Input : -
  * Output : เปลี่ยนเส้นทางไปยังหน้าการยืมอุปกรณ์
  * Author : Thakdanai Makmi (Ryu) 66160355
  **/
  const handleBorrow = () => {
    // เปลี่ยน path และส่งค่า deviceId ไปผ่าน state
    navigate("/list-devices/borrow", {
      state: {
        deviceId: device.de_id
      }
    });
  }

  return (
    <div className="w-[308px] min-h-[313px] rounded-[16px] bg-white shadow-md border border-gray-200 overflow-hidden flex flex-col">

      {/* รูปภาพ */}
      <div className="w-full h-[115px] bg-[#FFFFFF] flex items-center justify-center">
        <img
          src={device.de_images || ""}
          className="object-cover h-full"
        />
      </div>

      {/* เนื้อหา */}
      <div className="px-[15px] py-[10px] flex flex-col gap-[7px] flex-1">
        {/* Badges */}
        <div className="flex gap-[6px]">

          <span className={`px-3 h-[21px] flex items-center rounded-full text-[10px] border ${device.available === 0 ? "text-[#FF4D4F] border-[#FF4D4F]" : " text-[#73D13D] border-[#73D13D]"}`}>
            {device.available === 0 ? 'ไม่พร้อมใช้งาน' : 'พร้อมใช้งาน'}
          </span>
          <span className="px-3 h-[21px] flex items-center rounded-full text-[10px] border border-[#7492FF] text-[#7492FF]">
            ฝ่ายย่อย : {device.sub_section}
          </span>
        </div>

        {/* ชื่ออุปกรณ์ */}
        <h3 className="mt-[5px] text-[18px] font-bold text-[#40A9FF]">
          {device.de_name}
        </h3>

        {/* รายละเอียด */}
        <div className="flex flex-col gap-[7px] text-sm text-[#B3B1B1] flex-1">
          <p>รหัสอุปกรณ์ : {device.de_serial_number}</p>
          <p>หมวดหมู่ : {device.category}</p>
          <p>แผนก : {device.department}</p>
          <div className="mt-auto flex items-center justify-between">
            <p>
              คงเหลือ : {device.available} / {device.total} ชิ้น
            </p>

              <Button
                className="!w-[74px] !h-[31px] !min-h-[31px] rounded-full text-sm cursor-pointer"
                onClick={handleBorrow}
                disabled={device.available === 0}
              >
                ยืม
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevicesCard