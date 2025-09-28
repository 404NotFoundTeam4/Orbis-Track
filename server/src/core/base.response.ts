/**
 * Description: โครงสร้าง response กลาง ใช้กับทุก endpoint
 * Input : <T> คือชนิดของ data ที่จะส่งกลับ
 * Output : อ็อบเจ็กต์ที่มี message / success / data / traceStack
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export interface BaseResponse<T = unknown> {
    // ข้อความสั้น ๆ ว่าเกิดอะไร/ผลลัพธ์เป็นไง (ไว้โชว์ toast ก็ได้)
    message?: string;

    // ธงบอกว่าสำเร็จมั้ย — ปกติให้ถือว่า true เป็นดีฟอลต์ฝั่ง client
    /**
     * @default true
     */
    success?: boolean;

    // ข้อมูลจริงที่จะส่งกลับ ชนิดตามเจเนอริก T
    data?: T;

    // เอาไว้แนบ stack เวลา error (ช่วย debug ตอน dev ส่วน prod จะไม่ส่งก็ได้)
    traceStack?: string;
}