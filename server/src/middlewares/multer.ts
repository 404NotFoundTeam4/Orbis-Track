import multer from "multer";
import path from "path";
import fs from "fs";

// 1. กำหนดที่เก็บไฟล์ (Storage Engine)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    // ตรวจสอบว่ามีโฟลเดอร์ uploads หรือไม่ ถ้าไม่มีให้สร้างใหม่
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์ใหม่: timestamp-ชื่อไฟล์เดิม เพื่อป้องกันชื่อซ้ำ
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 2. การกรองประเภทไฟล์ (File Filter)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, webp) เท่านั้น"), false);
  }
};

// 3. สร้าง Instance ของ Multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // จำกัดขนาดไฟล์ไม่เกิน 2MB
  },
  fileFilter: fileFilter,
});