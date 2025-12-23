import { useLocation, useNavigate } from "react-router-dom"
import BorrowEquipmentModal from "../components/BorrowDeviceModal"
import { borrowService, type GetDeviceForBorrow } from "../services/BorrowService";
import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";

interface BorrowForm {
    dateRange: [Date | null, Date | null];
    quantity: number;
    reason: string;
    placeOfUse: string;
    borrowTime: string;
    returnTime: string;
}

interface AddToCart {
    deviceId: number;
    borrower: string;
    phone: string,
    reason: string,
    placeOfUse: string,
    quantity: number,
    dateRange: [Date | null, Date | null];
    borrowTime: string;
    returnTime: string;
}

const BorrowDevice = () => {
    const navigate = useNavigate();

    const location = useLocation();
    // รับรหัสอุปกรณ์แม่ที่ส่งมาจาก state ของ navigate
    const de_id = location.state?.deviceId;
    // เก็บข้อมูลอุปกรณ์
    const [device, setDevice] = useState<GetDeviceForBorrow | null>(null);
    // ใช้ำสำหรับแสดง toast
    const { push } = useToast();

    // ดึงข้อมูลอุปกรณ์เมื่อเรนเดอร์หน้าเว็บครั้งแรก
    useEffect(() => {
        const fetchDevice = async () => {
            const res = await borrowService.getDeviceForBorrow(de_id);
            // เก็บข้อมูลลงใน state
            setDevice(res.data);
        }

        fetchDevice();
    }, [de_id]);

    if (!device) {
        return null;
    }

    // อุปกรณ์เสริม
    const accessory = device.accessories
        ? device.accessories?.map((acc) => ({
            name: acc.acc_name,
            qty: acc.acc_quantity,
        }))
        : [];

    // รายละเอียดของอุปกรณ์ ที่จะส่งไปให้ BorrowEquipmentModal
    const equipment = {
        serialNumber: device.de_serial_number,
        name: device.de_name,
        category: device.category?.ca_name ?? "",
        department: device.department ?? "",
        section: device.section ?? "",
        imageUrl: device.de_images ?? "",
        storageLocation: device.de_location,
        total: device.device_childs?.length ?? 0,
        remain: device.device_childs?.filter(
            (d) => d.dec_status === "READY"
        ).length ?? 0,
        maxBorrowDays: device.de_max_borrow_days,
        accessories: accessory
    };

    // หาอุปกรณ์ลูกที่สถานะเป็น Ready
    const getReadyDeviceChilds = (deviceChilds: { dec_id: number, dec_status: string }[], quantity: number) => {
        const ready = deviceChilds.filter((d) => d.dec_status === "READY");
        return ready.slice(0, quantity).map(d => d.dec_id);
    }

    // ฟังก์ชันสำหรับรวมวันที่และเวลาเป็น Date (ISO)
    const buildDateTime = (date: Date, time: string) => {
        // แยกชั่วโมงและนาที
        const [hh, mm] = time.split(":").map(Number);
        // clone วันที่
        const d = new Date(date);
        // ตั้งค่าเวลาให้วันที่
        d.setHours(hh, mm, 0, 0);
        return d;
    };

    // ส่งคำร้องยืมอุปกรณ์
    const handleSubmit = async ({ data }: { data: BorrowForm }) => {
        try {
            // วันที่ยืมและวันที่คืน
            const [borrowDate, returnDateRaw] = data.dateRange;
            // วันที่คืน (กรณียืมวันเดียว)
            const returnDate = returnDateRaw ?? borrowDate;

            if (!borrowDate || !returnDate) return;

            // รวมวันเวลาที่ยืมและคืนเป็น Date
            const borrowStart = buildDateTime(borrowDate, data.borrowTime);
            const borrowEnd = buildDateTime(returnDate, data.returnTime);

            // หาอุปกรณ์ลูกที่พร้อมให้ยืม
            const deviceChilds = getReadyDeviceChilds(
                device.device_childs ?? [],
                data.quantity
            );

            const payload = {
                deviceChilds,
                borrowStart: borrowStart.toISOString(),
                borrowEnd: borrowEnd.toISOString(),
                reason: data.reason,
                placeOfUse: data.placeOfUse,
            };

            await borrowService.createBorrowTicket(payload);

            push({ tone: "success", message: "ส่งคำร้องเสร็จสิ้น!" });

        } catch (error) {
            push({ tone: "danger", message: "เกิดข้อผิดพลาดในการส่งคำร้อง!" });
        } finally {
            navigate('/list-devices'); // กลับไปหน้ารายการอุปกรณ์
        }

    };

    const handleAddToCard = async ({ data }: { data: AddToCart }) => {
        try {
            // วันที่ยืมและวันที่คืน
            const [borrowDate, returnDateRaw] = data.dateRange;
            // วันที่คืน (กรณียืมวันเดียว)
            const returnDate = returnDateRaw ?? borrowDate;

            if (!borrowDate || !returnDate) return;

            const borrowStart = buildDateTime(borrowDate, data.borrowTime);
            const borrowEnd = buildDateTime(returnDate, data.returnTime);

            // หาอุปกรณ์ลูกที่พร้อมให้ยืม
            const deviceChilds = getReadyDeviceChilds(
                device.device_childs ?? [],
                data.quantity
            );

            const payload = {
                deviceId: de_id,
                borrower: data.borrower,
                phone: data.phone,
                reason: data.reason,
                placeOfUse: data.placeOfUse,
                quantity: data.quantity,
                borrowStart: borrowStart.toISOString(),
                borrowEnd: borrowEnd.toISOString(),
                deviceChilds,
            }

            await borrowService.addToCart(payload);

            push({ tone: "success", message: "เพิ่มไปยังรถเข็นเสร็จสิ้น!" });
        } catch (error) {
            push({ tone: "danger", message: "เกิดข้อผิดพลาดในการเพิ่มไปยังรถเข็น!" });
        } finally {
            navigate('/list-devices'); // กลับไปหน้ารายการอุปกรณ์
        }
    }

    return (
        <div className="flex flex-col gap-[20px] w-[1707px] min-h-[945px] px-[20px] py-[20px]">

            <div className="space-x-[9px]">
                <span className="text-[#858585]">รายการอุปกรณ์</span>
                <span className="text-[#858585]">&gt;</span>
                <span className="text-[#000000]">ยืมอุปกรณ์</span>
            </div>

            <div className="flex items-center">
                <h1 className="text-[36px] font-semibold">ยืมอุปกรณ์</h1>
            </div>

            <BorrowEquipmentModal
                mode="borrow-equipment"
                equipment={equipment}
                onSubmit={handleSubmit}
                onAddToCart={handleAddToCard}
            />
        </div>
    )
}

export default BorrowDevice