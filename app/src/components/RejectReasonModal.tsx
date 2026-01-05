/**
 * Description: Modal สำหรับกรอกเหตุผลในการปฏิเสธคำร้อง
 * Input : RejectReasonModalProps { isOpen, onClose, onConfirm }
 * Output : React Component (Modal)
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
import { useState } from "react";
import { Icon } from "@iconify/react";
import Button from "./Button";

interface RejectReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
}

const RejectReasonModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: RejectReasonModalProps) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason);
            // ไม่ reset reason ตรงนี้ เพราะอาจมี confirm dialog ซ้อน
        }
    };

    const handleClose = () => {
        setReason(""); // reset เวลาปิด
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 md:px-6 md:py-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={handleClose}></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[24px] md:rounded-[42px] w-full max-w-[839px] p-6 md:p-10 flex flex-col mx-4">
                {/* Header */}
                <div className="relative flex items-center justify-center pb-3 md:pb-5">
                    <h2 className="text-lg md:text-2xl font-bold text-black text-center">ระบุเหตุผลปฏิเสธ</h2>
                    <button
                        onClick={handleClose}
                        className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-gray-200 cursor-pointer"
                    >
                        <Icon icon="mdi:close" width="18" height="18" color="#000000ff" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto">
                    <textarea
                        className="w-full h-40 md:h-48 p-4 border border-[#A2A2A2] rounded-2xl resize-none"
                        placeholder="ระบุเหตุผล"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4 md:gap-9 pt-4 md:pt-6">
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        style={{ minWidth: 90, height: 42 }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isLoading}
                        style={{ minWidth: 90, height: 42 }}
                    >
                        {isLoading ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RejectReasonModal;
