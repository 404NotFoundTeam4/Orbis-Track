import multer from 'multer';
import fs from 'node:fs';

// ที่เก็บไฟล์รูปภาพ
const uploadDir = "uploads";

// ตรวจสอบว่ามีโฟลเดอร์ uploads ไหม
if (!fs.existsSync(uploadDir)) {
    // สร้างโฟลเดอร์ uploads
    fs.mkdirSync(uploadDir);
}

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
    // โฟลเดอร์ที่จะใช้เก็บไฟล์
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    // ตั้งชื่อไฟล์ (Timestamp - ชื่อไฟล์เดิมจากผู้ใช้)
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

export const upload = multer({ storage });