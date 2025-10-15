import {
  faMagnifyingGlass,
  faChevronDown,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useRef, useEffect } from "react";

interface DropDownItem {
  id: string | number; // รหัสประจำตัวของรายการ (ใช้เป็น key)
  label: string; // ข้อความที่แสดงหลัก
  value: any; // ค่าจริงของรายการ
  icon?: React.ReactNode; // ไอคอนแสดงด้านหน้า (optional)
  subtitle?: string; // ข้อความรอง (optional)
  disabled?: boolean; // สถานะปิดการใช้งาน (optional)
  textColor?: string; // สีข้อความ (optional)
}

interface DropDownProps<T extends DropDownItem> {
  items: T[]; // รายการทั้งหมดที่จะแสดงใน dropdown
  value?: T | null; // รายการที่ถูกเลือก (optional)
  onChange: (item: T) => void; // Callback เมื่อเลือกรายการ
  placeholder?: string; // ข้อความแสดงเมื่อยังไม่เลือก
  searchPlaceholder?: string; // ข้อความ placeholder สำหรับช่องค้นหา
  label?: string; // ป้ายกำกับของ dropdown
  disabled?: boolean; // ปิดการใช้งาน dropdown
  searchable?: boolean; // เปิด/ปิดช่องค้นหา
  renderItem?: (item: T) => React.ReactNode; // Custom render function
  filterFunction?: (item: T, searchTerm: string) => boolean; // Custom filter logic
  className?: string; // CSS class เพิ่มเติม
  emptyMessage?: string; // ข้อความแสดงเมื่อไม่มีข้อมูล
}

/**
 * Component: Dropdown
 * Description: Dropdown component หลักพร้อมฟีเจอร์ search, filter, และ custom render
 * Features:
 *   - รองรับการค้นหาแบบ real-time
 *   - กรองข้อมูลด้วย custom function
 *   - รองรับการแสดงผล custom
 *   - ปิดอัตโนมัติเมื่อคลิกข้างนอก
 *   - รองรับ icon และ subtitle
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
function DropDown<T extends DropDownItem>({
  items,
  value,
  onChange,
  placeholder = "เลือก",
  searchPlaceholder = "ค้นหา",
  label,
  disabled = false,
  searchable = true,
  renderItem,
  filterFunction,
  className = "",
  emptyMessage = "ไม่พบข้อมูล",
}: Readonly<DropDownProps<T>>) {
  const [isOpen, setIsOpen] = useState(false); // สถานะเปิด/ปิด dropdown
  const [searchTerm, setSearchTerm] = useState(""); // คำค้นหาปัจจุบัน
  const dropdownRef = useRef<HTMLDivElement>(null); // อ้างอิงถึง container ของ dropdown
  const searchInputRef = useRef<HTMLInputElement>(null); // อ้างอิงถึง input ค้นหา

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input เมื่อเปิด dropdown
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  /** Filter items
   * Description: รายการที่ผ่านการกรองตามคำค้นหา
   * Logic:
   *   1. ถ้าไม่มีคำค้นหา -> แสดงทั้งหมด
   *   2. ถ้ามี filterFunction -> ใช้ function นั้นกรอง
   *   3. ถ้าไม่มี -> กรองจาก label และ subtitle
   */
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;

    if (filterFunction) {
      return filterFunction(item, searchTerm);
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      item.label.toLowerCase().includes(searchLower) ||
      item.subtitle?.toLowerCase().includes(searchLower)
    );
  });

  /**
   * Description: สลับสถานะเปิด/ปิด dropdown
   * Input: -
   * Output: void
   * Note: ถ้า disabled = true จะไม่ทำงาน
   */
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchTerm("");
      }
    }
  };

  /**
   * Description: จัดการเมื่อมีการเลือกรายการ
   * Input: item - รายการที่ถูกเลือก
   * Output: void
   * Logic:
   *   1. ตรวจสอบว่ารายการไม่ถูก disabled
   *   2. เรียก onChange callback
   *   3. ปิด dropdown และเคลียร์คำค้นหา
   */
  const handleSelect = (item: T) => {
    if (!item.disabled) {
      onChange(item);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  /**
   * Description: Default render function สำหรับแสดงรายการ
   * Input: item - รายการที่จะแสดง
   * Output: React.ReactNode - JSX ของรายการ
   * Layout: [icon] label
   *                subtitle
   */
  const defaultRenderItem = (item: T) => (
    <div className="flex items-center gap-3 w-full">
      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-normal text-[#000000] truncate"
          style={{ color: item.textColor || "#000000" }}
        >
          {item.label}
        </div>
        {item.subtitle && (
          <div className="text-xs text-[#000000] truncate mt-0.5">
            {item.subtitle}
          </div>
        )}
      </div>
      {value?.id === item.id && (
        <FontAwesomeIcon
          icon={faCheck}
          className="w-4 h-4 text-[#000000] flex-shrink-0"
        />
      )}
    </div>
  );

  return (
    <div className={`relative ${className} w-[250px]`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-[#000000] mb-1.5">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
            w-full px-4 py-2.5 
            bg-white 
            border border-[#D9D9D9]
            rounded-[16px]
            flex items-center justify-between
            text-left
            transition-all duration-200
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300 cursor-pointer"}
            ${isOpen ? "border-[#D9D9D9]" : ""}
            `}
      >
        <span
          className={`text-sm`}
          style={{ color: value ? value.textColor || "#000000" : "#9E9E9E" }}
        >
          {value?.label || placeholder}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-3 h-3 text-[#000000] transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-[#D9D9D9] rounded-[16px] shadow-sm overflow-hidden"
          style={{ maxHeight: "320px" }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-1 border-b border-[#D9D9D9]">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="w-3 h-3 text-[#949494] shrink-0 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm  rounded-[16px] text-[#000000] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
            {filteredItems.length > 0 ? (
              <div>
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={item.disabled}
                    className={`
                        w-full px-4 py-2.5
                        text-left
                        transition-colors duration-150
                        ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#EBF3FE] cursor-pointer"}
                        `}
                  >
                    {renderItem ? renderItem(item) : defaultRenderItem(item)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DropDown;
