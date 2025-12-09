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
    storageLocation: string;
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
    // ค่าเริ่มต้นข้อมูลฟอร์มการยืม (ใช้ defaultValue ถ้ามี)
    const initialForm: BorrowFormData = {
        borrower: defaultValue?.borrower ?? "",
        phone: defaultValue?.phone ?? "",
        reason: defaultValue?.reason ?? "",
        placeOfUse: defaultValue?.placeOfUse ?? "",
        quantity: defaultValue?.quantity ?? 1,
        borrowDate: defaultValue?.borrowDate ?? null,
        returnDate: defaultValue?.returnDate ?? null,
        borrowTime: defaultValue?.borrowTime ?? "",
        returnTime: defaultValue?.returnTime ?? "",
    }

    // ฟอร์มยืมอุปกรณ์
    const [form, setForm] = useState<BorrowFormData>(initialForm);

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
        <div className="flex justify-around items-start gap-[24px] rounded-[16px] w-[1672px] h-auto">
            {/* การ์ดฟอร์มยืมอุปกรณ์ */}
            <form
                className="flex flex-col justify-between gap-[30px] text-[16px] bg-[#FFFFFF] border border-[#D9D9D9] rounded-[16px] w-[1048px] px-[40px] py-[40px]"
                onSubmit={handleSubmit}>
                {/* หัวข้อ */}
                <div className="flex flex-col gap-[20px]">
                    <div className="flex flex-col gap-[7px]">
                        <h1 className="text-[18px] font-medium">1. ระบุข้อมูลผู้ยืม</h1>
                        <p className="text-[#40A9FF] font-medium">รายละเอียดข้อมูลอุปกรณ์</p>
                    </div>
                    {/* ชื่อผู้ยืม */}
                    <div>
                        <Input
                            fullWidth
                            label="ชื่อผู้ยืม"
                            placeholder="กรอกข้อมูลชื่อผู้ยืม"
                            value={form.borrower}
                            onChange={(e) => setForm({ ...form, borrower: e.target.value })}
                        />
                    </div>
                    {/* เบอร์โทรศัพท์ผู้ยืม */}
                    <div>
                        <Input
                            fullWidth
                            label="เบอร์โทรศัพท์ผู้ยืม"
                            placeholder="กรอกข้อมูลเบอร์โทรศัพท์ผู้ยืม"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    {/* เหตุผลในการยืม */}
                    <div className="flex flex-col gap-[4px]">
                        <label className="font-medium">เหตุผลในการยืม</label>
                        <textarea
                            className="border border-[#D8D8D8] rounded-[16px] w-[581px] h-[111px] px-[15px] py-[8px]"
                            placeholder="กรอกข้อมูลเหตุผลในการยืม"
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
                </div>
                <div className="flex flex-col gap-[20px]">
                    {/* หัวข้อ */}
                    <div className="flex flex-col gap-[7px]">
                        <h1 className="text-[18px] font-medium">2. เลือกช่วงเวลาการยืม</h1>
                        <p className="text-[#40A9FF] font-medium">รายละเอียดช่วงเวลาการยืม</p>
                    </div>
                    {/* วันเวลาที่ยืม */}
                    <div className="flex gap-[10px]">
                        <DatePickerField
                            width={489}
                            label="ช่วงวันที่ยืม"
                            value={form.borrowDate}
                            onChange={(date) => setForm({ ...form, borrowDate: date })}
                        />
                    </div>
                    {/* เวลาที่ยืม - คืน */}
                    <div className="flex gap-[10px]">
                        <TimePickerField
                            width={239}
                            label="ช่วงเวลาที่ยืม"
                            value={form.borrowTime}
                            onChange={(time: string) => setForm({ ...form, borrowTime: time })}
                        />
                        <TimePickerField
                            width={239}
                            label="ช่วงเวลาที่คืน"
                            value={form.returnTime}
                            onChange={(time: string) => setForm({ ...form, returnTime: time })}
                        />
                    </div>
                    <div className="flex items-center gap-[10px] text-[#00AA1A]">
                        <Icon
                            icon="icon-park-solid:check-one"
                            width={20}
                            height={20}
                        />
                        <p className="text-[16px]">ช่วงเวลานี้มีอุปกรณ์ที่ว่างทั้งหมด X ชิ้น</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[20px]">
                    {/* หัวข้อ */}
                    <div className="flex flex-col gap-[7px]">
                        <h1 className="text-[18px] font-medium">3. เลือกจำนวนอุปกรณ์ที่ต้องการยืม</h1>
                        <p className="text-[#40A9FF] font-medium">รายละเอียดจำนวนอุปกรณ์</p>
                    </div>
                    {/* จำนวนอุปกรณ์ */}
                    <div>
                        <QuantityInput
                            width={399}
                            label="จำนวน"
                            value={form.quantity}
                            onChange={(e: number) => setForm({ ...form, quantity: e })}
                            min={1}
                            max={equipment.remain} // ไม่เกินจำนวนคงเหลือ
                        />
                    </div>
                </div>
                {/* ปุ่ม */}
                <div className={`flex ${mode === "edit-detail" ? "justify-end" : "gap-[20px]"}`}>
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
                        className="!w-[155px] !h-[46px]"
                        variant="primary">
                        {mode === "borrow-equipment" ? "ส่งคำร้อง" : "บันทึก"}
                    </Button>
                </div>
            </form>
            {/* การ์ดรายละเอียดอุปกรณ์ */}
            <div className="flex flex-col gap-[20px] bg-[#FFFFFF] border border-[#BFBFBF] rounded-[16px] w-[600px] min-h-[668px] px-[40px] py-[40px]">
                {/* รูปภาพอุปกรณ์ */}
                <div className="border border-[#D9D9D9] rounded-[16px] w-[520px] h-[118px]">
                    <img
                        className="w-full h-full object-cover rounded-[16px]"
                        src={equipment.imageUrl}
                    />
                </div>
                {/* รายละเอียดอุปกรณ์ */}
                <div className="flex flex-col gap-[20px] text-[14px] text-[#747474]">
                    <p className="text-[16px] text-black font-semibold">{equipment.name}</p>
                    <p className="text-[#747474]">รหัสอุปกรณ์: {equipment.id}</p>
                    <div className="w-[520px] h-[1px] bg-[#D9D9D9]"></div>
                    <p className="text-[16px] text-black font-semibold">รายละเอียดอุปกรณ์</p>
                    <p>หมวดหมู่: {equipment.category}</p>
                    <p>แผนก: {equipment.department}</p>
                    <p>ฝ่ายย่อย: {equipment.section}</p>
                    <p>สถานที่เก็บอุปกรณ์: {equipment.storageLocation}</p>
                    {/* อุปกรณ์ย่อย */}
                    <div className="flex flex-col gap-[10px] border border-[#D9D9D9] rounded-[16px] w-[520px] min-h-[106px] text-[14px] px-[24px] py-[15px]">
                        <div className="flex items-center gap-[10px]">
                            <Icon
                                className="text-[#848484]"
                                icon="material-symbols-light:box-outline-rounded"
                                width="24"
                                height="24"
                            />
                            <p className="text-black font-semibold">อุปกรณ์ย่อย</p>
                        </div>
                        {/* รายการอุปกรณ์เสริม */}
                        <div className="flex flex-col gap-[10px] pl-[34px] pr-[10px]">
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
                {/* ยืมได้สูงสุด / จำนวนคงเหลือ */}
                <div className="flex gap-[10px] text-[16px]">
                    <p className="flex justify-center items-center bg-[#FF4D4F]/10 rounded-[10px] text-[#ED1A1A] min-w-[191px] h-[39px] px-[20px]">*ยืมได้สูงสุดไม่เกิน {equipment.maxBorrowDays} วัน</p>
                    <p className="flex justify-center items-center bg-[#00AA1A]/10 rounded-[10px] text-[#00AA1A] min-w-[191px] h-[39px] px-[20px]">ขณะนี้ว่าง {equipment.remain} ชิ้น</p>
                </div>
            </div>
        </div>
    )
}

export default BorrowEquipmentModal