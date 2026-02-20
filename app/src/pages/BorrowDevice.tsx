import { Link, useLocation, useNavigate } from "react-router-dom";
import BorrowEquipmentModal from "../components/BorrowDeviceModal";
import {
  borrowService,
  type GetAvailable,
  type GetDeviceForBorrow,
  type DeviceAvailability,
  type BorrowUsers,
} from "../services/BorrowService";
import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";

interface BorrowForm {
  borrowerId: number; // ไอดีคนที่จะยืมให้
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
  phone: string;
  reason: string;
  placeOfUse: string;
  quantity: number;
  dateRange: [Date | null, Date | null];
  borrowTime: string;
  returnTime: string;
}

const BorrowDevice = () => {
  const navigate = useNavigate();

  const location = useLocation();
  // รับรหัสอุปกรณ์แม่ที่ส่งมาจาก state ของ navigate
  const deId = location.state?.deviceId;
  // เก็บข้อมูลอุปกรณ์แม่
  const [device, setDevice] = useState<GetDeviceForBorrow | null>(null);

  // เก็บข้อมูลอุปกรณ์ลูก
  const [availableDevices, setAvailableDevices] = useState<GetAvailable[]>([]);
  // เก็บอุปกรณ์ที่ผู้ใช้เลือก
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  // เก็บจำนวนอุปกรณ์ที่สถานะ READY
  const [availableCount, setAvailableCount] = useState(0);

  const [deviceAvailabilities, setDeviceAvailabilities] = useState<
    DeviceAvailability[]
  >([]);

  useEffect(() => {
    let isLive = true;

    const fetchAvailabilities = async () => {
      try {
        const res = await borrowService.getDeviceAvailabilities();
        if (isLive) setDeviceAvailabilities(res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAvailabilities();

    return () => {
      isLive = false;
    };
  }, []);

  // ใช้ำสำหรับแสดง toast
  const { push } = useToast();

  // ดึงข้อมูลอุปกรณ์แม่เมื่อเรนเดอร์หน้าเว็บครั้งแรก
  useEffect(() => {
    const fetchDevice = async () => {
      if (!deId) return; // ป้องกันการเรียก API ถ้าไม่มี deId
      const res = await borrowService.getDeviceForBorrow(deId);
      setAvailableCount(res.ready); // เก็บจำนวนอุปกรณ์ (ขณะนี้ว่าง X ชิ้น)
      // เก็บข้อมูลลงใน state
      setDevice(res);
    };

    fetchDevice();
  }, [deId]);

  // ดึงข้อมูล user จาก sessionStorage หรือ localStorage
  const userString = sessionStorage.getItem("User") || localStorage.getItem("User");
  const user = userString ? JSON.parse(userString) : null;

  // role ที่สามารถยืมให้ผู้อื่นได้
  const isCanBorrowForOthers = user?.us_role === "STAFF" || user?.us_role === "ADMIN";
  // เก็บรายชื่อผู้ใช้
  const [borrowUsers, setBorrowUsers] = useState<BorrowUsers[]>([]);

  /**
  * Description: ฟังก์ชันสำหรับดึงรายชื่อในการยืมให้ผู้อื่น (ดึงข้อมูลก็ต่อเมื่อ role นั้น สามารถยืมให้ผู้อื่นได้)
  * Input : -
  * Output : รายชื่อผู้ใช้
  * Author : Thakdanai Makmi (Ryu) 66160355
  **/
  useEffect(() => {
    if (!isCanBorrowForOthers) return;

    const fetchBorrowUsers = async () => {
      const res = await borrowService.getBorrowUsers();
      setBorrowUsers(res);
    };

    fetchBorrowUsers();
  }, [isCanBorrowForOthers]);

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
    deviceId: deId,
    serialNumber: device.de_serial_number,
    name: device.de_name,
    category: device.category?.ca_name ?? "",
    department: device.department ?? "",
    section: device.section ?? "",
    imageUrl: device.de_images ?? "",
    storageLocation: device.de_location,
    total: device.total,
    remain: device.ready,
    maxBorrowDays: device.de_max_borrow_days,
    accessories: accessory,
  };

  /**
   * Description: ฟังก์ชันสำหรับรวมวันที่และเวลาเป็น Date (ISO)
   * Input : date - วันที่, time - เวลา
   * Output : วันที่และเวลาที่ถูกรวมแล้ว
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const buildDateTime = (date: Date, time: string) => {
    // แยกชั่วโมงและนาที
    const [hh, mm] = time.split(":").map(Number);
    // clone วันที่
    const dateTime = new Date(date);
    // ตั้งค่าเวลาให้วันที่
    dateTime.setHours(hh, mm, 0, 0);
    return dateTime;
  };

  //เวลายืมคืนใน DeviceAvailabilities
  const isOverlap = (
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
  ) => {
    const as = new Date(aStart).getTime();
    const ae = new Date(aEnd).getTime();
    const bs = new Date(bStart).getTime();
    const be = new Date(bEnd).getTime();
    return as <= be && ae >= bs;
  };

  /**
   * Description: ฟังก์ชันสำหรับจัดการเมื่อมีการเปลี่ยนวันที่หรือเวลาที่เลือก
   * Input : -
   * Output : อัปเดตข้อมูลอุปกรณ์ที่ว่าง, จำนวนอุปกรณ์ที่ว่าง และรีเซ็ตการเลือกอุปกรณ์
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  // const handleDateTimeChange = async () => {
  const handleDateTimeChange = async (payload: {
    startISO: string;
    endISO: string;
  }) => {
    // // ดึงข้อมูล device childs ทั้งหมด พร้อมเวลาที่ถูกยืม
    // const res = await borrowService.getAvailable(deId);
    // setAvailableDevices(res);

    // // นับจำนวนอุปกรณ์ที่ว่าง
    // const readyCount = res.filter((d) => d.dec_status === "READY").length;
    // setAvailableCount(readyCount);

    // // reset การเลือก ถ้าเวลาเปลี่ยน
    // setSelectedDeviceIds([]);

    if (!deId) return;

    const { startISO, endISO } = payload;

    const res = await borrowService.getAvailable(deId);

    const blockedDecIdSet = new Set(
      deviceAvailabilities
        .filter((da) => da.da_status === "ACTIVE")
        .filter((da) => isOverlap(da.da_start, da.da_end, startISO, endISO))
        .map((da) => da.da_dec_id)
    );

    const filtered = res.filter(
      (device) => !blockedDecIdSet.has(device.dec_id)
    );

    setAvailableDevices(filtered);

    // const readyCount = filtered.filter((d) => d.dec_status === "READY").length;
    // setAvailableCount(readyCount);

    setSelectedDeviceIds([]);
  };

  /**
   * Description: ฟังก์ชันสำหรับส่งคำร้องยืมอุปกรณ์
   * Input : data - ข้อมูลฟอร์มการยืมอุปกรณ์
   * Output : สร้างคำร้องยืมอุปกรณ์ และนำทางกลับไปยังหน้ารายการอุปกรณ์
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
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

      const payload = {
        borrowerId: data.borrowerId, // ไอดีคนที่จะยืมให้
        deviceChilds: selectedDeviceIds, // อุปกรณ์ที่เลือก
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
      navigate("/list-devices"); // กลับไปหน้ารายการอุปกรณ์
    }
  };

  /**
   * Description: ฟังก์ชันสำหรับเพิ่มอุปกรณ์ลงในรถเข็น
   * Input : data - ข้อมูลฟอร์มการยืมอุปกรณ์
   * Output : เพิ่มอุปกรณ์ลงรถเข็น และนำทางกลับไปยังหน้ารายการอุปกรณ์
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const handleAddToCart = async ({ data }: { data: AddToCart }) => {
    try {
      // วันที่ยืมและวันที่คืน
      const [borrowDate, returnDateRaw] = data.dateRange;
      // วันที่คืน (กรณียืมวันเดียว)
      const returnDate = returnDateRaw ?? borrowDate;

      if (!borrowDate || !returnDate) return;

      // รวมวันเวลาที่ยืมและคืนเป็น Date
      const borrowStart = buildDateTime(borrowDate, data.borrowTime);
      const borrowEnd = buildDateTime(returnDate, data.returnTime);

      const payload = {
        deviceId: deId,
        borrower: data.borrower,
        phone: data.phone,
        reason: data.reason,
        placeOfUse: data.placeOfUse,
        quantity: selectedDeviceIds.length,
        borrowStart: borrowStart.toISOString(),
        borrowEnd: borrowEnd.toISOString(),
        deviceChilds: selectedDeviceIds, // อุปกรณ์ที่เลือก
      };

      await borrowService.addToCart(payload);

      push({ tone: "success", message: "เพิ่มไปยังรถเข็นเสร็จสิ้น!" });
    } catch (error) {
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการเพิ่มไปยังรถเข็น!" });
    } finally {
      navigate("/list-devices"); // กลับไปหน้ารายการอุปกรณ์
    }
  };

  return (
    <div className="flex flex-col gap-[20px] w-[1707px] min-h-[945px] px-[20px] py-[20px]">
      <div className="space-x-[9px]">
        <Link to="/list-devices" className="text-[#858585]">
          รายการอุปกรณ์
        </Link>
        {/* <span className="text-[#858585]">รายการอุปกรณ์</span> */}
        <span className="text-[#858585]">&gt;</span>
        <span className="text-[#000000]">ยืมอุปกรณ์</span>
      </div>

      <div className="flex items-center">
        <h1 className="text-[36px] font-semibold">ยืมอุปกรณ์</h1>
      </div>
      <BorrowEquipmentModal
        mode="borrow-equipment"
        equipment={equipment} // ข้อมูลอุปกรณ์
        availableDevices={availableDevices} // รายการอุปกรณ์ลูก
        availableCount={availableCount} // จำนวนอุปกรณ์ที่พร้อมใช้งาน (READY)
        selectedDeviceIds={selectedDeviceIds} // อุปกรณ์ที่เลือก
        onSelectDevice={setSelectedDeviceIds} // เปลี่ยนอุปกรณ์ที่เลือก
        onDateTimeChange={handleDateTimeChange} // เปลี่ยนวันเวลา
        onSubmit={handleSubmit}
        onAddToCart={handleAddToCart}
        borrowUsers={borrowUsers}
      />
    </div>
  );
};

export default BorrowDevice;
