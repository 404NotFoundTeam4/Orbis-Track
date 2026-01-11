/**
 * Description: หน้าแก้ไขรายละเอียดอุปกรณ์ในรถเข็น (Edit Cart)
 * Note : ใช้สำหรับแสดงข้อมูลการยืมอุปกรณ์ที่ผู้ใช้เคยเพิ่มไว้ในรถเข็น
 * และสามารถแก้ไขข้อมูล เช่น จำนวน วันที่ยืม เหตุผล ฯลฯ แล้วบันทึกกลับเข้าสู่ระบบได้
 *
 * Flow การทำงาน:
 * 1. รับ ctiId จาก route state
 * 2. ดึงข้อมูลอุปกรณ์จาก CartService
 * 3. แปลงข้อมูลให้อยู่ในรูปแบบที่ BorrowDeviceModal ใช้งานได้
 * 4. เมื่อกดบันทึก จะเรียก API เพื่ออัปเดตข้อมูลในรถเข็น
 * 5. บันทึกสำเร็จ → กลับไปหน้ารถเข็น
 * 6. บันทึกไม่สำเร็จ(ยกเลิก) → รีเทิร์นหน้ารถเข็น(reset data)
 *
 * Author: Salsabeela Sa-e (San) 66160349
 */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BorrowDeviceModal from "../components/BorrowDeviceModal";
import CartService from "../services/CartService";
import { borrowService } from "../services/BorrowService";
import { useToast } from "../components/Toast";

export interface ActiveBorrow {
  start: string;
  end: string;
}

export interface GetAvailable {
  dec_id: number;
  dec_serial_number?: string;
  dec_asset_code: string;
  dec_status: "READY" | "BORROWED" | "REPAIRING" | "DAMAGED" | "LOST";
  availabilities: ActiveBorrow[];
}

export interface CartItem {
  ctiId: number;
  deviceId: number;
  name: string;
  code: string;
  category: string;
  department: string;
  section: string;
  qty: number;
  readyQuantity: number;
  maxQuantity: number;
  availability: string;
  borrowDate: string | null;
  returnDate: string | null;
  borrower: string | null;
  phone: string | null;
  reason: string | null;
  placeOfUse: string | null;
  image: string;
  de_max_borrow_days: number;
}

export interface BorrowFormData {
  borrower: string;
  phone: string;
  reason: string;
  placeOfUse: string;
  quantity: number;
  dateRange: [Date | null, Date | null];
  borrowTime: string;
  returnTime: string;
}

const EditCart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();

  const { ctiId } = (location.state as { ctiId?: number }) ?? {};

  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<GetAvailable[]>([]);
  // เก็บอุปกรณ์ที่ผู้ใช้เลือก
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  // อุปกรณ์เสริม (accessories) ของอุปกรณ์แม่
  const [accessories, setAccessories] = useState<
    {
      name: string;
      qty: number;
    }[]
  >([]);
  // สถานที่เก็บอุปกรณ์
  const [storageLocation, setStorageLocation] = useState<string>("");

  useEffect(() => {
    if (!ctiId) {
      navigate("/list-devices/cart", { replace: true });
      return;
    }

    /**
     * Description: ฟังก์ชันสำหรับดึงข้อมูลรายการอุปกรณ์ที่อยู่ในตะกร้า (Cart Item)
     * เพื่อนำมาแสดงและแก้ไขข้อมูลในหน้า Edit Cart
     *
     * Note:
     * - ใช้สำหรับโหลดข้อมูลเดิมของรายการยืมอุปกรณ์จากระบบ
     * - ดึงรายการในตะกร้าทั้งหมดของผู้ใช้จาก API
     * - เลือกรายการที่ต้องการแก้ไขจาก ctiId ที่ได้จาก route state
     * - แปลงข้อมูลให้อยู่ในรูปแบบ CartItem เพื่อใช้งานในฝั่ง Frontend
     *
     * Flow การทำงาน:
     * 1. เรียก CartService.getCartItems() เพื่อดึงรายการอุปกรณ์ทั้งหมดในตะกร้า
     * 2. ค้นหารายการอุปกรณ์ที่มี ctiId ตรงกับค่าที่รับมาจาก route state
     * 3. Map ข้อมูลจาก API ให้อยู่ในรูปแบบ CartItem
     * 4. บันทึกข้อมูลลง state ด้วย setCartItem()
     * 5. หากไม่พบข้อมูลหรือเกิดข้อผิดพลาด จะ redirect ผู้ใช้กลับไปหน้ารายการตะกร้า
     * 6. ปิดสถานะ loading เมื่อทำงานเสร็จ
     *
     * Author: Salsabeela Sa-e (San) 66160349
     */

    const loadCartItem = async () => {
      try {
        const res = await CartService.getCartItems();
        const item = res.itemData.find((items) => items.cti_id === ctiId);
        if (!item) {
          throw new Error("ไม่พบรายการในตะกร้า");
        }

        const mapped: CartItem = {
          ctiId: item.cti_id,
          deviceId: item.device?.de_id ?? 0,
          name: item.device?.de_name ?? "",
          code: item.device?.de_serial_number ?? "",
          category: item.de_ca_name ?? "",
          department: item.de_dept_name ?? "",
          section: item.de_sec_name ?? "",
          qty: item.cti_quantity,
          readyQuantity: item.dec_ready_count ?? 0,
          maxQuantity: item.dec_count ?? 0,
          availability: item.dec_availability,
          borrowDate: item.cti_start_date,
          returnDate: item.cti_end_date,
          borrower: item.cti_us_name,
          phone: item.cti_phone,
          reason: item.cti_note,
          placeOfUse: item.cti_usage_location,
          image: item.device?.de_images ?? "/images/default.png",
          de_max_borrow_days: item.device?.de_max_borrow_days ?? 0,
        };

        setCartItem(mapped);
        const decIds = item?.device_childs?.length
          ? item.device_childs
              .map((dec) => dec?.dec_id)
              .filter((id): id is number => typeof id === "number")
          : [];

        setSelectedDeviceIds(decIds);

        // ดึงรายละเอียดอุปกรณ์จาก service เพื่อให้ได้ข้อมูล accessories เหมือนหน้า BorrowDevice
        try {
          const deviceDetail = await borrowService.getDeviceForBorrow(
            mapped.deviceId as any
          );
          const accessory = deviceDetail.accessories
            ? deviceDetail.accessories.map((acc: any) => ({
                name: acc.acc_name,
                qty: acc.acc_quantity,
              }))
            : [];

          setAccessories(accessory);
          setStorageLocation(deviceDetail.de_location ?? "");
        } catch (err) {
          console.error("ไม่สามารถดึงอุปกรณ์เสริมได้:", err);
          setAccessories([]);
          setStorageLocation("");
        }

        try {
          const avail = await borrowService.getAvailable(
            mapped.deviceId as any
          );
          setAvailableDevices(avail ?? []);
        } catch (err) {
          console.error("ไม่สามารถดึงรายการอุปกรณ์ย่อยได้:", err);
        }
      } catch (err) {
        console.error("โหลดข้อมูลแก้ไขไม่สำเร็จ:", err);
        navigate("/list-devices/cart", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadCartItem();
  }, [ctiId, navigate]);

  if (loading) {
    return <div className="p-6 text-center">กำลังโหลดข้อมูล...</div>;
  }

  if (!cartItem) return null;

  /**
   * Description:ฟังก์ชันสำหรับบันทึกการแก้ไขข้อมูลรายการยืมอุปกรณ์ในตะกร้า (Cart Item)
   * หลังจากผู้ใช้งานแก้ไขข้อมูลในฟอร์มและกดปุ่มบันทึก
   *
   * Note:ใช้สำหรับอัปเดตข้อมูลการยืมอุปกรณ์ เช่น จำนวน วันที่ยืม–คืน
   * ข้อมูลผู้ยืม และสถานที่ใช้งาน ลงในระบบผ่าน API
   *
   * Flow การทำงาน: 1. รับข้อมูลจากฟอร์ม (BorrowFormData)
   * 2. แปลงวันที่ยืมและวันที่คืนเป็นรูปแบบ ISO String (หากไม่มีค่า จะส่งเป็น null)
   * 3. เรียก CartService.updateCartItem() เพื่ออัปเดตข้อมูลในระบบ
   * 4. แสดงข้อความแจ้งเตือนเมื่อบันทึกสำเร็จ
   * 5. Redirect ผู้ใช้กลับไปยังหน้ารายการตะกร้า
   * 6. ถ้าเกิดข้อผิดพลาด จะแสดงข้อความแจ้งเตือนกรณีบันทึกไม่สำเร็จ
   *
   * Author: Salsabeela Sa-e (San) 66160349
   */
  const handleSubmit = async ({ data }: { data: BorrowFormData }) => {
    try {
      await CartService.updateCartItem(cartItem.ctiId, {
        quantity: selectedDeviceIds.length,
        borrower: data.borrower,
        phone: data.phone,
        reason: data.reason,
        placeOfUse: data.placeOfUse,
        borrowDate: data.borrowTime ? data.borrowTime : null,
        returnDate: data.returnTime ? data.returnTime : null,
        deviceChilds: selectedDeviceIds,
      });

      push({ tone: "success", message: "แก้ไขรายละเอียดเสร็จสิ้น!" });
      navigate("/list-devices/cart", { replace: true });
    } catch (err) {
      console.error("update error:", err);
      push({
        tone: "danger",
        message: "เกิดข้อผิดพลาด ไม่สามารถบันทึกได้",
      });
    }
  };

  /**
   * Description: ฟังก์ชันสำหรับแปลงวันที่หรือเวลาให้อยู่ในรูปแบบเวลา (HH:mm)
   * ตามรูปแบบเวลาของประเทศไทย (Time Zone: Asia/Bangkok)
   *
   * Note:
   * - รองรับ input ได้ทั้ง string และ Date
   * - ใช้ locale "th-TH" เพื่อให้รูปแบบเวลาเป็นมาตรฐานของไทย
   * - แสดงผลเวลาแบบ 24 ชั่วโมง (ไม่ใช้ AM/PM)
   * - เหมาะสำหรับใช้แสดงเวลาในหน้าจอ เช่น เวลาในการยืม–คืนอุปกรณ์
   *
   * Flow การทำงาน:
   * 1. รับค่า date ที่เป็น string หรือ Date
   * 2. แปลงค่า date ให้เป็น Date object
   * 3. เรียก toLocaleTimeString() พร้อมกำหนด locale และ options
   * 4. คืนค่าเวลาในรูปแบบ HH:mm
   *
   * Author: Salsabeela Sa-e (San) 66160349
   */
  const getTimeTH = (date: string | Date): string => {
    const dateObj = new Date(date);

    return dateObj.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Bangkok",
    });
  };

  /** Description: ฟังก์ชันสำหรับรีเฟรชข้อมูลอุปกรณ์ที่พร้อมใช้งาน
   * เมื่อมีการเปลี่ยนแปลงวันที่หรือเวลายืม–คืนในฟอร์ม
   *
   * Note:
   * - ใช้ในหน้า Edit Cart
   * - เรียก borrowService.getAvailable() เพื่อดึงข้อมูลอุปกรณ์ที่พร้อมใช้งาน
   * - อัปเดต state availableDevices เพื่อให้ข้อมูลเป็นปัจจุบัน
   *
   * Flow การทำงาน:
   * 1. ตรวจสอบว่ามี cartItem หรือไม่
   * 2. เรียก borrowService.getAvailable() โดยใช้ deviceId จาก cartItem
   * 3. อัปเดต state availableDevices ด้วยข้อมูลที่ได้รับ
   * 4. จัดการข้อผิดพลาดหากเกิดขึ้นระหว่างการเรียก API
   * 5. ใช้ useEffect ใน BorrowDeviceModal เพื่อเรียกฟังก์ชันนี้เมื่อวันที่หรือเวลายืม–คืนเปลี่ยนแปลง
   *  
   * Author: Salsabeela Sa-e (San) 66160349
   **/
   const handleDateTimeChange = async () => {
    if (!cartItem) return;
    try {
      const avail = await borrowService.getAvailable(cartItem.deviceId as any);
      setAvailableDevices(avail ?? []);
    } catch (err) {
      console.error("refresh available devices error:", err);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-row p-4 gap-6">
      <div className="flex-1">
        {/* Breadcrumb */}
        <div className="mb-[24px] space-x-[9px] text-sm">
          <span
            className="text-[#858585] cursor-pointer hover:underline"
            onClick={() => navigate("/list-devices")}
          >
            รายการอุปกรณ์
          </span>
          <span className="text-[#858585]">&gt;</span>
          <span
            className="text-[#858585] cursor-pointer hover:underline"
            onClick={() => navigate("/list-devices/cart")}
          >
            รถเข็น
          </span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000] font-medium">แก้ไขรายละเอียด</span>
        </div>
        <h1 className="text-2xl font-semibold mb-[24px]">แก้ไขรายละเอียด</h1>

        <BorrowDeviceModal
          mode="edit-detail"
          equipment={{
            name: cartItem.name,
            serialNumber: cartItem.code,
            category: cartItem.category,
            department: cartItem.department,
            section: cartItem.section,
            imageUrl: cartItem.image,
            storageLocation: storageLocation,
            remain: cartItem.readyQuantity,
            total: cartItem.maxQuantity,
            maxBorrowDays: cartItem.de_max_borrow_days,
            accessories: accessories,
          }}
          defaultValue={{
            borrower: cartItem.borrower ?? "",
            phone: cartItem.phone ?? "",
            reason: cartItem.reason ?? "",
            placeOfUse: cartItem.placeOfUse ?? "",
            quantity: cartItem.qty,
            dateRange: [
              cartItem.borrowDate ? new Date(cartItem.borrowDate) : null,
              cartItem.returnDate ? new Date(cartItem.returnDate) : null,
            ],
            borrowTime: getTimeTH(cartItem.borrowDate ?? new Date()),
            returnTime: getTimeTH(cartItem.returnDate ?? new Date()),
          }}
          /** props ที่ BorrowDeviceModal บังคับ แต่ edit ไม่ได้ใช้ */
          availableDevices={availableDevices}
          availableCount={
            availableDevices.filter((d) => d.dec_status === "READY").length
          }
          selectedDeviceIds={selectedDeviceIds}
          onSelectDevice={setSelectedDeviceIds} // เปลี่ยนอุปกรณ์ที่เลือก
          onDateTimeChange={handleDateTimeChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EditCart;
