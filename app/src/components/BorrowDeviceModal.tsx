import { useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { Icon } from "@iconify/react";
import TimePickerField from "./TimePickerField";
import { AlertDialog } from "./AlertDialog";
import type { ActiveBorrow, GetAvailable } from "../services/BorrowService";
import { useNavigate } from "react-router-dom";
import getImageUrl from "../services/GetImage";
import BorrowModal from "./BorrowDate/BorrowModal";
import { borrowService } from "../services/BorrowService";
// โครงสร้างข้อมูลอุปกรณ์
interface EquipmentDetail {
  serialNumber: string;
  name: string;
  total: number;
  category: string;
  department: string;
  section: string;
  imageUrl?: string;
  storageLocation: string;
  remain: number;
  maxBorrowDays: number;
  deviceId: number;
  accessories: {
    name: string;
    qty: number;
  }[];
}

// โครงสร้างข้อมูลฟอร์มการยืมอุปกรณ์
interface BorrowFormData {
  borrower: string;
  phone: string;
  reason: string;
  placeOfUse: string;
  quantity: number;
  dateRange: [Date | null, Date | null];
  borrowTime: string;
  returnTime: string;
}

// โครงสร้าง props ที่ต้องส่งมาเมื่อเรียกใช้งาน
interface BorrowEquipmentModalProps {
  mode: "borrow-equipment" | "edit-detail";
  defaultValue?: BorrowFormData; // ค่าเริ่มต้น
  equipment: EquipmentDetail; // รายละเอียดอุปกรณ์
  onSubmit: (data: { data: BorrowFormData }) => void; // ฟังก์ชันส่งข้อมูลตอน “ส่งคำร้อง” หรือ “บันทึก”
  onAddToCart?: (data: { data: any }) => void; // ฟังก์ชันเพิ่มไปยังรถเข็น
  availableDevices: GetAvailable[]; // รายการอุปกรณ์ลูก
  availableCount: number; // จำนวนอุปกรณ์ที่พร้อมใช้งาน
  selectedDeviceIds: number[]; // อุปกรณ์ที่เลือก
  onSelectDevice: (ids: number[]) => void; // เปลี่ยนอุปกรณ์ที่เลือก
  onDateTimeChange: (payload: { startISO: string; endISO: string }) => void; // เปลี่ยนวันเวลา
}

type Device = {
  dec_id: number;
  dec_serial_number?: string;
  dec_asset_code: string;
  dec_status: string;
  activeBorrow?: ActiveBorrow[];
  maxBorrow: number;
};

const BorrowEquipmentModal = ({
  mode,
  defaultValue,
  equipment,
  onSubmit,
  onAddToCart,
  availableDevices,
  availableCount,
  selectedDeviceIds,
  onSelectDevice,
  onDateTimeChange,
}: BorrowEquipmentModalProps) => {

  // ดึงข้อมูล user จาก sessionStorage หรือ localStorage
  const userString = sessionStorage.getItem("User") || localStorage.getItem("User");
  const user = userString ? JSON.parse(userString) : null;
  
  // role ที่สามารถยืมให้ผู้อื่นได้
  const isCanBorrowForOthers = user.us_role === "STAFF" || user.us_role === "ADMIN";

  // ค่าเริ่มต้นข้อมูลฟอร์มการยืม (ใช้ defaultValue ถ้ามี)
  const initialForm: BorrowFormData = {
    borrower: defaultValue?.borrower ?? `${user.us_firstname ?? ""} ${user.us_lastname ?? ""}`.trim(),
    phone: defaultValue?.phone ?? user.us_phone ?? "",
    reason: defaultValue?.reason ?? "",
    placeOfUse: defaultValue?.placeOfUse ?? "",
    quantity: defaultValue?.quantity ?? 1,
    dateRange: defaultValue?.dateRange ?? [null, null],
    borrowTime: defaultValue?.borrowTime ?? "",
    returnTime: defaultValue?.returnTime ?? "",
  };
  const [data, setData] = useState<Device[]>([]);
  // ฟอร์มยืมอุปกรณ์
  const [form, setForm] = useState<BorrowFormData>(initialForm);

  // ตัวอ้างอิงในการเปิด / ปิด ของ alert dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  // เก็บข้อความ error ของแต่ละ field ในฟอร์ม BorrowFormData
  const [errors, setErrors] = useState<
    Partial<Record<keyof BorrowFormData, string>>
  >({});
  function applyTimeToDate(
    date: Date,
    time: string, // "09:30"
  ): string {
    const [hour, minute] = time.split(":").map(Number);

    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);

    // ส่งเข้า backend เป็น ISO (UTC)
    return d.toISOString();
  }
  const navigate = useNavigate();

  /**
   * Description: ฟังก์ชันในการตรวจสอบข้อมูลและกำหนดข้อความ error
   * Input : -
   * Output : boolean (true = ข้อมูลถูกต้อง, false = ข้อมูลไม่ครบหรือไม่ถูกต้อง)
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const validate = () => {
    const newError: typeof errors = {};

    // ตรวจสอบชื่อผู้ยืม
    if (!form.borrower.trim()) {
      newError.borrower = "กรุณาระบุชื่อผู้ยืม";
    } else if (!/^[a-zA-Zก-๙\s]+$/.test(form.borrower)) {
      newError.borrower = "ชื่อต้องเป็นตัวอักษรเท่านั้น";
    }

    // ตรวจสอบเบอร์โทรศัพท์
    if (!form.phone.trim()) {
      newError.phone = "กรุณาระบุเบอร์โทรศัพท์ผู้ยืม";
    } else if (!/^\d+$/.test(form.phone)) {
      newError.phone = "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
    } else if (form.phone.length !== 10) {
      newError.phone = "เบอร์โทรศัพท์ต้องมี 10 หลัก";
    }

    // ตรวจสอบเหตุผลในการยืม
    if (!form.reason.trim()) {
      newError.reason = "กรุณาระบุเหตุผลในการยืม";
    }

    // ตรวจสอบสถานที่ใช้งาน
    if (!form.placeOfUse.trim()) {
      newError.placeOfUse = "กรุณาระบุสถานที่ใช้งาน";
    }

    // ตรวจสอบวันที่ยืมและวันที่คืน (กรณีไม่เลือกวัน)
    if (!form.dateRange[0]) {
      newError.dateRange = "กรุณาเลือกช่วงวันที่ยืม";
    }

    // วันที่เริ่มยืมและวันที่สิ้นสุด
    const startDate = form.dateRange[0];
    const endDate = form.dateRange[1] ?? form.dateRange[0];

    if (startDate && endDate && form.borrowTime && form.returnTime) {
      const sameDay = startDate.toISOString() === endDate.toISOString();
      // กรณียืมวันเดียว เวลาคืนต้องมากกว่าเวลายืม
      if (sameDay && form.borrowTime >= form.returnTime) {
        newError.returnTime = "เวลาที่คืนต้องมากกว่าเวลาที่ยืม";
      }
    }

    // ตรวจสอบเวลาที่ยืม
    if (!form.borrowTime) {
      newError.borrowTime = "กรุณาระบุช่วงเวลาที่ยืม";
    }

    // ตรวจสอบเวลาที่คืน
    if (!form.returnTime) {
      newError.returnTime = "กรุณาระบุช่วงเวลาที่คืน";
    }

    // อัปเดต state เพื่อให้แสดงข้อความ error
    setErrors(newError);

    // คืนค่า true เมื่อไม่ error (ฟอร์มถูกต้อง)
    return Object.keys(newError).length === 0;
  };

  /**
   * Description: ฟังก์ชันในการส่งคำร้องยืมอุปกรณ์
   * Input : -
   * Output : ส่งข้อมูลคำร้องไปยัง parent component, รีเซ็ตฟอร์ม และปิด AlertDialog
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const handleSubmitBorrow = () => {
    // ส่งข้อมูลไปยัง parent component
    onSubmit({
      data: form,
    });

    // รีเซ็ตค่าในฟอร์ม
    setForm(initialForm);
    // ปิด alert
    setIsConfirmOpen(false);
  };

  /**
   * Description: ฟังก์ชันในการเพิ่มอุปกรณ์ไปยังรถเข็น
   * Input : -
   * Output : ส่งข้อมูลไปยัง parent component เพื่อบันทึกลงตะกร้า
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  
  const handleAddToCart = async () => {
    try {
      // ส่งข้อมูลไปยัง parent component
      await onAddToCart?.({ data: form });

      // แจ้ง Navbar ให้เช็คของใหม่
      //Nontapat Sinthum (Guitar) 66160104
      window.dispatchEvent(new Event("cart:changed"));
    } catch (error) {
      console.error("add to cart error:", error);
    }
  };

  /**
   * Description: ฟังก์ชันในการแก้ไขรายละเอียดอุปกรณ์
   * Input : -
   * Output : ส่งข้อมูลที่แก้ไขแล้วไปยัง parent component และปิด AlertDialog
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const handleSubmitEdit = () => {
    // ส่งข้อมูลไปยัง parent component
    const submitData = {
      ...form,
      borrowTime: applyTimeToDate(form.dateRange[0]!, form.borrowTime),
      returnTime: applyTimeToDate(
        form.dateRange[1] ?? form.dateRange[0]!,
        form.returnTime,
      ),
    };

    onSubmit({ data: submitData });

    // ปิด alert
    setIsConfirmOpen(false);
  };

  /**
   * Description: ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลฟอร์ม
   * Input : -
   * Output : เปิด AlertDialog เมื่อข้อมูลผ่านการตรวจสอบ
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const handleOpenConfirm = () => {
    if (!validate()) {
      return;
    }

    setIsConfirmOpen(true);
  };

  /**
   * Description: ฟังก์ชันควบคุมการทำงานหลัก ตามโหมดของหน้า
   * Input : -
   * Output : ดำเนินการยืมอุปกรณ์ หรือบันทึกการแก้ไขตามโหมด
   * Author : Thakdanai Makmi (Ryu) 66160355
   **/
  const handlePrimaryAction = () => {
    // ตรวจสอบว่าเป็นโหมดการยืมอุปกรณ์หรือไม่
    if (mode === "borrow-equipment") {
      handleSubmitBorrow();
    } else {
      handleSubmitEdit();
    }
  };

  // useEffect(() => {
  //   // วันเวลาที่เริ่มยืม-คืน
  //   const [startDate, endDateRaw] = form.dateRange;
  //   // กรณียืมวันเดียว
  //   const endDate = endDateRaw ?? startDate;

  //   if (!startDate) return;

  //   if (!form.borrowTime || !form.returnTime) return;

  //   if (startDate && endDate && form.borrowTime && form.returnTime) {
  //     // นับจำนวนอุปกรณ์ที่พร้อมใช้งาน
  //     onDateTimeChange();
  //   }
  // }, [form.dateRange, form.borrowTime, form.returnTime]);

  useEffect(() => {
    const startDate = form.dateRange[0];
    const endDate = form.dateRange[1] ?? form.dateRange[0];

    if (!startDate || !endDate) return;
    if (!form.borrowTime || !form.returnTime) return;

    const [sh, sm] = form.borrowTime.split(":").map(Number);
    const [eh, em] = form.returnTime.split(":").map(Number);

    const start = new Date(startDate);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(endDate);
    end.setHours(eh, em, 0, 0);

    onDateTimeChange({
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    });
  }, [form.dateRange, form.borrowTime, form.returnTime]);

  const fetchData = async () => {
    try {
      const res = await borrowService.getAvailable(equipment.deviceId);
      setData(res);
    } catch (error) {
      console.error("API error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [equipment.deviceId]);

  // เช็คอุปกรณ์ว่างตามช่วงเวลา
  const isBorrowAvailable = (
    start: Date | null,
    end: Date | null,
    timeStart?: string,
    timeEnd?: string,
    activeBorrow?: ActiveBorrow[] | null,
  ): boolean => {
    // ยังไม่เลือกวันเวลา
    if (!start || !end || !timeStart || !timeEnd) return true;
    // อุปกรณ์นี้ไม่มีประวัติถูกยืม
    if (!activeBorrow || activeBorrow.length === 0) return true;

    // รวมวันเวลา ให้กลายเป็น Date
    const combineDateTime = (date: Date, time: string) => {
      const [hour, minute] = time.split(":").map(Number); // แยกชั่วโมงและนาที
      const dateTime = new Date(date);
      dateTime.setHours(hour, minute, 0, 0);
      return dateTime;
    };

    // เวลาที่ผู้ใช้ต้องการยืม
    const userStart = combineDateTime(start, timeStart);
    const userEnd = combineDateTime(end, timeEnd);

    // ถ้าเวลาเริ่มมากกว่าเวลาสิ้นสุด
    if (userStart > userEnd) return false;

    // ตรวจสอบช่วงเวลาที่ผู้ใช้เลือก ชนกับช่วงเวลาที่ถูกยืมอยู่หรือไม่
    return !activeBorrow.some((borrow) => {
      const borrowStart = new Date(borrow.start);
      const borrowEnd = new Date(borrow.end);
      return userStart < borrowEnd && userEnd > borrowStart;
    });
  };

  // หาอุปกรณ์ที่ว่างในช่วงเวลาที่เลือก (ช่วงเวลานี้มีอุปกรณ์ที่ว่างทั้งหมด X ชิ้น)
  const readyDevices =
    form.dateRange[0] && form.dateRange[1] && form.borrowTime && form.returnTime
      ? (availableDevices ?? [])
        .filter((devices) => devices.dec_status === "READY")
        .filter((device) =>
          isBorrowAvailable(
            form.dateRange[0],
            form.dateRange[1],
            form.borrowTime,
            form.returnTime,
            device.availabilities,
          ),
        )
      : [];

  return (
    <div className="flex justify-around items-start gap-[24px] rounded-[16px] w-[1672px] h-auto">
      {/* การ์ดฟอร์มยืมอุปกรณ์ */}
      <form className="flex flex-col justify-between gap-[30px] text-[16px] bg-[#FFFFFF] border border-[#D9D9D9] rounded-[16px] w-[1047px] px-[40px] py-[70px]">
        {/* หัวข้อ */}
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[7px]">
            <h1 className="text-[18px] font-medium">1. ระบุข้อมูลผู้ยืม</h1>
            <p className="text-[#40A9FF] font-medium">
              รายละเอียดข้อมูลอุปกรณ์
            </p>
          </div>
          {/* ชื่อผู้ยืม */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[16px] font-medium">
              ชื่อผู้ยืม <span className="text-[#F5222D]">*</span>
            </label>
            <Input
              className="disabled:bg-white"
              fullWidth
              placeholder="กรอกข้อมูลชื่อผู้ยืม"
              value={form.borrower}
              onChange={(e) => setForm({ ...form, borrower: e.target.value })}
              error={errors.borrower}
              disabled={!isCanBorrowForOthers}
            />
          </div>
          {/* เบอร์โทรศัพท์ผู้ยืม */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[16px] font-medium">
              เบอร์โทรศัพท์ผู้ยืม <span className="text-[#F5222D]">*</span>
            </label>
            <Input
              className="disabled:bg-white"
              maxLength={10}
              fullWidth
              placeholder="กรอกข้อมูลเบอร์โทรศัพท์ผู้ยืม"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
              disabled={!isCanBorrowForOthers}
            />
          </div>
          {/* เหตุผลในการยืม */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[16px] font-medium">
              เหตุผลในการยืม <span className="text-[#F5222D]">*</span>
            </label>
            <textarea
              className={`border rounded-[16px] w-full h-[111px] px-[15px] py-[8px] placeholder:text-[#CDCDCD] focus:outline-none focus:ring-2 focus:border-transparent transition-all
                ${errors.reason ? "border-red-500 focus:ring-red-500" : "border-[#D8D8D8] focus:ring-blue-500"}
                `}
              placeholder="กรอกข้อมูลเหตุผลในการยืม"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            ></textarea>
            {errors.reason && (
              <span className="text-sm mt-1 text-red-500">{errors.reason}</span>
            )}
          </div>
          {/* สถานที่ใช้งาน */}
          <div className="flex flex-col gap-[4px]">
            <label className="text-[16px] font-medium">
              สถานที่ใช้งาน <span className="text-[#F5222D]">*</span>
            </label>
            <textarea
              className={`border rounded-[16px] w-full h-[111px] px-[15px] py-[8px] placeholder:text-[#CDCDCD] focus:outline-none focus:ring-2 focus:border-transparent transition-all
                ${errors.placeOfUse ? "border-red-500 focus:ring-red-500" : "border-[#D8D8D8] focus:ring-blue-500"}
              `}
              placeholder="กรอกสถานที่ใช้งาน"
              value={form.placeOfUse}
              onChange={(e) => setForm({ ...form, placeOfUse: e.target.value })}
            ></textarea>
            {errors.placeOfUse && (
              <span className="text-sm mt-1 text-red-500">
                {errors.placeOfUse}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[20px]">
          {/* หัวข้อ */}
          <div className="flex flex-col gap-[7px]">
            <h1 className="text-[18px] font-medium">2. เลือกช่วงเวลาการยืม</h1>
            <p className="text-[#40A9FF] font-medium">
              รายละเอียดช่วงเวลาการยืม
            </p>
          </div>
          {/* วันเวลาที่ยืม */}
          <div className="flex gap-[10px]">
            <div className="flex flex-col gap-[4px]">
              <label className="text-[16px] font-medium">
                ช่วงวันที่ยืม <span className="text-[#F5222D]">*</span>
              </label>
              <BorrowModal
                defaultValues={data}
                maxBorrow={equipment.maxBorrowDays}
                timeDefault={{
                  time_start: form.borrowTime,
                  time_end: form.returnTime,
                }}
                dateDefault={{
                  start: form.dateRange[0] ? new Date(form.dateRange[0]) : null,
                  end: form.dateRange[1] ? new Date(form.dateRange[1]) : null,
                }}
                onConfirm={(data) => {
                  setForm((prev: any) => ({
                    ...prev,
                    dateRange: [
                      data.borrow_start ? new Date(data.borrow_start) : null,
                      data.borrow_end ? new Date(data.borrow_end) : null,
                    ],
                    borrowTime: data.time_start,
                    returnTime: data.time_end,
                  }));
                }}
              />
              {errors.dateRange && (
                <p className="text-sm mt-1 text-red-500">{errors.dateRange}</p>
              )}
            </div>
          </div>
          {/* เวลาที่ยืม - คืน */}
          <div className="flex gap-[10px]">
            <div className="flex flex-col gap-[4px]">
              <label className="text-[16px] font-medium">
                ช่วงเวลาที่ยืม <span className="text-[#F5222D]">*</span>
              </label>
              <TimePickerField
                width={239}
                label=""
                value={form.borrowTime}
                onChange={(time: string) =>
                  setForm({ ...form, borrowTime: time })
                }
                placeholder="เวลายืม"
              />
              {errors.borrowTime && (
                <span className="text-sm mt-1 text-red-500">
                  {errors.borrowTime}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="text-[16px] font-medium">
                ช่วงเวลาที่คืน <span className="text-[#F5222D]">*</span>
              </label>
              <TimePickerField
                width={239}
                label=""
                value={form.returnTime}
                onChange={(time: string) =>
                  setForm({ ...form, returnTime: time })
                }
                placeholder="เวลาคืน"
              />
              {errors.returnTime && (
                <span className="text-sm mt-1 text-red-500">
                  {errors.returnTime}
                </span>
              )}
            </div>
          </div>
          {
            // เลือกวันที่และเวลายืม-คืน ก่อนจึงจะแสดง
            form.dateRange[0] && form.borrowTime && form.returnTime && (
              <div className="flex items-center gap-[10px] text-[#00AA1A]">
                <Icon icon="icon-park-solid:check-one" width={20} height={20} />
                <p className="text-[16px]">
                  ช่วงเวลานี้มีอุปกรณ์ที่ว่างทั้งหมด {readyDevices.length} ชิ้น
                </p>
              </div>
            )
          }

          {/* แสดงรายการอุปกรณ์ที่ว่างคร่าวๆ (ลบได้) */}
          <div className="grid grid-cols-2 gap-[22px]">
            {
              // เทสแสดงรายการอุปกรณ์ที่พร้อมใช้งาน (ให้ผู้ใช้เลือกเอง)
              readyDevices
                .map((device) => {
                  // ตรวจสอบว่าอุปกรณ์ที่เลือกอยู่ในรายการที่เลือกอยู่แล้วหรือไม่
                  const checked = selectedDeviceIds.includes(device.dec_id);
                  return (
                    <label
                      key={device.dec_id}
                      className="flex items-center gap-[10px] border border-[#A2A2A2] rounded-[12px] px-[12px] py-[10px] cursor-pointer
                                    "
                  >
                    <input
                      type="checkbox"
                      className="custom-checkbox-inventory"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          // ถ้าถูกเลือกอยู่ -> เอาติ๊กออก ถ้ายังไม่ถูกเลือก -> ติ๊ก
                          onSelectDevice(
                            selectedDeviceIds.filter(
                              (id) => id !== device.dec_id,
                            ),
                          );
                        } else {
                          // ยังไม่ถูกเลือก เพิ่มเข้ารายการที่เลือก
                          onSelectDevice([...selectedDeviceIds, device.dec_id]);
                        }
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {device.dec_serial_number}
                      </span>
                      <span className="text-[12px] text-[#888]">
                        {device.dec_asset_code}
                      </span>
                    </div>
                  </label>
                );
              })
            }
          </div>
        </div>
        {/* ปุ่ม */}
        <div
          className={`flex gap-[20px] ${mode === "edit-detail" ? "justify-end" : ""}`}
        >
          {
            // ถ้าเป็นยืมอุปกรณ์แสดงเพิ่มไปยังรถเข็น
            mode === "borrow-equipment" && (
              <Button
                disabled={selectedDeviceIds.length === 0}
                type="button"
                className="!border border-[#008CFF] !text-[#008CFF] !w-[285px] !h-[46px] font-semibold"
                variant="outline"
                onClick={handleAddToCart}
              >
                <Icon icon="mdi-light:cart" width="36" height="36" />
                เพิ่มไปยังรถเข็น
              </Button>
            )
          }
          {/* ปุ่มยกเลิก (เฉพาะ edit-detail) */}
          {mode === "edit-detail" && (
            <Button
              type="button"
              className="!bg-[#E5E7EB] text-black !w-[112px] !h-[46px] hover:!bg-[#D1D5DB] font-semibold"
              onClick={() => {
                navigate("/list-devices/cart");
              }}
            >
              ยกเลิก
            </Button>
          )}
          {/* ปุ่มหลัก */}
          <Button
            disabled={selectedDeviceIds.length === 0}
            onClick={handleOpenConfirm}
            type="button"
            className="!w-[155px] !h-[46px] font-semibold"
            variant="primary"
          >
            {mode === "borrow-equipment" ? "ส่งคำร้อง" : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </form>
      {/* การ์ดรายละเอียดอุปกรณ์ */}
      <div className="flex flex-col gap-[20px] bg-[#FFFFFF] border border-[#BFBFBF] rounded-[16px] w-[600px] min-h-[668px] px-[40px] py-[40px]">
        {/* รูปภาพอุปกรณ์ */}
        <div className="rounded-[16px] w-[520px] h-[118px] overflow-hidden">
          {equipment.imageUrl && (
            <img
              className="w-full h-full object-cover"
              src={getImageUrl(equipment.imageUrl)}
            />
          )}
        </div>
        {/* รายละเอียดอุปกรณ์ */}
        <div className="flex flex-col gap-[20px] text-[14px] text-[#747474]">
          <p className="text-[16px] text-black font-semibold">
            {equipment.name}
          </p>
          <p className="text-[#747474]">
            รหัสอุปกรณ์: {equipment.serialNumber}
          </p>
          <div className="w-[520px] h-[1px] bg-[#D9D9D9]"></div>
          <p className="text-[16px] text-black font-semibold">
            รายละเอียดอุปกรณ์
          </p>
          <p>หมวดหมู่: {equipment.category}</p>
          <p>แผนก: {equipment.department}</p>
          <p>ฝ่ายย่อย: {equipment.section}</p>
          <p>สถานที่เก็บอุปกรณ์: {equipment.storageLocation}</p>
          {/* อุปกรณ์เสริม */}
          <div className="flex flex-col gap-[10px] border border-[#D9D9D9] rounded-[16px] w-[520px] min-h-[106px] text-[14px] px-[24px] py-[15px]">
            <div className="flex items-center gap-[10px]">
              <Icon
                className="text-[#848484]"
                icon="material-symbols-light:box-outline-rounded"
                width="24"
                height="24"
              />
              <p className="text-black font-semibold">อุปกรณ์เสริม</p>
            </div>
            {/* รายการอุปกรณ์เสริม */}
            {equipment.accessories.length > 0 ? (
              <div className="flex flex-col gap-[10px] pl-[34px] pr-[10px]">
                {equipment.accessories.map((acc, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <p>{acc.name}</p>
                    <p>
                      {acc.qty *
                        (selectedDeviceIds.length > 0
                          ? selectedDeviceIds.length
                          : 1)}{" "}
                      ชิ้น
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">ไม่มีอุปกรณ์เสริม</p>
            )}
          </div>
        </div>
        {/* ยืมได้สูงสุด / จำนวนคงเหลือ */}
        <div className="flex gap-[10px] text-[16px]">
          <p className="flex justify-center items-center bg-[#FF4D4F]/10 rounded-[10px] text-[#ED1A1A] min-w-[191px] h-[39px] px-[20px]">
            *ยืมได้สูงสุดไม่เกิน {equipment.maxBorrowDays} วัน
          </p>
          <p className="flex justify-center items-center bg-[#00AA1A]/10 rounded-[10px] text-[#00AA1A] min-w-[191px] h-[39px] px-[20px]">
            ขณะนี้ว่าง {availableCount} ชิ้น
          </p>
        </div>
      </div>
      {isConfirmOpen && (
        <AlertDialog
          tone="warning"
          title={
            mode === "borrow-equipment"
              ? "ยืนยันการส่งคำร้อง?"
              : "ยืนยันการบันทึกการแก้ไข"
          }
          open={isConfirmOpen}
          onConfirm={handlePrimaryAction}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default BorrowEquipmentModal;
