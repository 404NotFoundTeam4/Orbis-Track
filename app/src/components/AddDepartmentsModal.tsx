import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { useState } from "react";

const AddDepartmentsModal = () => {
  const navigate = useNavigate();
  const [DepartmentName, setDepartmentName] = useState<string>("");
  

  return (
    <form className="fixed inset-0 flex items-center justify-center z-5">
      {/* Card */}
      <div className="bg-white rounded-[24px] w-[804px] h-[371px] max-w-[95%] border border-[#858585]  relative px-8 py-[40px] flex flex-col items-center">

        {/* ปุ่มปิด */}
        


        <h1 className="text-[32px] font-bold">เพิ่มแผนก</h1>

        {/* ฟอร์ม */}
        <div className="mt-[57px] flex flex-col items-start mx-auto w-[333px]">
          <label htmlFor="department" className="text-[16px] font-semibold mb-[4px]">
            แผนก
          </label>

          <input id="department" type="text" placeholder="ประเภทแผนก" className="w-[333px] h-[46px] border border-gray-300 rounded-[16px] px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <Button className="w-[128px] h-[46px] mt-[57px]" variant="primary" size="md">บันทึก</Button>
      </div>
    </form>
  );
} ;

export default AddDepartmentsModal;