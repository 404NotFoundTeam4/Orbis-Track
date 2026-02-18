import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import { AlertDialog, type AlertTone } from "../components/AlertDialog";
import { useToast } from "../components/Toast";
import { Link } from "react-router-dom";
import CartService from "../services/CartService";
import axios from "axios";

/**
 * Description : หน้า Cart สำหรับจัดการรายการอุปกรณ์ที่ผู้ใช้เลือกยืม
 * Feature :
 * - แสดงรายการอุปกรณ์ในรถเข็น
 * - เลือก / ยกเลิกเลือกอุปกรณ์
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
  isBorrow: boolean;
}

export const Cart = () => {
  /**
   * Description : ดึงข้อมูลผู้ใช้จาก sessionStorage / localStorage
   */
  const loginData =
    sessionStorage.getItem("User") || localStorage.getItem("User");
  const user = loginData ? JSON.parse(loginData) : null;
  const userId = user?.us_id || user?.state?.user?.us_id || null;

  /**
   * Description : State เก็บรายการอุปกรณ์ในรถเข็น
   */
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * Description: ฟังก์ชันสำหรับโหลดข้อมูลรถเข็นของผู้ใช้ และแปลงข้อมูลให้อยู่ในรูปแบบ CartItem เพื่อใช้แสดงผลใน UI
   * Input : userId (ดึงจาก session/local storage หรือ state ภายใน component)
   * Output : อัปเดตข้อมูลรายการรถเข็นใน state (items)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const loadCart = useCallback(async () => {
    try {
      if (!userId) return;

      const res = await CartService.getCartItems();

      const mapped: CartItem[] = res.itemData.map((cti: any) => ({
        id: cti.cti_id,
        name: cti.device?.de_name ?? "ไม่ระบุ",
        code: cti.device?.de_serial_number ?? "-",
        category: cti.de_ca_name ?? "ไม่ระบุ",
        department: cti.de_dept_name ?? "ไม่ระบุ",
        qty: cti.cti_quantity ?? 1,
        image: cti.device?.de_images ?? "/images/default.png",
        section: cti.de_sec_name
          ? cti.de_sec_name.trim().split(" ").pop()
          : "-",
        availability: cti.dec_availability,
        borrowDate: formatThaiDateTime(cti.cti_start_date) ?? "ยังไม่กำหนด",
        returnDate: formatThaiDateTime(cti.cti_end_date) ?? "ยังไม่กำหนด",
        readyQuantity: cti.dec_ready_count ?? 0,
        maxQuantity: cti.dec_count ?? 0,
        isBorrow: cti.isBorrow,
      }));

      setItems(mapped);
    } catch (err) {
      console.error("โหลดรถเข็นผิดพลาด:", err);
    }
  }, [userId]);

  /**
   * Description: Hook สำหรับเรียก loadCart เมื่อ component ถูก mount หรือเมื่อ dependency ของ loadCart เปลี่ยน
   * Input : loadCart
   * Output : -
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /** State สำหรับจัดการการเลือกอุปกรณ์ */
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { push } = useToast();

  /** State สำหรับ Modal */
  const [modalType, setModalType] = useState<ModalType>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectDeleteMode, setSelectDeleteMode] = useState(false);

  /**
   * Description: คำนวณจำนวนชิ้นรวมของรายการที่ถูกเลือก (รวม qty ของแต่ละรายการ)
   * Input : items, selectedItems
   * Output : number (จำนวนชิ้นรวม)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const totalItems = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.qty, 0);

  /**
   * Description: ฟังก์ชันลบรายการในรถเข็นทีละรายการ พร้อมอัปเดต state และแสดง toast
   * Input : id (cart_item id)
   * Output : Promise<void>
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const remove = async (id: number) => {
    try {
      await CartService.deleteCartItem({ cartItemId: id });

      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

      push({ tone: "danger", message: "ลบออกจากรถเข็นเสร็จสิ้น!" });
      closeModal();
    } catch (err) {
      console.error("ลบรายการไม่สำเร็จ:", err);
      push({ tone: "danger", message: "เกิดข้อผิดพลาด ไม่สามารถลบได้" });
    }
  };

  /**
   * Description: ฟังก์ชันเปิด Modal ยืนยันการลบแบบรายชิ้น และเก็บ id ที่ต้องการลบไว้ใน state
   * Input : id (cart_item id)
   * Output : void (อัปเดต state: itemToDelete, modalType)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const openDeleteModal = (id: number) => {
    setItemToDelete(id);
    setModalType("danger");
  };

  /**
   * Description: ฟังก์ชันเปิดโหมดลบแบบเลือกหลายรายการ และแสดง Modal ยืนยันการลบ
   * Input : -
   * Output : void (อัปเดต state: selectDeleteMode, modalType)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const handleSelectDelete = () => {
    setSelectDeleteMode(true);
    setModalType("danger");
  };

  /**
   * Description: ฟังก์ชันเปิด Modal ยืนยันการส่งคำร้อง (ต้องมีรายการที่ถูกเลือกอย่างน้อย 1 รายการ)
   * Input : selectedItems
   * Output : void (อัปเดต state: modalType)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const openSubmitModal = () => {
    if (selectedItems.length > 0) setModalType("success");
  };

  /**
   * Description: ฟังก์ชันยืนยันการส่งคำร้องขอยืมอุปกรณ์ โดยสร้าง Borrow Ticket ตามรายการที่ผู้ใช้เลือก
   * Input : us_id, selectedItems (cartItemId[])
   * Output : Promise<void> (เรียก API + reload cart + reset selection)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const handleConfirmSubmit = async () => {
    try {
      // ส่งคำร้องตามรายการที่เลือก
      for (const cartItemId of selectedItems) {
        await CartService.createBorrowTicket({ cartItemId });
      }

      await loadCart();
      push({ tone: "success", message: "ส่งคำร้องสำเร็จ!" });

      // ล้าง state หลังส่งสำเร็จ
      setSelectedItems([]);
      closeModal();
    } catch (err) {
      // console.error("ส่งคำร้องไม่สำเร็จ:", err);
      if (axios.isAxiosError(err)) {
        console.error("ส่งคำร้องไม่สำเร็จ (backend):", {
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
          method: err.config?.method,
          requestBody: err.config?.data,
        });
      } else {
        console.error("ส่งคำร้องไม่สำเร็จ:", err);
      }
      push({ tone: "danger", message: "เกิดข้อผิดพลาดในการส่งคำร้อง" });
    }
  };

  /**
   * Description: ฟังก์ชันยืนยันการลบอุปกรณ์ออกจากรถเข็น รองรับทั้งลบรายชิ้น และลบหลายรายการ (selectDeleteMode)
   * Input : selectDeleteMode, selectedItems, itemToDelete
   * Output : Promise<void> (เรียก API + อัปเดต state + toast)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const handleConfirmDelete = async () => {
    try {
      if (selectDeleteMode) {
        await Promise.all(
          selectedItems.map((id) =>
            CartService.deleteCartItem({ cartItemId: id }),
          ),
        );

        setItems((prev) =>
          prev.filter((item) => !selectedItems.includes(item.id)),
        );

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
   * Description: ฟังก์ชันปิด Modal และ reset state ที่เกี่ยวข้องกับ Modal/การลบ
   * Input : -
   * Output : void
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const closeModal = () => {
    setModalType(null);
    setItemToDelete(null);
    setSelectDeleteMode(false);
  };

  /**
   * Description: ฟังก์ชันเลือก/ยกเลิกเลือกอุปกรณ์ทีละรายการ โดยจะไม่อนุญาตให้เลือกหาก availability ไม่พร้อมใช้งาน
   * Input : id (cart_item id)
   * Output : void (อัปเดต state: selectedItems)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const toggleSelect = (id: number) => {
    const item = items.find((item) => item.id === id);
    if (!item) return;

    // ถ้า availability = "ไม่พร้อมใช้งาน" ห้ามเลือก
    if (item.availability === "ไม่พร้อมใช้งาน") return;
    // ถ้าถูกยืม/จอง ห้ามเลือก
    if (item.isBorrow) return;

    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const selectableItems = items.filter(
    (item) => item.availability === "พร้อมใช้งาน" && !item.isBorrow,
  );
  const selectableIds = selectableItems.map((item) => item.id);

  const selectedItemCount = selectedItems.length;

  const allSelectableSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedItems.includes(id));

  /**
   * Description: ฟังก์ชันเลือกทั้งหมด/ยกเลิกเลือกทั้งหมด โดยเลือกเฉพาะรายการที่พร้อมใช้งานเท่านั้น
   * Input : allSelectableSelected, selectableIds
   * Output : void (อัปเดต state: selectedItems)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
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
      width: 850,
    };
  } else if (modalType === "success") {
    modalProps = {
      title: "ยืนยันการส่งคำร้อง?",
      onConfirm: handleConfirmSubmit,
      tone: "success" as AlertTone,
      confirmText: "ยืนยัน",
      showRing: true,
    };
  }

  /**
   * Description: ฟังก์ชันแปลง ISO Date string เป็นรูปแบบ วัน / เดือน(ไทย) / ปี พ.ศ. + เวลา
   * Input : isoDate (string | null)
   * Output : string (รูปแบบวันที่ภาษาไทย)
   * Author : Nontapat Sinhum (Guitar) 66160104
   **/
  const formatThaiDateTime = (isoDate: string | null): string => {
    if (!isoDate) return "ยังไม่กำหนด";

    const date = new Date(isoDate);

    const thaiMonths = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    const day = date.getDate().toString().padStart(2, "0");
    const month = thaiMonths[date.getMonth()];
    const year = (date.getFullYear() + 543).toString(); // แปลงเป็น พ.ศ.

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} / ${month} / ${year}   เวลา : ${hours}:${minutes}`;
  };

  return (
    // <div className="h-[calc(100vh-126px)] overflow-hidden">
    <div className="w-full h-full min-h-0 flex flex-row p-4 gap-6 overflow-hidden">
      {/* LEFT SIDE: Cart Items */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        <div className="shrink-0">
          {/* แถบนำทาง */}
          <div className="mb-[8px] space-x-[9px]">
            <Link to="/list-devices" className="text-[#858585]">
              รายการอุปกรณ์
            </Link>
            <span className="text-[#858585]">&gt;</span>
            <span className="text-[#000000]">รถเข็น</span>
          </div>

          {/* Page Title */}
          <div className="flex items-center gap-[14px] mb-[21px]">
            <h1 className="text-2xl font-semibold">รถเข็น</h1>
          </div>

          {/* Select all */}
          <div className="flex items-center gap-2 mb-[24px]">
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelectableSelected}
                onChange={toggleSelectAll}
                className="peer sr-only"
              />

              <span
                className="w-[29px] h-[29px] rounded-[8px] border border-[#BFBFBF] bg-white flex items-center justify-center
                        transition-colors peer-checked:bg-[#000000] peer-checked:border-[#000000] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0072FF]/30"
              >
                <Icon
                  icon="rivet-icons:check"
                  width="25"
                  height="25"
                  className="inline-block text-white peer-checked:opacity-100 transition-opacity"
                />
              </span>
            </label>
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
        </div>

        <div className="flex-1 min-h-0">
          {/* <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-1"> */}
          <div className="max-h-[calc(100vh-110px-220px)] overflow-y-auto overflow-x-hidden space-y-4 pr-1">
            {items.length === 0 ? (
              <div className="text-center text-lg text-[#858585] py-10 border rounded-xl bg-white">
                ไม่มีรายการอุปกรณ์ในรถเข็น
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="h-[208px] bg-white rounded-xl shadow-sm flex overflow-hidden transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex-1 p-4 flex gap-[25px] items-center">
                    <label className="inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="peer sr-only"
                      />

                      {/* กล่อง checkbox */}
                      <span
                        className="w-[29px] h-[29px] rounded-[8px] border border-[#BFBFBF] bg-white flex items-center justify-center
                        transition-colors peer-checked:bg-[#000000] peer-checked:border-[#000000] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0072FF]/30"
                      >
                        <Icon
                          icon="rivet-icons:check"
                          width="25"
                          height="25"
                          className="inline-block text-white peer-checked:opacity-100 transition-opacity"
                        />
                      </span>
                    </label>
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
                        {item.isBorrow && (
                          <div className="mt-2 inline-flex items-center gap-2  px-3 py-1 text-sm text-[#FF4D4F]">
                            <Icon icon="jam:alert" width="18" height="18" />
                            <span className="font-medium">
                              อุปกรณ์ที่คุณกำลังเลือกมีการเปลี่ยนแปลงสถานะ
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-[#B3B1B1] space-y-[2px]">
                        <div>รหัสอุปกรณ์ : {item.code}</div>
                        <div>หมวดหมู่ : {item.category}</div>
                        <div>แผนก : {item.department}</div>
                        <div>
                          คงเหลือ : {item.readyQuantity} / {item.maxQuantity}{" "}
                          ชิ้น
                        </div>
                      </div>
                      <Link
                        to={`/list-devices/cart/edit/${item.id}`}
                        state={{ ctiId: item.id }}
                        className="mt-1 text-[#096DD9] text-sm underline hover:text-[#0050B3] transition-colors"
                      >
                        แก้ไขรายละเอียด
                      </Link>
                    </div>

                    <div className="flex flex-col items-end h-full py-2 mr-5">
                      <div className="w-full text-left text-sm space-y-[2px]">
                        ช่วงเวลายืม - คืน
                      </div>
                      <div className="text-right text-sm text-[#B3B1B1] space-y-[2px]">
                        <div>วันที่ยืม : {item.borrowDate}</div>
                        <div>วันที่คืน : {item.returnDate}</div>
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
                        width="30"
                        height="30"
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Summary (Sidebar) */}
      <div className="w-[400px] h-full shrink-0">
        <div className="fixed top-[126px] right-4 w-[400px] h-[calc(100vh-142px)] z-20">
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col h-full">
            <h2 className="font-bold text-xl mb-4 flex items-center justify-center">
              สรุปรายการยืมอุปกรณ์
            </h2>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2 text-lg">
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

            <div className="pt-3 mt-3 shrink-0">
              <div className="font-semibold flex justify-between text-lg mb-4 border-t border-gray-200 pt-3">
                <span className="text-[#000000]">รวม :</span>
                <span className="text-[#000000]">{totalItems} ชิ้น</span>
              </div>

              <button
                onClick={openSubmitModal}
                className="w-full bg-[#40A9FF] text-white py-3 rounded-full text-center text-base font-semibold hover:bg-[#0050B3] transition-colors disabled:bg-gray-400"
                disabled={selectedItemCount === 0}
              >
                ส่งคำร้อง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalProps && (
        <AlertDialog
          open={modalType !== null}
          onOpenChange={closeModal}
          {...modalProps}
        />
      )}
    </div>
    // </div>
  );
};
