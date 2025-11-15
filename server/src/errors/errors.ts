import { HttpStatus } from "../core/http-status.enum.js";

/**
 * Description: Error ตัวแม่ของแอป ใส่ statusCode เองได้ + ตั้ง message ได้
 * Input : statusCode: number, message: string
 * Output : อินสแตนซ์ Error ที่มีชื่อ 'HttpError' และสถานะชัดเจน
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
        this.name = 'HttpError';
    }
}

/**
 * Description: ใช้โยนตอน validate ไม่ผ่าน ตอบ 400 ให้เลย พร้อมข้อความสั้น ๆ
 * Input : message: string
 * Output : อินสแตนซ์ Error ที่มีชื่อ 'ValidationError' และสถานะ 400
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export class ValidationError extends HttpError {
    constructor(public message: string) {
        super(HttpStatus.BAD_REQUEST, message);
        this.name = 'ValidationError';
    }
}