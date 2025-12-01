import { useState } from "react";
import Button from "./Button"
import DatePickerField from "./DatePickerField";
import Input from "./Input"
import QuantityInput from "./QuantityInput"
import { Icon } from "@iconify/react";
import TimePickerField from "./TimePickerField";

// โครงสร้างข้อมูลอุปกรณ์
interface EquipmentDetail {
    id: number;
    name: string;
    category: string;
    department: string;
    section: string;
    imageUrl?: string;
    remain: number;
    total: number;
    maxBorrowDays: number;
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
    borrowDate: Date | null;
    returnDate: Date | null;
    borrowTime: string;
    returnTime: string;
}

// โครงสร้าง props ที่ต้องส่งมาเมื่อเรียกใช้งาน
interface BorrowEquipmentModalProps {
    mode: "borrow-equipment" | "edit-detail";
    defaultValue?: BorrowFormData; // ค่าเริ่มต้น
    equipment: EquipmentDetail; // รายละเอียดอุปกรณ์
    onSubmit: (data: {
        equipmentId: number,
        data: BorrowFormData
    }) => void; // ฟังก์ชันส่งข้อมูลตอน “ส่งคำร้อง” หรือ “บันทึก”
    onAddToCart?: (data: {
        equipmentId: number,
        data: BorrowFormData
    }) => void; // ฟังก์ชันเพิ่มไปยังรถเข็น
}

const BorrowEquipmentModal = ({ mode, defaultValue, equipment, onSubmit, onAddToCart }: BorrowEquipmentModalProps) => {
    // ฟอร์มยืมอุปกรณ์ ใช้ defaultValue ถ้ามี
    const [form, setForm] = useState<BorrowFormData>(
        defaultValue ?? {
            borrower: "",
            phone: "",
            reason: "",
            placeOfUse: "",
            quantity: 0,
            borrowDate: null,
            returnDate: null,
            borrowTime: "",
            returnTime: ""
        }
    );

    // ส่งข้อมูลฟอร์มและรหัสอุปกรณ์ ออกไปให้ใช้ต่อ
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // ป้องกันบราว์เซอร์ refresh หน้าเว็บ
        onSubmit({
            equipmentId: equipment.id,
            data: form
        });

        // รีเซ็ตค่าในฟอร์ม
        setForm({
            ...form,
            reason: "",
            placeOfUse: "",
            quantity: 0,
            borrowDate: null,
            returnDate: null,
            borrowTime: "",
            returnTime: ""
        });
    }

    // ส่งข้อมูลฟอร์มและรหัสอุปกรณ์ ออกไปให้ใช้ต่อ
    const handleAddToCard = () => {
        onAddToCart?.({
            equipmentId: equipment.id,
            data: form
        });
    }

    return (
        <div className="flex justify-around items-start bg-white border border-[#BFBFBF] rounded-[16px] w-[1662px] px-[64px] py-[71px]">
            {/* การ์ดรายละเอียดอุปกรณ์ */}
            <div className="flex flex-col gap-[24px] border border-[#BFBFBF] rounded-[16px] w-[609px] min-h-[937px] px-[27px] py-[24px]">
                <h1 className="text-center text-[18px]">รายละเอียดอุปกรณ์</h1>
                {/* รูปภาพอุปกรณ์ */}
                <div className="border border-[#D9D9D9] rounded-[16px] w-full h-[164px]">
                    <img
                        className="w-full h-full object-cover rounded-[16px]"
                        src={equipment.imageUrl}
                    />
                </div>
                {/* รายละเอียดอุปกรณ์ */}
                <div className="flex flex-col gap-[25px] text-[16px] font-medium">
                    <div className="flex justify-between">
                        <p>{equipment.name}</p>
                        <p>จำนวนคงเหลือ: <span className="text-[#5292FF]">{equipment.remain} / {equipment.total} ชิ้น</span></p>
                    </div>
                    <p>รหัสอุปกรณ์: {equipment.id}</p>
                    <p>หมวดหมู่: {equipment.category}</p>
                    <p>แผนก: {equipment.department}</p>
                    <p>ฝ่ายย่อย: {equipment.section}</p>
                    <p className="text-[#ED1A1A]">*ยืมได้สูงสุดไม่เกิน {equipment.maxBorrowDays} วัน</p>
                    {/* อุปกรณ์เสริม */}
                    <div className="flex flex-col gap-[25px] font-normal">
                        <div className="flex justify-between items-center bg-[#D9D9D9] rounded-[16px] w-[554px] h-[37px] px-[18px] text-[18px] font-medium">
                            <p>อุปกรณ์เสริม</p>
                            <p>จำนวน</p>
                        </div>
                        {/* รายการอุปกรณ์เสริม */}
                        <div className="flex flex-col gap-[25px] px-[18px]">
                            {
                                equipment.accessories.map((acc, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <p>{acc.name}</p>
                                        <p>{acc.qty} ชิ้น</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            {/* การ์ดฟอร์มยืมอุปกรณ์ */}
            <form
                className="flex flex-col justify-between gap-[19px] text-[16px]"
                onSubmit={handleSubmit}>
                {/* หัวข้อ */}
                <div className="flex flex-col gap-[7px]">
                    <h1 className="text-[18px] font-medium">ระบุข้อมูลการยืม</h1>
                    <p className="text-[#858585]">รายละเอียดข้อมูลอุปกรณ์</p>
                </div>
                {/* ชื่อผู้ยืม */}
                <div>
                    <Input
                        fullWidth
                        label="ชื่อผู้ยืม"
                        value={form.borrower}
                        readOnly
                    />
                </div>
                {/* เบอร์โทรศัพท์ผู้ยืม */}
                <div>
                    <Input
                        fullWidth
                        label="เบอร์โทรศัพท์ผู้ยืม"
                        value={form.phone}
                        readOnly
                    />
                </div>
                {/* เหตุผลในการยืม */}
                <div className="flex flex-col gap-[4px]">
                    <label className="font-medium">เหตุผลในการยืม</label>
                    <textarea
                        className="border border-[#D8D8D8] rounded-[16px] w-[581px] h-[111px] px-[15px] py-[8px]"
                        placeholder="กรอกเหตุผลในการยืม"
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    >
                    </textarea>
                </div>
                {/* สถานที่ใช้งาน */}
                <div className="flex flex-col gap-[4px]">
                    <label className="font-medium">สถานที่ใช้งาน</label>
                    <textarea
                        className="border border-[#D8D8D8] rounded-[16px] w-[581px] h-[111px] px-[15px] py-[8px]"
                        placeholder="กรอกสถานที่ใช้งาน"
                        value={form.placeOfUse}
                        onChange={(e) => setForm({ ...form, placeOfUse: e.target.value })}
                    >
                    </textarea>
                </div>
                {/* จำนวนอุปกรณ์ */}
                <div>
                    <QuantityInput
                        label="จำนวน"
                        value={form.quantity}
                        onChange={(e: number) => setForm({ ...form, quantity: e })}
                        min={1}
                        max={equipment.remain} // ไม่เกินจำนวนคงเหลือ
                    />
                </div>
                {/* วันเวลาที่ยืม */}
                <div className="flex gap-[10px]">
                    <DatePickerField
                        label="วันที่ยืม"
                        value={form.borrowDate}
                        onChange={(date) => setForm({ ...form, borrowDate: date })}
                    />
                    <TimePickerField
                        label="เวลาที่ยืม"
                        value={form.borrowTime}
                        onChange={(time) => setForm({ ...form, borrowTime: time })}
                    />
                </div>
                {/* วันเวาลาที่คืน */}
                <div className="flex gap-[10px]">
                    <DatePickerField
                        label="วันที่คืน"
                        value={form.returnDate}
                        onChange={(date) => setForm({ ...form, returnDate: date })}
                    />
                    <TimePickerField
                        label="เวลาที่คืน"
                        value={form.returnTime}
                        onChange={(time: string) => setForm({ ...form, returnTime: time })}
                    />
                </div>
                {/* ปุ่ม */}
                <div className={`flex ${mode === "edit-detail" ? "justify-end" : "justify-between"}`}>
                    {
                        // ถ้าเป็นยืมอุปกรณ์แสดงเพิ่มไปยังรถเข็น
                        mode === "borrow-equipment" && (
                            <Button
                                type="button"
                                className="!border border-[#008CFF] !text-[#008CFF] !w-[285px] !h-[46px]"
                                variant="outline"
                                onClick={handleAddToCard}>
                                <Icon
                                    icon="mdi-light:cart"
                                    width="36"
                                    height="36"
                                />
                                เพิ่มไปยังรถเข็น
                            </Button>
                        )
                    }
                    <Button
                        type="submit"
                        className="!w-[285px] !h-[46px]"
                        variant="primary">
                        {mode === "borrow-equipment" ? "ส่งคำร้อง" : "บันทึก"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default BorrowEquipmentModal