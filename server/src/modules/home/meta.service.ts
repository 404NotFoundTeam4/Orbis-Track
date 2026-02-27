/**
 * Description: Service สำหรับส่งค่า meta data เช่น dropdown options ต่างๆ
 * - ส่ง enum values พร้อม label ภาษาไทยสำหรับใช้กับ Dropdown บนหน้าบ้าน
 * Input : -
 * Output : object ที่มี options หลายประเภท
 * Author: 66160080 Pakkapon Chomchoey (Tonnam)
 */

/** ตัวเลือกสถานะ Borrow Ticket ทั้งหมด (ใช้สำหรับ filter ทั่วไป เช่น History) */
const BORROW_STATUS_OPTIONS = [
    { id: "ALL", value: "", label: "ทั้งหมด" },
    { id: "PENDING", value: "PENDING", label: "รออนุมัติ" },
    { id: "APPROVED", value: "APPROVED", label: "อนุมัติแล้ว" },
    { id: "IN_USE", value: "IN_USE", label: "กำลังใช้งาน" },
    { id: "COMPLETED", value: "COMPLETED", label: "คืนแล้ว" },
    { id: "OVERDUE", value: "OVERDUE", label: "เลยกำหนด" },
    { id: "REJECTED", value: "REJECTED", label: "ปฏิเสธ" },
] as const;

/** ตัวเลือกสถานะ Borrow Ticket สำหรับ STAFF (แสดงเฉพาะที่เกี่ยวข้อง) */
const BORROW_STATUS_OPTIONS_STAFF = [
    { id: "ALL", value: "", label: "ทั้งหมด" },
    { id: "PENDING", value: "PENDING", label: "รออนุมัติ" },
    { id: "APPROVED", value: "APPROVED", label: "อนุมัติแล้ว" },
    { id: "IN_USE", value: "IN_USE", label: "กำลังใช้งาน" },
    { id: "OVERDUE", value: "OVERDUE", label: "เลยกำหนด" },
] as const;

/** ตัวเลือกสถานะ Borrow Ticket สำหรับ role อื่นๆ (HOD/HOS ที่เห็นเฉพาะรอตัวเอง) */
const BORROW_STATUS_OPTIONS_APPROVER = [
    { id: "ALL", value: "", label: "ทั้งหมด" },
    { id: "PENDING", value: "PENDING", label: "รออนุมัติ" },
] as const;

/** ตัวเลือกสถานะแจ้งซ่อม (Repair / Issue) */
const REPAIR_STATUS_OPTIONS = [
    { id: "ALL", value: "", label: "ทั้งหมด" },
    { id: "PENDING", value: "PENDING", label: "รอรับเรื่อง" },
    { id: "IN_PROGRESS", value: "IN_PROGRESS", label: "กำลังซ่อม" },
    { id: "COMPLETED", value: "COMPLETED", label: "เสร็จสิ้น" },
] as const;

/**
 * Description: คืนค่า dropdown options ทั้งหมดสำหรับหน้าบ้าน
 * Input : -
 * Output : object ที่มี borrowStatuses, borrowStatusesStaff, borrowStatusesApprover, repairStatuses
 */
function getDropdownOptions() {
    return {
        borrowStatuses: BORROW_STATUS_OPTIONS,
        borrowStatusesStaff: BORROW_STATUS_OPTIONS_STAFF,
        borrowStatusesApprover: BORROW_STATUS_OPTIONS_APPROVER,
        repairStatuses: REPAIR_STATUS_OPTIONS,
    };
}

export const metaService = {
    getDropdownOptions,
};
