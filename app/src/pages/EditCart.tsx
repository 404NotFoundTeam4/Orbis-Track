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
import { useToast } from "../components/Toast";

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

interface BorrowFormData {
  borrower: string;
  phone: string;
  reason: string;
  placeOfUse: string;
  quantity: number;
  borrowDate: Date | null;
  returnDate: Date | null;
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

  useEffect(() => {
    if (!ctiId) {
      navigate("/list-devices/cart", { replace: true });
      return;
    }

    /**
     * Description:ฟังก์ชันสำหรับดึงข้อมูลรายการอุปกรณ์ที่อยู่ในตะกร้า (Cart Item)
     * เพื่อนำมาแสดงและแก้ไขข้อมูลในหน้า Edit Cart
     *
     * Note:ใช้สำหรับโหลดข้อมูลเดิมของรายการยืมอุปกรณ์จากระบบ
     * โดยดึงข้อมูลจาก API ตาม ctiId และแปลงให้อยู่ในรูปแบบ CartItem
     * เพื่อใช้งานภายในฝั่ง Frontend
     *
     * Flow การทำงาน: 1. เรียก CartService.getCartItems(ctiId) เพื่อดึงข้อมูลรายการในตะกร้า
     * 2. เลือกข้อมูลรายการแรกจากผลลัพธ์ที่ได้ (itemData[0])
     * 3. Map ข้อมูลจาก API ให้อยู่ในรูปแบบ CartItem
     * 4. บันทึกข้อมูลลง state ด้วย setCartItem()
     * 5. ถ้าเกิดข้อผิดพลาด จะ redirect ผู้ใช้กลับไปหน้ารายการตะกร้า
     * 6. ปิดสถานะ loading เมื่อทำงานเสร็จ
     *
     * Author: Salsabeela Sa-e (San) 66160349
     */

    const loadCartItem = async () => {
      try {
        const res = await CartService.getCartItems(ctiId);
        const item = res.itemData[0];

        const mapped: CartItem = {
          ctiId: item.ctiId,
          deviceId: item.device?.de_id,
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
  const handleSubmit = async ({
    data,
  }: {
    equipmentId: number;
    data: BorrowFormData;
  }) => {
    try {
      await CartService.updateCartItem(cartItem.ctiId, {
        quantity: data.quantity,
        borrowDate: data.borrowDate ? data.borrowDate.toISOString() : null,
        returnDate: data.returnDate ? data.returnDate.toISOString() : null,
        borrower: data.borrower,
        phone: data.phone,
        reason: data.reason,
        placeOfUse: data.placeOfUse,
      });

      push({ tone: "success", message: "แก้ไขรายละเอียดเสร็จสิ้น!" });

      //กลับหน้ารถเข็น
      navigate("/list-devices/cart", { replace: true });
    } catch (err) {
      console.error("update error:", err);
      push({
        tone: "danger",
        message: "เกิดข้อผิดพลาด ไม่สามารถบันทึกได้",
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-row p-4 gap-6">
      <div className="flex-1">
        {/* Breadcrumb */}
        <div className="mb-[24px] space-x-[9px] text-sm">
          <span className="text-[#858585]">รายการอุปกรณ์</span>
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
            id: cartItem.deviceId,
            name: cartItem.name,
            code: cartItem.code,
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
            borrowDate: cartItem.borrowDate
              ? new Date(cartItem.borrowDate)
              : null,
            returnDate: cartItem.returnDate
              ? new Date(cartItem.returnDate)
              : null,
            borrowTime: "",
            returnTime: "",
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EditCart;
