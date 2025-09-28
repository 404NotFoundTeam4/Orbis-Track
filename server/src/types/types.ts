/**
 * Description: ชนิดข้อมูลยูทิลิตี้สำหรับผลลัพธ์ที่อาจเป็นค่าปกติหรือเป็น Promise
 * Input : T ประเภทข้อมูลผลลัพธ์ที่ต้องการห่อ
 * Output : T | Promise<T>
 * Author: Pakkapon Chomchoey (Tonnam) 66160080
 */
export type MaybePromise<T> = T | Promise<T>;