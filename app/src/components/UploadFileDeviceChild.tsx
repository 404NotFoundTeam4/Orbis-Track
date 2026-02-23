import { Icon } from "@iconify/react";
import Button from "./Button";
import { useState } from "react";

// โครงสร้างข้อมูลที่ต้องส่งมาเมื่อเรียกใช้งาน
interface UploadFileDeviceProps {
    onClose: () => void; // ปิด modal
    onConfirm: (file: File | null) => void; // เมื่อยืนยัน modal
}

const UploadFileDeviceChild = ({ onClose, onConfirm }: UploadFileDeviceProps) => {
    const [file, setFile] = useState<File | null>(null); // เก็บไฟล์ที่อัปโหลดเข้ามา
    const [isDragging, setIsDragging] = useState<boolean>(false); // ตรวจจับการลาก

    /**
    * Description: ฟังก์ชันสำหรับจัดการเมื่อผู้ใช้เลือกไฟล์
    * Input     : event - React change event จาก input file
    * Output    : เก็บไฟล์ไว้ใน state
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const picked = event.target.files?.[0] ?? null; // ดึงไฟล์ตัวแรก (ถ้ามี)
        setFile(picked);
    }

    /**
    * Description: ฟังก์ชันสำหรับจัดการเมื่อมีไฟล์ถูกลากเข้ามา
    * Input     : event - React drag event จาก div
    * Output    : อัปเดต state ลากไฟล์
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();  // กัน browser เปิดไฟล์
        setIsDragging(true);
    }

    /**
    * Description: ฟังก์ชันสำหรับจัดการเมื่อลากไฟล์ออก
    * Input     : -
    * Output    : อัปเดต state ลากไฟล์
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const onDragLeave = () => {
        setIsDragging(false);
    }

    /**
    * Description: ฟังก์ชันสำหรับจัดการเมื่อปล่อยไฟล์ลงใน Drop zone
    * Input     : event - React drag event จาก div
    * Output    : เก็บไฟล์ไว้ใน state
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const onDropFile = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();  // กัน browser เปิดไฟล์
        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0]; // ดึงไฟล์ตัวแรก
        setFile(droppedFile);
    }

    /**
    * Description: ฟังก์ชันสำหรับลบไฟล์ที่อัปโหลดเข้ามา
    * Input     : -
    * Output    : ลบไฟล์ออกจาก state
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const removeFile = () => {
        setFile(null);
    }

    /**
    * Description: ฟังก์ชันสำหรับเลือกไอคอนตามประเภทไฟล์
    * Input     : file - ไฟล์ที่อัปโหลดเข้ามา
    * Output    : string - ชื่อ icon ตามประเภทไฟล์
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const getFileIcon = (file: File) => {
        const ext = file.name.split(".").pop()?.toLowerCase(); // ดึงนามสกุลไฟล์
        // Excel
        if (ext === "xlsx" || ext === "xls") {
            return "bi:filetype-xlsx";
        }
        // CSV
        if (ext === "csv") {
            return "ph:file-csv-light";
        }
        // ใช้ icon ทั่วไป
        return "mdi:file-outline";
    };

    /**
    * Description: ฟังก์ชันสำหรับแปลงขนาดไฟล์
    * Input     : bytes - ขนาดไฟล์ในหน่วย Byte
    * Output    : string - ขนาดไฟล์ในรูปแบบ B / KB / MB
    * Author    : Thakdanai Makmi (Ryu) 66160355
    */
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${Math.round(kb)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    // ไอคอนกากบาทวงกลมจาก Radix Icons (ใช้แทนไอคอนปิด)
    const CrossCircledIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M8 8l8 8M16 8l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="flex flex-col gap-[25px] relative bg-[#FFFFFF] border border-[#D9D9D9] w-[691px] h-auto rounded-[16px] p-[32px]"
                onClick={(event) => event.stopPropagation()}
            >

                {/* Header */}
                <div className="flex justify-between">
                    <div className="flex flex-col gap-[10px]">
                        <h1 className="text-[24px] font-semibold">อัปโหลดไฟล์</h1>
                        <p className="text-[16px] text-[#747474]">
                            เลือกไฟล์จากคอมพิวเตอร์ของคุณ
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        type="button"
                        className="absolute top-7 right-7 color-[#000000] transition"
                        onClick={onClose}
                    >
                        <CrossCircledIcon className="w-[35px] h-[35px]" />
                    </button>
                </div>

                {/* Upload and Dropzone */}
                <div className={`relative flex flex-col justify-center items-center border border-dashed w-full h-[208px] rounded-[16px]
                    ${isDragging ? "border-[#40A9FF]" : "border-[#2F2F2F]"}
                `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDropFile}
                >
                    <Icon
                        icon="fa7-solid:cloud-upload"
                        color="#818181"
                        height={66}
                        width={66}
                    />
                    <input
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={onPickFile}
                    />
                    <p className="text-[#A2A2A2]">
                        <span className="text-[#40A9FF]">อัปโหลดไฟล์</span> หรือวางไฟล์ที่นี่
                    </p>
                    <p className="text-[#A2A2A2]">ประเภทไฟล์ .csv หรือ .xlsx</p>
                </div>

                <p className="text-[#747474] font-medium">
                    รองรับประเภทไฟล์ CSV หรือ XLSX ขนาดไฟล์ไม่เกิน 20Mb
                    <a
                        href="/templates/example-template.xlsx"
                        download
                        className="inline-flex items-center gap-1 text-[#40A9FF] ml-1 hover:underline"
                    >
                        ตัวอย่างไฟล์
                        <Icon
                            icon="mage:external-link"
                            width={16}
                            height={16}
                        />
                    </a>
                </p>

                {/* Preview */}
                {
                    file && (
                        <div className="flex flex-col gap-[10px]">
                            <h1 className="text-[20px] font-medium">อัปโหลดไฟล์</h1>
                            <div className="flex justify-between items-center border border-[#D9D9D9] w-full h-[68px] rounded-[12px] p-[16px]">
                                {/* Icon and File name */}
                                <div className="flex items-center gap-[15px]">
                                    <Icon
                                        icon={getFileIcon(file)}
                                        height={36}
                                        width={36}
                                    />
                                    <div className="flex flex-col">
                                        <p>{file.name}</p>
                                        <p className="text-[#6D6D6D]">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                {/* Remove File */}
                                <Icon
                                    className="cursor-pointer hover:text-black transition"
                                    icon="iconamoon:close-light"
                                    color="#A2A2A2"
                                    height={24}
                                    width={24}
                                    onClick={removeFile}
                                />
                            </div>
                        </div>
                    )
                }

                {/* Button */}
                <div className="flex justify-end gap-[10px]">
                    <Button
                        className="bg-[#D8D8D8] border border-[#CDCDCD] text-black hover:bg-[#D8D8D8]"
                        onClick={onClose}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        disabled={!file}
                        onClick={() => onConfirm(file)}
                    >
                        อัปโหลด
                    </Button>
                </div>

            </div>
        </div>
    )
}

export default UploadFileDeviceChild