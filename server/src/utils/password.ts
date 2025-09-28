import argon2 from "argon2";

/**
 * Description: แฮชรหัสผ่านด้วย Argon2
 * Input : password: string //รหัสผ่านแบบ plaintext
 * Output: string //แฮชรหัสผ่าน
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}

/**
 * Description: ตรวจสอบรหัสผ่านว่าแมตช์กับแฮชที่เก็บไว้หรือไม่
 * Input :
 *   - hash: string //แฮชที่เก็บในฐานข้อมูล
 *   - password: string //รหัสผ่านที่ผู้ใช้กรอก
 * Output: boolean //true = ตรงกัน, false = ไม่ตรง
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    // argon2.verify จะอ่านพารามิเตอร์จากสตริงแฮชโดยอัตโนมัติ ไม่ต้องระบุซ้ำ
    return argon2.verify(hash, password);
}
