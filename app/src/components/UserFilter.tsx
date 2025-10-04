import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type Option = { label: string; value: string };

interface UserFilterProps {
  total: number;
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
  total,
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
    "h-10 rounded-xl border border-gray-300 px-3 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white";

  return (
    <div className="w-full mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-700">
          ผู้ใช้งานทั้งหมด <span className="font-semibold">{total}</span>
        </div>

        {/* แถวตัวกรอง */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}

          <div
            className={`${inputClass} min-w-[220px] flex-1 flex items-center gap-2`}
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
              className="flex-1 h-10 bg-transparent border-0 outline-none text-sm"
            />
          </div>

          {/* ตำแหน่ง */}
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={`${inputClass} w-[180px]`}
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
            className={`${inputClass} w-[180px]`}
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
            className={`${inputClass} w-[180px]`}
            aria-label="ฝ่ายย่อย"
          >
            {subDepartments.map((o) => (
              <option key={`sub-${o.value}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;