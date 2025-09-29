/**
 * Description: กำหนดบทบาทผู้ใช้เป็น enum (ตัวเลข) ให้ตรงกับค่าใน DB ใช้เช็คสิทธิ์/เงื่อนไขในระบบ
 * Input : -
 * Output : enum ของบทบาทที่อ้างอิงง่าย
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    HEADDEPT = 'HOD',
    HEADSEC = 'HOS',
    STAFF = 'STAFF',
    TECHNICAL = 'TECHNICAL',
    USER = 'EMPLOYEE',
}
