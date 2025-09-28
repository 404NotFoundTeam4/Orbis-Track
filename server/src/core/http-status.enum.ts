/**
 * Description: รวมรหัสสถานะ HTTP ที่ใช้บ่อย เอาไว้เรียกใช้ให้ตรงกันทั้งโปรเจกต์
 * Input : -
 * Output : enum ของโค้ดสถานะ HTTP
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export enum HttpStatus {
    OK = 200, // สำเร็จปกติ มีเนื้อหากลับมา
    CREATED = 201, // สร้าง resource ใหม่สำเร็จ
    NO_CONTENT = 204, // สำเร็จแต่ไม่มีเนื้อหา (เช่น DELETE/บางกรณีของ UPDATE)
    BAD_REQUEST = 400, // ฝั่ง client ส่ง payload มาแล้วพังหรือพารามิเตอร์ไม่ครบ รูปแบบไม่ถูก
    UNAUTHORIZED = 401, // ยังไม่ล็อกอิน/ไม่มีสิทธิ์เพราะ token ไม่ผ่าน
    FORBIDDEN = 403, // ล็อกอินแล้วแต่สิทธิ์ไม่พอ (ห้ามเข้าจริง ๆ)
    NOT_FOUND = 404, // หา resource ไม่เจอ
    CONFLICT = 409, // ข้อมูลขัดแย้งกัน (เช่น ค่า unique ซ้ำ)
    INTERNAL_SERVER_ERROR = 500, // พังฝั่งเซิร์ฟเวอร์ จับไม่ทัน/ไม่คาดคิด
}
