import React, { useEffect, useState } from "react";
import Input from "./Input";
import { useToast } from "./Toast";
import { AlertDialog } from "./AlertDialog";
import { categoryService, type Category } from "../services/CategoryService";

export type CategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newCategory: Category) => void; // เพิ่ม category ใหม่ให้ table
};

export function CategoryModal({
  open,
  onOpenChange,
  onSuccess,
}: CategoryModalProps) {
  const toast = useToast();
  
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // reset modal เมื่อเปิด
  useEffect(() => {
    if (open) {
      setCategoryName("");
      setError("");
      setPendingName(null);
      setConfirmOpen(false);
      loadExistingCategories();
    }
  }, [open]);

  const loadExistingCategories = async () => {
    try {
      const result = await categoryService.getCategories({
        page: 1,
        limit: 1000,
      });
      setExistingCategories(result.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // ไม่แสดง error toast เพื่อไม่ให้รบกวน user
      setExistingCategories([]);
    }
  };

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("กรุณาระบุชื่อหมวดหมู่");
      return;
    }

    const trimmedName = categoryName.trim();
    const isDuplicate = existingCategories.some(
      (cat) => cat.ca_name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError("ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว");
      return;
    }

    setPendingName(trimmedName);
    setConfirmOpen(true);
  };

const handleConfirmAdd = async () => {
  if (!pendingName) return;

  try {
    setLoading(true);
    // 1. เรียก API (ต้องมั่นใจว่า Service ยิงไปที่ Path /category)
    const newCategory = await categoryService.addCategory({ca_name: pendingName});
    console.log(pendingName);
    // 2. ถ้าสำเร็จ ให้แสดง Toast สีเขียว
    toast.push({
      tone: "success",
      message: "เพิ่มหมวดหมู่อุปกรณ์เสร็จสิ้น!",
    });

    // 3. ปิดหน้าจอและอัปเดตข้อมูล (ย้ายมาไว้หลัง API Success)
    setConfirmOpen(false); 
    onOpenChange(false);   
    onSuccess?.(newCategory);

  } catch (err: any) {
    // กรณี Error (เช่น 404 หรือชื่อซ้ำจาก DB)
    toast.push({
      tone: "danger",
      message: err?.response?.data?.message || "เพิ่มหมวดหมู่ไม่สำเร็จ",
    });
    setConfirmOpen(false); // ปิดแค่หน้ายืนยัน แต่คงหน้าเพิ่มข้อมูลไว้ให้แก้ไข
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    if (!loading) onOpenChange(false);
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white border border-[#858585] rounded-[42px] w-[804px] h-[371px]">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100"
        >
          ✕
        </button>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="absolute left-1/2 top-[40px] -translate-x-1/2 flex flex-col items-center gap-[57px] w-[333px]"
        >
          <h2 className="text-[28px] font-semibold text-black">
            เพิ่มหมวดหมู่อุปกรณ์
          </h2>

          <div className="w-full relative">
            <label className="block mb-2 text-[#858585]">หมวดหมู่</label>
            <Input
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError("");
              }}
              placeholder="หมวดหมู่อุปกรณ์"
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-5 left-0 text-[12px] text-red-500">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-[120px] h-[44px] rounded-full bg-[#1890FF] text-white font-medium hover:bg-[#1677ff] transition"
            disabled={loading}
          >
            บันทึก
          </button>
        </form>
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ยืนยันการเพิ่มหมวดหมู่"
        description={`คุณต้องการเพิ่มหมวดหมู่อุปกรณ์ "${pendingName}" หรือไม่?`}
        tone="success" // แสดงเป็นเขียว
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
}