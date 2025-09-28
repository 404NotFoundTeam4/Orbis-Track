/**
 * Description: กำหนดบทบาทผู้ใช้เป็น enum (ตัวเลข) ให้ตรงกับค่าใน DB ใช้เช็คสิทธิ์/เงื่อนไขในระบบ
 * Input : -
 * Output : enum ของบทบาทที่อ้างอิงง่าย
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export enum UserRole {
    ADMIN = 1,
    HEADDEPT = 2,
    HEADSEC = 3,
    STAFF = 4,
    TECHNICAL = 5,
    USER = 6,
}
