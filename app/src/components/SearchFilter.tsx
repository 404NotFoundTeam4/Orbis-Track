import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface SearchFilterProps {
  onChange: (filters: { search: string }) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onChange }) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
      onChange({ search });
    }, [search, onChange]);

  const inputClass =
    "h-10 border border-gray-300 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white";

  return (
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
  );
};

export default SearchFilter;
