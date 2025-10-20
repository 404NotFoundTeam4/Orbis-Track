import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import DropDown from "./DropDown"

interface PopupAddSubDepartmentProps {
  isOpen: boolean
  onClose: () => void
}

const PopupAddSubDepartment = ({ isOpen, onClose }: PopupAddSubDepartmentProps) => {
  const [department, setDepartment] = useState("")
  const [subDepartment, setSubDepartment] = useState("")

  const departmentOptions = [
    { id: "", label: "ทั้งหมด", value: "" },
    //mock dropdown แผนก
    { id: "คลังสินค้า", label: "คลังสินค้า", value: "คลังสินค้า" },
    { id: "ซ่อมบำรุง", label: "ซ่อมบำรุง", value: "ซ่อมบำรุง" },
    { id: "IT", label: "IT", value: "IT" },
  ]

  const [departmentFilter, setDepartmentFilter] = useState<{ id: string | number; label: string; value: string } | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-[804px] h-[470px] rounded-[16px] shadow-lg p-6 relative animate-fadeIn border border-[#858585] overflow-visible flex flex-col items-center justify-center text-center gap-[47px]">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
        >
          <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
        </button>

        {/* หัวข้อ */}
        <h2 className="text-[32px] font-semibold text-center">เพิ่มฝ่ายย่อย</h2>

        {/* ฟอร์ม - จัดให้อยู่ตรงกลาง และช่องทั้งสองขนาดเท่ากัน */}
        {/* Input ฝ่ายย่อย */}
          <div className="h-[46px] flex flex-col w-[333px]">
            <label className="text-[16px] text-sm text-left text-[#000]">แผนก</label>
            {/* ใช้ DropDown โดยตรง — ตัวควบคุมขนาด 333x46 และเมนูขนาด 333x407 */}
            <DropDown
              items={departmentOptions}
              value={departmentFilter}
              onChange={(item) => {
                setDepartmentFilter(item)
                setDepartment(item?.value || "")
              }}
              placeholder="ประเภทแผนก"
              className="w-[333px] focus:border-[#40A9FF] rounded-[16px] bg-white text-[#222] flex items-center"
              
            />
          </div>

          {/* Input ฝ่ายย่อย */}
          <div className="flex flex-col gap-[4px] w-[333px]">
            <label className="text-[16px] text-sm text-left text-[#000]">ฝ่ายย่อย</label>
            <input
              type="text"
              value={subDepartment}
              onChange={(e) => setSubDepartment(e.target.value)}
              placeholder="ประเภทฝ่ายย่อย"
              className="border border-[#A2A2A2] rounded-[16px] px-3 py-2 focus:outline-none focus:border-[#40A9FF] transition text-[#222] placeholder:text-[#CDCDCD]"
            />
          </div>
        

        {/* ปุ่มบันทึก */}
        <div className="flex justify-center">
          <button
            onClick={() => console.log({ department, subDepartment })}
            className="px-6 py-2 bg-[#40A9FF] text-white rounded-[8px] hover:bg-[#1890FF] gap-4"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  )
}

export default PopupAddSubDepartment
