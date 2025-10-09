import { Icon } from "@iconify/react";

interface AddButtonProps {
  onClick?: () => void; // ✅ กำหนดให้คลิกได้
  label?: string; // ✅ ข้อความที่เปลี่ยนได้
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label = "บัญชีผู้ใช้", // ✅ ค่าเริ่มต้น
}) => {
  return (
    <div className="flex items-center justify-center w-[150px] h-[46px] border bg-[#1890FF] rounded-full text-[#FFFFFF]">
      <Icon icon="ic:baseline-plus" width="22" height="22" /> เพิ่ม{label}
    </div>
  );
};

export default AddButton;
