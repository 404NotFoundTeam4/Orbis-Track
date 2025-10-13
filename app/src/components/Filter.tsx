import React, { useEffect, useState } from "react";

type Option = { label: string; value: string };

// // interface FilterProps {
// //   onChange: (filters: { option: string }) => void;
// //   option?: Option[];
// // }

// interface FilterProps {
//   onChange: (filters: { label: string; value: string }) => void;
//   option?: Option[];
// }

// const defaultOpt = [{ label: "ทั้งหมด", value: "" }];

// export const Filter: React.FC<FilterProps> = ({
//   onChange,
//   option = defaultOpt,
// }) => {
//   // ใช้ string สำหรับ <select>
//   const [selectedOption, setSelectedOption] = useState<Option>();

//   // เมื่อเปลี่ยนค่า → แจ้ง component แม่
//   useEffect(() => {
//     onChange({ option: selectedOption });
//   }, [selectedOption, onChange]);

//   const inputClass =
//     "h-10 border border-gray-300 text-sm outline-none " +
//     "focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white";

//   return (
//     <div className="flex gap-2 items-center">
//       <select
//         value={selectedOption}
//         onChange={(e) => setSelectedOption(e.target.value)}
//         className={`${inputClass} w-[210px] h-[46px] px-[20px] py-[8px] rounded-[16px]`}
//         aria-label="ตำแหน่ง"
//       >
//         {option.map((o) => (
//           <option key={`pos-${o.value}`} value={o.value}>
//             {o.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default Filter;

// interface FilterProps {
//   onChange: (option: { label: string; value: string }) => void;
//   option?: Option[];
// }

interface FilterProps {
  onChange: (value: string) => void;
  option?: Option[];
}

const defaultOpt: Option[] = [{ label: "ทั้งหมด", value: "" }];

export const Filter: React.FC<FilterProps> = ({ onChange, option = defaultOpt }) => {
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    onChange(selectedValue);
  }, [selectedValue, onChange]);

  const inputClass =
    "h-10 border border-gray-300 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white";

  return (
    <div className="flex gap-2 items-center">
      <select
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        className={`${inputClass} w-[210px] h-[46px] px-[20px] py-[8px] rounded-[16px]`}
        aria-label="ตำแหน่ง"
      >
        {option.map((o) => (
          <option key={`pos-${o.value}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
