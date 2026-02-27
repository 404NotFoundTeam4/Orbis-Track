import { useEffect, useState } from "react";

interface QuantityInputProps {
  label?: string; // ข้อความ
  min?: number; // จำนวนต่ำสุด
  max?: number; // จำนวนสูงสุด
  value: number | null;
  width?: number;
  required?: boolean; // ต้องระบุ (*)
  error?: string;
  onChange?: (value: number) => void; // เปลี่ยนแปลงค่า
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  // ค่า default
  label = "จำนวน",
  min = 0,
  max = 99,
  value,
  width = "260",
  required,
  error,
  onChange,
}) => {
  // ค่าในช่อง input
  const [localValue, setLocalValue] = useState<number | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const changeValue = (newValue: number | null) => {
    if (newValue !== null && (newValue < min || newValue > max)) return;
    setLocalValue(newValue); // อัปเดตค่า
    onChange?.(newValue ?? 0); // ถ้า newValue เป็น null หรือ undefined ใช้ 0 แทน
  };

  // ลดจำนวน
  const decreaseValue = () => {
    if (value === null || value <= min) return;
    changeValue(value - 1);
  };

  // เพิ่มจำนวน
  const increaseValue = () => {
    changeValue((value ?? 0) + 1); // ถ้า value เป็นตัวเลขใช้ค่านั้นเลย ถ้าเป็น null แทนด้วย 0
  };

  // ระบุจำนวนในช่องเอง
  const inputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, ""); // กันตัวอักษร/สัญลักษณ์

    if (numeric === "") {
      changeValue(null);
      return;
    }

    // แปลงเป็นตัวเลข
    const num = Number(numeric);
    // พิมพ์เกิน max ให้แสดง max แทน
    if (num > max) {
      changeValue(max);
      return;
    }

    changeValue(num);
  };

  return (
    <div className="flex flex-col gap-[4px]">
      {/* Label */}
      <label className="text-[16px]">
        {label}
        {required && <span className="text-[#F5222D] ml-1">*</span>}
      </label>
      {/* Input Box */}
      <div
        className={`flex items-center overflow-hidden border rounded-[8px] h-[46px] py-[8px] ${error ? "border-red-500" : "border-[#A2A2A2]"}`}
        style={{ width: width }}
      >
        {/* ลดจำนวน */}
        <button
          type="button"
          onClick={decreaseValue}
          className="flex justify-center items-center text-2xl border-r border-[#A2A2A2] w-[46px] h-[46px] hover:bg-gray-100"
        >
          -
        </button>
        {/* แสดงจำนวน */}
        <input
          type="text"
          value={localValue === null ? "" : localValue}
          className={`flex-1 text-center text-[16px] ${localValue === null ? "text-[#CDCDCD]" : "text-black"}`}
          placeholder="จำนวน"
          onChange={inputValue}
        ></input>
        {/* เพิ่มจำนวน */}
        <button
          type="button"
          onClick={increaseValue}
          className="flex justify-center items-center text-2xl border-l border-[#A2A2A2] w-[46px] h-[46px] hover:bg-gray-100"
        >
          +
        </button>
      </div>
      
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default QuantityInput;
