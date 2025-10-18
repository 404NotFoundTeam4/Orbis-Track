import "express";

/**
 * Description: TypeScript declaration file สำหรับ extend Express Request interface เพื่อรองรับ Multer file upload
 * Note      : ใช้ module augmentation เพื่อเพิ่ม properties file และ files ให้กับ Express Request
 * Author    : Pakkapon Chomchoey (Tonnam) 66160080
 */
declare module "express-serve-static-core" {
  /**
   * Interface: ขยาย Express Request เพื่อรองรับ Multer file upload middleware
   * Properties:
   *   - file  : ไฟล์เดียวที่อัพโหลด (single file upload)
   *   - files : หลายไฟล์ที่อัพโหลด (multiple files upload) 
   *             - อาจเป็น array หรือ object ที่มี field name เป็น key
   */
    interface Request {
        file?: Express.Multer.File;
        files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
    }
}
