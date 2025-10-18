import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"

interface DropdownArrowProps {
  isOpen: boolean,
}

const DropdownArrow = ({ isOpen }: DropdownArrowProps) => {
  return (
    <div>
      <FontAwesomeIcon
        icon={faChevronDown}
        className={`w-3 h-3 text-[#000000] transition-transform duration-200
        ${isOpen ? "w-[32px] h-[32px] p-1.5 rounded-[10px] bg-[#40A9FF] text-[#FFFFFF] transform rotate-180" : ""}`}
      />
    </div>
  )
}

export default DropdownArrow