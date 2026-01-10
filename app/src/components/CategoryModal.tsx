import React, { useEffect, useState } from "react";
import Input from "./Input";
import { useToast } from "./Toast";
import { AlertDialog } from "./AlertDialog";
import { categoryService, type Category } from "../services/CategoryService";

type ModalType =
    | "add-category"
    | "edit-category";

export type CategoryModalProps = {
    open: boolean;
    mode: ModalType;
    initialCategory?: Category | null; // ค่าเดิมของหมวดหมู่
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void; // เพิ่ม category ใหม่ให้ table
};

export function CategoryModal({
    open,
    mode,
    initialCategory,
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
        if (!open) return;

        if (mode === "edit-category" && initialCategory) {
            setCategoryName(initialCategory.ca_name);
        } else {
            setCategoryName("");
        }

        setError("");
        setPendingName(null);
        setConfirmOpen(false);
        loadExistingCategories();
    }, [open, mode, initialCategory]);

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

        const isDuplicate = existingCategories.some((cat) => {
            if (mode === "edit-category" && cat.ca_id === initialCategory?.ca_id) {
                return false; // ข้ามตัวเอง
            }
            return cat.ca_name.toLowerCase() === trimmedName.toLowerCase();
        });


        if (isDuplicate) {
            setError("หมวดหมู่อุปกรณ์นี้มีอยู่แล้ว");
            return;
        }

        setPendingName(trimmedName);
        setConfirmOpen(true);
    };
    
    const handleConfirmAdd = async () => {
        if (!pendingName) return;

        try {
            setLoading(true);

            if (mode === "add-category") {
                await categoryService.addCategory({ ca_name: pendingName });
                toast.push({
                    tone: "success",
                    message: "เพิ่มหมวดหมู่อุปกรณ์เสร็จสิ้น!",
                });
            } else {
                toast.push({ tone: "success", message: "แก้ไขหมวดหมู่อุปกรณ์เสร็จสิ้น!" });
            }

            // 3. ปิดหน้าจอและอัปเดตข้อมูล (ย้ายมาไว้หลัง API Success)
            setConfirmOpen(false);
            onOpenChange(false);
            onSuccess?.();

        } catch (err: any) {
            // กรณี Error (เช่น 404 หรือชื่อซ้ำจาก DB)
            const message = err?.response?.data?.message;

            if (message?.toLowerCase().includes("already exist")) {
                setError("หมวดหมู่อุปกรณ์นี้มีอยู่แล้ว");
                setConfirmOpen(false);
                return;
            }
            
            toast.push({
                tone: "danger",
                message: err?.response?.data?.message || (mode === "add-category"
                    ? "เพิ่มหมวดหมู่ไม่สำเร็จ"
                    : "แก้ไขหมวดหมู่ไม่สำเร็จ"),
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
                        {mode === "add-category" ? "เพิ่มหมวดหมู่อุปกรณ์" : "แก้ไขหมวดหมู่อุปกรณ์"}
                    </h2>

                    <div className="w-full relative">
                        <Input
                            label="หมวดหมู่"
                            value={categoryName}
                            onChange={(e) => {
                                setCategoryName(e.target.value);
                                setError("");
                            }}
                            placeholder="หมวดหมู่อุปกรณ์"
                            autoFocus
                            error={error}
                        />
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
                title={mode === "add-category" ? "ยืนยันการเพิ่มหมวดหมู่อุปกรณ์?" : "ยืนยันการแก้ไขหมวดหมู่อุปกรณ์?"}
                tone="warning"
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
                onConfirm={handleConfirmAdd}
            />
        </div>
    );
}