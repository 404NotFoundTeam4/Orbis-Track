/**
 * File: Inventory.ts
 * Description:
 *  - เป็นตัวกลาง (Facade) สำหรับเรียกใช้งาน InventoryService
 *  - รวมฟังก์ชันที่เกี่ยวข้องกับอุปกรณ์และการอนุมัติ
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */

import { DeviceService } from "../services/InventoryService";
import type {
  getAllDevices,
  CreateDevicePayload,
  CreateApprovalFlowPayload,
} from "../services/InventoryService";

/**
 * Function: getDevicesAll
 * Description:
 *  - ดึงรายการอุปกรณ์ทั้งหมดจากระบบ
 *
 * คืนค่า รายการอุปกรณ์ทั้งหมด
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export async function getDevicesAll(): Promise<getAllDevices> {
  const res = await DeviceService.getAllDevices();
  return res;
}

/**
 * Function: createDevicesdata
 * Description:
 *  - เพิ่มข้อมูลอุปกรณ์ใหม่เข้าสู่ระบบ
 *
 *  payload ข้อมูลอุปกรณ์ที่ต้องการเพิ่ม
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export async function createDevicesdata(payload: CreateDevicePayload) {
  const res = await DeviceService.createDevices(payload);
  return res;
}

export async function updateDevicesdata(id: number, payload: CreateDevicePayload) {
  const res = await DeviceService.updateDevices(id, payload);
  return res;
}

/**
 * Function: createApprovedata
 * Description:
 *  - สร้างข้อมูลการอนุมัติอุปกรณ์
 *
 *  payload ข้อมูลการอนุมัติ
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export async function createApprovedata(payload: CreateApprovalFlowPayload) {
  const res = await DeviceService.createApprove(payload);
  return res;
}

/**
 * Function: getApproveAll
 * Description:
 *  - ดึงรายการข้อมูลการอนุมัติทั้งหมด
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export async function getApproveAll() {
  const res = await DeviceService.getApprove();
  return res;
}

/**
 * Constant: useInventorys
 * Description:
 *  - รวมฟังก์ชันที่เกี่ยวข้องกับ Inventory
 *  - ใช้เรียกใช้งานใน component หรือ service 
 *
 * Author: Panyapon Phollert (Ton) 66160086
 */
export const useInventorys = {
  getDevicesAll,
  createDevicesdata,
  createApprovedata,
  getApproveAll,
  updateDevicesdata
};
