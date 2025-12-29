import { useState } from "react";
import SearchFilter from "../components/SearchFilter";
import Dropdown from "../components/DropDown";
import RequestItem from "../components/RequestItem";

// Mock Data
const MOCK_REQUESTS = [
    {
        id: "OFF-RPN",
        device_name: "เครื่องพิมพ์เลเซอร์",
        device_image: "https://placehold.co/200x150/png?text=Printer",
        quantity: 1,
        category: "อุปกรณ์สำนักงาน",
        requester_name: "ชาลชาบิรา ชะอิ",
        requester_id: "6616000",
        request_date: "12/12/2568",
        request_time: "14.00",
        status: "pending" as const,
        details: {
            request_date_full: "20 / ก.ย / 2568 | 12.58 น.",
            return_date_full: "22 / ก.ย / 2568 | 14.00 น.",
            reason: "Ariana Grande",
            location: "ตึก C ชั้น 8",
            phone: "000-000-0000",
            accessories: "ไม่มี",
        },
    },
    {
        id: "MU",
        device_name: "คอมพิวเตอร์ ( รุ่น XXX )",
        device_image: "https://placehold.co/200x150/png?text=Computer",
        quantity: 1,
        category: "อุปกรณ์สำนักงาน",
        requester_name: "กีต้าร์ สินธรรม",
        requester_id: "6616000",
        request_date: "13/12/2568",
        request_time: "10.00",
        status: "pending" as const,
        details: {
            request_date_full: "21 / ก.ย / 2568 | 09.00 น.",
            return_date_full: "23 / ก.ย / 2568 | 17.00 น.",
            reason: "Work from home",
            location: "บ้านพัก",
            phone: "081-234-5678",
            accessories: "สายชาร์จ, เมาส์",
        },
    },
    {
        id: "OFF-RPN-2",
        device_name: "เครื่องพิมพ์เลเซอร์",
        device_image: "https://placehold.co/200x150/png?text=Printer",
        quantity: 1,
        category: "อุปกรณ์สำนักงาน",
        requester_name: "ชาลชาบิรา ชะอิ",
        requester_id: "6616000",
        request_date: "12/12/2568",
        request_time: "14.00",
        status: "pending" as const,
        details: {
            request_date_full: "20 / ก.ย / 2568 | 12.58 น.",
            return_date_full: "22 / ก.ย / 2568 | 14.00 น.",
            reason: "Print documents",
            location: "ตึก A ชั้น 2",
            phone: "000-000-0000",
            accessories: "ไม่มี",
        },
    },
    {
        id: "OFF-RPN-3",
        device_name: "เครื่องพิมพ์เลเซอร์",
        device_image: "https://placehold.co/200x150/png?text=Printer",
        quantity: 1,
        category: "อุปกรณ์สำนักงาน",
        requester_name: "ชาลชาบิรา ชะอิ",
        requester_id: "6616000",
        request_date: "12/12/2568",
        request_time: "14.00",
        status: "pending" as const,
        details: {
            request_date_full: "20 / ก.ย / 2568 | 12.58 น.",
            return_date_full: "22 / ก.ย / 2568 | 14.00 น.",
            reason: "Urgent meeting",
            location: "ห้องประชุม 1",
            phone: "000-000-0000",
            accessories: "กระดาษ A4",
        },
    },
];

const Requests = () => {
    const [searchFilter, setSearchFilter] = useState({ search: "" });
    const [statusFilter, setStatusFilter] = useState<{ id: string; label: string; value: string } | null>(null);

    const statusOptions = [
        { id: "all", label: "สถานะ", value: "" },
        { id: "pending", label: "รออนุมัติ", value: "pending" },
        { id: "approved", label: "อนุมัติแล้ว", value: "approved" },
        { id: "rejected", label: "ปฏิเสธ", value: "rejected" },
    ];

    const handleApprove = (id: string) => {
        console.log("Approved:", id);
        // TODO: Implement API call
    };

    const handleReject = (id: string) => {
        console.log("Rejected:", id);
        // TODO: Implement API call
    };

    return (
        <div className="w-full min-h-screen flex flex-col p-4">
            <div className="flex-1">
                {/* Breadcrumb */}
                <div className="mb-[8px] space-x-[9px]">
                    <span className="text-[#858585]">การจัดการ</span>
                    <span className="text-[#858585]">&gt;</span>
                    <span className="text-[#000000]">คำร้อง</span>
                </div>

                {/* Page Title */}
                <div className="flex items-center gap-[14px] mb-[21px]">
                    <h1 className="text-2xl font-semibold">จัดการคำร้อง</h1>
                </div>

                {/* Filters */}
                <div className="w-full mb-[23px]">
                    <div className="flex justify-between items-center">
                        <SearchFilter onChange={setSearchFilter} />
                        <div>
                            <Dropdown
                                items={statusOptions}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                placeholder="สถานะ"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="w-full bg-white border border-[#D9D9D9] font-semibold text-gray-700 rounded-[16px] mb-[16px] h-[61px] grid [grid-template-columns:1.5fr_0.6fr_1fr_1.2fr_1fr_0.8fr_1fr_50px] items-center px-4">
                    <div className="flex items-center gap-2">
                        อุปกรณ์ <i className="fas fa-sort"></i>
                    </div>
                    <div className="flex items-center gap-2">
                        จำนวน <i className="fas fa-sort"></i>
                    </div>
                    <div className="flex items-center gap-2">
                        หมวดหมู่ <i className="fas fa-sort"></i>
                    </div>
                    <div className="flex items-center gap-2">
                        ชื่อผู้ร้องขอ <i className="fas fa-sort"></i>
                    </div>
                    <div className="flex items-center gap-2">
                        วันที่ร้องขอ <i className="fas fa-sort"></i>
                    </div>
                    <div className="flex items-center gap-2">
                        สถานะ <i className="fas fa-sort"></i>
                    </div>
                    <div className="flex items-center gap-2">
                        จัดการ <i className="fas fa-sort"></i>
                    </div>
                    <div></div>
                </div>

                {/* Request List */}
                <div className="w-full">
                    {MOCK_REQUESTS.map((req) => (
                        <RequestItem
                            key={req.id}
                            request={req}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Requests;
