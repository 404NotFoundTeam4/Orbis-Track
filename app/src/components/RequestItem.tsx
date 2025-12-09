import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faPlus } from "@fortawesome/free-solid-svg-icons";

interface RequestItemProps {
    request: {
        id: string;
        device_name: string;
        device_image: string;
        quantity: number;
        category: string;
        requester_name: string;
        requester_id: string;
        request_date: string;
        request_time: string;
        status: "pending" | "approved" | "rejected";
        details: {
            request_date_full: string;
            return_date_full: string;
            reason: string;
            location: string;
            phone: string;
            accessories: string;
        };
    };
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const RequestItem = ({ request, onApprove, onReject }: RequestItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-white border border-[#D9D9D9] rounded-[16px] mb-3 overflow-hidden transition-all duration-300">
            {/* Summary Row */}
            <div
                className="grid [grid-template-columns:1.5fr_0.6fr_1fr_1.2fr_1fr_0.8fr_1fr_50px] items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={toggleExpand}
            >
                {/* Device Name & ID */}
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{request.device_name}</span>
                    <span className="text-sm text-gray-500">รหัส : {request.id}</span>
                </div>

                {/* Quantity */}
                <div className="text-gray-700">{request.quantity} ชิ้น</div>

                {/* Category */}
                <div className="text-gray-700">{request.category}</div>

                {/* Requester */}
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{request.requester_name}</span>
                    <span className="text-sm text-gray-500">{request.requester_id}</span>
                </div>

                {/* Date & Time */}
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{request.request_date}</span>
                    <span className="text-sm text-blue-500">เวลา : {request.request_time}</span>
                </div>

                {/* Status */}
                <div>
                    <span className="px-4 py-1 rounded-full border border-yellow-400 text-yellow-600 bg-yellow-50 text-sm font-medium">
                        รออนุมัติ
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onApprove(request.id)}
                        className="bg-[#73D13D] hover:bg-[#52c41a] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        อนุมัติ
                    </button>
                    <button
                        onClick={() => onReject(request.id)}
                        className="bg-[#FF4D4F] hover:bg-[#ff7875] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        ปฏิเสธ
                    </button>
                </div>

                {/* Expand Icon */}
                <div className="text-gray-400 flex justify-center">
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
            </div>

            {/* Expanded Details */}
            <div
                className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[600px] opacity-100 border-t border-gray-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="p-6 bg-white flex gap-6">
                    {/* 1. Progress Steps (Left) */}
                    <div className="flex flex-col items-center gap-1 min-w-[60px] pt-2">
                        {/* Step 1: Request */}
                        <div className="w-8 h-8 rounded-full border-2 border-[#52c41a] flex items-center justify-center text-[#52c41a] bg-white z-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="h-12 w-[2px] bg-[#52c41a]"></div>
                        <span className="text-xs text-[#52c41a] font-medium -mt-1 mb-2">ส่งคำร้อง</span>

                        {/* Step 2: Approve */}
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 bg-white z-10">
                            <FontAwesomeIcon icon={faPlus} className="transform rotate-45" />
                        </div>
                        <div className="h-12 w-[2px] bg-gray-200"></div>
                        <span className="text-xs text-gray-400 font-medium -mt-1 mb-2">อนุมัติ</span>

                        {/* Step 3: In Use */}
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 bg-white z-10">
                        </div>
                        <div className="h-12 w-[2px] bg-gray-200"></div>
                        <span className="text-xs text-gray-400 font-medium -mt-1 mb-2">กำลังใช้งาน</span>

                        {/* Step 4: Return */}
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 bg-white z-10">
                        </div>
                        <span className="text-xs text-gray-400 font-medium mt-1">คืนอุปกรณ์</span>
                    </div>

                    {/* 2. Image & Description Column */}
                    <div className="w-[320px] flex flex-col gap-4">
                        {/* Device Image */}
                        <div className="w-full h-[200px] bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 p-4">
                            <img src={request.device_image} alt={request.device_name} className="max-w-full max-h-full object-contain" />
                        </div>

                        {/* Description Box */}
                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                            <div className="font-semibold text-gray-700 mb-1 text-sm">รายละเอียด <span className="font-normal text-gray-500">— ประเภท: เลเซอร์ขาว-ดำ (Workgroup)</span></div>
                            <div className="text-gray-500 text-xs leading-relaxed">
                                • ความเร็ว 28-38 ppm (A4) • 1200x1200 dpi • A4/Letter/A5/Legal 60-163 gsm • USB 2.0 • Windows/macOS/Linux
                            </div>
                        </div>

                        {/* Footer Alert */}
                        <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-2 rounded text-sm text-center">
                            *อุปกรณ์นี้ถูกหยิบได้สูงสุด 3 วัน
                        </div>
                    </div>

                    {/* 3. Info Columns Container */}
                    <div className="flex-1 grid grid-cols-2 gap-8 pt-2">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">ผู้ส่งคำร้อง</span>
                                <span className="text-gray-600">{request.requester_name}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">ชื่ออุปกรณ์</span>
                                <span className="text-gray-600">{request.device_name}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">หมวดหมู่</span>
                                <span className="text-gray-600">{request.category}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">แผนก/ฝ่ายย่อย</span>
                                <span className="text-gray-600">ไอที (IT) / A</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-center">
                                <span className="font-semibold text-gray-700">รหัสอุปกรณ์</span>
                                <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 w-fit">
                                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 text-xs">CH-001 <span className="cursor-pointer ml-1">×</span></span>
                                    <button className="text-gray-400 hover:text-gray-600"><FontAwesomeIcon icon={faPlus} size="xs" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline mt-auto">
                                <span className="font-semibold text-gray-700">จำนวน</span>
                                <span className="text-gray-600">{request.quantity} ชิ้น</span>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">วันที่ยืม</span>
                                <span className="text-gray-600">{request.details.request_date_full}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">วันที่คืน</span>
                                <span className="text-gray-600">{request.details.return_date_full}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">เหตุผลในการยืม</span>
                                <span className="text-gray-600">{request.details.reason}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">สถานที่ใช้งาน</span>
                                <span className="text-gray-600">{request.details.location}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">เบอร์โทรศัพท์ผู้ยืม</span>
                                <span className="text-gray-600">{request.details.phone}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-baseline">
                                <span className="font-semibold text-gray-700">อุปกรณ์เสริม</span>
                                <span className="text-gray-600">{request.details.accessories}</span>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-start mt-auto">
                                <span className="font-semibold text-gray-700 pt-2">สถานะที่รับอุปกรณ์</span>
                                <textarea
                                    className="w-full h-[100px] p-3 bg-gray-200 border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 placeholder-gray-500"
                                    placeholder="กรอกสถานะที่รับอุปกรณ์"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestItem;
