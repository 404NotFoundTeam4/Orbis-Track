import { DeviceService } from "../services/InventoryService";
import type{ getAllDevices, createDevices } from "../services/InventoryService";

export async function getDevicesAll(): Promise<getAllDevices> {
  const res = await DeviceService.getAllDevices();
  return res;
}

export async function createDevicesdata(payload: createDevices) {
  const res = await DeviceService.createDevices(payload);
  return res;
}

export const useInventorys = {
  getDevicesAll,createDevicesdata
};
