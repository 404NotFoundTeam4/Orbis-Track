import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { AlertDialog, type AlertTone } from "../components/AlertDialog";
import { useToast } from "../components/Toast";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import CartService from "../services/CartService";

/**
 * Description : หน้า Cart สำหรับจัดการรายการอุปกรณ์ที่ผู้ใช้เลือกยืม
 * Feature :
 * - แสดงรายการอุปกรณ์ในรถเข็น
 * - เลือก / ยกเลิกเลือกอุปกรณ์
 * - เพิ่ม–ลดจำนวนอุปกรณ์ตามจำนวนที่พร้อมใช้งาน
 * - ลบอุปกรณ์ (รายชิ้น / หลายรายการ)
 * - ส่งคำร้องขอยืมอุปกรณ์
 * Related API :
 * - CartService.getCartItems()
 * - CartService.deleteCartItem()
 * Author : Nontapat Sinhum (Guitar) 66160104
 */

type ModalType = "danger" | "success" | "warning" | null;

/**
 * Description : โครงสร้างข้อมูลของอุปกรณ์ในรถเข็น
 */
interface CartItem {
  id: number;
  name: string;
  code: string;
  category: string;
  department: string;
  qty: number;
  readyQuantity: number;
  maxQuantity: number;
  image: string;
  availability: string;
  section: string;
  borrowDate: string;
  returnDate: string;
}

export const Cart = () => {
  /**
   * Description : ดึงข้อมูลผู้ใช้จาก sessionStorage / localStorage
   */
  const loginData =
    sessionStorage.getItem("User") || localStorage.getItem("User");
  const user = loginData ? JSON.parse(loginData) : null;
  const us_id = user?.us_id || user?.state?.user?.us_id || null;

  /**
   * Description : State เก็บรายการอุปกรณ์ในรถเข็น
   */
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * Description : โหลดข้อมูลรถเข็นของผู้ใช้จากระบบ
   * Trigger : เมื่อ component ถูก mount
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  useEffect(() => {
    const loadCart = async () => {
      try {
        
        const res = await CartService.getCartItems(us_id);
        const mapped: CartItem[] = res.itemData.map((d: any) => ({
          id: d.cti_id,
          name: d.device?.de_name ?? "ไม่ระบุ",
          code: d.device?.de_serial_number ?? "-",
          category: d.de_ca_name ?? "ไม่ระบุ",
          department: d.de_dept_name ?? "ไม่ระบุ",
          qty: d.cti_quantity ?? 1,
          image: d.device?.de_images ?? "/images/default.png",
          section: d.de_sec_name ? d.de_sec_name.trim().split(" ").pop() : "-",
          availability: d.dec_availability,
          borrowDate: formatThaiDateTime(d.cti_start_date) ?? "ยังไม่กำหนด",
          returnDate: formatThaiDateTime(d.cti_end_date) ?? "ยังไม่กำหนด",
          readyQuantity: d.dec_ready_count ?? 0,
          maxQuantity: d.dec_count ?? 0,
        }));

        setItems(mapped);
      } catch (err) {
        console.error("โหลดรถเข็นผิดพลาด:", err);
      }
    };

    loadCart();
  }, []);

  /** State สำหรับจัดการการเลือกอุปกรณ์ */
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { push } = useToast();

  /** State สำหรับ Modal */
  const [modalType, setModalType] = useState<ModalType>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectDeleteMode, setSelectDeleteMode] = useState(false);

  /**
   * Description : คำนวณจำนวนอุปกรณ์รวมที่ถูกเลือก
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  const totalItems = items
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.qty, 0);

  const remove = async (id: number) => {
    try {
      await CartService.deleteCartItem(id);

      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

      push({ tone: "danger", message: "ลบออกจากรถเข็นเสร็จสิ้น!" });
      closeModal();
    } catch (err) {
      console.error("ลบรายการไม่สำเร็จ:", err);
      push({ tone: "danger", message: "เกิดข้อผิดพลาด ไม่สามารถลบได้" });
    }
  };

  /**
   * Description : เปิด Modal ยืนยันการลบอุปกรณ์
   */
  const openDeleteModal = (id: number) => {
    setItemToDelete(id);
    setModalType("danger");
  };

  const handleSelectDelete = () => {
    setSelectDeleteMode(true);
    setModalType("danger");
  };

  /**
   * Description : เปิด Modal ยืนยันการส่งคำร้อง
   * Constraint : ต้องมีรายการที่ถูกเลือกอย่างน้อย 1 รายการ
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  const openSubmitModal = () => {
    if (selectedItems.length > 0) setModalType("success");
  };

  /**
   * Description : ยืนยันการส่งคำร้องขอยืมอุปกรณ์
   */
  const handleConfirmSubmit = async () => {
    // push({ tone: "confirm", message: "ส่งคำร้องสำเร็จ!" });
    try {
      // ส่งคำร้องตามรายการที่เลือก
      await Promise.all(
        selectedItems.map((cartItemId) =>
          CartService.createBorrowTicket(us_id, {
            cartItemId,
          })
        )
      );

      push({ tone: "success", message: "ส่งคำร้องสำเร็จ!" });

      // ล้าง state หลังส่งสำเร็จ
      setSelectedItems([]);
      closeModal();
    } catch (err) {
      console.error("ส่งคำร้องไม่สำเร็จ:", err);
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการส่งคำร้อง" });
    }
  };

  /**
   * Description : ยืนยันการลบอุปกรณ์ออกจากรถเข็น
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  const handleConfirmDelete = async () => {
    try {
      if (selectDeleteMode) {
        await Promise.all(
          selectedItems.map((id) => CartService.deleteCartItem(id))
        );

        setItems((prev) => prev.filter((i) => !selectedItems.includes(i.id)));

        push({
          tone: "danger",
          message: "ลบออกจากรถเข็นเสร็จสิ้น!",
        });

        setSelectedItems([]);
        setSelectDeleteMode(false);
        closeModal();
        return;
      }

      // ลบทีละรายการ
      if (itemToDelete) await remove(itemToDelete);
    } catch (err) {
      console.error("ลบไม่สำเร็จ:", err);
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการลบ" });
    }
  };

  /**
   * Description : ปิด Modal และ reset state ที่เกี่ยวข้อง
   */
  const closeModal = () => {
    setModalType(null);
    setItemToDelete(null);
    setSelectDeleteMode(false);
  };

  /**
   * Description : เพิ่มจำนวนอุปกรณ์
   * Constraint : ไม่เกิน readyQuantity
   */
  const increment = (id: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.qty < i.readyQuantity ? { ...i, qty: i.qty + 1 } : i
      )
    );
  };

  /**
   * Description : ลดจำนวนอุปกรณ์
   * Constraint : จำนวนต่ำสุดคือ 1
   */
  const decrement = (id: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i))
    );
  };

  /**
   * Description : เลือก / ยกเลิกเลือกอุปกรณ์
   * Constraint : อุปกรณ์ที่ไม่พร้อมใช้งานไม่สามารถเลือกได้
   */
  const toggleSelect = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // ถ้า availability = "ไม่พร้อมใช้งาน" → ห้ามเลือก
    if (item.availability === "ไม่พร้อมใช้งาน") return;

    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectableItems = items.filter((i) => i.availability === "พร้อมใช้งาน");
  const selectableIds = selectableItems.map((i) => i.id);

  const selectedItemCount = selectedItems.length;

  const allSelectableSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedItems.includes(id));

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedItems([]);
    } else {
      // เลือกเฉพาะรายการที่พร้อมใช้งาน
      setSelectedItems(selectableIds);
    }
  };

  // --- MODAL CONFIG ---
  let modalProps = null;
  if (modalType === "danger") {
    modalProps = {
      title: "คุณแน่ใจหรือไม่ว่าต้องการลบออกจากรถเข็น?",
      description: "การดำเนินการนี้ไม่สามารถกู้คืนได้",
      onConfirm: handleConfirmDelete,
      tone: "danger" as AlertTone,
      confirmText: "ยืนยัน",
      showRing: true,
    };
  } else if (modalType === "success") {
    modalProps = {
      title: "ยืนยันการส่งคำร้อง?",
      // description: `การดำเนินการนี้จะส่งรายการอุปกรณ์จำนวน ${selectedItemCount} รายการเพื่อขออนุมัติ`,
      onConfirm: handleConfirmSubmit,
      tone: "success" as AlertTone,
      confirmText: "ยืนยัน",
      showRing: true,
    };
  }

  /**
   * Description : แปลง ISO Date string เป็นรูปแบบ วัน/เดือน/ปี พ.ศ. + เวลา
   * Input  : isoDate (string | null)
   * Output : string
   * Author : Nontapat Sinhum (Guitar) 66160104
   */
  const formatThaiDateTime = (isoDate: string | null): string => {
    if (!isoDate) return "ยังไม่กำหนด";

    const date = new Date(isoDate);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = (date.getFullYear() + 543).toString(); // แปลงเป็น พ.ศ.

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year}   เวลา : ${hours}:${minutes}`;
  };

  return (
    <div className="w-full min-h-screen flex flex-row p-4 gap-6">
      {/* LEFT SIDE: Cart Items */}
      <div className="flex-1">
        {/* แถบนำทาง */}
        <div className="mb-[24px] space-x-[9px] text-sm">
          <span className="text-[#858585]">รายการอุปกรณ์</span>
          <span className="text-[#858585]">&gt;</span>
          <span className="text-[#000000] font-medium">รถเข็น</span>
        </div>
        <h1 className="text-2xl font-semibold mb-[24px]">รถเข็น</h1>

        {/* Select all */}
        <div className="flex items-center gap-2 mb-[24px]">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-[#0072FF] focus:ring-0 cursor-pointer"
            checked={selectedItemCount === items.length && items.length > 0}
            onChange={toggleSelectAll}
          />
          <span className="text-black text-sm">
            เลือกรายการอุปกรณ์ทั้งหมด ({selectedItemCount})
          </span>
          {selectedItemCount > 0 && (
            <button
              onClick={handleSelectDelete}
              className="px-[15px] py-[6.4px] w-[167px] h-[46px] bg-[#FF4D4F] text-white rounded-full text-[18px] font-semibold hover:bg-[#D9363E] transition-colors"
            >
              ลบคำขอยืม
            </button>
          )}
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="h-[208px] bg-white rounded-xl shadow-sm flex overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex-1 p-4 flex gap-[25px] items-center">
                <input
                  type="checkbox"
                  className="w-[29px] h-[29px] rounded-[8px] text-[#0072FF] focus:ring-0 cursor-pointer"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-[143px] h-[153px] rounded-lg object-cover border border-gray-100"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 border rounded-full text-xs font-medium ${item.availability === "พร้อมใช้งาน" ? "border-[#73D13D] text-[#73D13D]" : "border-[#FF4D4F] text-[#FF4D4F]"}`}
                    >
                      {item.availability}
                    </span>
                    <span className="px-2 py-0.5 border border-[#7492FF] text-[#7492FF] rounded-full text-xs font-medium">
                      ฝ่ายย่อย : {item.section}
                    </span>
                  </div>
                  <div className="font-semibold text-[18px] text-[#40A9FF]">
                    {item.name}
                  </div>
                  <div className="text-sm text-[#B3B1B1] space-y-[2px]">
                    <div>รหัสอุปกรณ์ : {item.code}</div>
                    <div>หมวดหมู่ : {item.category}</div>
                    <div>แผนก : {item.department}</div>
                    <div>
                      คงเหลือ : {item.readyQuantity}/{item.maxQuantity} ชิ้น
                    </div>
                  </div>
                  <Link
                    to="/list-devices/cart/edit"
                     state={{ cti_id: item.id }}
                    className="mt-1 text-[#096DD9] text-sm underline hover:text-[#0050B3] transition-colors"
                  >
                    แก้ไขรายละเอียด
                  </Link>
                </div>

                <div className="flex flex-col items-end h-full py-2 mr-5">
                  <div className="text-right text-sm text-[#B3B1B1] space-y-[2px]">
                    <div>วันที่ยืม : {item.borrowDate}</div>
                    <div>วันที่คืน : {item.returnDate}</div>
                  </div>
                  <div className="w-[145px] h-[46px] flex items-center border border-[#A2A2A2] rounded-[16px] overflow-hidden mt-4">
                    {/* ปุ่มลบ */}
                    <button
                      className="flex-1 h-full flex items-center justify-center bg-[#F0F0F0] hover:bg-[#E0E0E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => decrement(item.id)}
                      disabled={item.qty <= 1}
                    >
                      <Icon icon="ic:round-minus" width="16" height="16" />
                    </button>

                    {/* จำนวน */}
                    <div className="flex-1 h-full border-l border-r border-[#A2A2A2] flex items-center justify-center bg-white text-base font-medium">
                      {item.qty}
                    </div>

                    {/* ปุ่มบวก */}
                    <button
                      className="flex-1 h-full flex items-center justify-center bg-[#F0F0F0] hover:bg-[#E0E0E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => increment(item.id)}
                      disabled={item.qty >= item.readyQuantity}
                    >
                      <Icon icon="ic:round-plus" width="16" height="16" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <div className="w-[40px] bg-[#FF4D4F] flex items-center justify-center cursor-pointer hover:bg-[#D9363E] transition-colors">
                <button
                  onClick={() => openDeleteModal(item.id)}
                  aria-label={`ลบ ${item.name} ออกจากรถเข็น`}
                  className="w-full h-full flex items-center justify-center text-white hover:bg-[#D9363E] transition-colors"
                >
                  <Icon
                    icon="solar:trash-bin-trash-outline"
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-lg text-[#858585] py-10 border rounded-xl bg-white">
            ไม่มีรายการอุปกรณ์ในรถเข็น
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Summary (Sidebar) */}
      <div className="w-[300px]">
        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full">
          <h2 className="font-bold text-lg mb-4 flex items-center justify-center">
            สรุปรายการยืมอุปกรณ์
          </h2>

          <div className="space-y-2 text-sm flex-grow overflow-y-auto pr-1">
            {items
              .filter((item) => selectedItems.includes(item.id))
              .map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600 truncate mr-2">
                    {item.name}
                  </span>
                  <span className="font-medium text-black whitespace-nowrap">
                    {item.qty}
                  </span>
                </div>
              ))}
          </div>

          <div className="pt-3 mt-3">
            <div className="font-semibold flex justify-between text-base mb-4 border-t border-gray-200 pt-3">
              <span className="text-black">รวม :</span>
              <span className="text-[#FF4D4F]">{totalItems} ชิ้น</span>
            </div>

            <button
              onClick={openSubmitModal}
              className="w-full bg-[#40A9FF] text-white py-3 rounded-full text-center text-base font-semibold hover:bg-[#0050B3] transition-colors disabled:bg-gray-400"
              disabled={selectedItemCount === 0}
            >
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalProps && (
        <AlertDialog
          open={modalType !== null}
          onOpenChange={closeModal}
          width={786}
          {...modalProps}
        />
      )}
    </div>
  );
};
