import { useEffect, useState } from "react"
import Button from "./Button"
import { inventoryService, type GetInventory } from "../services/InventoryService";

const DevicesCard = () => {

  const [devices, setDevices] = useState<GetInventory[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      const res = await inventoryService.getInventory();
      console.log(res);

      setDevices(res);
    }
    fetchDevices();
  }, []);



  return (
    <div className="w-full min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-[14px] mb-[21px] mt-[33px]">
        <h1 className="text-2xl font-semibold">รายการอุปกรณ์</h1>
        <div className="bg-[#D9D9D9] text-sm text-[#000000] rounded-full px-4 py-1 flex items-center justify-center w-[160px] h-[34px]">
          อุปกรณ์ทั้งหมด {devices.length}
        </div>
      </div>


      {/* Card */}
      <div className="grid grid-cols-5 gap-x-[30px] gap-y-[24px]">

        {
          devices.slice(0,10).map((device) => (
            <div key={device.de_id} className="w-[308px] min-h-[313px] rounded-[16px] bg-white shadow-md border border-gray-200 overflow-hidden flex flex-col">

              {/* Image */}
              <div className="w-full h-[115px] bg-[#FFFFFF] flex items-center justify-center">
                <img
                  src={device.de_images || ""}
                  className="object-cover h-full"
                />
              </div>

              {/* Content */}
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

                {/* Title */}
                <h3 className="mt-[5px] text-[18px] font-bold text-[#40A9FF]">
                  {device.de_name}
                </h3>

                {/* Details */}
                <div className="flex flex-col gap-[7px] text-sm text-[#B3B1B1] flex-1">
                  <p>รหัสอุปกรณ์ : {device.de_serial_number}</p>
                  <p>หมวดหมู่ : {device.category}</p>
                  <p>แผนก : {device.department}</p>

                  {/* Bottom row */}
                  <div className="mt-auto flex items-center justify-between">
                    <p>
                      คงเหลือ : {device.available} / {device.total} ชิ้น
                    </p>

                    <Button className="!w-[74px] !h-[31px] !min-h-[31px] rounded-full text-sm">
                      ยืม
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DevicesCard
