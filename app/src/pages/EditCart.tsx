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

/**
 * Description: โครงสร้างข้อมูลอุปกรณ์
 * ใช้สำหรับส่งข้อมูลไปแสดงผลใน BorrowDeviceModal
 */
export interface EquipmentDetail {
  serialNumber: string;
  name: string;
  category: string;
  department: string;
  section: string;
  imageUrl: string;
  storageLocation: string;
  total: number;
  remain: number;
  maxBorrowDays: number;
  accessories: {
    name: string;
    qty: number;
  }[];
}

const EditCart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();

  const { ctiId } = (location.state as { ctiId?: number }) ?? {};

  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [equipmentDetail, setEquipmentDetail] =
    useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<GetAvailable[]>([]);
  // เก็บอุปกรณ์ที่ผู้ใช้เลือก
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  
  useEffect(() => {
    if (!ctiId) {
      navigate("/list-devices/cart", { replace: true });
      return;
    }

    /**
     * Description: ฟังก์ชันสำหรับโหลดข้อมูลรายการอุปกรณ์ในตะกร้า
     * เพื่อแสดงและแก้ไขข้อมูลในหน้า Edit Cart
     *
     * Note:
     * - ดึงข้อมูลรายการในตะกร้าจาก API
     * - เลือกรายการที่ตรงกับ ctiId
     * - Map ข้อมูลเป็น CartItem และ EquipmentDetail
     * - กำหนดอุปกรณ์ย่อยที่ถูกเลือก (selectedDeviceIds)
     * - โหลดรายการอุปกรณ์ที่พร้อมใช้งาน (availableDevices)
     *
     * Flow การทำงาน:
     * 1. ดึงรายการอุปกรณ์ทั้งหมดในตะกร้า
     * 2. เลือกรายการที่ต้องการจาก ctiId
     * 3. บันทึกข้อมูลลง state เพื่อแสดงผล
     * 4. โหลดข้อมูลอุปกรณ์ที่พร้อมใช้งาน
     * 5. จัดการ error และปิด loading
     *
     * Author: Salsabeela Sa-e (San) 66160349
     */

    const loadCartItem = async () => {
      try {
        const res = await CartService.getCartItems();
        const item = res.itemData.find((i) => i.cti_id === ctiId);
        if (!item) throw new Error("ไม่พบรายการในตะกร้า");

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
        };

        setCartItem(mapped);
        const decIds = item?.device_childs?.length
          ? item.device_childs
              .map((dec) => dec?.dec_id)
              .filter((id): id is number => typeof id === "number")
          : [];

        setSelectedDeviceIds(decIds);

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
  const getTimeTH = (date: string | Date) =>
    new Date(date).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Bangkok",
    });

  /**
   * Description: ฟังก์ชันสำหรับบันทึกการแก้ไขข้อมูลรายการยืมอุปกรณ์ในตะกร้า
   *
   * Note:
   * - อัปเดตข้อมูลการยืมอุปกรณ์ผ่าน CartService
   * - ใช้ข้อมูลจากฟอร์มและรายการอุปกรณ์ที่ผู้ใช้เลือก
   *
   * Flow การทำงาน:
   * 1. รับข้อมูลจากฟอร์ม
   * 2. เรียก API เพื่ออัปเดตรายการในตะกร้า
   * 3. แสดงผลลัพธ์และ redirect ผู้ใช้
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
    } catch {
      push({ tone: "danger", message: "เกิดข้อผิดพลาด ไม่สามารถบันทึกได้" });
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

  // Re-fetch available devices when date/time changes in the modal
  const handleDateTimeChange = async () => {
    if (!cartItem) return;
    try {
      const avail = await borrowService.getAvailable(cartItem.deviceId as any);
      setAvailableDevices(avail ?? []);
    } catch (err) {
      console.error("refresh available devices error:", err);
    }
  };

  if (loading || !cartItem || !equipmentDetail) {
    return <div className="p-6 text-center">กำลังโหลดข้อมูล...</div>;
  }

        <BorrowDeviceModal
          mode="edit-detail"
          equipment={{
            name: cartItem.name,
            serialNumber: cartItem.code,
            category: cartItem.category,
            department: cartItem.department,
            section: cartItem.section,
            imageUrl: cartItem.image,
            storageLocation: "",
            remain: cartItem.readyQuantity,
            total: cartItem.maxQuantity,
            maxBorrowDays: 0,
            accessories: [],
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
