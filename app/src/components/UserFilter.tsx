import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@iconify/react";

type Option = { label: string; value: string };

interface UserFilterProps {
  onChange: (filters: {
    search: string;
    position: string;
    department: string;
    subDepartment: string;
  }) => void;
  positions?: Option[];
  departments?: Option[];
  subDepartments?: Option[];
}

const defaultOpt = [{ label: "ทั้งหมด", value: "" }];

export const UserFilter: React.FC<UserFilterProps> = ({
  onChange,
  positions = defaultOpt,
  departments = defaultOpt,
  subDepartments = defaultOpt,
}) => {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [subDepartment, setSubDepartment] = useState("");

  useEffect(() => {
    onChange({ search, position, department, subDepartment });
  }, [search, position, department, subDepartment, onChange]);

  const inputClass =
    "h-10 border border-gray-300 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white";

  return (
    <div className="w-full mb-3">
      {/* แถวตัวกรอง */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        {/* Search */}
        <div
          className={`${inputClass} w-[438px] h-[46px] px-[24px] py-[10px] flex items-center gap-2 rounded-full`}
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="w-4 h-4 text-gray-400 shrink-0"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา"
            aria-label="ค้นหา"
            className="flex-1 h-10 bg-transparent border-0 outline-none text-sm "
          />
        </div>

        {/* filter */}
        <div className="flex space-x-[4px]">
          {/* ตำแหน่ง */}
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={`${inputClass} w-[210px] h-[46px] px-[20px] py-[8px] rounded-[16px]`}
            aria-label="ตำแหน่ง"
          >
            {positions.map((o) => (
              <option key={`pos-${o.value}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* แผนก */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={`${inputClass} w-[210px] h-[46px] px-[20px] py-[8px] rounded-[16px]`}
            aria-label="แผนก"
          >
            {departments.map((o) => (
              <option key={`dep-${o.value}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* ฝ่ายย่อย */}
          <select
            value={subDepartment}
            onChange={(e) => setSubDepartment(e.target.value)}
            className={`${inputClass} w-[210px] h-[46px] px-[20px] py-[8px] rounded-[16px]`}
            aria-label="ฝ่ายย่อย"
          >
            {subDepartments.map((o) => (
              <option key={`sub-${o.value}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* ปุ่มเพิ่ม */}
          <div className="flex items-center justify-center w-[150px] h-[46px] border bg-[#1890FF] rounded-full text-[#FFFFFF]">
            <Icon icon="ic:baseline-plus" width="22" height="22" />{" "}
            เพิ่มบัญชีผู้ใช้
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;
